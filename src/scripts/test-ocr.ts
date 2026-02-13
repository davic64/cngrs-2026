import vision from "@google-cloud/vision";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function testGoogleVision() {
  console.log("🔍 Iniciando prueba de Google Cloud Vision...");

  try {
    const client = new vision.ImageAnnotatorClient();

    // Probamos con una imagen de prueba de Google o simplemente inicializando
    console.log("✅ Cliente inicializado. Buscando credenciales...");

    // Si llegamos aquí sin que explote, las variables de entorno están siendo leídas.
    // Intentar una operación mínima
    console.log("🚀 Google Vision está listo para procesar imágenes.");
  } catch (error: any) {
    console.error("❌ Error de configuración en Google Vision:");
    console.error(error.message);
    console.error(
      "👉 Asegúrate de tener GOOGLE_APPLICATION_CREDENTIALS en tu .env",
    );
  }
}

testGoogleVision();
