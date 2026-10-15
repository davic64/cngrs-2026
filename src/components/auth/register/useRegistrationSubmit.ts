import { useRouter } from "next/navigation";
import * as React from "react";
import { registerUser, setRegistrationSession } from "@/app/actions/auth";
import {
  completeCardRegistration,
  createCheckoutSession,
  savePendingRegistration,
} from "@/app/actions/stripe";
import {
  clearRegStorage,
  loadRegText,
  saveRegText,
} from "@/lib/registration-storage";
import {
  buildRegistrationData,
  ensureUploadedFiles,
} from "./registration-form-data";
import type { RegistrationConfig, RegistrationFormData } from "./types";

type Params = {
  formData: RegistrationFormData;
  config: RegistrationConfig;
  setStep: (step: number) => void;
  restoreFromStorage: () => Promise<void>;
};

export function useRegistrationSubmit({
  formData,
  config,
  setStep,
  restoreFromStorage,
}: Params) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isCompletingRegistration, setIsCompletingRegistration] =
    React.useState(false);

  // Regreso de Stripe: el servidor finaliza el registro con el session_id.
  const completeStripeRegistration = async (sessionId: string) => {
    setIsCompletingRegistration(true);

    // El servidor tiene los datos (registro pendiente): no depende de localStorage.
    const result = await completeCardRegistration(sessionId);

    if (result.success) {
      clearRegStorage();
      router.push("/dashboard");
      return;
    }

    alert(result.error);
    setIsCompletingRegistration(false);
    await restoreFromStorage();
  };

  // Tarjeta: sube archivos, guarda el registro pendiente y redirige a Stripe.
  const submitCard = async () => {
    // 1. Reusar archivos ya subidos al pasar al step 8, o subirlos si no existen
    const files = await ensureUploadedFiles(formData);
    if (!files) {
      alert("Error al subir archivos. Intenta de nuevo.");
      setIsProcessing(false);
      return;
    }

    // 2. Guardar el registro en el servidor (valida teléfono y cupo antes de cobrar)
    const pending = await savePendingRegistration(
      buildRegistrationData(formData, files),
    );
    if (!pending.success) {
      alert(pending.error);
      setIsProcessing(false);
      return;
    }
    const stripeSessionId = pending.id;

    // 3. Redirigir a Stripe
    const result = await createCheckoutSession(
      null,
      formData.tipoPago as "completo" | "inscripcion",
      stripeSessionId,
      `${formData.nombre} ${formData.apellido}`.trim(),
      parseInt(formData.edad || "0", 10),
    );

    if (result.success && result.url) {
      // Guardar baseAmount para usar en completeStripeRegistration
      const existing = loadRegText() || {};
      saveRegText({
        ...existing,
        baseAmount:
          formData.tipoPago === "completo"
            ? config.fullPaymentPrice
            : config.registrationFeePrice,
      });

      // Usar setTimeout para dar tiempo a que se guarden los datos
      setTimeout(() => {
        window.location.href = result.url;
      }, 100);
    } else {
      alert(
        result.error ||
          "No se pudo conectar con la pasarela de pagos. Intenta más tarde.",
      );
      setIsProcessing(false);
    }
  };

  // Transferencia/efectivo: registra ahora con el comprobante.
  const submitProof = async () => {
    // Transferencia/efectivo → Registrar ahora con comprobante
    try {
      if (!formData.comprobantePago) {
        alert("Por favor sube una foto del comprobante de pago");
        setIsProcessing(false);
        return;
      }

      const files = await ensureUploadedFiles(formData);
      if (!files) {
        alert("Error al subir archivos. Intenta de nuevo.");
        setIsProcessing(false);
        return;
      }

      const data = buildRegistrationData(formData, files);
      data.append("comprobantePago", formData.comprobantePago);

      const result = await registerUser(data);

      if (result.success && result.userId) {
        clearRegStorage();
        await setRegistrationSession(result.userId);
        setStep(9);
      } else {
        alert(result.error || "Hubo un error al procesar tu registro");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error en transferencia/efectivo:", error);
      alert("Error al procesar tu registro. Por favor intenta de nuevo.");
      setIsProcessing(false);
    }
  };

  const submit = async () => {
    setIsProcessing(true);
    if (formData.metodoPago === "tarjeta") await submitCard();
    else await submitProof();
  };

  return {
    isProcessing,
    isCompletingRegistration,
    submit,
    completeStripeRegistration,
  };
}
