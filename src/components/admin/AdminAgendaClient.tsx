"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Plus, Trash2, User } from "lucide-react";
import * as React from "react";
import {
  createAgendaDay,
  createEvent,
  deleteAgendaDay,
  deleteEvent,
} from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

interface AgendaDay {
  id: number;
  label: string;
  date: string;
  sortOrder: number;
}

interface AdminAgendaClientProps {
  initialEvents: any[];
  initialDays: AgendaDay[];
}

export function AdminAgendaClient({
  initialEvents,
  initialDays,
}: AdminAgendaClientProps) {
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = React.useState(false);
  const [isSubmitting, setIsProcessing] = React.useState(false);
  const [day, setDay] = React.useState(
    initialDays.length > 0 ? initialDays[0].id.toString() : "",
  );

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      speaker: formData.get("speaker") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      dayId: formData.get("dayId") as string,
    };

    const result = await createEvent(data);
    if (result.success) {
      setIsEventModalOpen(false);
    } else {
      alert("Error al guardar el evento");
    }
    setIsProcessing(false);
  };

  const handleDaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get("label") as string,
      date: formData.get("date") as string,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    };

    const result = await createAgendaDay(data);
    if (result.success) {
      setIsDayModalOpen(false);
    } else {
      alert("Error al crear el día");
    }
    setIsProcessing(false);
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      await deleteEvent(id);
    }
  };

  const handleDeleteDay = async (id: number) => {
    if (confirm("¿Eliminar este día y todos sus eventos asociados?")) {
      await deleteAgendaDay(id);
    }
  };

  const filteredEvents = initialEvents.filter((e) => e.dayId === day);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
            Programa Oficial
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Gestionar <span className="text-primary">Agenda</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDayModalOpen(true)}
            variant="outline"
            className="font-black uppercase text-[10px] tracking-widest px-6"
          >
            <Calendar size={16} className="mr-2" /> Agregar Día
          </Button>
          <Button
            onClick={() => setIsEventModalOpen(true)}
            className="font-black uppercase text-[10px] tracking-widest px-8"
            disabled={initialDays.length === 0}
          >
            <Plus size={16} className="mr-2" /> Agregar Evento
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {initialDays.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 text-gray-400 font-bold uppercase text-xs">
              Agrega un día primero para comenzar a crear la agenda
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {initialDays.map((d) => (
                  <div key={d.id} className="relative group">
                    <button
                      onClick={() => setDay(d.id.toString())}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        day === d.id.toString()
                          ? "bg-secondary text-white shadow-lg"
                          : "bg-white text-gray-400 border border-gray-100",
                      )}
                    >
                      {d.label} — {d.date}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDay(d.id)}
                      className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                      <div className="flex gap-5 items-center">
                        <div className="h-14 w-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-[9px] font-black text-primary uppercase">
                            {event.time.split(" ")[1]}
                          </span>
                          <span className="text-lg font-black text-secondary">
                            {event.time.split(" ")[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-secondary uppercase tracking-tight">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <User size={12} className="text-primary" />{" "}
                              {event.speaker}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <MapPin size={12} className="text-primary" />{" "}
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 text-gray-400 font-bold uppercase text-xs">
                  No hay eventos para este día
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Configuración">
            <p className="text-xs text-gray-500 leading-relaxed italic">
              Selecciona el día para visualizar y gestionar las actividades
              programadas en el feed de los usuarios.
            </p>
          </DashboardCard>
        </div>
      </div>

      {/* MODAL: Nuevo Evento */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      >
        <form onSubmit={handleEventSubmit}>
          <ModalHeader onClose={() => setIsEventModalOpen(false)}>
            <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
              Nuevo <span className="text-primary">Evento</span>
            </ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4 pt-4">
            <Input
              name="title"
              label="Título del Evento"
              placeholder="Ej. Conferencia Magistral"
              required
            />
            <Input
              name="speaker"
              label="Ponente / Invitado"
              placeholder="Nombre completo"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input name="time" label="Hora" placeholder="10:00 AM" required />
              <Input
                name="location"
                label="Lugar"
                placeholder="Auditorio A"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                name="dayId"
                label="Día"
                options={initialDays.map((d) => ({
                  value: d.id.toString(),
                  label: `${d.label} — ${d.date}`,
                }))}
              />
              <Select
                name="category"
                label="Categoría"
                options={[
                  { value: "magistral", label: "Magistral" },
                  { value: "taller", label: "Taller" },
                  { value: "social", label: "Social" },
                ]}
              />
            </div>
          </ModalContent>
          <ModalFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsEventModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Guardando..." : "Guardar Evento"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* MODAL: Nuevo Día */}
      <Modal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)}>
        <form onSubmit={handleDaySubmit}>
          <ModalHeader onClose={() => setIsDayModalOpen(false)}>
            <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
              Nuevo <span className="text-primary">Día</span>
            </ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4 pt-4">
            <Input
              name="label"
              label="Nombre del Día"
              placeholder="Ej. Jueves"
              required
            />
            <Input
              name="date"
              label="Fecha"
              placeholder="Ej. 12 de Febrero"
              required
            />
            <Input
              name="sortOrder"
              label="Orden"
              type="number"
              placeholder="1"
              required
            />
          </ModalContent>
          <ModalFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsDayModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Guardando..." : "Guardar Día"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
