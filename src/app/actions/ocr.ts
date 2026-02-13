"use server";

import vision from "@google-cloud/vision";

// Configuramos el cliente
// Nota: Google buscará automáticamente las credenciales en las variables de entorno
const client = new vision.ImageAnnotatorClient();

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
    console.log("Texto detectado por Google:", fullText);

    // 3. Lógica de búsqueda de fecha de nacimiento
    // Buscamos patrones comunes en INE: "FECHA DE NACIMIENTO", "NACIMIENTO", o formato DD/MM/YYYY
    const dateRegex = /(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})/;
    const matches = fullText.match(new RegExp(dateRegex, "g"));

    if (matches) {
      // Normalmente la primera fecha encontrada en una INE es la de nacimiento
      // o podemos buscar la etiqueta cerca del texto
      const birthDateStr = matches[0];
      const [day, month, year] = birthDateStr.split(/[\/\-.]/).map(Number);
      
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return { 
        success: true, 
        age, 
        isValid: age >= 15 && age <= 29,
        detectedDate: birthDateStr 
      };
    }

    // Intento secundario: buscar en el CURP (posiciones 5 a 10 son YYMMDD)
    // Ejemplo: VIVA920515... -> 15 de mayo de 1992
    const curpRegex = /[A-Z]{4}(\d{6})[A-Z]{6}\d{2}/;
    const curpMatch = fullText.match(curpRegex);
    if (curpMatch) {
      const curpDate = curpMatch[1]; // 920515
      const yearShort = parseInt(curpDate.substring(0, 2));
      const month = parseInt(curpDate.substring(2, 4)) - 1;
      const day = parseInt(curpDate.substring(4, 6));
      
      // Asumimos 1900 o 2000 dependiendo del año corto
      const year = yearShort > 25 ? 1900 + yearShort : 2000 + yearShort;
      
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) {
        age--;
      }

      return { 
        success: true, 
        age, 
        isValid: age >= 15 && age <= 29,
        detectedDate: `${day}/${month+1}/${year}`
      };
    }

    return { success: false, error: "No se pudo extraer una fecha de nacimiento válida de la identificación" };

  } catch (error) {
    console.error("Error en Google Vision Action:", error);
    return { success: false, error: "Error al procesar la imagen con Google Vision" };
  }
}
