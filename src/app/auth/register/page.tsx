"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  FileText,
  UserPlus,
  X,
  CreditCard,
  Banknote,
  Repeat,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User
} from "lucide-react";
import * as React from "react";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  edad: string;
  genero: string;
  telefono: string;
  contactoEmergencia: { nombre: string; telefono: string } | null;
  documento: File | null;
  pais: string;
  otroPais: string;
  estado: string;
  localidad: string;
  alergias: string;
  padecimiento: string;
  medicamento: string;
  dosisFrecuencia: string;
  fotoPerfil: File | null;
  tallaPlayera: string;
  aceptaTerminos: boolean;
  tipoPago: "completo" | "inscripcion" | "";
  metodoPago: "tarjeta" | "transferencia" | "efectivo" | "";
  comprobantePago: File | null;
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState<
    "success" | "error" | null
  >(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = React.useState<string | null>(null);
  const [comprobantePreview, setComprobantePreview] = React.useState<
    string | null
  >(null);

  const [formData, setFormData] = React.useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    edad: "",
    genero: "",
    telefono: "",
    contactoEmergencia: null,
    documento: null,
    pais: "",
    otroPais: "",
    estado: "",
    localidad: "",
    alergias: "",
    padecimiento: "",
    medicamento: "",
    dosisFrecuencia: "",
    fotoPerfil: null,
    tallaPlayera: "",
    aceptaTerminos: false,
    tipoPago: "",
    metodoPago: "",
    comprobantePago: null,
  });

  const [tempContacto, setTempContacto] = React.useState({
    nombre: "",
    telefono: "",
  });

  const edadInt = React.useMemo(
    () => parseInt(formData.edad, 10),
    [formData.edad],
  );
  const isEdadValida = edadInt >= 15 && edadInt <= 29;
  const needsResponsiva = edadInt >= 15 && edadInt <= 17;

  // Validaciones
  const isStep1Valid =
    formData.nombre &&
    formData.apellido &&
    formData.password &&
    formData.edad &&
    formData.genero &&
    formData.telefono &&
    formData.contactoEmergencia;
  const isStep2Valid = isEdadValida && formData.documento;
  const isStep3Valid =
    (formData.pais === "Otro" ? formData.otroPais : formData.pais) &&
    formData.estado &&
    formData.localidad;
  const isStep4Valid =
    formData.alergias &&
    formData.padecimiento &&
    formData.medicamento &&
    formData.dosisFrecuencia;
  const isStep5Valid = !!formData.fotoPerfil;
  const isStep6Valid = formData.tallaPlayera && formData.aceptaTerminos;
  const isStep7Valid = formData.tipoPago && formData.metodoPago;
  const isStep8Valid =
    formData.metodoPago === "tarjeta" ? true : !!formData.comprobantePago;

  const handleNext = () => {
    if (step === 1 && !isEdadValida) {
      alert("Lo sentimos, la edad permitida es de 15 a 29 años.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const simulateStripePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const isSuccess = Math.random() > 0.2;

    setIsProcessing(false);
    if (isSuccess) {
      setPaymentStatus("success");
      setTimeout(() => setStep(9), 1500);
    } else {
      setPaymentStatus("error");
    }
  };

  const handleFinalAction = () => {
    if (formData.metodoPago === "tarjeta") {
      simulateStripePayment();
    } else {
      setStep(9);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "documento" | "comprobantePago" | "fotoPerfil",
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      if (field === "documento") setPreviewUrl(url);
      else if (field === "fotoPerfil") setProfilePreviewUrl(url);
      else setComprobantePreview(url);
    }
  };

  const handleEdadChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setFormData({ ...formData, edad: cleanValue });
  };

  const saveContacto = () => {
    if (tempContacto.nombre && tempContacto.telefono) {
      setFormData({ ...formData, contactoEmergencia: tempContacto });
      setIsModalOpen(false);
    }
  };

  const toggleHealthField = (field: keyof FormData, value: string) => {
    if (formData[field] === value) setFormData({ ...formData, [field]: "" });
    else setFormData({ ...formData, [field]: value });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg flex flex-col h-full max-h-[95vh] sm:max-h-none">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-secondary uppercase tracking-tighter">
            Registro <span className="text-primary">CNGRS26</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto sm:overflow-visible px-3 pb-12 -mx-3">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5 sm:space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100"
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
                      setFormData({ ...formData, telefono: e.target.value })
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
                        <UserPlus className="h-5 w-5 text-primary group-hover:scale-110" />
                        <span className="text-xs font-bold text-secondary/70">
                          Agregar Contacto
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20"
                  disabled={!isStep1Valid}
                  onClick={handleNext}
                >
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
                    Documentación
                  </h2>
                  <div className="relative">
                    {formData.documento ? (
                      <div className="relative w-full h-64 rounded-3xl overflow-hidden border-2 border-primary/20">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            alt="Doc"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <FileText className="h-10 w-10 text-primary" />
                            <span className="text-xs mt-2">
                              {formData.documento.name}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, documento: null });
                            setPreviewUrl(null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                        <Camera className="h-10 w-10 text-primary mb-2" />
                        <span className="text-sm font-bold text-secondary text-center px-4">
                          {needsResponsiva
                            ? "Subir Carta Responsiva"
                            : "Tomar foto de INE"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, "documento")}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-[2] h-14 font-bold shadow-lg"
                    disabled={!isStep2Valid}
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">Ubicación</h2>
                <Select
                  label="País"
                  options={[
                    { value: "México", label: "México" },
                    { value: "Otro", label: "Otro" },
                  ]}
                  value={formData.pais}
                  onChange={(e) =>
                    setFormData({ ...formData, pais: e.target.value })
                  }
                />
                <Input
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                />
                <Input
                  label="Localidad"
                  value={formData.localidad}
                  onChange={(e) =>
                    setFormData({ ...formData, localidad: e.target.value })
                  }
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-[2] h-14 font-bold"
                    disabled={!isStep3Valid}
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">Salud</h2>
                <Input
                  label="Alergias"
                  value={formData.alergias}
                  onChange={(e) =>
                    setFormData({ ...formData, alergias: e.target.value })
                  }
                  labelAction={
                    <button
                      type="button"
                      onClick={() => toggleHealthField("alergias", "Ninguna")}
                      className={cn(
                        "text-[10px] font-bold uppercase px-3 py-1 rounded-full cursor-pointer",
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
                  label="Enfermedad"
                  value={formData.padecimiento}
                  onChange={(e) =>
                    setFormData({ ...formData, padecimiento: e.target.value })
                  }
                  labelAction={
                    <button
                      type="button"
                      onClick={() =>
                        toggleHealthField("padecimiento", "Ninguna")
                      }
                      className={cn(
                        "text-[10px] font-bold uppercase px-3 py-1 rounded-full cursor-pointer",
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
                  label="Medicamento que tomas"
                  value={formData.medicamento}
                  onChange={(e) =>
                    setFormData({ ...formData, medicamento: e.target.value })
                  }
                />
                <Input
                  label="Dosis y Frecuencia"
                  value={formData.dosisFrecuencia}
                  onChange={(e) =>
                    setFormData({ ...formData, dosisFrecuencia: e.target.value })
                  }
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-[2] h-14 font-bold"
                    disabled={!isStep4Valid}
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                    <User size={32} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">
                    ¡Queremos <span className="text-primary">Conocerte</span>!
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Sube una foto tuya para completar tu perfil y tu gafete digital.
                  </p>
                  
                  <div className="relative group">
                    {formData.fotoPerfil ? (
                      <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                        {profilePreviewUrl ? (
                          <img
                            src={profilePreviewUrl}
                            className="w-full h-full object-cover"
                            alt="Perfil"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-50">
                            <FileText className="h-10 w-10 text-primary" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, fotoPerfil: null });
                            setProfilePreviewUrl(null);
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="h-8 w-8 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-48 h-48 mx-auto border-4 border-dashed border-gray-100 rounded-full cursor-pointer hover:bg-gray-50 transition-all hover:border-primary/30">
                        <Camera className="h-10 w-10 text-primary mb-2" />
                        <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest px-4 leading-tight">
                          Tomar Foto o Subir
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "fotoPerfil")}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-14"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-[2] h-14 font-bold shadow-lg"
                    disabled={!isStep5Valid}
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
                  Finalizar Registro
                </h2>
                <Select
                  label="Talla"
                  options={[
                    { value: "M", label: "Mediana (M)" },
                    { value: "L", label: "Grande (L)" },
                  ]}
                  value={formData.tallaPlayera}
                  onChange={(e) =>
                    setFormData({ ...formData, tallaPlayera: e.target.value })
                  }
                />
                <div className="bg-gray-50 p-4 rounded-xl text-xs h-32 overflow-auto text-gray-500">
                  Términos y condiciones extendidos aquí...
                </div>
                <Checkbox
                  label="Acepto los términos"
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
                    disabled={!isStep6Valid}
                    onClick={handleNext}
                  >
                    Ir al pago
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 font-bold text-gray-500 border-gray-200"
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
                    Método de Pago
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, tipoPago: "completo" })
                      }
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
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
                        <p className="font-bold text-secondary text-sm">
                          Pago Completo
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                          Asegura tu lugar
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, tipoPago: "inscripcion" })
                      }
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
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
                        <p className="font-bold text-secondary text-sm">
                          Solo Inscripción
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                          Aparta tu lugar
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
                            metodoPago: m.id as any,
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
                            formData.metodoPago === m.id
                              ? "text-primary"
                              : "text-gray-300",
                          )}
                        />
                        <span className="text-[10px] font-bold uppercase">
                          {m.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    className="h-14 font-bold"
                    disabled={!isStep7Valid}
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
            )}

            {step === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
                  Detalles del Pago
                </h2>

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
                          Hubo un error al procesar tu tarjeta. Por favor
                          verifica los datos e intenta de nuevo.
                        </p>
                      </motion.div>
                    )}

                    {paymentStatus === "success" ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </motion.div>
                        <p className="text-xl font-black text-secondary uppercase tracking-tighter">
                          ¡Pago Exitoso!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          label="Número de Tarjeta"
                          placeholder="0000 0000 0000 0000"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Vencimiento" placeholder="MM/YY" />
                          <Input label="CVV" placeholder="123" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(formData.metodoPago === "transferencia" ||
                  formData.metodoPago === "efectivo") && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 text-left">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest leading-tight">
                        {formData.metodoPago === "transferencia"
                          ? "3 horas para pagar"
                          : "24 horas para depositar"}
                      </p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                      <Camera className="h-8 w-8 text-primary mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase text-center px-4 leading-tight">
                        {formData.comprobantePago
                          ? formData.comprobantePago.name
                          : "Subir Comprobante"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileChange(e, "comprobantePago")
                        }
                      />
                    </label>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  {!paymentStatus && (
                    <Button
                      className="h-16 font-black text-lg shadow-lg"
                      disabled={!isStep8Valid || isProcessing}
                      onClick={handleFinalAction}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Procesando...
                        </>
                      ) : (
                        "Confirmar y Finalizar"
                      )}
                    </Button>
                  )}
                  {paymentStatus !== "success" && (
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
            )}

            {step === 9 && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
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
                        Pendiente de Liquidar
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed mt-1">
                        Tienes hasta el 15 de Octubre para pagar el resto ($800
                        MXN) y asegurar tu precio de preventa.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Hemos enviado los detalles de tu registro y acceso a tu
                  teléfono <strong>{formData.telefono}</strong> vía SMS.
                </p>
                <Button
                  className="h-16 w-full font-black text-lg shadow-xl mt-4 uppercase tracking-widest"
                  onClick={() => router.push("/dashboard")}
                >
                  Ir a mi cuenta
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 py-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                step === i ? "w-10 bg-primary shadow-sm shadow-primary/30" : "w-2 bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <ModalTitle className="text-xl font-black text-secondary uppercase tracking-tight">Contacto de Emergencia</ModalTitle>
          <ModalDescription className="text-xs font-bold uppercase tracking-widest mt-1">
            ¿A quién llamamos en caso de emergencia?
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4 pt-4">
          <Input
            label="Nombre"
            value={tempContacto.nombre}
            onChange={(e) =>
              setTempContacto({ ...tempContacto, nombre: e.target.value })
            }
          />
          <Input
            label="Teléfono"
            value={tempContacto.telefono}
            onChange={(e) =>
              setTempContacto({ ...tempContacto, telefono: e.target.value })
            }
          />
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button className="flex-1 font-bold" onClick={saveContacto}>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}
