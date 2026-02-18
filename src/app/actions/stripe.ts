"use server";

import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, settings, users } from "@/db/schema";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function createCheckoutSession(
  userId: string | null,
  type: "completo" | "inscripcion",
  sessionId?: string,
  userName?: string,
) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY no está configurada en el servidor");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("NEXT_PUBLIC_APP_URL no está configurada en el servidor");
    }

    // 1. Obtener precios actuales de la DB
    const config = await db.query.settings.findFirst();
    if (!config) {
      throw new Error(
        "No se pudo obtener la configuración de pagos de la base de datos",
      );
    }

    const basePrice =
      type === "completo"
        ? config.fullPaymentPrice
        : config.registrationFeePrice;

    // 2. Calcular total con comisión (3.6% + $3)
    const commissionPercent =
      parseFloat(config.stripePercentage || "3.6") / 100;
    const fixedFee = config.stripeFixedFee || 3;
    const totalPrice = Math.ceil(
      basePrice * (1 + commissionPercent) + fixedFee,
    );

    // 3. Crear sesión en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${userName ? `${userName} ` : ""}CNGRS26`,
              description: "Acceso al Congreso Juvenil Internacional 2026",
            },
            unit_amount: totalPrice * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: userId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: userId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?stripe=cancel`,
      metadata: {
        userId: userId || "registration_pending",
        paymentType: type,
        baseAmount: String(basePrice),
        isNewRegistration: userId ? "false" : "true",
        ...(sessionId && { sessionId }),
      },
    });

    if (!session.url) {
      throw new Error("No se pudo generar la URL de checkout de Stripe");
    }

    return { success: true, url: session.url, sessionId: session.id };
  } catch (error: any) {
    console.error("Error en createCheckoutSession:", error);
    return {
      success: false,
      error:
        error.message || "No se pudo iniciar el proceso de pago con tarjeta",
    };
  }
}

export async function verifyStripeSession(sessionId: string) {
  try {
    if (!sessionId) {
      throw new Error("Session ID no proporcionado");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return {
        success: true,
        amount: (session.amount_total || 0) / 100,
        type: session.metadata?.paymentType || "completo",
        baseAmount: session.metadata?.baseAmount
          ? parseInt(session.metadata.baseAmount, 10)
          : (session.amount_total || 0) / 100,
        userId: session.metadata?.userId,
        isNewRegistration: session.metadata?.isNewRegistration === "true",
      };
    }

    if (session.payment_status === "unpaid") {
      return { success: false, error: "El pago aún no ha sido procesado" };
    }

    return {
      success: false,
      error: "El pago no fue completado o fue cancelado",
    };
  } catch (error: any) {
    console.error("Error al verificar sesión de Stripe:", error);
    return {
      success: false,
      error: "No se pudo verificar el pago. Por favor intenta de nuevo.",
    };
  }
}

export async function recordNewRegistrationPayment(
  userId: string,
  sessionId: string,
  baseAmount: number,
  paymentType: "completo" | "inscripcion",
) {
  try {
    // Verificar que el pago fue realizado en Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return {
        success: false,
        error: "El pago en Stripe no fue completado",
      };
    }

    // Registrar el pago en la BD
    await db.insert(payments).values({
      userId,
      amount: baseAmount,
      type: paymentType,
      method: "tarjeta",
      status: "completado",
    });

    // Calcular nuevo status del usuario
    const userPayments = await db.query.payments.findMany({
      where: (payments, { and, eq }) =>
        and(eq(payments.userId, userId), eq(payments.status, "completado")),
    });

    const totalPaid = userPayments.reduce((acc, p) => acc + p.amount, 0);
    const config = await db.query.settings.findFirst();
    const requiredAmount = config?.fullPaymentPrice || 1500;

    const newStatus = totalPaid >= requiredAmount ? "completado" : "parcial";

    await db
      .update(users)
      .set({ registrationStatus: newStatus })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");

    return {
      success: true,
      registrationStatus: newStatus,
      totalPaid,
      requiredAmount,
    };
  } catch (error: any) {
    console.error("Error al registrar pago de nuevo usuario:", error);
    return {
      success: false,
      error: "No se pudo registrar el pago. Por favor contacta soporte.",
    };
  }
}

export async function createCheckoutSessionForBalance(
  userId: string,
  amount: number,
) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY no está configurada");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("NEXT_PUBLIC_APP_URL no está configurada en el servidor");
    }

    // 1. Obtener configuración para comisiones
    const config = await db.query.settings.findFirst();
    if (!config) {
      throw new Error(
        "No se pudo obtener la configuración de la base de datos",
      );
    }

    const commissionPercent =
      parseFloat(config.stripePercentage || "3.6") / 100;
    const fixedFee = config.stripeFixedFee || 3;

    // 2. Calcular total con comisión
    const totalPrice = Math.ceil(amount * (1 + commissionPercent) + fixedFee);

    // 3. Obtener datos del usuario
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${userName} - CNGRS26`,
              description: `Pago de saldo restante ($${amount} MXN + comisiones)`,
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`,
      metadata: {
        userId: userId,
        paymentType: "liquidacion",
        baseAmount: String(amount),
        isNewRegistration: "false",
      },
    });

    if (!session.url) {
      throw new Error("No se pudo generar la URL de checkout de Stripe");
    }

    return { success: true, url: session.url, sessionId: session.id };
  } catch (error: any) {
    console.error("Error en createCheckoutSessionForBalance:", error);
    return {
      success: false,
      error: error.message || "No se pudo iniciar el proceso de liquidación",
    };
  }
}

export async function uploadManualPaymentProof(
  userId: string,
  amount: number,
  formData: FormData,
) {
  try {
    const file = formData.get("file") as File;
    const method = formData.get("method") as "transferencia" | "efectivo";

    if (!file) {
      return { success: false, error: "No se encontró el archivo" };
    }

    if (!method || (method !== "transferencia" && method !== "efectivo")) {
      return { success: false, error: "Método de pago inválido" };
    }

    // Importar uploadFile aquí para evitar imports circulares
    const { uploadFile } = await import("@/lib/storage");
    const url = await uploadFile(file, "Pagos");

    await db.insert(payments).values({
      userId,
      amount,
      type: "liquidacion",
      method,
      status: "revision",
      proofUrl: url,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error al subir comprobante:", error);
    return {
      success: false,
      error: error.message || "No se pudo procesar el comprobante",
    };
  }
}
