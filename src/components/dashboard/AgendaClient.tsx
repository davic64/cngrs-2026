"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Search, User } from "lucide-react";
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
  { value: "social", label: "Evento Social" },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

interface AgendaClientProps {
  initialEvents: any[];
}

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  const [selectedDay, setSelectedDay] = React.useState("1");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredEvents = initialEvents.filter((event) => {
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
      <header className="mb-10 text-center md:text-left">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Cronograma de Actividades
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Agenda <span className="text-primary">CNGRS26</span>
        </h1>
      </header>

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
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory("all");
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <Clock className="text-primary mb-4" size={32} />
              <h3 className="text-lg font-black uppercase tracking-tighter leading-tight mb-2">
                Puntualidad
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Te recomendamos llegar 10 minutos antes de cada sesión para
                asegurar tu lugar.
              </p>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black text-secondary uppercase tracking-[0.15em]">
              {DAYS.find((d) => d.id === selectedDay)?.full}
            </h2>
            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              {filteredEvents.length} Eventos
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
                    <EventCard {...event} />
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                  <Search size={32} className="text-gray-200 mb-4" />
                  <p className="font-black text-secondary uppercase tracking-tighter">
                    Sin resultados
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EventCard({ title, speaker, time, location, category }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="bg-white shadow-lg shadow-black/[0.04] border border-gray-50 px-5 py-4 rounded-xl flex flex-col items-center min-w-[100px]">
        <span className="text-[10px] font-black text-primary uppercase mb-1">
          {time.split(" ")[1]}
        </span>
        <span className="text-2xl font-black text-secondary leading-none tracking-tighter">
          {time.split(" ")[0]}
        </span>
      </div>
      <div className="flex-1 space-y-2 text-left">
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
        <h3 className="font-black text-secondary text-lg leading-tight uppercase tracking-tight">
          {title}
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <User size={12} className="text-primary" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {speaker}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-primary" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
