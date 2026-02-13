"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  User, 
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { createEvent, deleteEvent } from "@/app/actions/admin";

interface AdminAgendaClientProps {
  initialEvents: any[];
}

export function AdminAgendaClient({ initialEvents }: AdminAgendaClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsProcessing] = React.useState(false);
  const [day, setDay] = React.useState("1");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      speaker: formData.get("speaker") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      dayId: day
    };

    const result = await createEvent(data);
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert("Error al guardar el evento");
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      await deleteEvent(id);
    }
  };

  const filteredEvents = initialEvents.filter(e => e.dayId === day);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Programa Oficial</p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Gestionar <span className="text-primary">Agenda</span>
          </h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="font-black uppercase text-[10px] tracking-widest px-8">
          <Plus size={16} className="mr-2" /> Agregar Evento
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
             {[1, 2, 3].map((d) => (
               <button 
                 key={d} 
                 onClick={() => setDay(d.toString())}
                 className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                   day === d.toString() ? "bg-secondary text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100"
                 )}
               >
                 Día {d}
               </button>
             ))}
          </div>

          {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                <div className="flex gap-5 items-center">
                  <div className="h-14 w-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-[9px] font-black text-primary uppercase">{event.time.split(' ')[1]}</span>
                    <span className="text-lg font-black text-secondary">{event.time.split(' ')[0]}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-secondary uppercase tracking-tight">{event.title}</h3>
                    <div className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><User size={12} className="text-primary" /> {event.speaker}</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><MapPin size={12} className="text-primary" /> {event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleDelete(event.id)} className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"><Trash2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 text-gray-400 font-bold uppercase text-xs">No hay eventos para este día</div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Configuración">
             <p className="text-xs text-gray-500 leading-relaxed italic">Selecciona el día para visualizar y gestionar las actividades programadas en el feed de los usuarios.</p>
          </DashboardCard>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={() => setIsModalOpen(false)}>
            <ModalTitle className="text-2xl font-black uppercase tracking-tighter">Nuevo <span className="text-primary">Evento</span></ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4 pt-4">
            <Input name="title" label="Título del Evento" placeholder="Ej. Conferencia Magistral" required />
            <Input name="speaker" label="Ponente / Invitado" placeholder="Nombre completo" required />
            <div className="grid grid-cols-2 gap-4">
              <Input name="time" label="Hora" placeholder="10:00 AM" required />
              <Input name="location" label="Lugar" placeholder="Auditorio A" required />
            </div>
            <Select name="category" label="Categoría" options={[{ value: "magistral", label: "Magistral" }, { value: "taller", label: "Taller" }, { value: "social", label: "Social" }]} />
          </ModalContent>
          <ModalFooter className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-[2] shadow-lg shadow-primary/20">{isSubmitting ? "Guardando..." : "Guardar Evento"}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
