"use client";

import * as React from "react";

// Fecha/hora fija de fin del mantenimiento, IGUAL para todos los usuarios.
// Ajusta este valor si cambia la hora de salida (zona -06:00, CDMX).
const MAINTENANCE_END = new Date("2026-06-16T14:00:00-06:00").getTime();

function format(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const tick = () => setRemaining(Math.max(0, MAINTENANCE_END - Date.now()));
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
