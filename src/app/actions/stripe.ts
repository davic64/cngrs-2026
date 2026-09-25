"use server";

import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, pendingRegistrations, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  checkCapacity,
  finalizeCardRegistration,
  isPhoneTaken,
  type PendingRegistrationData,
  validateRegistration,
} from "@/lib/registration";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function createCheckoutSession(
  userId: string | null,
  type: "completo" | "inscripcion",
  sessionId?: string,
  userName?: string,
  age?: number,
) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY no está configurada en el servidor");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("NEXT_PUBLIC_APP_URL no está configurada en el servidor");
    }

    if (!userId && age !== undefined) {
      if (age > 29) {
        const { getAdultCompanionCount } = await import("@/app/actions/ocr");
        const adultCount = await getAdultCompanionCount();
        if (adultCount >= 50) {
          throw new Error("Lo sentimos, el cupo de adultos acompañantes está lleno.");
        }
      } else {
        const { getRegularRegistrationCount } = await import("@/app/actions/ocr");
        const regularCount = await getRegularRegistrationCount();
        if (regularCount >= 500) {
          throw new Error("Lo sentimos, el cupo de asistentes generales está lleno.");
        }
      }
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

// Guarda el registro con tarjeta en el servidor antes de ir a Stripe.
// Valida datos, teléfono y cupo aquí para no cobrar a quien no puede registrarse.
export async function savePendingRegistration(formData: FormData) {
  const validation = validateRegistration(formData);
  if (!validation.ok) return { success: false, error: validation.error };
  const { password, ...data } = validation.data;

  try {
    if (await isPhoneTaken(data.phone)) {
      return { success: false, error: "El número telefónico ya está registrado" };
    }
    const capacityError = await checkCapacity(data.age);
    if (capacityError) return { success: false, error: capacityError };

    const id =
      (formData.get("sessionId") as string) ||
      `reg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const values = {
      data: {
        ...data,
        profilePhotoUrl: (formData.get("profilePhotoUrl") as string) || "",
        documentUrl: (formData.get("documentUrl") as string) || "",
      } satisfies PendingRegistrationData,
      passwordHash: await bcrypt.hash(password, 10),
      paymentType: data.paymentType,
      status: "pending",
      error: null,
    };

    await db
      .insert(pendingRegistrations)
      .values({ id, ...values })
      .onConflictDoUpdate({ target: pendingRegistrations.id, set: values });

    return { success: true, id };
  } catch (error) {
    console.error("Error guardando registro pendiente:", error);
    return {
      success: false,
      error: "No se pudo guardar tu registro. Intenta de nuevo.",
    };
  }
}

// Regreso del navegador desde Stripe: finaliza (o recupera) el registro y
// abre la sesión. No depende de localStorage.
export async function completeCardRegistration(checkoutSessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const result = await finalizeCardRegistration(session);
    if (!result.ok) return { success: false, error: result.error };

    const cookieStore = await cookies();
    cookieStore.set("user_session", result.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: undefined,
      path: "/",
    });

    revalidatePath("/dashboard");
    return { success: true, userId: result.userId };
  } catch (error) {
    console.error("Error completando registro con tarjeta:", error);
    return {
      success: false,
      error:
        "No pudimos confirmar tu pago todavía. Recarga la página en unos momentos.",
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
