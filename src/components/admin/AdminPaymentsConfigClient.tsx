"use client";

import { motion } from "framer-motion";
import { Banknote, Save } from "lucide-react";
import * as React from "react";
import { updateSettings } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminPaymentsConfigClient({ config }: { config: any }) {
  const [formData, setFormData] = React.useState({
    bankName: config.bankName || "BBVA",
    bankCLABE: config.bankCLABE || "0123 4567 8901 2345 67",
    bankHolder: config.bankHolder || "JIDI Internacional A.C.",
    oxxoReference: config.oxxoReference || "Tu número de teléfono",
    // We need to send all required fields to updateSettings
    fullPaymentPrice: config.fullPaymentPrice,
    registrationFeePrice: config.registrationFeePrice,
    stripePercentage: config.stripePercentage,
    stripeFixedFee: config.stripeFixedFee,
  });
  
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSettings(formData);
    if (result.success) {
      alert("Configuración de pagos actualizada correctamente.");
    } else {
      alert("Error al guardar la configuración.");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Configuración de Recaudación
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Métodos de <span className="text-primary">Pago</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <DashboardCard title="Datos para Transferencia (SPEI)">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Estos datos se mostrarán a los asistentes que elijan pagar vía transferencia bancaria.
              </p>
              
              <Input
                label="Nombre del Banco"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
              
              <Input
                label="CLABE Interbancaria"
                value={formData.bankCLABE}
                onChange={(e) => setFormData({ ...formData, bankCLABE: e.target.value })}
              />
              
              <Input
                label="Nombre del Titular"
                value={formData.bankHolder}
                onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
              />
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Referencia para Pago en Efectivo">
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Define qué referencia deben dar los usuarios al pagar en efectivo (OXXO/Staff).
              </p>
              
              <Input
                label="Instrucción de Referencia"
                placeholder="Ej. Tu número de teléfono"
                value={formData.oxxoReference}
                onChange={(e) => setFormData({ ...formData, oxxoReference: e.target.value })}
              />

              <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                  <Banknote size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-amber-700">Vista previa para el usuario:</p>
                  <p className="text-lg font-black text-secondary mt-1 uppercase tracking-tighter">
                    Referencia: <span className="text-primary">{formData.oxxoReference}</span>
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-sm"
            >
              <Save size={20} className="mr-2" />
              {isSaving ? "Guardando..." : "Guardar Configuración de Pagos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
