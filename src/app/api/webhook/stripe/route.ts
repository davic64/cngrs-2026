import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { confirmTemporaryFiles } from "@/lib/storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Manejar el evento de pago exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const paymentType = session.metadata?.paymentType;

    if (userId && userId !== "registration_pending") {
      // 1. Registrar el pago (usar baseAmount del metadata, sin comisiones)
      const baseAmount = session.metadata?.baseAmount
        ? parseInt(session.metadata.baseAmount, 10)
        : (session.amount_total || 0) / 100;

      await db.insert(payments).values({
        userId: userId,
        amount: baseAmount,
        type: paymentType || "completo",
        method: "tarjeta",
        status: "completado",
      });

      // 2. Calcular total pagado acumulado
      const userPayments = await db.query.payments.findMany({
        where: (payments, { and, eq }) =>
          and(eq(payments.userId, userId), eq(payments.status, "completado")),
      });

      const totalPaid = userPayments.reduce((acc, p) => acc + p.amount, 0);

      // 3. Obtener meta de settings
      const config = await db.query.settings.findFirst();
      const requiredAmount = config?.fullPaymentPrice || 1500;

      // 4. Actualizar estatus del usuario
      await db
        .update(users)
        .set({
          registrationStatus:
            totalPaid >= requiredAmount ? "completado" : "parcial",
        })
        .where(eq(users.id, userId));

      // 5. Confirmar archivos temporales del cliente si los hay
      const sessionId = session.metadata?.sessionId;
      if (sessionId) {
        await confirmTemporaryFiles(sessionId);
        console.log(
          `✅ Archivos temporales confirmados para sesión: ${sessionId}`,
        );
      }

      console.log(
        `✅ Pago procesado para el usuario ${userId}. Total: ${totalPaid}/${requiredAmount}`,
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
