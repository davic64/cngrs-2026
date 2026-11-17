import type { MetadataRoute } from "next";

// Instalable como app: abre directo en el escáner de la entrada.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CNGRS 2026 · Escáner",
    short_name: "Escáner CNGRS",
    start_url: "/admin/scanner",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [{ src: "/favicon.png", sizes: "any", type: "image/png" }],
  };
}
