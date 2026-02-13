"use server";

import Stripe from "stripe";
import { db } from "@/db";
import { settings } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function createCheckoutSession(userId: string, type: "completo" | "inscripcion") {
  try {
    // 1. Obtener precios actuales de la DB
    const config = await db.query.settings.findFirst();
    const basePrice = type === "completo" ? config?.fullPaymentPrice || 1500 : config?.registrationFeePrice || 500;
    
    // 2. Calcular total con comisión (3.6% + $3)
    const commissionPercent = parseFloat(config?.stripePercentage || "3.6") / 100;
    const fixedFee = config?.stripeFixedFee || 3;
    const totalPrice = Math.ceil(basePrice * (1 + commissionPercent) + fixedFee);

    // 3. Crear sesión en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Registro CNGRS26 - ${type === 'completo' ? 'Pago Total' : 'Inscripción'}`,
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
