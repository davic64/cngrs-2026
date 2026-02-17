import { NextResponse } from "next/server";
import { checkCartaResponsivaExists, getCartaResponsivaUrl } from "@/lib/storage";

export async function GET() {
  const exists = await checkCartaResponsivaExists();
  if (!exists) {
    return new NextResponse("Plantilla no disponible", { status: 404 });
  }

  const url = getCartaResponsivaUrl();
  const r2Response = await fetch(url);

  if (!r2Response.ok) {
    return new NextResponse("Error al obtener la plantilla", { status: 502 });
  }

  const buffer = await r2Response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Carta_Responsiva_Plantilla.pdf"',
    },
  });
}
