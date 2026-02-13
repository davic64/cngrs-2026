"use server";

import { db } from "@/db";
import { asc, count, desc, eq, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  events,
  localities,
  notifications,
  payments,
  settings,
  users,
} from "@/db/schema";
import { uploadFile } from "@/lib/storage";

// --- GESTIÓN DE LOCALIDADES ---
export async function getLocalities() {
  return await db.select().from(localities).orderBy(asc(localities.name));
}

export async function createLocality(data: { name: string; country: string }) {
  await db.insert(localities).values(data);
  revalidatePath("/admin/dashboard");
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
    };
  }
}

export async function updateSettings(data: {
  fullPaymentPrice: number;
  registrationFeePrice: number;
  stripePercentage: string;
  stripeFixedFee: number;
}) {
  await db.update(settings).set({ ...data, updatedAt: new Date() });
  revalidatePath("/admin/dashboard");
  revalidatePath("/auth/register");
  return { success: true };
}

// --- GESTIÓN DE USUARIOS ---
export async function getUsers() {
  return await db.query.users.findMany({
    with: {
      emergencyContact: true,
      healthInfo: true,
    },
    orderBy: [desc(users.createdAt)],
  });
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
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [validatedPayments] = await db
      .select({ value: count() })
      .from(payments)
      .where(eq(payments.status, "completado"));
    const [pendingPayments] = await db
      .select({ value: count() })
      .from(payments)
      .where(eq(payments.status, "revision"));
    const [totalIncome] = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "completado"));

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
      await db
        .update(users)
        .set({ registrationStatus: "completado" })
        .where(eq(users.id, updatedPayment.userId));
    }

    revalidatePath("/admin/payments");
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
    await db.insert(notifications).values(data);
    revalidatePath("/admin/notifications");
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}
