"use client";

import { MapPin, User } from "lucide-react";

interface EventItemProps {
  title: string;
  speaker: string;
  time: string;
  location: string;
  _index?: number;
}

export function EventItem({
  title,
  speaker,
  time,
  location,
  _index = 0,
}: EventItemProps) {
  return (
    <div className="group flex gap-5 items-center p-2 -m-2 rounded-3xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent">
      <div className="bg-white shadow-lg shadow-black/[0.03] border border-gray-100 px-4 py-3 rounded-2xl flex flex-col items-center min-w-[85px] group-hover:border-primary/30 transition-all group-hover:-translate-y-1">
        <span className="text-[10px] font-black text-primary uppercase mb-0.5">
          {time.split(" ")[1]}
        </span>
        <span className="text-xl font-black text-secondary leading-none tracking-tighter">
          {time.split(" ")[0]}
        </span>
      </div>
      <div className="flex-1 space-y-1.5 text-left">
        <h3 className="font-black text-secondary text-base group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">
          {title}
        </h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
            <User size={12} className="text-primary" /> {speaker}
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
            <MapPin size={12} className="text-primary" /> {location}
          </p>
        </div>
      </div>
    </div>
  );
}
