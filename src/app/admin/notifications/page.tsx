"use client";

import {
  AlertTriangle,
  Bell,
  History,
  Megaphone,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const SENT_NOTICES = [
  {
    id: 1,
    title: "¡Inscripciones Abiertas!",
    date: "Hoy, 10:00 AM",
    type: "important",
    audience: "Todos",
  },
  {
    id: 2,
    title: "Cambio de Auditorio",
    date: "Ayer, 04:30 PM",
    type: "urgent",
    audience: "Asistentes",
  },
];

export default function AdminNotificationsPage() {
  const [type, setType] = React.useState("info");
  const feedLabelId = React.useId();
  const modalLabelId = React.useId();

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Comunicación Oficial
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Enviar <span className="text-primary">Avisos</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-7">
          <DashboardCard title="Nuevo Comunicado">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Tipo de Aviso"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[
                    { value: "important", label: "Fijado / Importante" },
                    { value: "urgent", label: "Urgente (Rojo)" },
                    { value: "info", label: "Información (Azul)" },
                    { value: "event", label: "Evento (Morado)" },
                  ]}
                />
                <Select
                  label="Audiencia"
                  options={[
                    { value: "all", label: "Todos los Usuarios" },
                    { value: "paid", label: "Solo Pagados" },
                    { value: "pending", label: "Solo con Adeudo" },
                  ]}
                />
              </div>

              <Input
                label="Título del Aviso"
                placeholder="Ej. ¡Estamos listos para comenzar!"
              />

              <div className="space-y-1.5">
                <label
                  htmlFor={feedLabelId}
                  className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1"
                >
                  Mensaje Corto (Feed)
                </label>
                <textarea
                  id={feedLabelId}
                  className="w-full min-h-[100px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                  placeholder="Este mensaje aparecerá en la lista principal..."
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={modalLabelId}
                  className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1"
                >
                  Contenido Extendido (Modal)
                </label>
                <textarea
                  id={modalLabelId}
                  className="w-full min-h-[150px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                  placeholder="Aquí puedes poner todos los detalles..."
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  className="w-full h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20"
                >
                  <Megaphone size={18} className="mr-2" /> Emitir Aviso Oficial
                </Button>
              </div>
            </form>
          </DashboardCard>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <DashboardCard
            title="Historial"
            action={<History size={18} className="text-gray-300" />}
          >
            <div className="space-y-4">
              {SENT_NOTICES.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        notice.type === "important"
                          ? "bg-primary text-secondary"
                          : "bg-red-100 text-red-600",
                      )}
                    >
                      {notice.type === "important" ? (
                        <Bell size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-secondary uppercase tracking-tight">
                        {notice.title}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {notice.date}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-secondary/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <MessageSquare size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                  Impacto
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-white/60 font-medium">
                Tus avisos se enviarán como notificaciones push y aparecerán
                instantáneamente en el feed de noticias de los asistentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
