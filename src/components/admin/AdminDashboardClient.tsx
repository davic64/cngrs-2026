"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Save,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  createLocality,
  deleteLocality,
  updateSettings,
} from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface AdminDashboardClientProps {
  stats: any;
  pendingPayments: any[];
  config: any;
  allLocalities: any[];
}

export function AdminDashboardClient({
  stats,
  pendingPayments,
  config,
  allLocalities,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Localities State
  const [newLocality, setNewLocality] = React.useState({
    name: "",
    country: "México",
  });
  const [isAddingLocality, setIsAddingLocality] = React.useState(false);

  const handleAddLocality = async () => {
    if (!newLocality.name) return;
    setIsAddingLocality(true);
    await createLocality(newLocality);
    setNewLocality({ ...newLocality, name: "" });
    setIsAddingLocality(false);
  };
  const [prices, setPrices] = React.useState({
    fullPaymentPrice: config.fullPaymentPrice,
    registrationFeePrice: config.registrationFeePrice,
    stripePercentage: config.stripePercentage,
    stripeFixedFee: config.stripeFixedFee,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSavePrices = async () => {
    setIsSaving(true);
    const result = await updateSettings(prices);
    if (result.success) alert("Configuración actualizada correctamente");
    setIsSaving(false);
  };

  const statCards = [
    {
      label: "Total Registrados",
      value: stats.totalUsers,
      icon: <Users />,
      color: "blue",
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
    },
    {
      label: "Ingresos Totales",
      value: `$${stats.totalIncome.toLocaleString()} MXN`,
      icon: <TrendingUp />,
      color: "purple",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
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
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-secondary mt-1">
                {stat.value}
              </p>
            </DashboardCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard
            title="Validaciones Pendientes"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black text-primary uppercase tracking-widest"
                onClick={() => router.push("/admin/payments")}
              >
                Ver todo
              </Button>
            }
          >
            <div className="space-y-4">
              {pendingPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => router.push("/admin/payments")}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-secondary shadow-sm">
                      {payment.user?.firstName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-secondary uppercase tracking-tight">
                        {payment.user?.firstName} {payment.user?.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        ${payment.amount} MXN • {payment.method}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))}
              {pendingPayments.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-6 uppercase font-bold tracking-widest">
                  Sin pendientes por ahora
                </p>
              )}
            </div>
          </DashboardCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Configuración de Costos">
            <div className="space-y-4">
              <Input
                label="Precio Pago Completo"
                type="number"
                value={prices.fullPaymentPrice}
                onChange={(e) =>
                  setPrices({
                    ...prices,
                    fullPaymentPrice: parseInt(e.target.value, 10),
                  })
                }
              />
              <Input
                label="Precio Inscripción"
                type="number"
                value={prices.registrationFeePrice}
                onChange={(e) =>
                  setPrices({
                    ...prices,
                    registrationFeePrice: parseInt(e.target.value, 10),
                  })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="% Comisión"
                  type="text"
                  value={prices.stripePercentage}
                  onChange={(e) =>
                    setPrices({ ...prices, stripePercentage: e.target.value })
                  }
                />
                <Input
                  label="Cuota Fija MXN"
                  type="number"
                  value={prices.stripeFixedFee}
                  onChange={(e) =>
                    setPrices({
                      ...prices,
                      stripeFixedFee: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <Button
                className="w-full mt-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
                onClick={handleSavePrices}
                disabled={isSaving}
              >
                <Save size={16} className="mr-2" />
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </DashboardCard>

          <DashboardCard title="Gestión de Sedes / Localidades">
            <div className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Nombre de sede/distrito"
                    value={newLocality.name}
                    onChange={(e) =>
                      setNewLocality({ ...newLocality, name: e.target.value })
                    }
                  />
                </div>
                <div className="w-32">
                  <Select
                    options={[
                      { value: "México", label: "MX" },
                      { value: "Estados Unidos", label: "USA" },
                      { value: "Canadá", label: "CAN" },
                      { value: "El Salvador", label: "SLV" },
                      { value: "Guatemala", label: "GTM" },
                      { value: "Honduras", label: "HND" },
                    ]}
                    value={newLocality.country}
                    onChange={(e) =>
                      setNewLocality({
                        ...newLocality,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={handleAddLocality}
                  disabled={isAddingLocality}
                  size="sm"
                  className="h-10 px-4"
                >
                  <Plus size={16} />
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {allLocalities.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group"
                  >
                    <div>
                      <p className="text-xs font-black text-secondary uppercase leading-none">
                        {loc.name}
                      </p>
                      <p className="text-[8px] font-bold text-primary uppercase mt-1 tracking-widest">
                        {loc.country}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteLocality(loc.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {allLocalities.length === 0 && (
                  <p className="text-center text-[10px] text-gray-400 uppercase font-black py-4">
                    Sin localidades agregadas
                  </p>
                )}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Acciones Rápidas">
            <div className="grid grid-cols-1 gap-3">
              <AdminQuickBtn
                icon={<Bell size={18} />}
                label="Emitir Aviso"
                onClick={() => router.push("/admin/notifications")}
              />
              <AdminQuickBtn
                icon={<Calendar size={18} />}
                label="Editar Agenda"
                onClick={() => router.push("/admin/agenda")}
              />
              <AdminQuickBtn
                icon={<Users size={18} />}
                label="Ver Asistentes"
                onClick={() => router.push("/admin/users")}
              />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function AdminQuickBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 hover:bg-white hover:shadow-lg transition-all group cursor-pointer text-left"
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
