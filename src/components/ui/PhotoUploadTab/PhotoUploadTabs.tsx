"use client";

import React from "react";
import { AlertCircle, Camera, CheckCircle2, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadTabsProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  fileName?: string;
  onRemove: () => void;
  isLoading?: boolean;
  isVerified?: boolean;
  verificationMessage?: string;
  errorMessage?: string | null;
  subMessage?: string | null;
  title?: string;
  description?: string;
  circular?: boolean;
  width?: string;
  height?: string;
  cameraOnly?: boolean;
  label?: string;
}

export function PhotoUploadTabs({
  onFileSelect,
  previewUrl,
  fileName,
  onRemove,
  isLoading = false,
  isVerified = false,
  verificationMessage,
  errorMessage,
  subMessage,
  title = "Subir Foto",
  description,
  circular = false,
  width = "w-full",
  height = "h-64",
  cameraOnly = false,
  label,
}: PhotoUploadTabsProps) {
  const [method, setMethod] = React.useState<"camera" | "upload" | null>(
    cameraOnly ? "camera" : null,
  );
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  // Si cameraOnly es true y method cambia a null (por el botón volver), regresarlo a camera
  React.useEffect(() => {
    if (cameraOnly && method === null) {
      setMethod("camera");
    }
  }, [cameraOnly, method]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen (incluyendo HEIC/HEIF de iOS)
      const isImage =
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");
      if (!isImage) {
        alert("Solo se permiten archivos de imagen (JPG, PNG, WebP, HEIC)");
        return;
      }
      onFileSelect(file);
      setMethod(null);
    }
  };

  // Si ya hay preview, mostrar la imagen con opción de eliminar
  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div
          className={cn(
            "relative overflow-hidden border-4 border-primary/20 shadow-xl mx-auto",
            circular
              ? `aspect-square rounded-full w-48 h-48`
              : `aspect-[1.58/1] rounded-3xl ${width}`,
          )}
        >
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            alt="Preview"
          />

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Verificando...
              </p>
            </div>
          )}

          {/* Verified Overlay */}
          {isVerified && !isLoading && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle2 className="h-5 w-5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {verificationMessage || "Edad Verificada"}
                  </span>
                  {subMessage && (
                    <span className="text-[8px] font-bold opacity-80 mt-0.5 uppercase">
                      {subMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {!isVerified && !isLoading && errorMessage && (
            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] flex items-center justify-center p-4 z-20">
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl flex flex-col items-center gap-1 animate-in zoom-in duration-300 text-center max-w-[80%]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Validación Fallida
                  </span>
                </div>
                <p className="text-[9px] font-bold opacity-90 mt-1 leading-tight uppercase">
                  {errorMessage}
                </p>
                <div className="mt-2 bg-white text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Intentar de nuevo
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer disabled:hidden z-30"
          >
            <X className="h-8 w-8 text-white" />
          </button>
        </div>
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
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50",
              circular ? "aspect-square rounded-full" : "rounded-2xl",
            )}
          >
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-[10px] font-bold text-secondary uppercase leading-tight">
              Tomar Foto
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("upload")}
            disabled={isLoading}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50",
              circular ? "aspect-square rounded-full" : "rounded-2xl",
            )}
          >
            <Image className="h-6 w-6 text-primary" />
            <span className="text-[10px] font-bold text-secondary uppercase leading-tight">
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
    <div className="flex flex-col items-center gap-4 w-full mx-auto">
      {!cameraOnly && (
        <button
          type="button"
          onClick={() => setMethod(null)}
          className="text-xs text-gray-500 hover:text-primary transition-colors"
        >
          ← Cambiar método
        </button>
      )}
      <label
        className={cn(
          "flex flex-col items-center justify-center border-4 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-all hover:border-primary/30",
          circular
            ? "aspect-square rounded-full w-48 h-48"
            : "aspect-[1.58/1] rounded-3xl w-full",
          isLoading && "opacity-50 pointer-events-none",
        )}
      >
        {method === "camera" ? (
          <>
            <Camera className="h-10 w-10 text-primary mb-2" />
            <span className="text-sm font-bold text-secondary text-center px-4">
              {label || "Tomar Foto"}
            </span>
          </>
        ) : (
          <>
            <Image className="h-10 w-10 text-primary mb-2" />
            <span className="text-sm font-bold text-secondary text-center px-4">
              {label || "Seleccionar Imagen"}
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
