"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { emergencyContacts, healthInfo, payments, users } from "@/db/schema";
import { uploadFile } from "@/lib/storage";

export async function loginUser(formData: FormData) {
  try {
    const phone = formData.get("telefono") as string;
    const password = formData.get("password") as string;

    const [user] = await db.select().from(users).where(eq(users.phone, phone));

    if (!user) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const cookieStore = await cookies();
    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Usamos el rol de la base de datos
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

    // --- SUBIDA A CLOUDFLARE R2 ORGANIZADA ---
    const profilePhoto = formData.get("fotoPerfil") as File;
    const document = formData.get("documento") as File;
    const paymentProof = formData.get("comprobantePago") as File;

    let profileUrl = "";
    let docUrl = "";
    let proofUrl = "";

    if (profilePhoto && profilePhoto.size > 0) {
      profileUrl = await uploadFile(profilePhoto, "Fotos");
    }

    if (document && document.size > 0) {
      // Si tiene 15-17 años, lo guardamos en Carta Responsiva, si no, en INE
      const folderName = age >= 15 && age <= 17 ? "Carta Responsiva" : "INE";
      docUrl = await uploadFile(document, folderName);
    }

    if (paymentProof && paymentProof.size > 0) {
      proofUrl = await uploadFile(paymentProof, "Pagos");
    }

    const tipoPago = formData.get("tipoPago") as string;
    const metodoPago = formData.get("metodoPago") as
      | "tarjeta"
      | "transferencia"
      | "efectivo";
    const amount = tipoPago === "completo" ? 1500 : 500;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.transaction(async (tx) => {
      const [user] = await tx
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
          registrationStatus:
            tipoPago === "completo" && metodoPago === "tarjeta"
              ? "completado"
              : "pendiente",
          profilePhotoUrl: profileUrl,
          documentUrl: docUrl,
        })
        .returning();

      await tx.insert(emergencyContacts).values({
        userId: user.id,
        name: contactName,
        phone: contactPhone,
      });

      await tx.insert(healthInfo).values({
        userId: user.id,
        allergies,
        conditions,
        medications,
        dosageFrequency,
      });

      await tx.insert(payments).values({
        userId: user.id,
        amount,
        type: tipoPago,
        method: metodoPago,
        status: metodoPago === "tarjeta" ? "completado" : "revision",
        proofUrl: proofUrl,
      });

      return user;
    });

    const cookieStore = await cookies();
    cookieStore.set("user_session", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

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

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  revalidatePath("/");
  return { success: true };
}
