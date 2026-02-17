"use server";

import Stripe from "stripe";
import { db } from "@/db";
import { payments, settings } from "@/db/schema";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function createCheckoutSession(
  userId: string | null,
  type: "completo" | "inscripcion",
  sessionId?: string,
) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY no está configurada en el servidor");
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

    // 3. Obtener URL base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isRegistration = !userId;

    // 4. Crear sesión en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Registro CNGRS26 - ${type === "completo" ? "Pago Total" : "Inscripción"}`,
              description: "Acceso al Congreso Juvenil Internacional 2026",
            },
            unit_amount: totalPrice * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: isRegistration
        ? `${baseUrl}/auth/register?stripe=success&session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/dashboard?payment=success`,
      cancel_url: isRegistration
        ? `${baseUrl}/auth/register?stripe=cancel`
        : `${baseUrl}/dashboard?payment=cancel`,
      metadata: {
        userId: userId || "registration_pending",
        paymentType: type,
        baseAmount: String(basePrice),
        ...(sessionId && { sessionId }),
      },
    });

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error("Error detallado en Stripe Action:", error);
    return {
      success: false,
      error:
        error.message || "No se pudo iniciar el proceso de pago con tarjeta",
    };
  }
}

export async function verifyStripeSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return {
        success: true,
        amount: (session.amount_total || 0) / 100,
        type: session.metadata?.paymentType || "completo",
      };
    }
    return { success: false, error: "El pago no fue completado" };
  } catch (error: any) {
    return { success: false, error: "No se pudo verificar el pago" };
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

    // 3. Obtener URL base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: "Liquidación de Pago - CNGRS26",
              description: `Pago de saldo restante ($${amount} MXN + comisiones)`,
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancel`,
      metadata: {
        userId: userId,
        paymentType: "liquidacion",
        baseAmount: String(amount),
      },
    });

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error("Error en Stripe Balance Action:", error);
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

    if (!file) return { success: false, error: "No se encontró el archivo" };

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
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    return { success: false, error: "No se pudo procesar el comprobante" };
  }
}
