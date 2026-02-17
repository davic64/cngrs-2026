"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, User } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

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
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

interface AgendaDay {
  id: number;
  label: string;
  date: string;
  sortOrder: number;
}

interface AgendaClientProps {
  initialEvents: any[];
  days: AgendaDay[];
}

export function AgendaClient({ initialEvents, days }: AgendaClientProps) {
  const [selectedDay, setSelectedDay] = React.useState(
    days.length > 0 ? days[0].id.toString() : "",
  );

  const filteredEvents = initialEvents.filter((event) => {
    return event.dayId === selectedDay;
  });

  const currentDay = days.find((d) => d.id.toString() === selectedDay);

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

      {days.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <Clock size={40} className="text-gray-100 mb-4" />
          <p className="font-black text-secondary uppercase tracking-tighter">
            La agenda aún no está disponible
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center md:justify-start gap-3 mb-8 overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar">
            {days.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id.toString())}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[100px] h-20 rounded-[1.5rem] border-2 transition-all cursor-pointer",
                  selectedDay === day.id.toString()
                    ? "bg-secondary border-secondary text-white shadow-xl shadow-secondary/20 scale-105"
                    : "bg-white border-gray-100 text-gray-400 hover:border-primary/30",
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {day.label}
                </span>
                <span className="text-sm font-black tracking-tighter">
                  {day.date}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-black text-secondary uppercase tracking-[0.15em]">
                {currentDay ? `${currentDay.label} — ${currentDay.date}` : ""}
              </h2>
              <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                {filteredEvents.length} Eventos
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <motion.div key={event.id} variants={itemVariants} layout>
                      <EventCard {...event} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                    <Clock size={40} className="text-gray-100 mb-4" />
                    <p className="font-black text-secondary uppercase tracking-tighter">
                      Sin actividades programadas para hoy
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
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
