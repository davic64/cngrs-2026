"use server";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function getNotifications() {
  try {
    const allNotifs = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    return allNotifs;
  } catch (error) {
    console.error("Error al obtener avisos:", error);
    return [];
  }
}
