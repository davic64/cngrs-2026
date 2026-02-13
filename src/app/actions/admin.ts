"use server";

import { db } from "@/db";
import { users, payments, events, notifications } from "@/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- GESTIÓN DE DASHBOARD / MÉTRICAS ---
export async function getAdminStats() {
  try {
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [validatedPayments] = await db.select({ value: count() }).from(payments).where(eq(payments.status, "completado"));
    const [pendingPayments] = await db.select({ value: count() }).from(payments).where(eq(payments.status, "revision"));
    const [totalIncome] = await db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.status, "completado"));

    return {
      totalUsers: totalUsers.value,
      validatedPayments: validatedPayments.value,
      pendingPayments: pendingPayments.value,
      totalIncome: totalIncome.value || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return { totalUsers: 0, validatedPayments: 0, pendingPayments: 0, totalIncome: 0 };
  }
}

// --- GESTIÓN DE PAGOS ---
export async function getPendingPayments() {
  return await db.query.payments.findMany({
    where: eq(payments.status, "revision"),
    with: {
      user: true, // Necesitaremos configurar la relación en el schema
    },
    orderBy: [desc(payments.createdAt)],
  });
}

export async function validatePayment(paymentId: number, status: "completado" | "rechazado") {
  try {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, paymentId))
      .returning();

    // Si el pago es aprobado y es el total, actualizamos el estatus del usuario
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
  } catch (error) {
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
  } catch (error) {
    return { success: false };
  }
}
