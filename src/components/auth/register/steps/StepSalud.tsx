import { motion } from "framer-motion";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
};

export function StepSalud({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
}: Props) {
  const toggleHealthField = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    if (formData[field] === value) {
      const newData = { ...formData, [field]: "" };
      if (field === "medicamento") {
        newData.dosisFrecuencia = "";
      }
      setFormData(newData);
    } else {
      const newData = { ...formData, [field]: value };
      if (field === "medicamento" && value === "Ninguno") {
        newData.dosisFrecuencia = "N/A";
      }
      setFormData(newData);
    }
  };

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
        Salud
      </h2>
      <Input
        label="Alergias"
        value={formData.alergias}
        onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
        labelAction={
          <button
            type="button"
            onClick={() => toggleHealthField("alergias", "Ninguna")}
            className={cn(
              "text-[10px] font-black uppercase px-3 py-1 rounded-full cursor-pointer",
              formData.alergias === "Ninguna"
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary",
            )}
          >
            No tengo
          </button>
        }
      />
      <Input
        label="Enfermedad o Padecimiento"
        value={formData.padecimiento}
        onChange={(e) =>
          setFormData({ ...formData, padecimiento: e.target.value })
        }
        labelAction={
          <button
            type="button"
            onClick={() => toggleHealthField("padecimiento", "Ninguna")}
            className={cn(
              "text-[10px] font-black uppercase px-3 py-1 rounded-full cursor-pointer",
              formData.padecimiento === "Ninguna"
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary",
            )}
          >
            No tengo
          </button>
        }
      />
      <Input
        label="Medicamento que tomas actualmente"
        value={formData.medicamento}
        onChange={(e) =>
          setFormData({ ...formData, medicamento: e.target.value })
        }
        labelAction={
          <button
            type="button"
            onClick={() => toggleHealthField("medicamento", "Ninguno")}
            className={cn(
              "text-[10px] font-black uppercase px-3 py-1 rounded-full cursor-pointer",
              formData.medicamento === "Ninguno"
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary",
            )}
          >
            No tengo
          </button>
        }
      />
      <Input
        label="Dosis y Frecuencia"
        value={formData.dosisFrecuencia}
        onChange={(e) =>
          setFormData({
            ...formData,
            dosisFrecuencia: e.target.value,
          })
        }
      />
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-14" onClick={handleBack}>
          Atrás
        </Button>
        <Button
          className="flex-[2] h-14 font-bold"
          disabled={!isStepValid(4)}
          onClick={handleNext}
        >
          Siguiente
        </Button>
      </div>
    </motion.div>
  );
}
