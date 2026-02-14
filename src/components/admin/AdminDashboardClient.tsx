"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Save,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  createAdmin,
  createLocality,
  deleteAdmin,
  deleteLocality,
  updateAdmin,
  updateSettings,
  updateVenue,
} from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface AdminDashboardClientProps {
  stats: any;
  pendingPayments: any[];
  config: any;
  admins: any[];
}

export function AdminDashboardClient({
  stats,
  pendingPayments,
  config,
  admins,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Admin State
  const [newAdmin, setNewAdmin] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });
  const [isAddingAdmin, setIsAddingAdmin] = React.useState(false);

  const handleAddAdmin = async () => {
    if (!newAdmin.phone || !newAdmin.password) return;
    setIsAddingAdmin(true);
    await createAdmin(newAdmin);
    setNewAdmin({ firstName: "", lastName: "", phone: "", password: "" });
    setIsAddingAdmin(false);
  };
  const [prices, setPrices] = React.useState({
    fullPaymentPrice: config.fullPaymentPrice,
    registrationFeePrice: config.registrationFeePrice,
    stripePercentage: config.stripePercentage,
    stripeFixedFee: config.stripeFixedFee,
    termsAndConditions: config.termsAndConditions || "",
    priceDeadline: config.priceDeadline
      ? new Date(config.priceDeadline).toISOString().split("T")[0]
      : "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSavePrices = async () => {
    setIsSaving(true);
    const result = await updateSettings({
      ...prices,
      priceDeadline: prices.priceDeadline ? new Date(prices.priceDeadline) : null,
    });
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
                  {React.cloneElement(
                    stat.icon as React.ReactElement<{ size: number }>,
                    {
                      size: 24,
                    },
                  )}
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
        <div className="lg:col-span-8 space-y-8">
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

          {/* Gestión de Administradores */}
          <DashboardCard title="Administradores del Sistema">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Nombre"
                  value={newAdmin.firstName}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, firstName: e.target.value })
                  }
                />
                <Input
                  placeholder="Teléfono"
                  value={newAdmin.phone}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, phone: e.target.value })
                  }
                />
                <Input
                  placeholder="Contraseña"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                />
                <Button
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin}
                  className="h-11 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
                >
                  <Plus size={16} className="mr-2" />
                  Agregar
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admins.map((adm) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary text-white rounded-xl flex items-center justify-center font-black text-xs">
                        {adm.firstName[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-secondary uppercase">
                          {adm.firstName} {adm.lastName}
                        </p>
                        <p className="text-[10px] font-bold text-primary">
                          {adm.phone}
                        </p>
                      </div>
                    </div>
                    {adm.phone !== "3318319769" && (
                      <button
                        onClick={() => deleteAdmin(adm.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Términos y Condiciones con Rich Text */}
          <Collapse title="Términos y Condiciones">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Edita los términos que aparecerán en el registro. Utiliza el editor para dar formato a los puntos legales.
              </p>
              
              <RichTextEditor 
                data={prices.termsAndConditions}
                onChange={(val) => setPrices({ ...prices, termsAndConditions: val })}
              />

              <Button
                className="w-full h-12 shadow-lg shadow-primary/20 font-black uppercase text-xs tracking-widest"
                onClick={handleSavePrices}
                disabled={isSaving}
              >
                <Save size={18} className="mr-2" />
                Actualizar Términos y Condiciones
              </Button>
            </div>
          </Collapse>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <DashboardCard title="Costos y Comisiones">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Pago Completo"
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
                  label="Inscripción"
                  type="number"
                  value={prices.registrationFeePrice}
                  onChange={(e) =>
                    setPrices({
                      ...prices,
                      registrationFeePrice: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <Input
                label="Fecha Límite Precio Actual"
                type="date"
                value={prices.priceDeadline}
                onChange={(e) =>
                  setPrices({ ...prices, priceDeadline: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="% Stripe"
                  value={prices.stripePercentage}
                  disabled
                  className="opacity-60 bg-gray-50"
                />
                <Input
                  label="Fija Stripe"
                  value={prices.stripeFixedFee}
                  disabled
                  className="opacity-60 bg-gray-50"
                />
              </div>
              <Button
                className="w-full mt-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
                onClick={handleSavePrices}
                disabled={isSaving}
              >
                <Save size={16} className="mr-2" />
                Actualizar Costos
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
