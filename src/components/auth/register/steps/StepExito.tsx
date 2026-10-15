import { motion } from "framer-motion";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
};

export function StepExito({ formData }: Props) {
  const router = useRouter();

  return (
    <motion.div
      key="step9"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"
    >
      <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
        <ShieldCheck className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">
        ¡Registro Completado!
      </h2>
      {formData.tipoPago === "inscripcion" && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Tu pago está en revisión
            </p>
          </div>
        </div>
      )}
      <Button
        className="h-16 w-full font-black text-lg shadow-xl mt-4 uppercase tracking-widest"
        onClick={() => router.push("/dashboard")}
      >
        Ir a mi cuenta
      </Button>
    </motion.div>
  );
}
