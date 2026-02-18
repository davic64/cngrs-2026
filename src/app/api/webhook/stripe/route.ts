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
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Manejar el evento de pago exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const paymentType = session.metadata?.paymentType;
    const baseAmount = session.metadata?.baseAmount
      ? parseInt(session.metadata.baseAmount, 10)
      : (session.amount_total || 0) / 100;

    if (!userId) {
      console.warn("Webhook: userId no encontrado en metadata");
      return new NextResponse("Missing userId", { status: 400 });
    }

    try {
      // Si es un usuario existente (dashboard payments)
      if (userId !== "registration_pending") {
        console.log(`Processing payment for existing user: ${userId}`);

        // 1. Registrar el pago
        await db.insert(payments).values({
          userId,
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
        const newStatus =
          totalPaid >= requiredAmount ? "completado" : "parcial";
        await db
          .update(users)
          .set({ registrationStatus: newStatus })
          .where(eq(users.id, userId));

        // 5. Confirmar archivos temporales si los hay
        const sessionId = session.metadata?.sessionId;
        if (sessionId) {
          await confirmTemporaryFiles(sessionId);
          console.log(`✅ Temporary files confirmed for session: ${sessionId}`);
        }

        console.log(
          `✅ Payment processed for user ${userId}. Total: ${totalPaid}/${requiredAmount}. New status: ${newStatus}`,
        );
      } else {
        // Si es un nuevo usuario en registro (registration_pending)
        console.log(
          `Processing payment for new registration. Will be handled by client.`,
        );
        // El cliente se encargará de completar el registro con recordNewRegistrationPayment
        // El webhook solo confirma los archivos temporales aquí
        const sessionId = session.metadata?.sessionId;
        if (sessionId) {
          await confirmTemporaryFiles(sessionId);
          console.log(
            `✅ Temporary files confirmed for new registration session: ${sessionId}`,
          );
        }
      }
    } catch (error: any) {
      console.error(
        `Error processing webhook for user ${userId}:`,
        error.message,
      );
      // No retornar error al webhook para evitar reintentos infinitos
      // El error será loggeado pero el webhook responderá 200
    }
  }

  // Retornar 200 para todas las solicitudes exitosas
  return new NextResponse(null, { status: 200 });
}
