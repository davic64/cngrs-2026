"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export type ScanResult =
  | {
      status: "ok";
      name: string;
      locality: string;
      photoUrl: string | null;
    }
  | { status: "duplicate"; name: string; checkedInAt: string }
  | { status: "not_found" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El QR del asistente contiene su users.id. El UPDATE condicional hace que
// sólo el primer escaneo marque la entrada, aunque dos escáneres lean a la vez.
export async function scanAttendee(code: string): Promise<ScanResult> {
  await requireAdmin();
  const id = code.trim();
  if (!UUID.test(id)) return { status: "not_found" };

  const [marked] = await db
    .update(users)
    .set({ checkedInAt: new Date() })
    .where(
      and(eq(users.id, id), eq(users.role, "user"), isNull(users.checkedInAt)),
    )
    .returning();

  if (marked) {
    return {
      status: "ok",
      name: `${marked.firstName} ${marked.lastName}`.trim(),
      locality: marked.locality,
      photoUrl: marked.profilePhotoUrl,
    };
  }

  const existing = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.role, "user")),
  });
  if (!existing?.checkedInAt) return { status: "not_found" };

  return {
    status: "duplicate",
    name: `${existing.firstName} ${existing.lastName}`.trim(),
    checkedInAt: existing.checkedInAt.toISOString(),
  };
}
