"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import * as React from "react";
import {
  deleteCartaResponsivaTemplate,
  uploadCartaResponsivaTemplate,
} from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";

type Props = { initialUrl: string | null };

export function CartaPanel({ initialUrl }: Props) {
  // Carta Responsiva
  const [cartaUrl, setCartaUrl] = React.useState<string | null>(initialUrl);
  const [cartaFile, setCartaFile] = React.useState<File | null>(null);
  const [isUploadingCarta, setIsUploadingCarta] = React.useState(false);
  const cartaInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadCarta = async () => {
    if (!cartaFile) return;
    setIsUploadingCarta(true);
    const formData = new FormData();
    formData.append("template", cartaFile);
    const result = await uploadCartaResponsivaTemplate(formData);
    if (result.success && result.url) {
      setCartaUrl(result.url ?? null);
      setCartaFile(null);
      if (cartaInputRef.current) cartaInputRef.current.value = "";
    } else {
      alert("Error al subir la plantilla");
    }
    setIsUploadingCarta(false);
  };

  const handleDeleteCarta = async () => {
    if (!confirm("¿Eliminar la plantilla de Carta Responsiva?")) return;
    const result = await deleteCartaResponsivaTemplate();
    if (result.success) {
      setCartaUrl(null);
      setCartaFile(null);
      if (cartaInputRef.current) cartaInputRef.current.value = "";
    }
  };

  return (
    <DashboardCard title="Carta Responsiva">
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          Plantilla PDF que los menores de edad descargan durante el registro.
        </p>

        {cartaUrl ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-secondary uppercase">
                  Plantilla activa
                </p>
                <a
                  href={cartaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-green-600 hover:underline"
                >
                  Ver PDF
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteCarta}
              className="text-gray-300 hover:text-red-500 transition-colors p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Sin plantilla cargada
            </p>
          </div>
        )}

        <input
          ref={cartaInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setCartaFile(e.target.files?.[0] ?? null)}
        />

        {cartaFile && (
          <p className="text-[10px] font-bold text-secondary truncate">
            {cartaFile.name}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 font-black uppercase text-[10px] tracking-widest"
            onClick={() => cartaInputRef.current?.click()}
          >
            Seleccionar PDF
          </Button>
          <Button
            className="flex-1 h-10 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
            onClick={handleUploadCarta}
            disabled={!cartaFile || isUploadingCarta}
          >
            <Upload size={14} className="mr-2" />
            {isUploadingCarta ? "Subiendo..." : "Subir"}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}
