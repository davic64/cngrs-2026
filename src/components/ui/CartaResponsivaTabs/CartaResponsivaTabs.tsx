"use client";

import React from "react";
import {
  Download,
  Upload,
  FileText,
  X,
  AlertCircle,
  Camera,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CartaResponsivaTabsProps {
  templateUrl: string | null;
  templateLoading?: boolean;
  onDownloadTemplate: () => Promise<void>;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  fileName?: string;
  onRemove: () => void;
  isLoading?: boolean;
}

type Step = "intro" | "download" | "upload";
type UploadMethod = "camera" | "image" | "pdf" | null;

export function CartaResponsivaTabs({
  templateUrl,
  templateLoading = false,
  onDownloadTemplate,
  onFileSelect,
  previewUrl,
  fileName,
  onRemove,
  isLoading = false,
}: CartaResponsivaTabsProps) {
  const [step, setStep] = React.useState<Step>("intro");
  const [uploadMethod, setUploadMethod] = React.useState<UploadMethod>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setDownloadError(null);
      await onDownloadTemplate();
      setStep("upload");
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Error al descargar la plantilla",
      );
    }
  };

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
      setUploadMethod(null);
    }
  };

  const getAcceptType = () => {
    switch (uploadMethod) {
      case "camera":
        return "image/*";
      case "image":
        return "image/jpeg,image/png,image/webp";
      case "pdf":
        return "application/pdf";
      default:
        return "image/*,application/pdf";
    }
  };

  const isPdf =
    fileName?.toLowerCase().endsWith(".pdf") ||
    previewUrl?.includes("application/pdf");

  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full rounded-3xl overflow-hidden border-4 border-green-500/20 shadow-xl bg-white">
          {isPdf ? (
            <iframe
              src={previewUrl}
              className="w-full h-[500px] border-0"
              title="Carta Responsiva Preview"
            />
          ) : (
            <img
              src={previewUrl}
              className="w-full h-auto min-h-[300px] max-h-[500px] object-contain bg-gray-50"
              alt="Carta Responsiva Preview"
            />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {fileName && (
          <p className="text-xs text-gray-500 text-center truncate max-w-xs">
            ✓ {fileName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Step Indicators */}
      <div className="flex gap-2 justify-center">
        {(["intro", "download", "upload"] as const).map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                step === s || (step === "upload" && s !== "intro")
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600",
              )}
            >
              {idx + 1}
            </div>
            {idx < 2 && (
              <div
                className={cn(
                  "h-1 w-8",
                  step === s || (step === "upload" && s !== "intro")
                    ? "bg-primary"
                    : "bg-gray-200",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      {step === "intro" && (
        <div className="flex flex-col gap-4 text-center">
          <div className="inline-flex justify-center p-4 bg-blue-50 rounded-full mb-2 mx-auto">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-secondary uppercase">
            Carta Responsiva
          </h3>
          <p className="text-sm text-gray-600">
            Como eres menor de edad, necesitamos que un adulto responsable firme
            una carta de autorización.
          </p>
          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl">
            Descarga la plantilla, complétala, fírmala y luego sube el archivo.
          </p>

          <Button
            onClick={handleDownload}
            disabled={templateLoading || !templateUrl}
            className="w-full gap-2 h-12"
          >
            <Download size={18} />
            {templateLoading ? "Descargando..." : "Descargar Plantilla"}
          </Button>

          <button
            type="button"
            onClick={() => setStep("upload")}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Ya tengo la carta firmada →
          </button>
        </div>
      )}

      {step === "download" && (
        <div className="flex flex-col gap-4 text-center">
          <div className="inline-flex justify-center p-4 bg-green-50 rounded-full mb-2 mx-auto">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-secondary uppercase">
            Completar Carta
          </h3>
          <p className="text-sm text-gray-600">Ahora debes:</p>
          <ol className="text-sm text-left bg-gray-50 p-4 rounded-xl space-y-2">
            <li>✓ Descargar la plantilla</li>
            <li>✓ Completar todos los campos requeridos</li>
            <li>✓ Obtener la firma del adulto responsable</li>
            <li>✓ Volver aquí y subir el archivo</li>
          </ol>

          <Button
            onClick={() => setStep("upload")}
            variant="outline"
            className="w-full h-12"
          >
            Tengo la carta lista →
          </Button>
        </div>
      )}

      {step === "upload" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-secondary uppercase">
              Subir Carta Firmada
            </h3>
          </div>

          {downloadError && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-600">
                  Error al descargar
                </p>
                <p className="text-xs text-red-600">{downloadError}</p>
              </div>
            </div>
          )}

          {uploadMethod === null ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-600 text-center font-medium">
                ¿Cómo deseas subir la carta firmada?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod("camera")}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  <Camera className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-bold text-secondary uppercase text-center leading-tight">
                    Tomar Foto
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("image")}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  <Image className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-bold text-secondary uppercase text-center leading-tight">
                    Subir Imagen
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("pdf")}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-bold text-secondary uppercase text-center leading-tight">
                    Subir PDF
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setUploadMethod(null)}
                className="text-xs text-gray-500 hover:text-primary transition-colors text-left"
              >
                ← Cambiar método
              </button>
              <label
                className={cn(
                  "flex flex-col items-center justify-center w-full p-8 border-4 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all hover:border-primary/30",
                  isLoading && "opacity-50 pointer-events-none",
                )}
              >
                {uploadMethod === "camera" && (
                  <>
                    <Camera className="h-10 w-10 text-primary mb-3" />
                    <span className="text-sm font-bold text-secondary text-center">
                      Tomar Foto
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      Asegúrate que la carta se vea completa y clara
                    </span>
                  </>
                )}
                {uploadMethod === "image" && (
                  <>
                    <Image className="h-10 w-10 text-primary mb-3" />
                    <span className="text-sm font-bold text-secondary text-center">
                      Subir Imagen
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      JPG, PNG o WebP
                    </span>
                  </>
                )}
                {uploadMethod === "pdf" && (
                  <>
                    <FileText className="h-10 w-10 text-primary mb-3" />
                    <span className="text-sm font-bold text-secondary text-center">
                      Subir PDF
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      Archivo PDF firmado
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={getAcceptType()}
                  capture={
                    uploadMethod === "camera" ? "environment" : undefined
                  }
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setStep("intro");
              setUploadMethod(null);
            }}
            className="text-xs text-gray-500 hover:text-primary transition-colors text-center"
          >
            ← Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}
