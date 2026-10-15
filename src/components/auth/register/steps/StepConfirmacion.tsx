import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Repeat,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { PaymentProofCapture } from "@/components/ui/PaymentProofCapture";
import { cn } from "@/lib/utils";
import type { RegistrationConfig, RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  config: RegistrationConfig;
  comprobantePreviewUrl: string | null;
  setComprobantePreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isProcessing: boolean;
  isRestoredSession: boolean;
  paymentStatus: "success" | "error" | null;
  submit: () => void | Promise<void>;
};

export function StepConfirmacion({
  formData,
  setFormData,
  handleBack,
  isStepValid,
  config,
  comprobantePreviewUrl,
  setComprobantePreviewUrl,
  isProcessing,
  isRestoredSession,
  paymentStatus,
  submit,
}: Props) {
  return (
    <motion.div
      key="step8"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      {isRestoredSession && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-blue-900 uppercase tracking-wider">
              Bienvenido de nuevo
            </p>
            <p className="text-[10px] text-blue-700/70 leading-relaxed mt-1">
              Tus datos están guardados. Solo sube tu comprobante para completar
              el registro.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
        >
          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">
              El pago con tarjeta fue cancelado. Puedes intentar de nuevo o
              elegir otro método.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
          Detalles del Pago
        </h2>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase">
            Total a Pagar
          </p>
          <p className="text-xl font-black text-primary leading-none">
            $
            {formData.metodoPago === "tarjeta"
              ? Math.ceil(
                  (formData.tipoPago === "completo"
                    ? config.fullPaymentPrice
                    : config.registrationFeePrice) *
                    (1 + parseFloat(config.stripePercentage) / 100) +
                    config.stripeFixedFee,
                )
              : formData.tipoPago === "completo"
                ? config.fullPaymentPrice
                : config.registrationFeePrice}{" "}
            MXN
          </p>
        </div>
      </div>

      {/* Selector de método de pago para sesiones restauradas */}
      {isRestoredSession && (
        <div className="grid grid-cols-3 gap-2">
          {(["tarjeta", "transferencia", "efectivo"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFormData({ ...formData, metodoPago: m })}
              className={cn(
                "flex flex-col items-center p-3 rounded-2xl border-2 transition-all gap-1 cursor-pointer",
                formData.metodoPago === m
                  ? "border-primary bg-primary/5"
                  : "border-gray-100",
              )}
            >
              {m === "tarjeta" ? (
                <CreditCard
                  className={cn(
                    "h-5 w-5",
                    formData.metodoPago === m
                      ? "text-primary"
                      : "text-gray-300",
                  )}
                />
              ) : m === "transferencia" ? (
                <Repeat
                  className={cn(
                    "h-5 w-5",
                    formData.metodoPago === m
                      ? "text-primary"
                      : "text-gray-300",
                  )}
                />
              ) : (
                <Banknote
                  className={cn(
                    "h-5 w-5",
                    formData.metodoPago === m
                      ? "text-primary"
                      : "text-gray-300",
                  )}
                />
              )}
              <span className="text-[9px] font-bold uppercase">{m}</span>
            </button>
          ))}
        </div>
      )}

      {formData.metodoPago === "tarjeta" && (
        <div className="space-y-5">
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none">
              Pago seguro con Stripe
            </p>
          </div>
          {paymentStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
            >
              <XCircle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-xs font-bold text-red-700">
                Hubo un error al procesar tu tarjeta. Intenta de nuevo.
              </p>
            </motion.div>
          )}
          <p className="text-[10px] text-gray-400 font-medium text-center px-4 leading-relaxed italic">
            Al hacer clic en &quot;Confirmar y Finalizar&quot;, serás redirigido
            a Stripe para completar tu pago de forma segura.
          </p>
        </div>
      )}
      {formData.metodoPago === "transferencia" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-blue-800">
            <p className="text-[10px] font-black uppercase tracking-widest">
              Datos Bancarios (SPEI)
            </p>
            <p className="text-xs font-bold uppercase">
              Banco:{" "}
              <span className="text-secondary">
                {config.bankName || "BBVA"}
              </span>
            </p>
            <p className="text-xs font-bold uppercase">
              CLABE:{" "}
              <span className="text-secondary tracking-tighter">
                {config.bankCLABE || "0123 4567 8901 2345 67"}
              </span>
            </p>
            <p className="text-xs font-bold uppercase">
              Nombre:{" "}
              <span className="text-primary">
                {config.bankHolder || "JIDI Internacional A.C."}
              </span>
            </p>
            <p className="text-xs font-bold uppercase">
              Concepto:{" "}
              <span className="text-primary">
                {formData.nombre} {formData.apellido}
              </span>
            </p>
          </div>
          <PaymentProofCapture
            allowGallery
            onFileSelect={(file) => {
              setFormData({ ...formData, comprobantePago: file });
              const url = URL.createObjectURL(file);
              setComprobantePreviewUrl(url);
            }}
            onRemove={() => {
              setFormData({ ...formData, comprobantePago: null });
              setComprobantePreviewUrl(null);
            }}
            previewUrl={comprobantePreviewUrl}
            fileName={formData.comprobantePago?.name}
            label="Capturar Comprobante SPEI"
            description="Toma una foto clara del comprobante de tu transferencia bancaria"
            isLoading={isProcessing}
          />
        </div>
      )}
      {formData.metodoPago === "efectivo" && (
        <div className="space-y-4">
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4 text-amber-800">
            <p className="text-[10px] font-black uppercase tracking-widest">
              Depósito en OXXO
            </p>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Número de Tarjeta
              </p>
              <p className="text-3xl font-black tracking-tighter text-secondary">
                {config.oxxoCardNumber || "0000 0000 0000 0000"}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed font-medium">
              Proporciona este número de tarjeta en la caja de OXXO para
              realizar tu depósito.
            </p>
          </div>
          <PaymentProofCapture
            onFileSelect={(file) => {
              setFormData({ ...formData, comprobantePago: file });
              const url = URL.createObjectURL(file);
              setComprobantePreviewUrl(url);
            }}
            onRemove={() => {
              setFormData({ ...formData, comprobantePago: null });
              setComprobantePreviewUrl(null);
            }}
            previewUrl={comprobantePreviewUrl}
            fileName={formData.comprobantePago?.name}
            label="Capturar Ticket OXXO"
            description="Toma una foto clara del ticket de depósito de OXXO"
            isLoading={isProcessing}
          />
        </div>
      )}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          className="h-16 font-black text-lg shadow-lg"
          disabled={!isStepValid(8) || isProcessing}
          onClick={submit}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...
            </>
          ) : (
            "Confirmar y Finalizar"
          )}
        </Button>
        {!isRestoredSession && (
          <Button
            variant="outline"
            className="h-12 border-gray-200"
            disabled={isProcessing}
            onClick={handleBack}
          >
            Atrás
          </Button>
        )}
      </div>
    </motion.div>
  );
}
