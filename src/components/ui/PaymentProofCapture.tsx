"use client";

import React from "react";
import { AlertCircle, Camera, CheckCircle2, ImageUp, X } from "lucide-react";

interface PaymentProofCaptureProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  previewUrl: string | null;
  fileName?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  label?: string;
  description?: string;
  allowGallery?: boolean;
}

export function PaymentProofCapture({
  onFileSelect,
  onRemove,
  previewUrl,
  fileName,
  isLoading = false,
  errorMessage,
  label = "Tomar Foto del Comprobante",
  description,
  allowGallery = false,
}: PaymentProofCaptureProps) {
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let finalFile = file;
      if (file.type.startsWith("image/")) {
        try {
          const imageCompression = (await import("browser-image-compression")).default;
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
          const compressedBlob = await imageCompression(file, options);
          finalFile = new File([compressedBlob], file.name, { type: file.type });
        } catch (error) {
          console.error("Error comprimiendo imagen:", error);
        }
      }
      onFileSelect(finalFile);
    }
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  };

  // Preview de foto ya capturada
  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-primary/20 shadow-xl mx-auto bg-black">
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            alt="Comprobante capturado"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Procesando...
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Comprobante Capturado
                </span>
              </div>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] flex items-center justify-center p-4 z-20">
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl flex flex-col items-center gap-1 animate-in zoom-in duration-300 text-center max-w-[80%]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Error
                  </span>
                </div>
                <p className="text-[9px] font-bold opacity-90 mt-1 leading-tight uppercase">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white p-2 rounded-full shadow-lg transition-colors z-30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center">
          {fileName || `Comprobante ${new Date().toLocaleDateString()}`}
        </p>
      </div>
    );
  }

  // Estado inicial
  if (allowGallery) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {description && (
          <p className="text-[10px] text-gray-600 text-center font-medium">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 w-full">
          <label className="flex flex-col items-center justify-center gap-3 w-full aspect-square border-4 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-3xl transition-all cursor-pointer">
            <Camera className="h-10 w-10 text-primary" />
            <span className="text-xs font-bold text-secondary uppercase text-center px-2">
              {label}
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-semibold">
              Tomar foto
            </span>
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </label>
          <label className="flex flex-col items-center justify-center gap-3 w-full aspect-square border-4 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-3xl transition-all cursor-pointer">
            <ImageUp className="h-10 w-10 text-primary" />
            <span className="text-xs font-bold text-secondary uppercase text-center px-2">
              Subir Imagen
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-semibold">
              Desde galería
            </span>
            <input
              ref={galleryInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {description && (
        <p className="text-[10px] text-gray-600 text-center font-medium">
          {description}
        </p>
      )}
      <label className="flex flex-col items-center justify-center gap-3 w-full aspect-video border-4 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-3xl transition-all cursor-pointer">
        <Camera className="h-12 w-12 text-primary" />
        <span className="text-sm font-bold text-secondary uppercase text-center px-4">
          {label}
        </span>
        <span className="text-[9px] text-gray-500 uppercase font-semibold">
          Usa la cámara de tu dispositivo
        </span>
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
