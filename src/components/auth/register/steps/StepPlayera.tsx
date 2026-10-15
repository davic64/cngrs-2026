import { motion } from "framer-motion";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EditorResultRenderer } from "@/components/ui/EditorResultRenderer";
import { Select } from "@/components/ui/Select";
import type { RegistrationConfig, RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  config: RegistrationConfig;
  configLoaded: boolean;
};

export function StepPlayera({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
  config,
  configLoaded,
}: Props) {
  return (
    <motion.div
      key="step6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
        Finalizar Registro
      </h2>
      <Select
        label="Talla de Playera"
        options={[
          { value: "", label: "Seleccionar Talla" },
          { value: "S", label: "Chica (S)" },
          { value: "M", label: "Mediana (M)" },
          { value: "L", label: "Grande (L)" },
          { value: "XL", label: "Extra Grande (XL)" },
          { value: "XXL", label: "Extra Extra Grande (XXL)" },
        ]}
        value={formData.tallaPlayera}
        onChange={(e) =>
          setFormData({ ...formData, tallaPlayera: e.target.value })
        }
      />
      <div className="bg-gray-50/50 p-6 rounded-[2rem] h-80 overflow-y-auto border border-gray-100 italic custom-scrollbar shadow-inner">
        <EditorResultRenderer data={config.termsAndConditions} />
        {!configLoaded && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-gray-400 uppercase font-black animate-pulse">
              Cargando términos y condiciones...
            </p>
          </div>
        )}
        {configLoaded && !config.termsAndConditions && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-gray-400 uppercase font-black">
              Los términos y condiciones serán configurados próximamente.
            </p>
          </div>
        )}
      </div>
      <Checkbox
        label="He leído y acepto los términos y condiciones"
        checked={formData.aceptaTerminos}
        onChange={(e) =>
          setFormData({
            ...formData,
            aceptaTerminos: e.target.checked,
          })
        }
      />
      <div className="flex flex-col gap-3">
        <Button
          className="h-14 font-bold shadow-lg"
          disabled={!isStepValid(6)}
          onClick={handleNext}
        >
          Ir al pago
        </Button>
        <Button
          variant="outline"
          className="h-12 border-gray-200"
          onClick={handleBack}
        >
          Revisar datos
        </Button>
      </div>
    </motion.div>
  );
}
