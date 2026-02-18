"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { gt, sql } from "drizzle-orm";

export async function getAdultCompanionCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gt(users.age, 29));
  return Number(result.count);
}
