"use client";

import * as React from "react";

// Duracion del mantenimiento en horas. Ajusta aqui si cambia el tiempo.
const MAINTENANCE_HOURS = 18;
const STORAGE_KEY = "cngrs_maintenance_end";

function getEndTime(): number {
  // Ancla la cuenta regresiva en localStorage para que sea estable entre recargas.
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const end = Date.now() + MAINTENANCE_HOURS * 60 * 60 * 1000;
  window.localStorage.setItem(STORAGE_KEY, String(end));
  return end;
}

function format(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const end = getEndTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining === null) {
    // Evita parpadeo/hidratacion: placeholder mientras carga el cliente.
    return (
      <div className="flex gap-3 sm:gap-4 justify-center" aria-hidden>
        {["--", "--", "--"].map((v, i) => (
          <TimeBox key={i} value={v} label={["Horas", "Min", "Seg"][i]} />
        ))}
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <p className="text-lg sm:text-xl font-black text-primary uppercase tracking-tight">
        ¡Ya casi listo! Recarga la página.
      </p>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      <TimeBox value={format(hours)} label="Horas" />
      <TimeBox value={format(minutes)} label="Min" />
      <TimeBox value={format(seconds)} label="Seg" />
    </div>
  );
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[64px] sm:min-w-[80px] rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-5">
        <span className="block text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tighter">
          {value}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
