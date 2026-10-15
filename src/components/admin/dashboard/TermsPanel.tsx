"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type { useSettingsForm } from "./useSettingsForm";

type Props = { form: ReturnType<typeof useSettingsForm> };

export function TermsPanel({ form }: Props) {
  const { prices, setPrices, isSaving, handleSavePrices } = form;

  return (
    <Collapse title="Términos y Condiciones">
      <div className="space-y-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          Edita los términos que aparecerán en el registro. Utiliza el editor
          para dar formato a los puntos legales.
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
  );
}
