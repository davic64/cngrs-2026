import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function testR2Connection() {
  console.log("🔍 Iniciando prueba de conexión a Cloudflare R2...");

  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
  } = process.env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME
  ) {
    console.error(
      "❌ Error: Faltan variables de entorno de R2 en el archivo .env",
    );
    return;
  }

  const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 1,
    });

    await r2Client.send(command);
    console.log(
      "✅ ¡Conexión exitosa! El cliente S3 pudo comunicarse con el bucket:",
      R2_BUCKET_NAME,
    );
  } catch (error: any) {
    console.error("❌ Error de conexión a R2:");
    console.error("- Código:", error.name);
    console.error("- Mensaje:", error.message);
    if (error.name === "InvalidAccessKeyId") {
      console.error("👉 Sugerencia: Revisa que tu Access Key ID sea correcto.");
    } else if (error.name === "SignatureDoesNotMatch") {
      console.error(
        "👉 Sugerencia: Revisa que tu Secret Access Key sea correcto.",
      );
    } else if (error.name === "NoSuchBucket") {
      console.error("👉 Sugerencia: El nombre del bucket no existe.");
    }
  }
}

testR2Connection();
