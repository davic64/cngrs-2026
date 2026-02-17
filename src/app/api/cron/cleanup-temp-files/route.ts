import { NextResponse } from "next/server";
import { cleanupExpiredTemporaryFiles } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    // Verificar que la request viene de Vercel Cron o tiene el header correcto
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🧹 Iniciando limpieza de archivos temporales expirados...");

    const result = await cleanupExpiredTemporaryFiles();

    return NextResponse.json({
      success: result.success,
      message: `${result.cleanedCount || 0} archivos temporales limpiados`,
      cleanedCount: result.cleanedCount || 0,
    });
  } catch (error) {
    console.error("Error en cron job cleanup-temp-files:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
