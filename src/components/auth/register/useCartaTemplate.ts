import * as React from "react";

// Plantilla de la carta responsiva (menores de 18): URL cargada al iniciar y descarga bajo demanda.
export function useCartaTemplate() {
  const [cartaTemplateUrl, setCartaTemplateUrl] = React.useState<string | null>(
    null,
  );
  const [cartaTemplateLoading, setCartaTemplateLoading] = React.useState(false);

  const downloadCartaTemplate = async () => {
    if (!cartaTemplateUrl) {
      alert("La plantilla no está disponible");
      return;
    }
    try {
      setCartaTemplateLoading(true);
      const response = await fetch("/api/carta-responsiva");
      if (!response.ok) throw new Error("Error descargando plantilla");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Carta_Responsiva_Plantilla.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error descargando plantilla:", error);
      alert("Error al descargar la plantilla");
    } finally {
      setCartaTemplateLoading(false);
    }
  };

  return {
    cartaTemplateUrl,
    setCartaTemplateUrl,
    cartaTemplateLoading,
    downloadCartaTemplate,
  };
}
