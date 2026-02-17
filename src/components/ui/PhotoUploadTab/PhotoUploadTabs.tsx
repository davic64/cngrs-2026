"use client";

import React from "react";
import { Camera, CheckCircle2, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadTabsProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  fileName?: string;
  onRemove: () => void;
  isLoading?: boolean;
  isVerified?: boolean;
  title?: string;
  description?: string;
  circular?: boolean;
  width?: string;
  height?: string;
}

export function PhotoUploadTabs({
  onFileSelect,
  previewUrl,
  fileName,
  onRemove,
  isLoading = false,
  isVerified = false,
  title = "Subir Foto",
  description,
  circular = false,
  width = "w-48",
  height = "h-48",
}: PhotoUploadTabsProps) {
  const [method, setMethod] = React.useState<"camera" | "upload" | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten archivos de imagen (JPG, PNG, WebP)");
        return;
      }
      onFileSelect(file);
      setMethod(null);
    }
  };

  // Si ya hay preview, mostrar la imagen con opción de eliminar
  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative overflow-hidden border-4 border-primary/20 shadow-xl mx-auto",
            circular
              ? `${width} ${height} rounded-full`
              : `${width} ${height} rounded-3xl`,
          )}
        >
          <img
            src={previewUrl}
            className={cn(
              "w-full h-full",
              circular ? "object-cover" : "object-contain bg-gray-50",
            )}
            alt="Preview"
          />

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Verificando...</p>
            </div>
          )}

          {/* Verified Overlay */}
          {isVerified && !isLoading && (
            <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg z-20 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer disabled:hidden"
          >
            <X className="h-8 w-8 text-white" />
          </button>
        </div>
        {fileName && (
          <p className="text-xs text-gray-500 text-center truncate max-w-xs">
            {fileName}
          </p>
        )}
      </div>
    );
  }

  // Si no se ha seleccionado método, mostrar las dos opciones
  if (method === null) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        {description && (
          <p className="text-xs text-gray-600 text-center font-medium">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("camera")}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xs font-bold text-secondary uppercase">
              Tomar Foto
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("upload")}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <Image className="h-6 w-6 text-primary" />
            <span className="text-xs font-bold text-secondary uppercase">
              Subir Imagen
            </span>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center">
          Solo imágenes (JPG, PNG, WebP)
        </p>
      </div>
    );
  }

  // Si ya se seleccionó método, mostrar el input correspondiente
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <button
        type="button"
        onClick={() => setMethod(null)}
        className="text-xs text-gray-500 hover:text-primary transition-colors"
      >
        ← Cambiar método
      </button>
      <label
        className={cn(
          "flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all hover:border-primary/30 w-full aspect-square max-w-xs",
          isLoading && "opacity-50 pointer-events-none",
        )}
      >
        {method === "camera" ? (
          <>
            <Camera className="h-10 w-10 text-primary mb-2" />
            <span className="text-sm font-bold text-secondary text-center px-4">
              Tomar Foto
            </span>
            <span className="text-[10px] text-gray-400 mt-1 text-center px-4">
              Se abrirá la cámara de tu dispositivo
            </span>
          </>
        ) : (
          <>
            <Image className="h-10 w-10 text-primary mb-2" />
            <span className="text-sm font-bold text-secondary text-center px-4">
              Seleccionar Imagen
            </span>
            <span className="text-[10px] text-gray-400 mt-1 text-center px-4">
              JPG, PNG o WebP
            </span>
          </>
        )}
        <input
          ref={method === "camera" ? cameraInputRef : uploadInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          capture={method === "camera" ? "environment" : undefined}
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
