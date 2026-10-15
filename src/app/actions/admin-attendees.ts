"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { emergencyContacts, healthInfo, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { validateAttendeeEdit } from "@/lib/attendee-edit";
import { auditStatement } from "@/lib/audit";
import { diffChanges } from "@/lib/diff-changes";
import { checkCapacity, isPhoneTaken, pgCode } from "@/lib/registration";

type Result =
  | { success: true; changed: boolean }
  | { success: false; error: string };

// El admin edita los datos de un asistente. Todo o nada: usuario, contacto,
// salud y bitácora van en la misma transacción.
export async function updateAttendee(
  userId: string,
  input: Record<string, unknown>,
): Promise<Result> {
  const admin = await requireAdmin();

  const validation = validateAttendeeEdit(input);
  if (!validation.ok) return { success: false, error: validation.error };
  const data = validation.data;

  const current = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.role, "user")),
    with: { emergencyContact: true, healthInfo: true },
  });
  if (!current) return { success: false, error: "Asistente no encontrado." };

  const before = {
    firstName: current.firstName,
    lastName: current.lastName,
    phone: current.phone,
    age: current.age,
    gender: current.gender,
    shirtSize: current.shirtSize,
    country: current.country,
    state: current.state,
    locality: current.locality,
    contactName: current.emergencyContact?.name ?? "",
    contactPhone: current.emergencyContact?.phone ?? "",
    allergies: current.healthInfo?.allergies ?? "",
    conditions: current.healthInfo?.conditions ?? "",
    medications: current.healthInfo?.medications ?? "",
    dosageFrequency: current.healthInfo?.dosageFrequency ?? "",
  };
  const changes = diffChanges(before, data);
  if (Object.keys(changes).length === 0)
    return { success: true, changed: false };

  try {
    if (changes.phone && (await isPhoneTaken(data.phone))) {
      return { success: false, error: "Ese teléfono ya está registrado." };
    }

    // Cambiar de bolsa de edad (≤29 ↔ >29) consume cupo de la bolsa destino
    // sólo si el asistente ya cuenta en el cupo (registro completado).
    const movesPool = current.age > 29 !== data.age > 29;
    if (movesPool && current.registrationStatus === "completado") {
      const capacityError = await checkCapacity(data.age);
      if (capacityError) return { success: false, error: capacityError };
    }

    await db.batch([
      db
        .update(users)
        .set({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
          shirtSize: data.shirtSize,
          country: data.country,
          state: data.state,
          locality: data.locality,
        })
        .where(eq(users.id, userId)),
      db
        .insert(emergencyContacts)
        .values({ userId, name: data.contactName, phone: data.contactPhone })
        .onConflictDoUpdate({
          target: emergencyContacts.userId,
          set: { name: data.contactName, phone: data.contactPhone },
        }),
      db
        .insert(healthInfo)
        .values({
          userId,
          allergies: data.allergies,
          conditions: data.conditions,
          medications: data.medications,
          dosageFrequency: data.dosageFrequency,
        })
        .onConflictDoUpdate({
          target: healthInfo.userId,
          set: {
            allergies: data.allergies,
            conditions: data.conditions,
            medications: data.medications,
            dosageFrequency: data.dosageFrequency,
          },
        }),
      auditStatement({
        adminId: admin.id,
        userId,
        entity: "user",
        entityId: userId,
        action: "update",
        changes,
      }),
    ]);

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    return { success: true, changed: true };
  } catch (error) {
    console.error("Error al editar asistente:", error);
    if (pgCode(error) === "23505") {
      return { success: false, error: "Ese teléfono ya está registrado." };
    }
    return { success: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}
