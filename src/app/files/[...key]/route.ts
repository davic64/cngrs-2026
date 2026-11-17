import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/storage";

// Sirve los archivos de R2 a través de la app (y la caché de Vercel) en lugar
// de pub-*.r2.dev, que tiene límite de peticiones y devuelve 429.
export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  const key = decodeURIComponent(pathname.slice("/files/".length));
  if (!key || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const obj = await r2Client.send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }),
    );
    if (!obj.Body) return new Response("Not found", { status: 404 });

    // Las subidas usan UUID (nunca cambian); la plantilla se sobrescribe en la misma ruta.
    const cache = key.startsWith("templates/")
      ? "public, max-age=0, s-maxage=60"
      : "public, max-age=31536000, immutable";

    return new Response(obj.Body.transformToWebStream(), {
      headers: {
        "Content-Type": obj.ContentType ?? "application/octet-stream",
        ...(obj.ContentLength ? { "Content-Length": String(obj.ContentLength) } : {}),
        "Cache-Control": cache,
      },
    });
  } catch (error: any) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return new Response("Not found", { status: 404 });
    }
    console.error("Error leyendo archivo de R2:", key, error);
    return new Response("Error", { status: 500 });
  }
}
