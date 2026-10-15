import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLog } from "@/db/schema";
import type { Changes } from "./diff-changes";

// Entrada de bitácora como sentencia para sumarla al `db.batch` del cambio.
export function auditStatement(entry: {
  adminId: string;
  userId: string;
  entity: "user" | "payment";
  entityId: string | number | SQL;
  action: "update" | "create" | "delete";
  changes: Changes | Record<string, unknown>;
}) {
  return db.insert(adminAuditLog).values({
    ...entry,
    entityId:
      typeof entry.entityId === "object"
        ? entry.entityId
        : String(entry.entityId),
  });
}
