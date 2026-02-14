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

export async function getPinnedNotifications() {
  try {
    const pinned = await db.query.notifications.findMany({
      where: (notifications, { eq }) => eq(notifications.isPinned, true),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
    return pinned;
  } catch (error) {
    console.error("Error al obtener avisos fijados:", error);
    return [];
  }
}
