"use client";

import React from "react";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadTabsProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  fileName?: string;
  onRemove: () => void;
  accept?: string;
  isLoading?: boolean;
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
  accept = "image/*",
  isLoading = false,
  title = "Tomar Foto o Subir",
  description,
  circular = false,
  width = "w-48",
  height = "h-48",
}: PhotoUploadTabsProps) {
  const [method, setMethod] = React.useState<"camera" | "upload" | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (method === "camera") {
      cameraInputRef.current?.click();
    } else {
      setMethod("camera");
    }
  };

  const handleUploadClick = () => {
    if (method === "upload") {
      uploadInputRef.current?.click();
    } else {
      setMethod("upload");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setMethod(null);
    }
  };

  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative overflow-hidden border-4 border-primary/20 shadow-xl mx-auto",
            circular
              ? `${width} ${height} rounded-full`
              : `${width} ${height} rounded-3xl`
          )}
        >
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            alt="Preview"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
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

  if (method === null) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        <p className="text-xs text-gray-600 text-center font-medium">
          {description || "Selecciona cómo deseas proporcionar la imagen"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCameraClick}
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
            onClick={handleUploadClick}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <Upload className="h-6 w-6 text-primary" />
            <span className="text-xs font-bold text-secondary uppercase">
              Subir Archivo
            </span>
          </button>
        </div>
      </div>
    );
  }

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
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        {method === "camera" ? (
          <>
            <Camera className="h-10 w-10 text-primary mb-2" />
            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest px-4 text-center">
              Tomar Foto de la Cámara
            </span>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-primary mb-2" />
            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest px-4 text-center">
              Haz clic o arrastra un archivo
            </span>
          </>
        )}
        <input
          ref={method === "camera" ? cameraInputRef : uploadInputRef}
          type="file"
          className="hidden"
          accept={method === "camera" ? "image/*" : accept}
          capture={method === "camera" ? "environment" : undefined}
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
