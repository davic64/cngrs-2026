"use server";

import { db } from "@/db";
import { users, emergencyContacts, healthInfo, payments } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function loginUser(formData: FormData) {
  try {
    const phone = formData.get("telefono") as string;
    const password = formData.get("password") as string;

    // 1. Buscar usuario por teléfono
    const [user] = await db.select().from(users).where(eq(users.phone, phone));

    if (!user) {
      return { success: false, error: "Credenciales inválidas" };
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales inválidas" };
    }

    // 3. Crear sesión (Cookie)
    // En un entorno real usarías un JWT firmado
    const cookieStore = await cookies();
    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return { success: true };

  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Error interno en el servidor" };
  }
}

export async function registerUser(formData: FormData) {
  try {
    // 1. Extraer datos básicos
    const firstName = formData.get("nombre") as string;
    const lastName = formData.get("apellido") as string;
    const phone = formData.get("telefono") as string;
    const password = formData.get("password") as string;
    const age = parseInt(formData.get("edad") as string);
    const gender = formData.get("genero") as "M" | "F" | "Otro";
    const shirtSize = formData.get("tallaPlayera") as string;
    
    // Ubicación
    const country = formData.get("pais") as string;
    const state = formData.get("estado") as string;
    const locality = formData.get("localidad") as string;

    // Salud
    const allergies = formData.get("alergias") as string;
    const conditions = formData.get("padecimiento") as string;
    const medications = formData.get("medicamento") as string;
    const dosageFrequency = formData.get("dosisFrecuencia") as string;

    // Contacto Emergencia
    const contactName = formData.get("contactoNombre") as string;
    const contactPhone = formData.get("contactoTelefono") as string;

    // Archivos (Bytes listos para procesar)
    const profilePhoto = formData.get("fotoPerfil") as File;
    const document = formData.get("documento") as File;
    const paymentProof = formData.get("comprobantePago") as File;

    // Pago
    const tipoPago = formData.get("tipoPago") as string;
    const metodoPago = formData.get("metodoPago") as "tarjeta" | "transferencia" | "efectivo";
    
    // Cálculo de monto basado en el tipo de pago
    const amount = tipoPago === "completo" ? 1500 : 500;

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar en Base de Datos (Transacción)
    const newUser = await db.transaction(async (tx) => {
      // a. Crear Usuario
      const [user] = await tx.insert(users).values({
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
        registrationStatus: tipoPago === "completo" && metodoPago === "tarjeta" ? "completado" : "pendiente",
        profilePhotoUrl: `pending_upload_${profilePhoto?.name}`, 
        documentUrl: `pending_upload_${document?.name}`,
      }).returning();

      // b. Crear Contacto de Emergencia
      await tx.insert(emergencyContacts).values({
        userId: user.id,
        name: contactName,
        phone: contactPhone,
      });

      // c. Crear Info de Salud
      await tx.insert(healthInfo).values({
        userId: user.id,
        allergies,
        conditions,
        medications,
        dosageFrequency,
      });

      // d. Registrar Pago Inicial
      await tx.insert(payments).values({
        userId: user.id,
        amount,
        type: tipoPago,
        method: metodoPago,
        status: metodoPago === "tarjeta" ? "completado" : "revision",
        proofUrl: paymentProof ? `pending_upload_${paymentProof.name}` : "",
      });

      return user;
    });

    revalidatePath("/admin/users");
    return { success: true, userId: newUser.id };

  } catch (error: any) {
    console.error("Error en registro:", error);
    if (error.code === "23505") {
      return { success: false, error: "El número telefónico ya está registrado" };
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
      }
    });

    if (!user) return null;

    // Obtener el último pago para calcular estatus y monto pendiente
    const lastPayment = await db.query.payments.findFirst({
      where: eq(payments.userId, user.id),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    return {
      ...user,
      lastPayment,
    };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}
