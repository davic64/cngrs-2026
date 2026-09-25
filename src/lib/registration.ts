import { eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type Stripe from "stripe";
import { db } from "@/db";
import {
  emergencyContacts,
  healthInfo,
  payments,
  pendingRegistrations,
  users,
} from "@/db/schema";
import { confirmTemporaryFiles } from "@/lib/storage";
import { notifyAdmin } from "@/lib/telegram";
import {
  getAdultCompanionCount,
  getRegularRegistrationCount,
} from "@/app/actions/ocr";

export type RegistrationData = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  age: number;
  gender: "M" | "F" | "Otro";
  shirtSize: string;
  country: string;
  state: string;
  locality: string;
  allergies: string;
  conditions: string;
  medications: string;
  dosageFrequency: string;
  contactName: string;
  contactPhone: string;
  paymentType: "completo" | "inscripcion";
  paymentMethod: "tarjeta" | "transferencia" | "efectivo";
};

// [campo del formulario, clave en RegistrationData, etiqueta para el usuario]
const TEXT_FIELDS: [string, keyof RegistrationData, string][] = [
  ["nombre", "firstName", "el nombre"],
  ["apellido", "lastName", "el apellido"],
  ["telefono", "phone", "el teléfono"],
  ["password", "password", "la contraseña"],
  ["tallaPlayera", "shirtSize", "la talla de playera"],
  ["pais", "country", "el país"],
  ["estado", "state", "el estado"],
  ["localidad", "locality", "la localidad"],
  ["alergias", "allergies", "las alergias"],
  ["padecimiento", "conditions", "los padecimientos"],
  ["medicamento", "medications", "los medicamentos"],
  ["dosisFrecuencia", "dosageFrequency", "la dosis/frecuencia"],
  ["contactoNombre", "contactName", "el nombre del contacto de emergencia"],
  [
    "contactoTelefono",
    "contactPhone",
    "el teléfono del contacto de emergencia",
  ],
];

export function validateRegistration(
  fd: FormData,
): { ok: true; data: RegistrationData } | { ok: false; error: string } {
  const data: Record<string, unknown> = {};

  for (const [field, key, label] of TEXT_FIELDS) {
    const value = String(fd.get(field) ?? "").trim();
    if (!value)
      return { ok: false, error: `Falta ${label}. Revisa tus datos.` };
    data[key] = value;
  }

  const age = parseInt(String(fd.get("edad") ?? ""), 10);
  if (Number.isNaN(age) || age < 15) {
    return { ok: false, error: "La edad es inválida (mínimo 15 años)." };
  }
  data.age = age;

  const gender = fd.get("genero");
  if (gender !== "M" && gender !== "F" && gender !== "Otro") {
    return { ok: false, error: "Falta el género. Revisa tus datos." };
  }
  data.gender = gender;

  const paymentType = fd.get("tipoPago");
  if (paymentType !== "completo" && paymentType !== "inscripcion") {
    return { ok: false, error: "Selecciona el tipo de pago." };
  }
  data.paymentType = paymentType;

  const paymentMethod = fd.get("metodoPago");
  if (
    paymentMethod !== "tarjeta" &&
    paymentMethod !== "transferencia" &&
    paymentMethod !== "efectivo"
  ) {
    return { ok: false, error: "Selecciona el método de pago." };
  }
  data.paymentMethod = paymentMethod;

  return { ok: true, data: data as RegistrationData };
}

// Devuelve el mensaje de cupo lleno, o null si hay lugar.
export async function checkCapacity(age: number): Promise<string | null> {
  if (age > 29) {
    if ((await getAdultCompanionCount()) >= 50) {
      return "Lo sentimos, el cupo de adultos acompañantes está lleno.";
    }
  } else if ((await getRegularRegistrationCount()) >= 500) {
    return "Lo sentimos, el cupo de asistentes generales está lleno.";
  }
  return null;
}

export async function isPhoneTaken(phone: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.phone, phone),
    columns: { id: true },
  });
  return !!user;
}

// Crea usuario + contacto + salud + pago en una sola transacción (db.batch).
// `extra` permite sumar sentencias a la misma transacción (p. ej. marcar el
// registro pendiente como completado).
export async function createRegistration(input: {
  data: Omit<RegistrationData, "password">;
  passwordHash: string;
  profilePhotoUrl: string;
  documentUrl: string;
  payment: {
    amount: number;
    status: "revision" | "completado";
    proofUrl?: string;
  };
  extra?: (userId: string) => BatchItem<"pg">[];
}) {
  const { data, payment } = input;
  const userId = crypto.randomUUID();

  let registrationStatus: "pendiente" | "parcial" | "completado" = "pendiente";
  if (payment.status === "completado") {
    const config = await db.query.settings.findFirst();
    registrationStatus =
      payment.amount >= (config?.fullPaymentPrice || 1500)
        ? "completado"
        : "parcial";
  }

  await db.batch([
    db.insert(users).values({
      id: userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      password: input.passwordHash,
      age: data.age,
      gender: data.gender,
      shirtSize: data.shirtSize,
      country: data.country,
      state: data.state,
      locality: data.locality,
      registrationStatus,
      profilePhotoUrl: input.profilePhotoUrl,
      documentUrl: input.documentUrl,
    }),
    db.insert(emergencyContacts).values({
      userId,
      name: data.contactName,
      phone: data.contactPhone,
    }),
    db.insert(healthInfo).values({
      userId,
      allergies: data.allergies,
      conditions: data.conditions,
      medications: data.medications,
      dosageFrequency: data.dosageFrequency,
    }),
    db.insert(payments).values({
      userId,
      amount: payment.amount,
      type: data.paymentType,
      method: data.paymentMethod,
      status: payment.status,
      proofUrl: payment.proofUrl,
    }),
    ...(input.extra?.(userId) ?? []),
  ]);

  return userId;
}

// Código de Postgres de un error de Drizzle/Neon (puede venir en .cause).
export function pgCode(error: unknown): string | undefined {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
}

// Lo que se guarda en pending_registrations.data (sin la contraseña).
export type PendingRegistrationData = Omit<RegistrationData, "password"> & {
  profilePhotoUrl: string;
  documentUrl: string;
};

type FinalizeResult =
  | { ok: true; userId: string }
  | { ok: false; error: string; retryable: boolean };

// Crea usuario + pago a partir de un registro pendiente ya pagado en Stripe.
// Idempotente: la usan el webhook y el regreso del navegador; si ambos corren,
// el segundo choca con el teléfono único y lee el resultado del primero.
export async function finalizeCardRegistration(
  session: Stripe.Checkout.Session,
): Promise<FinalizeResult> {
  if (session.payment_status !== "paid") {
    return {
      ok: false,
      error: "El pago aún no ha sido completado.",
      retryable: false,
    };
  }

  const regId = session.metadata?.sessionId;
  const findPending = () =>
    regId
      ? db.query.pendingRegistrations.findFirst({
          where: eq(pendingRegistrations.id, regId),
        })
      : Promise.resolve(undefined);

  const pending = await findPending();
  if (!pending) {
    await notifyAdmin(
      `🚨 *PAGO SIN REGISTRO*\n\nStripe cobró pero no hay registro pendiente.\n🧾 Sesión: ${session.id}\n👤 ${session.customer_details?.name ?? "-"}\n📧 ${session.customer_details?.email ?? "-"}\n💰 $${(session.amount_total ?? 0) / 100} MXN`,
    );
    return {
      ok: false,
      error:
        "Tu pago se recibió pero no encontramos tus datos de registro. Ya avisamos al equipo; escríbenos por el chat de soporte.",
      retryable: false,
    };
  }

  if (pending.status === "completed" && pending.userId) {
    return { ok: true, userId: pending.userId };
  }

  const { profilePhotoUrl, documentUrl, ...data } =
    pending.data as PendingRegistrationData;
  const amount = parseInt(session.metadata?.baseAmount ?? "", 10);

  try {
    const userId = await createRegistration({
      data: {
        ...data,
        paymentType: pending.paymentType as RegistrationData["paymentType"],
        paymentMethod: "tarjeta",
      },
      passwordHash: pending.passwordHash,
      profilePhotoUrl,
      documentUrl,
      payment: {
        amount: Number.isNaN(amount)
          ? (session.amount_total ?? 0) / 100
          : amount,
        status: "completado",
      },
      extra: (uid) => [
        db
          .update(pendingRegistrations)
          .set({ status: "completed", userId: uid, error: null })
          .where(eq(pendingRegistrations.id, pending.id)),
      ],
    });
    await confirmTemporaryFiles(pending.id);
    return { ok: true, userId };
  } catch (error: any) {
    if (pgCode(error) === "23505") {
      const again = await findPending();
      if (again?.status === "completed" && again.userId) {
        return { ok: true, userId: again.userId };
      }
    }

    const message = `${pgCode(error) ?? ""} ${error?.message ?? error}`.trim();
    console.error(
      `Error finalizando registro con tarjeta ${pending.id}:`,
      error,
    );
    await db
      .update(pendingRegistrations)
      .set({ status: "failed", error: message })
      .where(eq(pendingRegistrations.id, pending.id));
    await notifyAdmin(
      `🚨 *PAGO CON TARJETA SIN CUENTA*\n\n👤 ${data.firstName} ${data.lastName}\n📱 ${data.phone}\n💰 $${amount} MXN (${pending.paymentType})\n🧾 Sesión Stripe: ${session.id}\n❌ ${message}`,
    );
    return {
      ok: false,
      error:
        "Tu pago se recibió pero no pudimos completar tu registro. Ya avisamos al equipo y te contactaremos.",
      retryable: pgCode(error) !== "23505",
    };
  }
}
