import { motion } from "framer-motion";
import { ArrowRight, Banknote, CreditCard, Repeat } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { RegistrationConfig, RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  config: RegistrationConfig;
};

export function StepPago({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
  config,
}: Props) {
  return (
    <motion.div
      key="step7"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
        Método de Pago
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tipoPago: "completo" })}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left",
            formData.tipoPago === "completo"
              ? "border-primary bg-primary/5"
              : "border-gray-100",
          )}
        >
          <Repeat
            className={cn(
              "h-6 w-6",
              formData.tipoPago === "completo"
                ? "text-primary"
                : "text-gray-300",
            )}
          />
          <div className="text-left">
            <p className="font-bold text-secondary text-sm">Pago Completo</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">
              ${config.fullPaymentPrice} MXN
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tipoPago: "inscripcion" })}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left",
            formData.tipoPago === "inscripcion"
              ? "border-primary bg-primary/5"
              : "border-gray-100",
          )}
        >
          <ArrowRight
            className={cn(
              "h-6 w-6",
              formData.tipoPago === "inscripcion"
                ? "text-primary"
                : "text-gray-300",
            )}
          />
          <div className="text-left">
            <p className="font-bold text-secondary text-sm">Solo Inscripción</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">
              ${config.registrationFeePrice} MXN
            </p>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "tarjeta", icon: CreditCard },
          { id: "transferencia", icon: Repeat },
          { id: "efectivo", icon: Banknote },
        ].map((m) => (
          <button
            type="button"
            key={m.id}
            onClick={() =>
              setFormData({
                ...formData,
                metodoPago: m.id as RegistrationFormData["metodoPago"],
              })
            }
            className={cn(
              "flex flex-col items-center p-3 rounded-2xl border-2 transition-all gap-1 cursor-pointer",
              formData.metodoPago === m.id
                ? "border-primary bg-primary/5"
                : "border-gray-100",
            )}
          >
            <m.icon
              className={cn(
                "h-6 w-6",
                formData.metodoPago === m.id ? "text-primary" : "text-gray-300",
              )}
            />
            <span className="text-[10px] font-bold uppercase">{m.id}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Button
          className="h-14 font-bold"
          disabled={!isStepValid(7)}
          onClick={handleNext}
        >
          Continuar
        </Button>
        <Button
          variant="outline"
          className="h-12 border-gray-200"
          onClick={handleBack}
        >
          Atrás
        </Button>
      </div>
    </motion.div>
  );
}
