"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function DashboardCard({
  children,
  className,
  title,
  action,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-black/5 border border-gray-100",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-8 px-2">
          {title && (
            <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
