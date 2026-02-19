import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { db } from "@/db";
import { temporaryFiles } from "@/db/schema";
import { eq, lt, and } from "drizzle-orm";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadFile(file: File, folder: string) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    // Retornamos la URL pública asegurando que tenga el protocolo https
    const domain = process.env.R2_PUBLIC_DOMAIN?.replace(/^https?:\/\//, "");
    return `https://${domain}/${fileName}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to storage");
  }
}

export async function uploadTemporaryFile(
  file: File,
  sessionId: string,
  fileType: "fotoPerfil" | "documento" | "comprobantePago",
) {
  try {
    const folder =
      fileType === "fotoPerfil"
        ? "Perfil"
        : fileType === "documento"
          ? "Identificacion"
          : "Pagos";
    const url = await uploadFile(file, folder);

    // Registrar el archivo temporal en la BD
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.insert(temporaryFiles).values({
      sessionId,
      fileUrl: url,
      fileType,
      status: "pending",
      expiresAt,
    });

    return { success: true, url };
  } catch (error) {
    console.error("Error uploading temporary file:", error);
    return {
      success: false,
      error: "Failed to upload temporary file",
      url: "",
    };
  }
}

export async function confirmTemporaryFiles(sessionId: string) {
  try {
    // El archivo ya está en R2 en su ruta definitiva (Perfil/, Identificación/).
    // Solo hay que eliminar el registro de seguimiento — ya no es necesario.
    await db
      .delete(temporaryFiles)
      .where(eq(temporaryFiles.sessionId, sessionId));

    console.log(
      `✅ Archivos confirmados y tracking eliminado para sesión: ${sessionId}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Error confirming temporary files:", error);
    return { success: false };
  }
}

export async function abandonTemporaryFiles(sessionId: string) {
  try {
    // Obtener todos los archivos temporales de esta sesión
    const files = await db
      .select()
      .from(temporaryFiles)
      .where(eq(temporaryFiles.sessionId, sessionId));

    // Eliminar de R2
    for (const file of files) {
      await deleteFile(file.fileUrl);
    }

    // Marcar como "abandoned" en BD
    await db
      .update(temporaryFiles)
      .set({ status: "abandoned" })
      .where(eq(temporaryFiles.sessionId, sessionId));

    console.log(
      `🗑️ ${files.length} archivos temporales eliminados para sesión: ${sessionId}`,
    );
    return { success: true, deletedCount: files.length };
  } catch (error) {
    console.error("Error abandoning temporary files:", error);
    return { success: false };
  }
}

export async function deleteFile(url: string) {
  try {
    // Extraer la Key del archivo de la URL
    // La URL es: https://dominio.com/folder/uuid.ext
    const domain = process.env.R2_PUBLIC_DOMAIN?.replace(/^https?:\/\//, "");
    const key = url.split(`${domain}/`)[1];

    if (!key) return;

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Error deleting from R2:", error);
  }
}

// Limpiar archivos temporales expirados (ejecutar periódicamente)
export async function cleanupExpiredTemporaryFiles() {
  try {
    const now = new Date();

    // Obtener archivos temporales expirados que no han sido confirmados
    const expiredFiles = await db
      .select()
      .from(temporaryFiles)
      .where(
        and(
          lt(temporaryFiles.expiresAt, now),
          eq(temporaryFiles.status, "pending"),
        ),
      );

    console.log(
      `🧹 Encontrados ${expiredFiles.length} archivos temporales expirados`,
    );

    // Eliminar archivos de R2
    for (const file of expiredFiles) {
      await deleteFile(file.fileUrl);
    }

    // Marcar como "abandoned" en BD
    if (expiredFiles.length > 0) {
      await db
        .update(temporaryFiles)
        .set({ status: "abandoned" })
        .where(
          and(
            lt(temporaryFiles.expiresAt, now),
            eq(temporaryFiles.status, "pending"),
          ),
        );
    }

    console.log(`✅ ${expiredFiles.length} archivos expirados limpiados`);
    return { success: true, cleanedCount: expiredFiles.length };
  } catch (error) {
    console.error("Error cleaning up expired temporary files:", error);
    return { success: false };
  }
}

// ===== CARTA RESPONSIVA TEMPLATE (ruta fija en R2) =====
const CARTA_RESPONSIVA_KEY = "templates/carta-responsiva.pdf";

export function getCartaResponsivaUrl(): string {
  const domain = process.env.R2_PUBLIC_DOMAIN?.replace(/^https?:\/\//, "");
  return `https://${domain}/${CARTA_RESPONSIVA_KEY}`;
}

export async function checkCartaResponsivaExists(): Promise<boolean> {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: CARTA_RESPONSIVA_KEY,
      }),
    );
    return true;
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error("Error checking carta responsiva:", error);
    return false;
  }
}

export async function uploadCartaResponsivaTemplate(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: CARTA_RESPONSIVA_KEY,
        Body: buffer,
        ContentType: "application/pdf",
      }),
    );

    return { success: true, url: getCartaResponsivaUrl() };
  } catch (error) {
    console.error("Error uploading carta responsiva template:", error);
    return { success: false, error: "Failed to upload template" };
  }
}

export async function deleteCartaResponsivaTemplate() {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: CARTA_RESPONSIVA_KEY,
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error deleting carta responsiva template:", error);
    return { success: false, error: "Failed to delete template" };
  }
}
