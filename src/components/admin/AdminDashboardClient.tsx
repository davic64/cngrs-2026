"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Save,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  createLocality,
  deleteLocality,
  deleteCartaResponsivaTemplate,
  updateSettings,
  uploadCartaResponsivaTemplate,
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
  cartaResponsivaUrl: string | null;
}

export function AdminDashboardClient({
  stats,
  pendingPayments,
  config,
  cartaResponsivaUrl,
}: AdminDashboardClientProps) {
  const router = useRouter();

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

  // Carta Responsiva
  const [cartaUrl, setCartaUrl] = React.useState<string | null>(
    cartaResponsivaUrl,
  );
  const [cartaFile, setCartaFile] = React.useState<File | null>(null);
  const [isUploadingCarta, setIsUploadingCarta] = React.useState(false);
  const cartaInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadCarta = async () => {
    if (!cartaFile) return;
    setIsUploadingCarta(true);
    const formData = new FormData();
    formData.append("template", cartaFile);
    const result = await uploadCartaResponsivaTemplate(formData);
    if (result.success && result.url) {
      setCartaUrl(result.url ?? null);
      setCartaFile(null);
      if (cartaInputRef.current) cartaInputRef.current.value = "";
    } else {
      alert("Error al subir la plantilla");
    }
    setIsUploadingCarta(false);
  };

  const handleDeleteCarta = async () => {
    if (!confirm("¿Eliminar la plantilla de Carta Responsiva?")) return;
    const result = await deleteCartaResponsivaTemplate();
    if (result.success) {
      setCartaUrl(null);
      setCartaFile(null);
      if (cartaInputRef.current) cartaInputRef.current.value = "";
    }
  };

  const handleSavePrices = async () => {
    setIsSaving(true);
    const result = await updateSettings({
      ...prices,
      priceDeadline: prices.priceDeadline
        ? new Date(prices.priceDeadline)
        : null,
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

          {/* Términos y Condiciones con Rich Text */}
          <Collapse title="Términos y Condiciones">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Edita los términos que aparecerán en el registro. Utiliza el
                editor para dar formato a los puntos legales.
              </p>

              <RichTextEditor
                data={prices.termsAndConditions}
                onChange={(val) =>
                  setPrices({ ...prices, termsAndConditions: val })
                }
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

          <DashboardCard title="Carta Responsiva">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Plantilla PDF que los menores de edad descargan durante el
                registro.
              </p>

              {cartaUrl ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-secondary uppercase">
                        Plantilla activa
                      </p>
                      <a
                        href={cartaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-green-600 hover:underline"
                      >
                        Ver PDF
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteCarta}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Sin plantilla cargada
                  </p>
                </div>
              )}

              <input
                ref={cartaInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setCartaFile(e.target.files?.[0] ?? null)}
              />

              {cartaFile && (
                <p className="text-[10px] font-bold text-secondary truncate">
                  {cartaFile.name}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 font-black uppercase text-[10px] tracking-widest"
                  onClick={() => cartaInputRef.current?.click()}
                >
                  Seleccionar PDF
                </Button>
                <Button
                  className="flex-1 h-10 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
                  onClick={handleUploadCarta}
                  disabled={!cartaFile || isUploadingCarta}
                >
                  <Upload size={14} className="mr-2" />
                  {isUploadingCarta ? "Subiendo..." : "Subir"}
                </Button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
