"use server";

import { db } from "@/db";

export async function getVenueInfo() {
  try {
    const venue = await db.query.venues.findFirst();
    // Datos por defecto si no hay nada en la DB
    return (
      venue || {
        name: "Centro de Convenciones Internacional",
        address: "Av. de la Reforma 123, Ciudad de México, CP 01000",
        description:
          "Un espacio moderno y accesible diseñado para albergar a los asistentes del CNGRS26.",
        mapsUrl: "https://maps.google.com",
        websiteUrl: "#",
      }
    );
  } catch (error) {
    console.error("Error al obtener sede:", error);
    return null;
  }
}
