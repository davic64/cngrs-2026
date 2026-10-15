import { motion } from "framer-motion";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Select } from "@/components/ui/Select";
import type { RegistrationFormData, SelectOption } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  filteredLocalities: SelectOption[];
  filteredStates: SelectOption[];
  showManualEstado: boolean;
  setShowManualEstado: React.Dispatch<React.SetStateAction<boolean>>;
  showManualLocalidad: boolean;
  setShowManualLocalidad: React.Dispatch<React.SetStateAction<boolean>>;
};

export function StepUbicacion({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
  filteredLocalities,
  filteredStates,
  showManualEstado,
  setShowManualEstado,
  showManualLocalidad,
  setShowManualLocalidad,
}: Props) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
        Ubicación
      </h2>
      <Select
        label="País"
        options={[
          { value: "", label: "Seleccionar País" },
          { value: "México", label: "México" },
          { value: "Estados Unidos", label: "Estados Unidos" },
          { value: "Canadá", label: "Canadá" },
          { value: "El Salvador", label: "El Salvador" },
          { value: "Guatemala", label: "Guatemala" },
          { value: "Honduras", label: "Honduras" },
          { value: "Otro", label: "Otro" },
        ]}
        value={formData.pais}
        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
      />
      <SearchableSelect
        label="Estado / Departamento"
        placeholder="Busca tu estado..."
        options={filteredStates}
        value={showManualEstado ? "Otro" : formData.estado}
        onChange={(val) => {
          if (val === "Otro") {
            setShowManualEstado(true);
            setFormData({ ...formData, estado: "", localidad: "" });
            setShowManualLocalidad(false);
          } else {
            setShowManualEstado(false);
            setFormData({ ...formData, estado: val, localidad: "" });
            setShowManualLocalidad(false);
          }
        }}
      />
      {showManualEstado && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            label="Escribe tu Estado"
            placeholder="Nombre de tu estado o provincia"
            value={formData.estado}
            onChange={(e) =>
              setFormData({ ...formData, estado: e.target.value })
            }
          />
        </motion.div>
      )}
      <SearchableSelect
        label="Localidad / Sede"
        placeholder="Busca tu ciudad o sede..."
        options={filteredLocalities}
        disabled={!formData.estado}
        value={showManualLocalidad ? "Otro" : formData.localidad}
        onChange={(val) => {
          if (val === "Otro") {
            setShowManualLocalidad(true);
            setFormData({ ...formData, localidad: "" });
          } else {
            setShowManualLocalidad(false);
            setFormData({ ...formData, localidad: val });
          }
        }}
      />
      {showManualLocalidad && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            label="Escribe tu Localidad"
            placeholder="Nombre de tu ciudad o sede"
            value={formData.localidad}
            onChange={(e) =>
              setFormData({ ...formData, localidad: e.target.value })
            }
          />
        </motion.div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-14" onClick={handleBack}>
          Atrás
        </Button>
        <Button
          className="flex-[2] h-14 font-bold"
          disabled={!isStepValid(3)}
          onClick={handleNext}
        >
          Siguiente
        </Button>
      </div>
    </motion.div>
  );
}
