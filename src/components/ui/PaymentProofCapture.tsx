"use client";

import React from "react";
import { AlertCircle, Camera, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentProofCaptureProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  previewUrl: string | null;
  fileName?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  label?: string;
  description?: string;
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
}: PaymentProofCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Iniciar cámara
  const startCamera = React.useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error: any) {
      console.error("Error al acceder a la cámara:", error);
      setCameraError(
        error.name === "NotAllowedError"
          ? "Permiso de cámara denegado. Actívalo en los permisos de la app."
          : "No se pudo acceder a la cámara. Intenta de nuevo.",
      );
    }
  }, []);

  // Detener cámara
  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capturar foto
  const capturePhoto = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Configurar canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual del video
      ctx.drawImage(video, 0, 0);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `comprobante_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onFileSelect(file);
            stopCamera();
          }
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("Error al capturar foto:", error);
      setCameraError("Error al capturar la foto. Intenta de nuevo.");
    }
  }, [onFileSelect, stopCamera]);

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Si hay preview, mostrar la imagen capturada
  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-primary/20 shadow-xl mx-auto bg-black">
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            alt="Comprobante capturado"
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Procesando...
              </p>
            </div>
          )}

          {/* Success overlay */}
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

          {/* Error overlay */}
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

          {/* Remove button */}
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

  // Si la cámara está activa, mostrar live preview
  if (isCameraActive) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-primary shadow-2xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Reticle overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-4/5 h-3/4 border-2 border-primary/30 rounded-lg" />
            <div className="absolute w-4/5 h-3/4 border-2 border-primary rounded-lg animate-pulse" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={stopCamera}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Capture button */}
        <button
          type="button"
          onClick={capturePhoto}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold uppercase px-8 py-3 rounded-full shadow-lg transition-colors"
        >
          <Camera className="h-5 w-5" />
          Capturar Foto
        </button>

        {/* Instructions */}
        <p className="text-[10px] text-gray-600 text-center font-medium max-w-xs">
          Alinea el comprobante en el recuadro y asegúrate de que esté bien
          iluminado. Luego toca el botón de captura.
        </p>
      </div>
    );
  }

  // Si hay error de cámara, mostrar opción alternativa
  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl w-full">
          <p className="text-[10px] font-bold text-red-700 text-center uppercase">
            {cameraError}
          </p>
        </div>
        <button
          type="button"
          onClick={startCamera}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold uppercase px-6 py-2 rounded-full shadow-lg transition-colors text-sm"
        >
          <Camera className="h-4 w-4" />
          Reintentar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileSelect(file);
            }
          }}
        />
      </div>
    );
  }

  // Estado inicial: botón para iniciar cámara
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {description && (
        <p className="text-[10px] text-gray-600 text-center font-medium">
          {description}
        </p>
      )}
      <button
        type="button"
        onClick={startCamera}
        className="flex flex-col items-center justify-center gap-3 w-full aspect-video border-4 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-3xl transition-all"
      >
        <Camera className="h-12 w-12 text-primary" />
        <span className="text-sm font-bold text-secondary uppercase text-center px-4">
          {label}
        </span>
        <span className="text-[9px] text-gray-500 uppercase font-semibold">
          Usa la cámara de tu dispositivo
        </span>
      </button>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
