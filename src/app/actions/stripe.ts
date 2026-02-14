"use server";

import Stripe from "stripe";
import { db } from "@/db";
import { payments, settings } from "@/db/schema";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function createCheckoutSession(
  userId: string,
  type: "completo" | "inscripcion",
) {
  try {
    // 1. Obtener precios actuales de la DB
    const config = await db.query.settings.findFirst();
    const basePrice =
      type === "completo"
        ? config?.fullPaymentPrice || 1500
        : config?.registrationFeePrice || 500;

    // 2. Calcular total con comisión (3.6% + $3)
    const commissionPercent =
      parseFloat(config?.stripePercentage || "3.6") / 100;
    const fixedFee = config?.stripeFixedFee || 3;
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
              name: `Registro CNGRS26 - ${type === "completo" ? "Pago Total" : "Inscripción"}`,
              description: "Acceso al Congreso Juvenil Internacional 2026",
            },
            unit_amount: totalPrice * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`,
      metadata: {
        userId: userId,
        paymentType: type,
      },
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Error al crear sesión de Stripe:", error);
    return { success: false, error: "No se pudo iniciar el proceso de pago" };
  }
}

export async function createCheckoutSessionForBalance(
  userId: string,
  amount: number,
) {
  try {
    // Calcular comisión Stripe sobre el monto faltante
    const config = await db.query.settings.findFirst();
    const commissionPercent =
      parseFloat(config?.stripePercentage || "3.6") / 100;
    const fixedFee = config?.stripeFixedFee || 3;
    const totalPrice = Math.ceil(amount * (1 + commissionPercent) + fixedFee);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: "Liquidación de Pago - CNGRS26",
              description: "Pago de saldo restante para el Congreso Juvenil",
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`,
      metadata: {
        userId: userId,
        paymentType: "completo", // Al liquidar se marca como completo
      },
    });

    return { success: true, url: session.url };
  } catch (error) {
    return { success: false, error: "Error al crear pago de liquidación" };
  }
}

export async function uploadManualPaymentProof(
  userId: string,
  amount: number,
  formData: FormData,
) {
  try {
    const file = formData.get("file") as File;
    const method = formData.get("method") as
      | "transferencia"
      | "efectivo";

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
