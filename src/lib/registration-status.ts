import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getRequiredAmount() {
  const config = await db.query.settings.findFirst();
  return config?.fullPaymentPrice || 1500;
}

// Estatus de registro derivado de los pagos validados. Va como sentencia dentro
// de un `db.batch` posterior al cambio del pago: corre en la misma transacción y
// ve el pago ya modificado, sin ventana de carrera con el webhook.
export function recomputeStatusStatement(userId: string, required: number) {
  const paid = sql`(SELECT COALESCE(SUM(amount), 0) FROM payments WHERE user_id = ${userId} AND payment_status = 'completado')`;
  return db
    .update(users)
    .set({
      registrationStatus: sql`(CASE WHEN ${paid} >= ${required} THEN 'completado' WHEN ${paid} > 0 THEN 'parcial' ELSE 'pendiente' END)::registration_status`,
    })
    .where(eq(users.id, userId));
}
