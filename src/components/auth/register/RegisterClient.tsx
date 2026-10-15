"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import * as React from "react";
import { getLocalities, getSettings } from "@/app/actions/admin";
import { getCartaResponsivaTemplate } from "@/app/actions/auth";
import { uploadAndSaveRegistration } from "@/components/auth/register/registration-form-data";
import { StepConfirmacion } from "@/components/auth/register/steps/StepConfirmacion";
import { StepDatos } from "@/components/auth/register/steps/StepDatos";
import { StepDocumento } from "@/components/auth/register/steps/StepDocumento";
import { StepExito } from "@/components/auth/register/steps/StepExito";
import { StepFoto } from "@/components/auth/register/steps/StepFoto";
import { StepPago } from "@/components/auth/register/steps/StepPago";
import { StepPlayera } from "@/components/auth/register/steps/StepPlayera";
import { StepSalud } from "@/components/auth/register/steps/StepSalud";
import { StepUbicacion } from "@/components/auth/register/steps/StepUbicacion";
import type {
  Localities,
  RegistrationConfig,
} from "@/components/auth/register/types";
import { useRegistrationForm } from "@/components/auth/register/useRegistrationForm";
import { useRegistrationSubmit } from "@/components/auth/register/useRegistrationSubmit";
import { ChatWidget } from "@/components/ChatWidget";
import { loadRegText } from "@/lib/registration-storage";
import { AgeRestrictedModal } from "./AgeRestrictedModal";
import { CompletingRegistrationScreen } from "./CompletingRegistrationScreen";
import { ContactoEmergenciaModal } from "./ContactoEmergenciaModal";
import { ESTADOS_POR_PAIS } from "./locations";
import { ProgressDots } from "./ProgressDots";
import { useCartaTemplate } from "./useCartaTemplate";
import { useDocumentCheck } from "./useDocumentCheck";

export function RegisterClient() {
  const [step, setStep] = React.useState(1);
  const doc = useDocumentCheck();
  const { isDocumentVerified, setIsDocumentVerified } = doc;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAgeRestrictedModalOpen, setIsAgeRestrictedModalOpen] =
    React.useState(false);
  const [detectedAge, setDetectedAge] = React.useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = React.useState<
    "success" | "error" | null
  >(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = React.useState<
    string | null
  >(null);
  const [showManualEstado, setShowManualEstado] = React.useState(false);
  const [showManualLocalidad, setShowManualLocalidad] = React.useState(false);
  const [comprobantePreviewUrl, setComprobantePreviewUrl] = React.useState<
    string | null
  >(null);
  const [configLoaded, setConfigLoaded] = React.useState(false);
  const {
    cartaTemplateUrl,
    setCartaTemplateUrl,
    cartaTemplateLoading,
    downloadCartaTemplate,
  } = useCartaTemplate();
  const [isRestoredSession, setIsRestoredSession] = React.useState(false);
  const [config, setConfig] = React.useState<RegistrationConfig>({
    fullPaymentPrice: 1500,
    registrationFeePrice: 500,
    stripePercentage: "3.6",
    stripeFixedFee: 3,
    termsAndConditions: "",
    bankName: "",
    bankCLABE: "",
    bankHolder: "",
    oxxoCardNumber: "",
  });
  const [dbLocalities, setDbLocalities] = React.useState<Localities>([]);

  // Cargar config, detectar retorno de Stripe, y restaurar sesiones guardadas
  // biome-ignore lint/correctness/useExhaustiveDependencies: init una sola vez al montar
  React.useEffect(() => {
    const init = async () => {
      // 1. Cargar config, localidades y plantilla de carta responsiva
      const [settingsData, localitiesData, cartaTemplateData] =
        await Promise.all([
          getSettings(),
          getLocalities(),
          getCartaResponsivaTemplate(),
        ]);
      if (settingsData)
        setConfig({
          ...settingsData,
          termsAndConditions: settingsData.termsAndConditions || "",
        });
      setConfigLoaded(true);
      if (localitiesData) setDbLocalities(localitiesData);
      if (cartaTemplateData?.success && cartaTemplateData?.templateUrl) {
        setCartaTemplateUrl(cartaTemplateData.templateUrl);
      }

      // 2. Detectar retorno de Stripe
      const params = new URLSearchParams(window.location.search);
      const stripeStatus = params.get("stripe");
      const sessionId = params.get("session_id");

      if (stripeStatus === "success" && sessionId) {
        await completeStripeRegistration(sessionId);
        return;
      }

      if (stripeStatus === "cancel") {
        // Restaurar datos y mostrar step 8 para reintentar
        await restoreFromStorage();
        setPaymentStatus("error");
        return;
      }

      // 3. Detectar sesión guardada (transfer/cash que regresa a subir comprobante)
      const saved = loadRegText();
      if (saved) {
        await restoreFromStorage();
      }
    };
    init();
  }, []);

  const { formData, setFormData, isEdadValida, needsResponsiva, isStepValid } =
    useRegistrationForm();

  const [tempContacto, setTempContacto] = React.useState({
    nombre: "",
    telefono: "",
  });

  const filteredStates = React.useMemo(() => {
    const states = ESTADOS_POR_PAIS[formData.pais] || [];
    return [...states, { value: "Otro", label: "Otro (Escribir)" }];
  }, [formData.pais]);

  // Filter localities based on selected country AND state
  const filteredLocalities = React.useMemo(() => {
    const options = dbLocalities
      .filter(
        (loc) => loc.country === formData.pais && loc.state === formData.estado,
      )
      .map((loc) => ({ value: loc.name, label: loc.name }));

    return [
      ...options,
      { value: "Otro", label: "Mi localidad no aparece (Escribir)" },
    ];
  }, [dbLocalities, formData.pais, formData.estado]);

  // ── Funciones de persistencia ──

  const restoreFromStorage = async () => {
    const saved = loadRegText();
    if (!saved) return;

    setFormData((prev) => ({
      ...prev,
      nombre: saved.nombre || "",
      apellido: saved.apellido || "",
      email: saved.email || "",
      password: saved.password || "",
      edad: saved.edad || "",
      genero: saved.genero || "",
      telefono: saved.telefono || "",
      contactoEmergencia: saved.contactoEmergencia || null,
      documento: null,
      pais: saved.pais || "",
      otroPais: saved.otroPais || "",
      estado: saved.estado || "",
      localidad: saved.localidad || "",
      alergias: saved.alergias || "",
      padecimiento: saved.padecimiento || "",
      medicamento: saved.medicamento || "",
      dosisFrecuencia: saved.dosisFrecuencia || "",
      fotoPerfil: null,
      tallaPlayera: saved.tallaPlayera || "",
      aceptaTerminos: saved.aceptaTerminos || false,
      tipoPago: saved.tipoPago || "",
      metodoPago: saved.metodoPago || "",
      comprobantePago: null,
    }));

    if (saved.contactoEmergencia) {
      setTempContacto(saved.contactoEmergencia);
    }

    setIsDocumentVerified(true);
    setIsRestoredSession(true);
    setStep(8);
  };

  const {
    isProcessing,
    isCompletingRegistration,
    submit,
    completeStripeRegistration,
  } = useRegistrationSubmit({ formData, config, setStep, restoreFromStorage });

  // ── Navegación ──

  const handleNext = () => {
    if (step === 1 && !isEdadValida) {
      alert("Lo sentimos, la edad mínima permitida es de 15 años.");
      return;
    }

    if (step === 2 && !isDocumentVerified) {
      alert("Por favor sube tu documento antes de continuar.");
      return;
    }

    const nextStep = step + 1;

    // Auto-guardar al llegar al step 8 (transfer/efectivo puede regresar después)
    if (nextStep === 8) {
      uploadAndSaveRegistration(formData);
    }

    setStep(nextStep);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const saveContacto = () => {
    if (tempContacto.nombre && tempContacto.telefono) {
      setFormData({ ...formData, contactoEmergencia: tempContacto });
      setIsModalOpen(false);
    }
  };

  const nav = { formData, setFormData, isStepValid, handleNext, handleBack };

  if (isCompletingRegistration) return <CompletingRegistrationScreen />;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-lg flex flex-col h-full max-h-[98vh]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-secondary uppercase tracking-tighter">
            Registro <span className="text-primary">CNGRS26</span>
          </h1>
          <p className="text-[10px] font-semibold text-secondary/40 tracking-wider mt-1">
            Desarrollado por{" "}
            <span className="text-primary/60 font-bold">LDV</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-12 -mx-3">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepDatos key="step1" {...nav} setIsModalOpen={setIsModalOpen} />
            )}

            {step === 2 && (
              <StepDocumento
                key="step2"
                {...nav}
                cartaTemplateLoading={cartaTemplateLoading}
                cartaTemplateUrl={cartaTemplateUrl}
                handleDownloadCartaTemplate={downloadCartaTemplate}
                needsResponsiva={needsResponsiva}
                {...doc}
              />
            )}

            {step === 3 && (
              <StepUbicacion
                key="step3"
                {...nav}
                filteredLocalities={filteredLocalities}
                filteredStates={filteredStates}
                showManualEstado={showManualEstado}
                setShowManualEstado={setShowManualEstado}
                showManualLocalidad={showManualLocalidad}
                setShowManualLocalidad={setShowManualLocalidad}
              />
            )}

            {step === 4 && <StepSalud key="step4" {...nav} />}

            {step === 5 && (
              <StepFoto
                key="step5"
                {...nav}
                profilePreviewUrl={profilePreviewUrl}
                setProfilePreviewUrl={setProfilePreviewUrl}
              />
            )}

            {step === 6 && (
              <StepPlayera
                key="step6"
                {...nav}
                config={config}
                configLoaded={configLoaded}
              />
            )}

            {step === 7 && <StepPago key="step7" {...nav} config={config} />}

            {step === 8 && (
              <StepConfirmacion
                key="step8"
                {...nav}
                config={config}
                comprobantePreviewUrl={comprobantePreviewUrl}
                setComprobantePreviewUrl={setComprobantePreviewUrl}
                isProcessing={isProcessing}
                isRestoredSession={isRestoredSession}
                paymentStatus={paymentStatus}
                submit={submit}
              />
            )}

            {step === 9 && <StepExito key="step9" formData={formData} />}
          </AnimatePresence>
        </div>

        <ProgressDots step={step} />
      </div>

      <ContactoEmergenciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tempContacto={tempContacto}
        setTempContacto={setTempContacto}
        saveContacto={saveContacto}
      />

      <AgeRestrictedModal
        isOpen={isAgeRestrictedModalOpen}
        detectedAge={detectedAge}
      />

      <ChatWidget userName={formData.nombre} />
    </main>
  );
}
