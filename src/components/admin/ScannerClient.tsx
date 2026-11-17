"use client";

import { CircleAlert, CircleCheck, CircleX, ScanLine } from "lucide-react";
import type QrScanner from "qr-scanner";
import * as React from "react";
import { type ScanResult, scanAttendee } from "@/app/actions/scanner";
import { Button } from "@/components/ui/Button";

type View =
  | { kind: "scanning" }
  | { kind: "checking" }
  | { kind: "error"; message: string }
  | ({ kind: "result" } & ScanResult);

export function ScannerClient() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerRef = React.useRef<QrScanner | null>(null);
  const busyRef = React.useRef(false);
  const [view, setView] = React.useState<View>({ kind: "scanning" });

  const onCode = React.useCallback(async (code: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    scannerRef.current?.pause();
    setView({ kind: "checking" });
    try {
      setView({ kind: "result", ...(await scanAttendee(code)) });
    } catch {
      setView({
        kind: "error",
        message: "No se pudo validar el código. Revisa la conexión.",
      });
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: Scanner } = await import("qr-scanner");
      if (cancelled || !videoRef.current) return;
      const scanner = new Scanner(videoRef.current, (r) => onCode(r.data), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        maxScansPerSecond: 5,
      });
      scannerRef.current = scanner;
      try {
        await scanner.start();
      } catch {
        setView({
          kind: "error",
          message:
            "No hay acceso a la cámara. Permite la cámara en el navegador y recarga.",
        });
      }
    })();
    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
    };
  }, [onCode]);

  const next = async () => {
    setView({ kind: "scanning" });
    busyRef.current = false;
    await scannerRef.current?.start();
  };

  const showCamera = view.kind === "scanning" || view.kind === "checking";

  return (
    <div className="max-w-md mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-secondary mb-4 flex items-center gap-2">
        <ScanLine className="text-primary" /> Escáner <span className="text-primary">QR</span>
      </h1>

      <div className={showCamera ? "relative" : "hidden"}>
        <video
          ref={videoRef}
          className="w-full aspect-square object-cover rounded-[2rem] bg-black"
          muted
          playsInline
        />
        {view.kind === "checking" && (
          <div className="absolute inset-0 rounded-[2rem] bg-black/60 flex items-center justify-center text-white font-black uppercase tracking-widest text-sm">
            Validando…
          </div>
        )}
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mt-4">
          Apunta la cámara al código QR del asistente
        </p>
      </div>

      {view.kind === "error" && (
        <ResultCard tone="error" icon={<CircleX size={48} />} title="Error">
          <p className="text-gray-600">{view.message}</p>
        </ResultCard>
      )}

      {view.kind === "result" && view.status === "ok" && (
        <ResultCard tone="ok" icon={<CircleCheck size={48} />} title="Acceso registrado">
          {view.photoUrl ? (
            <img
              src={view.photoUrl}
              alt={view.name}
              className="w-56 h-56 mx-auto rounded-[2rem] object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-56 h-56 mx-auto rounded-[2rem] bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-black uppercase">
              Sin foto
            </div>
          )}
          <p className="text-2xl font-black text-secondary mt-4">{view.name}</p>
          <p className="text-lg font-bold text-gray-500">{view.locality}</p>
        </ResultCard>
      )}

      {view.kind === "result" && view.status === "duplicate" && (
        <ResultCard tone="warn" icon={<CircleAlert size={48} />} title="Este código ya fue escaneado">
          <p className="text-lg font-bold text-secondary">{view.name}</p>
          <p className="text-gray-500">
            Escaneado el{" "}
            {new Date(view.checkedInAt).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </ResultCard>
      )}

      {view.kind === "result" && view.status === "not_found" && (
        <ResultCard tone="error" icon={<CircleX size={48} />} title="Este código no existe">
          <p className="text-gray-600">No corresponde a ningún asistente registrado.</p>
        </ResultCard>
      )}

      {!showCamera && (
        <Button
          variant="primary"
          className="w-full mt-6 font-black uppercase tracking-widest"
          onClick={next}
        >
          Escanear siguiente
        </Button>
      )}
    </div>
  );
}

const tones = {
  ok: "bg-green-50 border-green-500 text-green-600",
  warn: "bg-amber-50 border-amber-500 text-amber-600",
  error: "bg-red-50 border-red-500 text-red-600",
};

function ResultCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof tones;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-[2rem] border-4 p-6 text-center ${tones[tone]}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h2>
      {children}
    </div>
  );
}
