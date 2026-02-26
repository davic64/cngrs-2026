"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq, gt, lte, sql } from "drizzle-orm";

export async function getAdultCompanionCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(gt(users.age, 29), eq(users.registrationStatus, "completado")));
  return Number(result.count);
}

export async function getRegularRegistrationCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(lte(users.age, 29), eq(users.registrationStatus, "completado")));
  return Number(result.count);
}
