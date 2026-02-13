"use client";

import {
  AlertTriangle,
  Bell,
  History,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import * as React from "react";
import { broadcastNotification } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface AdminNotificationsClientProps {
  initialNotices: any[];
}

export function AdminNotificationsClient({
  initialNotices,
}: AdminNotificationsClientProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const feedLabelId = React.useId();
  const modalLabelId = React.useId();

  const handleBroadcast = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      message: formData.get("message") as string,
      fullContent: formData.get("fullContent") as string,
      type: formData.get("type") as string,
      isPinned: formData.get("isPinned") === "important",
    };

    const result = await broadcastNotification(data);
    if (result.success) {
      alert("Aviso emitido con éxito a todos los asistentes.");
      (e.target as HTMLFormElement).reset();
    } else {
      alert("Error al emitir el aviso.");
    }
    setIsSubmitting(false);
  };

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
        <div className="lg:col-span-7">
          <DashboardCard title="Nuevo Comunicado">
            <form onSubmit={handleBroadcast} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  name="type"
                  label="Tipo de Aviso"
                  options={[
                    { value: "info", label: "Información (Azul)" },
                    { value: "important", label: "Fijado / Importante" },
                    { value: "urgent", label: "Urgente (Rojo)" },
                    { value: "event", label: "Evento (Morado)" },
                  ]}
                />
                <Select
                  name="audience"
                  label="Audiencia"
                  options={[{ value: "all", label: "Todos los Usuarios" }]}
                />
              </div>

              <Input
                name="title"
                label="Título del Aviso"
                placeholder="Ej. ¡Estamos listos para comenzar!"
                required
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
                  name="message"
                  required
                  className="w-full min-h-[80px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
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
                  name="fullContent"
                  required
                  className="w-full min-h-[120px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                  placeholder="Aquí puedes poner todos los detalles..."
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? (
                    "Emitiendo..."
                  ) : (
                    <>
                      <Megaphone size={18} className="mr-2" /> Emitir Aviso
                      Oficial
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DashboardCard>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <DashboardCard
            title="Historial"
            action={<History size={18} className="text-gray-300" />}
          >
            <div className="space-y-4">
              {initialNotices.length > 0 ? (
                initialNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          notice.isPinned
                            ? "bg-primary text-secondary"
                            : "bg-white text-secondary border border-gray-100",
                        )}
                      >
                        {notice.type === "urgent" ? (
                          <AlertTriangle size={14} className="text-red-500" />
                        ) : (
                          <Bell size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-secondary uppercase tracking-tight line-clamp-1">
                          {notice.title}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-10 font-bold uppercase tracking-widest">
                  Sin historial de avisos
                </p>
              )}
            </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-secondary/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <MessageSquare size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                  Directo al Asistente
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-white/60 font-medium">
                Tus avisos aparecen instantáneamente en el feed de noticias de
                los 500 asistentes. Úsalos para cambios de clima, horarios o
                recordatorios urgentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
