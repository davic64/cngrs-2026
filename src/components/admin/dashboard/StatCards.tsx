"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import type { AdminStats } from "@/app/actions/admin-stats";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";

const COLORS = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-green-50 text-green-500",
  amber: "bg-amber-50 text-amber-500",
  purple: "bg-purple-50 text-purple-500",
} as const;

export const formatMxn = (n: number) => `$${n.toLocaleString("es-MX")} MXN`;

export function StatCards({ stats }: { stats: AdminStats }) {
  const cards: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: keyof typeof COLORS;
    href?: string;
  }[] = [
    {
      label: "Total Registrados",
      value: stats.totalUsers,
      icon: <Users />,
      color: "blue",
      href: "/admin/users",
    },
    {
      label: "Pagos Validados",
      value: stats.validatedPayments,
      icon: <CheckCircle2 />,
      color: "green",
    },
    {
      label: "Por Validar",
      value: stats.pendingPayments,
      icon: <Clock />,
      color: "amber",
      href: "/admin/payments",
    },
    {
      label: "Ingresos Totales",
      value: formatMxn(stats.totalIncome),
      icon: <TrendingUp />,
      color: "purple",
    },
  ];

  const statuses = [
    { key: "pendiente", label: "Pendientes", tone: "text-gray-500" },
    { key: "parcial", label: "Parciales", tone: "text-amber-600" },
    { key: "completado", label: "Completados", tone: "text-green-600" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, idx) => {
          const card = (
            <DashboardCard
              className={cn(
                "p-6 h-full",
                stat.href && "hover:border-primary/30 transition-all",
              )}
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm mb-4",
                  COLORS[stat.color],
                )}
              >
                {React.cloneElement(
                  stat.icon as React.ReactElement<{ size: number }>,
                  { size: 24 },
                )}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-secondary mt-1">
                {stat.value}
              </p>
            </DashboardCard>
          );
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {stat.href ? <Link href={stat.href}>{card}</Link> : card}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {statuses.map((s) => (
          <Link key={s.key} href={`/admin/users?status=${s.key}`}>
            <DashboardCard className="p-4 sm:p-6 hover:border-primary/30 transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className={cn("text-2xl sm:text-3xl font-black mt-1", s.tone)}>
                {stats.usersByStatus[s.key]}
              </p>
            </DashboardCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
