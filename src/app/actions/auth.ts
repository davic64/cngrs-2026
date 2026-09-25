"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import {
  checkCapacity,
  createRegistration,
  pgCode,
  validateRegistration,
} from "@/lib/registration";
import { notifyAdmin } from "@/lib/telegram";
import {
  uploadFile,
  uploadTemporaryFile,
  confirmTemporaryFiles,
  abandonTemporaryFiles,
  checkCartaResponsivaExists,
  getCartaResponsivaUrl,
} from "@/lib/storage";

export async function loginUser(formData: FormData) {
  try {
    const phone = formData.get("telefono") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    const [user] = await db.select().from(users).where(eq(users.phone, phone));

    if (!user) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const cookieStore = await cookies();

    // Si rememberMe está activado: 30 días
    // Si no: solo para esta sesión del navegador (se elimina al cerrar)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;

    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    const isAdmin = user.role === "admin";

    return { success: true, isAdmin };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Error interno en el servidor" };
  }
}

// Registro con transferencia/efectivo (el de tarjeta pasa por
// savePendingRegistration + finalizeCardRegistration en stripe.ts).
export async function registerUser(formData: FormData) {
  const validation = validateRegistration(formData);
  if (!validation.ok) return { success: false, error: validation.error };
  const data = validation.data;

  if (data.paymentMethod === "tarjeta") {
    return {
      success: false,
      error: "Para pagar con tarjeta usa el botón de pago con tarjeta.",
    };
  }

  const paymentProof = formData.get("comprobantePago") as File | null;
  if (!paymentProof || paymentProof.size === 0) {
    return { success: false, error: "Sube una foto del comprobante de pago." };
  }

  let stage: "subida_archivos" | "guardado" = "subida_archivos";
  try {
    const capacityError = await checkCapacity(data.age);
    if (capacityError) return { success: false, error: capacityError };

    // --- ARCHIVOS: URLs PRE-SUBIDAS O SUBIDAS DIRECTAS ---
    let profileUrl = (formData.get("profilePhotoUrl") as string) || "";
    let docUrl = (formData.get("documentUrl") as string) || "";
    const sessionId = formData.get("sessionId") as string | null;

    if (!profileUrl) {
      const profilePhoto = formData.get("fotoPerfil") as File | null;
      if (profilePhoto && profilePhoto.size > 0) {
        profileUrl = await uploadFile(profilePhoto, "Perfil");
      }
    }

    if (!docUrl) {
      const document = formData.get("documento") as File | null;
      if (document && document.size > 0) {
        const folderName =
          data.age >= 15 && data.age <= 17
            ? "Carta Responsiva"
            : "Identificacion";
        docUrl = await uploadFile(document, folderName);
      }
    }

    const proofUrl = await uploadFile(paymentProof, "Pagos");

    stage = "guardado";
    const config = await db.query.settings.findFirst();
    const amount =
      data.paymentType === "completo"
        ? config?.fullPaymentPrice || 1500
        : config?.registrationFeePrice || 500;

    const userId = await createRegistration({
      data,
      passwordHash: await bcrypt.hash(data.password, 10),
      profilePhotoUrl: profileUrl,
      documentUrl: docUrl,
      payment: { amount, status: "revision", proofUrl },
    });

    if (sessionId) await confirmTemporaryFiles(sessionId);

    const cookieStore = await cookies();
    cookieStore.set("user_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    revalidatePath("/admin/users");
    return { success: true, userId };
  } catch (error: any) {
    const code = pgCode(error);
    console.error(
      `Error en registro [etapa=${stage} code=${code ?? "-"}] tel=${data.phone}:`,
      error,
    );

    if (code === "23505") {
      return {
        success: false,
        error: "El número telefónico ya está registrado",
      };
    }

    after(() =>
      notifyAdmin(
        `⚠️ *REGISTRO FALLIDO*\n\n👤 ${data.firstName} ${data.lastName}\n📱 ${data.phone}\n💳 ${data.paymentMethod} (${data.paymentType})\n🧩 Etapa: ${stage}\n❌ ${code ?? ""} ${error?.message ?? error}`,
      ),
    );

    return {
      success: false,
      error:
        stage === "subida_archivos"
          ? "No se pudo subir tu comprobante o tus archivos. Revisa tu conexión e intenta de nuevo."
          : "No se pudo guardar tu registro. Intenta de nuevo; si el problema sigue, escríbenos por el chat de soporte.",
    };
  }
}

// Settear cookie de sesión para un usuario ya registrado (post-Stripe)
export async function setRegistrationSession(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) return { success: false, error: "Usuario no encontrado" };

    const cookieStore = await cookies();
    cookieStore.set("user_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: undefined,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Error al crear sesión:", error);
    return { success: false, error: "Error al crear sesión" };
  }
}

// Subir comprobante de pago para usuario que regresa (transfer/efectivo)
export async function submitRegistrationProof(
  userId: string,
  amount: number,
  formData: FormData,
) {
  try {
    const file = formData.get("file") as File;
    const method = formData.get("method") as "transferencia" | "efectivo";
    const type = formData.get("type") as string;

    if (!file) return { success: false, error: "No se encontró el archivo" };

    const url = await uploadFile(file, "Pagos");

    await db.insert(payments).values({
      userId,
      amount,
      type: type || "inscripcion",
      method,
      status: "revision",
      proofUrl: url,
    });

    // Settear cookie de sesión (solo para esta sesión del navegador)
    const cookieStore = await cookies();
    cookieStore.set("user_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: undefined,
      path: "/",
    });

    revalidatePath("/admin/payments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    return { success: false, error: "No se pudo procesar el comprobante" };
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        emergencyContact: true,
        healthInfo: true,
      },
    });

    if (!user) return null;

    const userPayments = await db.query.payments.findMany({
      where: eq(payments.userId, user.id),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    return {
      ...user,
      payments: userPayments,
      lastPayment: userPayments[0] || null,
    };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function uploadRegistrationFiles(formData: FormData) {
  try {
    const fotoPerfil = formData.get("fotoPerfil") as File | null;
    const documento = formData.get("documento") as File | null;
    const edad = formData.get("edad") as string;

    // Generar sessionId único para este intento de registro
    const sessionId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let profileUrl = "";
    let docUrl = "";

    // Subir foto de perfil si existe
    if (fotoPerfil && fotoPerfil.size > 0) {
      const result = await uploadTemporaryFile(
        fotoPerfil,
        sessionId,
        "fotoPerfil",
      );
      if (result.success) {
        profileUrl = result.url;
      } else {
        return {
          success: false,
          error: "Error al subir foto de perfil",
        };
      }
    }

    // Subir documento si existe
    if (documento && documento.size > 0) {
      const result = await uploadTemporaryFile(
        documento,
        sessionId,
        "documento",
      );
      if (result.success) {
        docUrl = result.url;
      } else {
        // Si falla la segunda subida, abandonar ambos archivos
        await abandonTemporaryFiles(sessionId);
        return {
          success: false,
          error: "Error al subir documento",
        };
      }
    }

    // Guardar sessionId en localStorage del cliente (se envía en la próxima request)
    // Esto lo maneja el cliente con el campo sessionId devuelto
    return {
      success: true,
      profileUrl,
      docUrl,
      sessionId, // El cliente lo almacena para confirmar después
    };
  } catch (error) {
    console.error("Error uploading registration files:", error);
    return {
      success: false,
      error: "Error al procesar los archivos",
    };
  }
}

// Confirmar que los archivos temporales se usaron exitosamente (post-Stripe)
export async function confirmRegistrationFiles(sessionId: string) {
  try {
    const result = await confirmTemporaryFiles(sessionId);
    if (result.success) {
      console.log(`✅ Archivos de sesión ${sessionId} confirmados`);
    }
    return result;
  } catch (error) {
    console.error("Error confirming registration files:", error);
    return { success: false };
  }
}

// Limpiar archivos temporales si el usuario cancela el registro
export async function cleanupRegistrationFiles(sessionId: string) {
  try {
    const result = await abandonTemporaryFiles(sessionId);
    if (result.success) {
      console.log(`🗑️ Archivos temporales de sesión ${sessionId} eliminados`);
    }
    return result;
  } catch (error) {
    console.error("Error cleaning up registration files:", error);
    return { success: false };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  revalidatePath("/");
  return { success: true };
}

export async function getCartaResponsivaTemplate() {
  try {
    const exists = await checkCartaResponsivaExists();
    if (!exists) {
      return { success: false, error: "Plantilla no disponible" };
    }
    return { success: true, templateUrl: getCartaResponsivaUrl() };
  } catch {
    return { success: false, error: "Error al obtener la plantilla" };
  }
}

// --- PASSWORD CHANGE MANAGEMENT ---
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return { success: false, error: "Contraseña actual incorrecta" };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return {
        success: false,
        error: "La nueva contraseña debe tener al menos 6 caracteres",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear passwordResetRequired flag
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetRequired: false,
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Error al cambiar la contraseña" };
  }
}
