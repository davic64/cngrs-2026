"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, Star, User } from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

// Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const DAYS = [
  { id: "1", label: "Jue 12", full: "Jueves 12 de Febrero" },
  { id: "2", label: "Vie 13", full: "Viernes 13 de Febrero" },
  { id: "3", label: "Sab 14", full: "Sábado 14 de Febrero" },
];

const CATEGORIES = [
  { value: "all", label: "Todas las áreas" },
  { value: "magistral", label: "Magistrales" },
  { value: "taller", label: "Talleres" },
  { value: "panel", label: "Paneles" },
];

const MOCK_AGENDA = [
  {
    id: 1,
    dayId: "1",
    title: "Inauguración: El Poder de la Unidad",
    speaker: "Comité Organizador",
    time: "08:00 AM",
    location: "Auditorio Principal",
    category: "magistral",
    isFavorite: true,
  },
  {
    id: 2,
    dayId: "1",
    title: "Conferencia: Liderazgo en el Siglo XXI",
    speaker: "Dr. Armando Guerra",
    time: "10:00 AM",
    location: "Auditorio Principal",
    category: "magistral",
  },
  {
    id: 3,
    dayId: "1",
    title: "Taller: Finanzas Saludables",
    speaker: "Lic. Rico McPato",
    time: "12:30 PM",
    location: "Sala B",
    category: "taller",
  },
  {
    id: 4,
    dayId: "2",
    title: "Panel: Tecnología y Fe",
    speaker: "Varios Ponentes",
    time: "09:00 AM",
    location: "Auditorio A",
    category: "panel",
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = React.useState("1");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredEvents = MOCK_AGENDA.filter((event) => {
    const matchesDay = event.dayId === selectedDay;
    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 pb-32 md:pb-12">
      {/* Header */}
      <header className="mb-10 text-center md:text-left">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Cronograma de Actividades
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Agenda <span className="text-primary">CNGRS26</span>
        </h1>
      </header>

      {/* Days Selector */}
      <div className="flex justify-center md:justify-start gap-3 mb-8 overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar">
        {DAYS.map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => setSelectedDay(day.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[100px] h-20 rounded-[1.5rem] border-2 transition-all cursor-pointer",
              selectedDay === day.id
                ? "bg-secondary border-secondary text-white shadow-xl shadow-secondary/20 scale-105"
                : "bg-white border-gray-100 text-gray-400 hover:border-primary/30",
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">
              {day.label.split(" ")[0]}
            </span>
            <span className="text-xl font-black tracking-tighter">
              {day.label.split(" ")[1]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <DashboardCard title="Filtros">
            <div className="space-y-6">
              <Input
                label="Buscar Actividad"
                placeholder="Nombre o ponente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                label="Categoría"
                options={CATEGORIES}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full h-11 font-bold uppercase text-[10px] tracking-widest"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </DashboardCard>

          <div className="hidden lg:block bg-primary/5 border border-primary/10 rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-3 text-primary">
              <Star size={20} fill="currentColor" />
              <h3 className="font-black uppercase tracking-tighter text-sm">
                Favoritos
              </h3>
            </div>
            <p className="text-[11px] text-secondary/60 font-medium leading-relaxed uppercase tracking-wider">
              Marca las actividades con una estrella para armar tu propia agenda
              personalizada.
            </p>
          </div>
        </aside>

        {/* Events List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black text-secondary uppercase tracking-[0.15em]">
              {DAYS.find((d) => d.id === selectedDay)?.full}
            </h2>
            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              {filteredEvents.length} Actividades
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay + filterCategory + searchQuery}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <motion.div key={event.id} variants={itemVariants} layout>
                    <EventItemCard {...event} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center"
                >
                  <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                    <Search size={32} />
                  </div>
                  <p className="font-black text-secondary uppercase tracking-tighter">
                    No hay resultados
                  </p>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                    Intenta cambiar tus filtros
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EventItemCard({
  title,
  speaker,
  time,
  location,
  category,
  isFavorite,
}: {
  title: string;
  speaker: string;
  time: string;
  location: string;
  category: string;
  isFavorite?: boolean;
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.03] border border-gray-100 group hover:border-primary/30 transition-all flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="bg-white shadow-lg shadow-black/[0.04] border border-gray-50 px-5 py-4 rounded-xl flex flex-col items-center min-w-[100px] group-hover:scale-105 transition-all">
        <span className="text-[10px] font-black text-primary uppercase mb-1">
          {time.split(" ")[1]}
        </span>
        <span className="text-2xl font-black text-secondary leading-none tracking-tighter">
          {time.split(" ")[0]}
        </span>
      </div>

      <div className="flex-1 space-y-2 text-left">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
              category === "magistral"
                ? "bg-purple-100 text-purple-600"
                : category === "taller"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-amber-100 text-amber-600",
            )}
          >
            {category}
          </span>
          {isFavorite && (
            <Star size={14} className="text-primary fill-primary" />
          )}
        </div>

        <h3 className="font-black text-secondary text-lg group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">
          {title}
        </h3>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-50 rounded-lg flex items-center justify-center">
              <User size={12} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {speaker}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-50 rounded-lg flex items-center justify-center">
              <MapPin size={12} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {location}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-10 px-6 font-bold uppercase text-[10px] tracking-widest"
        >
          Detalles
        </Button>
      </div>
    </div>
  );
}
