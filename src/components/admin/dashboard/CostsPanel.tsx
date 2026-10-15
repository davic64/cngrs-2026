"use client";

import { Save } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { useSettingsForm } from "./useSettingsForm";

type Props = { form: ReturnType<typeof useSettingsForm> };

export function CostsPanel({ form }: Props) {
  const { prices, setPrices, isSaving, handleSavePrices } = form;

  return (
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
  );
}
