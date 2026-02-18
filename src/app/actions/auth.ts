"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { emergencyContacts, healthInfo, payments, users } from "@/db/schema";
import {
  uploadFile,
  uploadTemporaryFile,
  confirmTemporaryFiles,
  abandonTemporaryFiles,
  checkCartaResponsivaExists,
  getCartaResponsivaUrl,
} from "@/lib/storage";
import { getAdultCompanionCount } from "@/app/actions/ocr";

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

export async function registerUser(formData: FormData) {
  try {
    const firstName = formData.get("nombre") as string;
    const lastName = formData.get("apellido") as string;
    const phone = formData.get("telefono") as string;
    const password = formData.get("password") as string;
    const age = parseInt(formData.get("edad") as string, 10);

    if (age > 29) {
      const adultCount = await getAdultCompanionCount();
      if (adultCount >= 50) {
        return {
          success: false,
          error: "Lo sentimos, el cupo de adultos acompañantes está lleno.",
        };
      }
    }

    const gender = formData.get("genero") as "M" | "F" | "Otro";
    const shirtSize = formData.get("tallaPlayera") as string;

    const country = formData.get("pais") as string;
    const state = formData.get("estado") as string;
    const locality = formData.get("localidad") as string;

    const allergies = formData.get("alergias") as string;
    const conditions = formData.get("padecimiento") as string;
    const medications = formData.get("medicamento") as string;
    const dosageFrequency = formData.get("dosisFrecuencia") as string;

    const contactName = formData.get("contactoNombre") as string;
    const contactPhone = formData.get("contactoTelefono") as string;

    // --- ARCHIVOS: URLs PRE-SUBIDAS O SUBIDAS DIRECTAS ---
    const profilePhotoUrl = formData.get("profilePhotoUrl") as string;
    const documentUrl = formData.get("documentUrl") as string;
    const paymentProof = formData.get("comprobantePago") as File;
    const sessionId = formData.get("sessionId") as string | null;

    let profileUrl = profilePhotoUrl || "";
    let docUrl = documentUrl || "";
    let proofUrl = "";

    // Si no hay URLs pre-subidas, subir archivos directamente
    // (para compatibilidad con pagos transfer/efectivo)
    if (!profilePhotoUrl) {
      const profilePhoto = formData.get("fotoPerfil") as File;
      if (profilePhoto && profilePhoto.size > 0) {
        profileUrl = await uploadFile(profilePhoto, "Perfil");
      }
    }

    if (!documentUrl) {
      const document = formData.get("documento") as File;
      if (document && document.size > 0) {
        const folderName =
          age >= 15 && age <= 17 ? "Carta Responsiva" : "Identificación";
        docUrl = await uploadFile(document, folderName);
      }
    }

    if (paymentProof && paymentProof.size > 0) {
      proofUrl = await uploadFile(paymentProof, "Pagos");
    }

    const tipoPago = formData.get("tipoPago") as string;
    const metodoPago = formData.get("metodoPago") as
      | "tarjeta"
      | "transferencia"
      | "efectivo";
    const stripeSessionId = formData.get("stripeSessionId") as string | null;
    const skipCookie = formData.get("skipCookie") === "true";

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    try {
      const [user] = await db
        .insert(users)
        .values({
          firstName,
          lastName,
          phone,
          password: hashedPassword,
          age,
          gender,
          shirtSize,
          country,
          state,
          locality,
          registrationStatus: "pendiente",
          profilePhotoUrl: profileUrl,
          documentUrl: docUrl,
        })
        .returning();

      newUser = user;

      await db.insert(emergencyContacts).values({
        userId: user.id,
        name: contactName,
        phone: contactPhone,
      });

      await db.insert(healthInfo).values({
        userId: user.id,
        allergies,
        conditions,
        medications,
        dosageFrequency,
      });

      // Registrar pago inicial
      if (metodoPago === "tarjeta" && stripeSessionId) {
        // Pago exitoso con Stripe durante el registro
        const config = await db.query.settings.findFirst();
        const amount =
          tipoPago === "completo"
            ? config?.fullPaymentPrice || 1500
            : config?.registrationFeePrice || 500;

        await db.insert(payments).values({
          userId: user.id,
          amount,
          type: tipoPago,
          method: "tarjeta",
          status: "completado",
        });

        // Actualizar estatus a parcial o completado según el monto
        await db
          .update(users)
          .set({
            registrationStatus:
              tipoPago === "completo" ? "completado" : "parcial",
          })
          .where(eq(users.id, user.id));
      } else if (metodoPago !== "tarjeta" && proofUrl) {
        // Pago por transferencia/efectivo (requiere revisión)
        const config = await db.query.settings.findFirst();
        const amount =
          tipoPago === "completo"
            ? config?.fullPaymentPrice || 1500
            : config?.registrationFeePrice || 500;

        await db.insert(payments).values({
          userId: user.id,
          amount,
          type: tipoPago,
          method: metodoPago,
          status: "revision",
          proofUrl: proofUrl,
        });

        // Confirmar archivos temporales si pago no es tarjeta (transfer/efectivo)
        if (sessionId) {
          await confirmTemporaryFiles(sessionId);
        }
      }
    } catch (dbError) {
      if (newUser) {
        await db.delete(users).where(eq(users.id, newUser.id));
      }
      throw dbError;
    }

    // Para tarjeta: no settear cookie (se hace después de verificar pago)
    if (!skipCookie) {
      const cookieStore = await cookies();
      cookieStore.set("user_session", newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    revalidatePath("/admin/users");
    return { success: true, userId: newUser.id };
  } catch (error: any) {
    console.error("Error en registro:", error);
    if (error.code === "23505") {
      return {
        success: false,
        error: "El número telefónico ya está registrado",
      };
    }
    return { success: false, error: "Error interno al procesar el registro" };
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
