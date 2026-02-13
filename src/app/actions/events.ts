"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getEvents() {
  try {
    const allEvents = await db.select().from(events).orderBy(asc(events.time));
    return allEvents;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return [];
  }
}
