import * as React from "react";
import { updateSettings } from "@/app/actions/admin";

// Costos y términos comparten el mismo formulario y el mismo guardado.
export function useSettingsForm(config: any) {
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
      priceDeadline: prices.priceDeadline
        ? new Date(prices.priceDeadline)
        : null,
    });
    if (result.success) alert("Configuración actualizada correctamente");
    setIsSaving(false);
  };

  return { prices, setPrices, isSaving, handleSavePrices };
}
