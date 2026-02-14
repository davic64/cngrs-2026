"use server";

import bcrypt from "bcryptjs";
import { and, asc, count, desc, eq, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  events,
  localities,
  notifications,
  payments,
  settings,
  users,
  venues,
} from "@/db/schema";
import { uploadFile } from "@/lib/storage";

// --- GESTIÓN DE LOCALIDADES ---
export async function getLocalities() {
  return await db.select().from(localities).orderBy(asc(localities.name));
}

export async function createLocality(data: {
  name: string;
  state: string;
  country: string;
}) {
  await db.insert(localities).values(data);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/localities");
  revalidatePath("/auth/register");
  return { success: true };
}

export async function deleteLocality(id: number) {
  await db.delete(localities).where(eq(localities.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath("/auth/register");
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
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
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
      ...data,
      password: hashedPassword,
      role: "admin",
      age: 26,
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

    const [validatedPayments] = await db
      .select({ value: count() })
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

export async function validatePayment(
  paymentId: number,
  status: "completado" | "rechazado",
) {
  try {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, paymentId))
      .returning();

    if (status === "completado") {
      // 1. Obtener todos los pagos completados del usuario
      const userPayments = await db.select({ amount: payments.amount }).from(payments).where(
        and(eq(payments.userId, updatedPayment.userId), eq(payments.status, "completado"))
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
