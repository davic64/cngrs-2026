import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
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

    if (userId) {
      // 1. Registrar el pago en la tabla de pagos PRIMERO
      await db.insert(payments).values({
        userId: userId,
        amount: (session.amount_total || 0) / 100, // De centavos a pesos
        type: paymentType || "completo",
        method: "tarjeta",
        status: "completado",
      });

      // 2. Calcular total pagado acumulado
      const userPayments = await db.query.payments.findMany({
        where: (payments, { and, eq }) => 
          and(eq(payments.userId, userId), eq(payments.status, "completado"))
      });
      
      const totalPaid = userPayments.reduce((acc, p) => acc + p.amount, 0);

      // 3. Obtener meta de settings
      const config = await db.query.settings.findFirst();
      const requiredAmount = config?.fullPaymentPrice || 1500;

      // 4. Actualizar estatus del usuario
      await db
        .update(users)
        .set({
          registrationStatus: totalPaid >= requiredAmount ? "completado" : "parcial",
        })
        .where(eq(users.id, userId));

      console.log(`✅ Pago procesado para el usuario ${userId}. Total: ${totalPaid}/${requiredAmount}`);
    }
  }

  return new NextResponse(null, { status: 200 });
}
