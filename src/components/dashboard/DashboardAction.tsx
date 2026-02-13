"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardActionProps {
  icon: React.ReactElement;
  label: string;
  color?: "blue" | "purple" | "amber" | "green";
  onClick?: () => void;
}

export function DashboardAction({
  icon,
  label,
  color = "blue",
  onClick,
}: DashboardActionProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    amber: "bg-amber-50 text-amber-500",
    green: "bg-green-50 text-green-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-primary/5 hover:-translate-y-1 transition-all group w-full cursor-pointer"
    >
      <div
        className={cn(
          "h-14 w-14 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
          colors[color],
        )}
      >
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, {
          size: 24,
        })}
      </div>
      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] text-center">
        {label}
      </span>
    </button>
  );
}
