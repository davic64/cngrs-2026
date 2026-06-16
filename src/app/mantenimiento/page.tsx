import type { Metadata } from "next";
import Countdown from "./Countdown";

export const metadata: Metadata = {
  title: "En mantenimiento · CNGRS 2026",
  description: "Estamos preparando algo nuevo. Vuelve pronto.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="space-y-3">
          <span className="inline-block text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.3em]">
            CNGRS 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">
            Sitio en <span className="text-primary">mantenimiento</span>
          </h1>
        </div>

        <p className="text-sm sm:text-base text-white/60 font-medium leading-relaxed px-2">
          Estamos afinando algunos detalles para mejorar tu experiencia.
          <br className="hidden sm:block" />
          Vuelve mañana — el registro estará habilitado.
        </p>

        <div className="pt-2">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
            Tiempo estimado
          </p>
          <Countdown />
        </div>

        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-4">
          Gracias por tu paciencia
        </p>
      </div>
    </main>
  );
}
