"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { auditStatement } from "@/lib/audit";
import { diffChanges } from "@/lib/diff-changes";
import { validatePaymentEdit } from "@/lib/payment-edit";
import {
  getRequiredAmount,
  recomputeStatusStatement,
} from "@/lib/registration-status";
import { deleteFile } from "@/lib/storage";

type Result =
  | { success: true; changed: boolean }
  | { success: false; error: string };

function refresh() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
}

// Alta manual (p. ej. efectivo recibido en persona). Pago + estatus + bitácora
// en una transacción.
export async function createPayment(
  userId: string,
  input: Record<string, unknown>,
): Promise<Result> {
  const admin = await requireAdmin();

  const validation = validatePaymentEdit({
    status: "completado",
    ...input,
  });
  if (!validation.ok) return { success: false, error: validation.error };
  const data = validation.data;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  if (!user || user.role !== "user") {
    return { success: false, error: "Asistente no encontrado." };
  }

  try {
    const required = await getRequiredAmount();
    await db.batch([
      db.insert(payments).values({ userId, ...data }),
      recomputeStatusStatement(userId, required),
      auditStatement({
        adminId: admin.id,
        userId,
        entity: "payment",
        // currval: id del pago recién insertado en esta misma transacción
        entityId: sql`currval(pg_get_serial_sequence('payments', 'id'))::text`,
        action: "create",
        changes: data,
      }),
    ]);
    refresh();
    return { success: true, changed: true };
  } catch (error) {
    console.error("Error al crear pago:", error);
    return { success: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}

export async function updatePayment(
  paymentId: number,
  input: Record<string, unknown>,
): Promise<Result> {
  const admin = await requireAdmin();

  const validation = validatePaymentEdit(input);
  if (!validation.ok) return { success: false, error: validation.error };
  const data = validation.data;

  const current = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
  });
  if (!current) return { success: false, error: "Pago no encontrado." };

  const changes = diffChanges(
    {
      amount: current.amount,
      type: current.type,
      method: current.method,
      status: current.status,
      rejectionReason: current.rejectionReason ?? null,
    },
    data,
  );
  if (Object.keys(changes).length === 0)
    return { success: true, changed: false };

  try {
    const required = await getRequiredAmount();
    await db.batch([
      db.update(payments).set(data).where(eq(payments.id, paymentId)),
      recomputeStatusStatement(current.userId, required),
      auditStatement({
        adminId: admin.id,
        userId: current.userId,
        entity: "payment",
        entityId: paymentId,
        action: "update",
        changes,
      }),
    ]);
    refresh();
    revalidatePath("/dashboard");
    return { success: true, changed: true };
  } catch (error) {
    console.error("Error al editar pago:", error);
    return { success: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}

export async function deletePayment(paymentId: number): Promise<Result> {
  const admin = await requireAdmin();

  const current = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
  });
  if (!current) return { success: false, error: "Pago no encontrado." };

  try {
    const required = await getRequiredAmount();
    await db.batch([
      db.delete(payments).where(eq(payments.id, paymentId)),
      recomputeStatusStatement(current.userId, required),
      auditStatement({
        adminId: admin.id,
        userId: current.userId,
        entity: "payment",
        entityId: paymentId,
        action: "delete",
        changes: {
          amount: current.amount,
          type: current.type,
          method: current.method,
          status: current.status,
          rejectionReason: current.rejectionReason,
        },
      }),
    ]);
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return { success: false, error: "No se pudo eliminar. Intenta de nuevo." };
  }

  // El archivo no es transaccional: si falla se registra y no se revierte la BD
  if (current.proofUrl) {
    try {
      await deleteFile(current.proofUrl);
    } catch (error) {
      console.error("Error al eliminar comprobante:", error);
    }
  }

  refresh();
  revalidatePath("/dashboard");
  return { success: true, changed: true };
}
