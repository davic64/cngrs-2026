"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Clock,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import * as React from "react";
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

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Inauguración: El Poder de la Unidad",
    speaker: "Comité Organizador",
    time: "08:00 AM",
    location: "Auditorio Principal",
  },
  {
    id: 2,
    title: "Conferencia: Liderazgo en el Siglo XXI",
    speaker: "Dr. Armando Guerra",
    time: "10:00 AM",
    location: "Auditorio Principal",
  },
  {
    id: 3,
    title: "Taller: Finanzas Saludables",
    speaker: "Lic. Rico McPato",
    time: "12:30 PM",
    location: "Sala B",
  },
];

export default function AdminAgendaPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
        <Button
          onClick={() => setIsModalOpen(true)}
          className="font-black uppercase text-[10px] tracking-widest px-8"
        >
          <Plus size={16} className="mr-2" /> Agregar Evento
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Events List */}
        <div className="lg:col-span-8 space-y-4">
          {MOCK_EVENTS.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                <div className="flex gap-5 items-center">
                  <div className="h-14 w-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:border-primary/30 transition-colors">
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
                <div className="flex gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                  <button
                    type="button"
                    className="flex-1 sm:flex-none h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    type="button"
                    className="flex-1 sm:flex-none h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Configuración">
            <div className="space-y-6">
              <Select
                label="Seleccionar Día"
                options={[
                  { value: "1", label: "Día 1 - Jueves 12" },
                  { value: "2", label: "Día 2 - Viernes 13" },
                  { value: "3", label: "Día 3 - Sábado 14" },
                ]}
              />
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">
                  Resumen del Día
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-black text-primary">12</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Actividades programadas
                    </p>
                  </div>
                  <Calendar size={32} className="text-primary/20" />
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
            Detalles del <span className="text-primary">Evento</span>
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4 pt-4">
          <Input
            label="Título del Evento"
            placeholder="Ej. Conferencia Magistral"
          />
          <Input label="Ponente / Invitado" placeholder="Nombre completo" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora" type="time" />
            <Input label="Lugar" placeholder="Ej. Auditorio A" />
          </div>
          <Select
            label="Categoría"
            options={[
              { value: "magistral", label: "Magistral" },
              { value: "taller", label: "Taller" },
              { value: "social", label: "Evento Social" },
            ]}
          />
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button className="flex-[2] shadow-lg shadow-primary/20">
            Guardar Evento
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
