"use server";

import bcrypt from "bcryptjs";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  notInArray,
  sql,
  sum,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  agendaDays,
  events,
  localities,
  notifications,
  payments,
  settings,
  users,
  venues,
} from "@/db/schema";
import {
  deleteFile,
  uploadFile,
  uploadCartaResponsivaTemplate as uploadCartaResponsivaToR2,
  getCartaResponsivaUrl,
  deleteCartaResponsivaTemplate as deleteCartaResponsivaFromR2,
  checkCartaResponsivaExists,
} from "@/lib/storage";

// --- GESTIÓN DE LOCALIDADES ---
export async function getLocalities() {
  return await db.select().from(localities).orderBy(asc(localities.name));
}

export async function createLocality(data: {
  name: string;
  state: string;
  country: string;
}) {
  const name = data.name.trim();
  const state = data.state.trim();
  const country = data.country.trim();

  // Duplicado: misma localidad/estado/país comparando en minúsculas
  const existing = await db
    .select({ id: localities.id })
    .from(localities)
    .where(
      and(
        sql`lower(${localities.name}) = ${name.toLowerCase()}`,
        sql`lower(${localities.state}) = ${state.toLowerCase()}`,
        sql`lower(${localities.country}) = ${country.toLowerCase()}`,
      ),
    );

  if (existing.length > 0) {
    return { success: false as const, error: "Ya existe esa localidad" };
  }

  const [inserted] = await db
    .insert(localities)
    .values({ name, state, country })
    .returning({ id: localities.id });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/localities");
  revalidatePath("/auth/register");
  return { success: true as const, id: inserted.id };
}

export async function deleteLocality(id: number) {
  await db.delete(localities).where(eq(localities.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/localities");
  revalidatePath("/auth/register");
  return { success: true };
}

export async function updateLocality(
  id: number,
  data: { name: string; state: string; country: string },
) {
  await db.update(localities).set(data).where(eq(localities.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/localities");
  revalidatePath("/auth/register");
  return { success: true };
}

// --- GESTIÓN DE CONFIGURACIÓN ---
export async function getSettings() {
  try {
    let config = await db.query.settings.findFirst();
    if (!config) {
      const [newConfig] = await db.insert(settings).values({}).returning();
      config = newConfig;
    }
    return config;
  } catch (error) {
    console.error("Error al obtener settings:", error);
    return {
      fullPaymentPrice: 1500,
      registrationFeePrice: 500,
      stripePercentage: "3.6",
      stripeFixedFee: 3,
      termsAndConditions: "",
      priceDeadline: null,
      bankName: "BBVA",
      bankCLABE: "0123 4567 8901 2345 67",
      bankHolder: "JIDI Internacional A.C.",
    };
  }
}

export async function updateSettings(data: {
  fullPaymentPrice: number;
  registrationFeePrice: number;
  stripePercentage: string;
  stripeFixedFee: number;
  termsAndConditions?: string;
  priceDeadline?: Date | null;
  bankName?: string;
  bankCLABE?: string;
  bankHolder?: string;
  oxxoCardNumber?: string;
}) {
  await db.update(settings).set({ ...data, updatedAt: new Date() });
  revalidatePath("/admin/dashboard");
  revalidatePath("/auth/register");
  return { success: true };
}

// --- GESTIÓN DE SEDE ---
export async function getVenue() {
  let venue = await db.query.venues.findFirst();
  if (!venue) {
    const [newVenue] = await db
      .insert(venues)
      .values({
        name: "Sede Principal",
        address: "Dirección de la sede",
        description: "Descripción de la sede",
        mapsUrl: "https://maps.google.com",
      })
      .returning();
    venue = newVenue;
  }
  return venue;
}

export async function updateVenue(data: any) {
  const current = await getVenue();
  await db.update(venues).set(data).where(eq(venues.id, current.id));
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard/venue");
  return { success: true };
}

// --- GESTIÓN DE USUARIOS (ASISTENTES) ---
export async function getUsers() {
  return await db.query.users.findMany({
    where: eq(users.role, "user"),
    with: {
      emergencyContact: true,
      healthInfo: true,
      payments: true,
    },
    orderBy: [desc(users.createdAt)],
  });
}

export async function updateUserDetails(userId: string, data: any) {
  await db.update(users).set(data).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  try {
    // 1. Obtener al usuario y sus pagos para tener las URLs de los archivos
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        payments: true,
      },
    });

    if (user) {
      // 2. Eliminar foto de perfil
      if (user.profilePhotoUrl) await deleteFile(user.profilePhotoUrl);

      // 3. Eliminar INE / Carta Responsiva
      if (user.documentUrl) await deleteFile(user.documentUrl);

      // 4. Eliminar todos los comprobantes de pago
      if (user.payments) {
        for (const payment of user.payments) {
          if (payment.proofUrl) await deleteFile(payment.proofUrl);
        }
      }
    }

    // 5. Eliminar de la base de datos (las relaciones se borran por CASCADE en el esquema)
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario y sus archivos:", error);
    return {
      success: false,
      error: "No se pudo eliminar al usuario completamente",
    };
  }
}

// --- GESTIÓN DE ADMINISTRADORES ---
export async function getAdmins() {
  return await db.query.users.findMany({
    where: eq(users.role, "admin"),
    orderBy: [desc(users.createdAt)],
  });
}

export async function createAdmin(data: any) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await db.insert(users).values({
      firstName: data.firstName,
      lastName: "",
      phone: data.phone,
      password: hashedPassword,
      role: "admin",
      age: 0,
      gender: "M",
      shirtSize: "N/A",
      country: "N/A",
      state: "N/A",
      locality: "N/A",
      registrationStatus: "completado",
    });
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, error: "Error al crear administrador" };
  }
}

export async function updateAdmin(userId: string, data: any) {
  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }
    await db.update(users).set(data).where(eq(users.id, userId));
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteAdmin(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateUserDocument(userId: string, formData: FormData) {
  try {
    const file = formData.get("documento") as File;
    if (!file) return { success: false, error: "No file provided" };

    const url = await uploadFile(file, "Carta Responsiva");

    await db
      .update(users)
      .set({ documentUrl: url })
      .where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true, url };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false };
  }
}

// --- GESTIÓN DE DASHBOARD / MÉTRICAS ---
export async function getAdminStats() {
  try {
    const [totalUsers] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "user"));

    // Asistentes distintos con al menos un pago validado (no filas de pago)
    const [validatedPayments] = await db
      .select({ value: countDistinct(payments.userId) })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(and(eq(payments.status, "completado"), eq(users.role, "user")));

    const [pendingPayments] = await db
      .select({ value: count() })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(and(eq(payments.status, "revision"), eq(users.role, "user")));

    const [totalIncome] = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(and(eq(payments.status, "completado"), eq(users.role, "user")));

    return {
      totalUsers: totalUsers.value,
      validatedPayments: validatedPayments.value,
      pendingPayments: pendingPayments.value,
      totalIncome: totalIncome.value || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      totalUsers: 0,
      validatedPayments: 0,
      pendingPayments: 0,
      totalIncome: 0,
    };
  }
}

// --- GESTIÓN DE PAGOS ---
export async function getPendingPayments() {
  return await db.query.payments.findMany({
    where: eq(payments.status, "revision"),
    with: {
      user: true,
    },
    orderBy: [desc(payments.createdAt)],
  });
}

export async function getRejectedPayments() {
  // Usuarios que ya tienen al menos un pago validado (no hay que contactarlos)
  const paid = await db
    .selectDistinct({ id: payments.userId })
    .from(payments)
    .where(eq(payments.status, "completado"));
  const paidIds = paid.map((p) => p.id);

  return await db.query.payments.findMany({
    where: and(
      eq(payments.status, "rechazado"),
      paidIds.length > 0 ? notInArray(payments.userId, paidIds) : undefined,
    ),
    with: {
      user: true,
    },
    orderBy: [desc(payments.createdAt)],
  });
}

export async function validatePayment(
  paymentId: number,
  status: "completado" | "rechazado",
  rejectionReason?: string,
) {
  try {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, paymentId))
      .returning();

    if (status === "rechazado") {
      // 1. Actualizar con razón de rechazo
      if (rejectionReason) {
        await db
          .update(payments)
          .set({ rejectionReason })
          .where(eq(payments.id, paymentId));
      }

      // 2. Eliminar el comprobante de R2 si existe
      if (updatedPayment.proofUrl) {
        try {
          await deleteFile(updatedPayment.proofUrl);
        } catch (error) {
          console.error("Error al eliminar comprobante:", error);
          // No fallar si no se puede eliminar el archivo
        }
      }

      // 3. Recalcular el estatus de registro del usuario
      const userPayments = await db
        .select({ amount: payments.amount })
        .from(payments)
        .where(
          and(
            eq(payments.userId, updatedPayment.userId),
            eq(payments.status, "completado"),
          ),
        );

      const totalPaid = userPayments.reduce((acc, p) => acc + p.amount, 0);
      const config = await db.query.settings.findFirst();
      const requiredAmount = config?.fullPaymentPrice || 1500;

      // Si después del rechazo no tiene suficientes pagos, volver a "pendiente"
      if (totalPaid === 0) {
        await db
          .update(users)
          .set({ registrationStatus: "pendiente" })
          .where(eq(users.id, updatedPayment.userId));
      } else if (totalPaid < requiredAmount) {
        await db
          .update(users)
          .set({ registrationStatus: "parcial" })
          .where(eq(users.id, updatedPayment.userId));
      }
    } else if (status === "completado") {
      // 1. Obtener todos los pagos completados del usuario
      const userPayments = await db
        .select({ amount: payments.amount })
        .from(payments)
        .where(
          and(
            eq(payments.userId, updatedPayment.userId),
            eq(payments.status, "completado"),
          ),
        );

      const totalPaid = userPayments.reduce((acc, p) => acc + p.amount, 0);

      // 2. Obtener el precio total requerido de settings
      const config = await db.query.settings.findFirst();
      const requiredAmount = config?.fullPaymentPrice || 1500;

      // 3. Solo si ya cubrió el total, lo marcamos como completado
      if (totalPaid >= requiredAmount) {
        await db
          .update(users)
          .set({ registrationStatus: "completado" })
          .where(eq(users.id, updatedPayment.userId));
      } else {
        await db
          .update(users)
          .set({ registrationStatus: "parcial" })
          .where(eq(users.id, updatedPayment.userId));
      }
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al validar pago:", error);
    return { success: false };
  }
}

// --- GESTIÓN DE DÍAS DE AGENDA ---
export async function getAgendaDays() {
  return await db.select().from(agendaDays).orderBy(asc(agendaDays.sortOrder));
}

export async function createAgendaDay(data: {
  label: string;
  date: string;
  sortOrder: number;
}) {
  await db.insert(agendaDays).values(data);
  revalidatePath("/admin/agenda");
  revalidatePath("/dashboard/agenda");
  return { success: true };
}

export async function deleteAgendaDay(id: number) {
  // Delete associated events first
  const dayIdStr = id.toString();
  await db.delete(events).where(eq(events.dayId, dayIdStr));
  await db.delete(agendaDays).where(eq(agendaDays.id, id));
  revalidatePath("/admin/agenda");
  revalidatePath("/dashboard/agenda");
  return { success: true };
}

// --- GESTIÓN DE AGENDA ---
export async function createEvent(data: any) {
  try {
    await db.insert(events).values(data);
    revalidatePath("/admin/agenda");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

export async function deleteEvent(eventId: number) {
  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/admin/agenda");
  revalidatePath("/dashboard/agenda");
}

// --- GESTIÓN DE NOTIFICACIONES ---
export async function broadcastNotification(data: {
  title: string;
  message: string;
  fullContent: string;
  type: string;
  isPinned: boolean;
}) {
  try {
    // Si el nuevo aviso es fijado, desfijamos todos los anteriores primero
    if (data.isPinned) {
      await db.update(notifications).set({ isPinned: false });
    }

    await db.insert(notifications).values(data);
    revalidatePath("/admin/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

// --- GESTIÓN DE CARTA RESPONSIVA ---
// Usa ruta fija en R2: templates/carta-responsiva.pdf

export async function uploadCartaResponsivaTemplate(formData: FormData) {
  try {
    const file = formData.get("template") as File;
    if (!file) return { success: false, error: "No file provided" };

    // Subir a ruta fija (sobreescribe si ya existe)
    const uploaded = await uploadCartaResponsivaToR2(file);
    if (!uploaded.success)
      return { success: false, error: "Error al subir la plantilla" };

    revalidatePath("/admin/dashboard");
    revalidatePath("/auth/register");
    return { success: true, url: uploaded.url, fileName: file.name };
  } catch (error) {
    console.error("Error uploading carta responsiva template:", error);
    return { success: false, error: "Error al subir la plantilla" };
  }
}

export async function getCartaResponsivaTemplate() {
  try {
    const exists = await checkCartaResponsivaExists();
    if (!exists) {
      return { success: false, error: "No template found" };
    }

    const url = getCartaResponsivaUrl();
    return { success: true, templateUrl: url };
  } catch (error) {
    console.error("Error getting carta responsiva template:", error);
    return { success: false, error: "Error al obtener la plantilla" };
  }
}

export async function deleteCartaResponsivaTemplate() {
  try {
    await deleteCartaResponsivaFromR2();

    revalidatePath("/admin/dashboard");
    revalidatePath("/auth/register");
    return { success: true };
  } catch (error) {
    console.error("Error deleting carta responsiva template:", error);
    return { success: false, error: "Error al eliminar la plantilla" };
  }
}

// --- GESTIÓN DE INFORMACIÓN DE SOPORTE ---
export async function getSupportInfo() {
  try {
    const config = await db.query.settings.findFirst();
    if (!config) {
      return {
        supportPhone: "+52 (555) 123-4567",
        supportEmail: "soporte@cngrs.mx",
        supportHours: "Lunes a Viernes, 9:00 AM - 6:00 PM",
      };
    }
    return {
      supportPhone: config.supportPhone || "+52 (555) 123-4567",
      supportEmail: config.supportEmail || "soporte@cngrs.mx",
      supportHours: config.supportHours || "Lunes a Viernes, 9:00 AM - 6:00 PM",
    };
  } catch (error) {
    console.error("Error getting support info:", error);
    return {
      supportPhone: "+52 (555) 123-4567",
      supportEmail: "soporte@cngrs.mx",
      supportHours: "Lunes a Viernes, 9:00 AM - 6:00 PM",
    };
  }
}

export async function updateSupportInfo(data: {
  supportPhone?: string;
  supportEmail?: string;
  supportHours?: string;
}) {
  try {
    await db.update(settings).set({ ...data, updatedAt: new Date() });
    revalidatePath("/admin/dashboard");
    revalidatePath("/auth/login");
    return { success: true };
  } catch (error) {
    console.error("Error updating support info:", error);
    return {
      success: false,
      error: "Error al actualizar información de soporte",
    };
  }
}

// --- PASSWORD RESET MANAGEMENT ---
export async function generateTemporaryPassword(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Generate a random temporary password (12 characters, mix of letters and numbers)
    const tempPassword =
      Math.random().toString(36).slice(2, 10).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user password and mark that they need to change it
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetRequired: true,
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");

    return {
      success: true,
      tempPassword: tempPassword,
      message: `Contraseña temporal generada: ${tempPassword}. El usuario deberá cambiarla en su próximo login.`,
    };
  } catch (error) {
    console.error("Error generating temporary password:", error);
    return {
      success: false,
      error: "Error al generar contraseña temporal",
    };
  }
}

export async function resetUserPassword(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Generate temporary password
    const tempPassword =
      Math.random().toString(36).slice(2, 10).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetRequired: true,
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");

    return {
      success: true,
      tempPassword: tempPassword,
      message: `Contraseña temporal enviada al usuario. Nueva contraseña: ${tempPassword}`,
    };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return {
      success: false,
      error: "Error al resetear contraseña del usuario",
    };
  }
}
