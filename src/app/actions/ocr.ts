"use server";

import vision from "@google-cloud/vision";
import { db } from "@/db";
import { users } from "@/db/schema";
import { gt, sql } from "drizzle-orm";

const ADULT_COMPANION_LIMIT = 50;

export async function getAdultCompanionCount(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gt(users.age, 29));
  return Number(result.count);
}

// Función para inicializar el cliente de forma segura
function getVisionClient() {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  const googleCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (apiKey) {
    return new vision.ImageAnnotatorClient({ apiKey });
  }

  if (googleCreds && googleCreds.startsWith("AIza")) {
    return new vision.ImageAnnotatorClient({ apiKey: googleCreds });
  }

  return new vision.ImageAnnotatorClient();
}

const client = getVisionClient();

export async function verifyDocumentAge(base64Image: string) {
  try {
    // 1. Extraer el contenido base64 (quitando el prefijo data:image/...)
    const buffer = Buffer.from(base64Image.split(",")[1], "base64");

    // 2. Enviar a Google Vision
    const [result] = await client.textDetection(buffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return { success: false, error: "No se detectó texto en la imagen" };
    }

    const fullText = detections[0].description?.toUpperCase() || "";
    // console.log("Texto detectado por Google:", fullText);

    // 3. Lógica de búsqueda de fecha de nacimiento
    // Patrones: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    // También buscamos el formato de INE antigua: DD MM YYYY
    const dateRegex = /(\d{2})[/\-.\s](\d{2})[/\-.\s](\d{4})/;
    const matches = fullText.match(new RegExp(dateRegex, "g"));

    if (matches) {
      for (const match of matches) {
        const [day, month, year] = match.split(/[/\-.\s]/).map(Number);

        // Validar que sea una fecha lógica (no el año de emisión o vigencia)
        // El año de nacimiento para jóvenes de 15-29 en 2026 debe ser entre 1996 y 2011
        if (year > 1950 && year < 2015) {
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (age > 29) {
            const adultCount = await getAdultCompanionCount();
            return {
              success: true,
              age,
              isValid: adultCount < ADULT_COMPANION_LIMIT,
              isAdultCompanion: true,
              spotsLeft: Math.max(0, ADULT_COMPANION_LIMIT - adultCount),
              detectedDate: match,
            };
          }

          return {
            success: true,
            age,
            isValid: age >= 15,
            detectedDate: match,
          };
        }
      }
    }

    // Intento secundario: buscar en el CURP (posiciones 5 a 10 son YYMMDD)
    // Buscamos una cadena que parezca CURP (18 caracteres alfanuméricos)
    const curpRegex = /[A-Z]{4}(\d{6})[A-Z]{6}[A-Z0-9]{2}/;
    const curpMatch = fullText.match(curpRegex);
    if (curpMatch) {
      const curpDate = curpMatch[1]; // 920515
      const yearShort = parseInt(curpDate.substring(0, 2), 10);
      const month = parseInt(curpDate.substring(2, 4), 10) - 1;
      const day = parseInt(curpDate.substring(4, 6), 10);

      const year = yearShort > 26 ? 1900 + yearShort : 2000 + yearShort;

      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (
        today.getMonth() < month ||
        (today.getMonth() === month && today.getDate() < day)
      ) {
        age--;
      }

      if (age > 29) {
        const adultCount = await getAdultCompanionCount();
        return {
          success: true,
          age,
          isValid: adultCount < ADULT_COMPANION_LIMIT,
          isAdultCompanion: true,
          spotsLeft: Math.max(0, ADULT_COMPANION_LIMIT - adultCount),
          detectedDate: `${day}/${month + 1}/${year}`,
        };
      }

      return {
        success: true,
        age,
        isValid: age >= 15,
        detectedDate: `${day}/${month + 1}/${year}`,
      };
    }

    return {
      success: false,
      error:
        "No pudimos encontrar tu fecha de nacimiento. Asegúrate de que la foto sea clara y se vea toda la identificación.",
    };
  } catch (error: any) {
    console.error("Error en Google Vision Action:", error);
    if (error.message?.includes("billing")) {
      return {
        success: false,
        error: "Error de facturación en el servicio de validación.",
      };
    }
    return {
      success: false,
      error:
        "No pudimos procesar la imagen. Intenta con una foto más clara o un formato diferente.",
    };
  }
}
