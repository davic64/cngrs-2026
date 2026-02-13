"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Registrados",
      value: "1,240",
      icon: <Users />,
      color: "blue",
      trend: "+12%",
    },
    {
      label: "Pagos Validados",
      value: "850",
      icon: <CheckCircle2 />,
      color: "green",
      trend: "68%",
    },
    {
      label: "Pendientes por Validar",
      value: "45",
      icon: <Clock />,
      color: "amber",
      trend: "Urgente",
    },
    {
      label: "Ingresos Totales",
      value: "$450,000",
      icon: <TrendingUp />,
      color: "purple",
      trend: "MXN",
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Métricas del Congreso
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Panel de <span className="text-primary">Control</span>
        </h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <DashboardCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                    stat.color === "blue"
                      ? "bg-blue-50 text-blue-500"
                      : stat.color === "green"
                        ? "bg-green-50 text-green-500"
                        : stat.color === "amber"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-purple-50 text-purple-500",
                  )}
                >
                  {React.cloneElement(stat.icon as React.ReactElement, {
                    size: 24,
                  })}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest",
                    stat.color === "green"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-secondary mt-1">
                {stat.value}
              </p>
            </DashboardCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Pending Payments */}
        <div className="lg:col-span-8">
          <DashboardCard
            title="Validaciones Pendientes"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black text-primary uppercase tracking-widest"
              >
                Ver todo
              </Button>
            }
          >
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-secondary border border-gray-100 shadow-sm">
                      {["JP", "AM", "LR"][i - 1]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-secondary uppercase tracking-tight">
                        {
                          ["Juan Pérez", "Ana Martínez", "Luis Rodríguez"][
                            i - 1
                          ]
                        }
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        SPEI - $1,000 MXN
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-black uppercase text-primary"
                    >
                      Revisar
                    </Button>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-primary transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Quick Admin Actions */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Acciones Rápidas">
            <div className="grid grid-cols-1 gap-3">
              <AdminActionButton
                icon={<QrCode size={18} />}
                label="Escanear Gafete"
              />
              <AdminActionButton
                icon={<Bell size={18} />}
                label="Enviar Notificación"
              />
              <AdminActionButton
                icon={<Calendar size={18} />}
                label="Agregar Evento"
              />
            </div>
          </DashboardCard>

          <div className="bg-primary rounded-[2rem] p-8 text-secondary relative overflow-hidden shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">
                Configuración del Evento
              </h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2 mb-6">
                Capacidad máxima: 2,000 personas
              </p>
              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 font-black uppercase text-[10px] tracking-widest">
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 hover:bg-white hover:shadow-lg hover:shadow-black/[0.02] transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
          {label}
        </span>
      </div>
      <ArrowUpRight
        size={14}
        className="text-gray-300 group-hover:text-primary"
      />
    </button>
  );
}
