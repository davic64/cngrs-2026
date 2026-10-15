import { motion } from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  isStepValid: (step: number) => boolean;
  setIsModalOpen: (open: boolean) => void;
};

export function StepDatos({
  formData,
  setFormData,
  handleNext,
  isStepValid,
  setIsModalOpen,
}: Props) {
  const handleEdadChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setFormData({ ...formData, edad: cleanValue });
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-5 sm:space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-secondary uppercase tracking-tight">
          Crea tu Cuenta
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Juan"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
          <Input
            label="Apellido"
            placeholder="Pérez"
            value={formData.apellido}
            onChange={(e) =>
              setFormData({ ...formData, apellido: e.target.value })
            }
          />
        </div>
        <Input
          label="Teléfono"
          type="tel"
          placeholder="Tu número de celular"
          value={formData.telefono}
          onChange={(e) =>
            setFormData({
              ...formData,
              telefono: e.target.value.replace(/[^0-9]/g, ""),
            })
          }
        />
        <Input
          label="Crea una Contraseña"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Edad"
            type="text"
            inputMode="numeric"
            placeholder="00"
            value={formData.edad}
            onChange={(e) => handleEdadChange(e.target.value)}
          />
          <Select
            label="Género"
            options={[
              { value: "", label: "Seleccionar" },
              { value: "M", label: "Masculino" },
              { value: "F", label: "Femenino" },
            ]}
            value={formData.genero}
            onChange={(e) =>
              setFormData({ ...formData, genero: e.target.value })
            }
          />
        </div>
        <div className="pt-2">
          <p className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
            Contacto de Emergencia
          </p>
          {formData.contactoEmergencia ? (
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20 text-primary">
              <span className="font-bold text-sm">
                {formData.contactoEmergencia.nombre}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Editar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-2 h-16 flex flex-col items-center justify-center gap-1 group"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-secondary/70">
                Agregar Contacto
              </span>
            </Button>
          )}
        </div>
      </div>
      <Button
        className="w-full h-14 text-base font-bold shadow-lg"
        disabled={!isStepValid(1)}
        onClick={handleNext}
      >
        Siguiente <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
}
