"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Camera,
  CreditCard,
  FileText,
  Loader2,
  Repeat,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { getLocalities, getSettings } from "@/app/actions/admin";
import { registerUser } from "@/app/actions/auth";
import { verifyDocumentAge } from "@/app/actions/ocr";
import { createCheckoutSession } from "@/app/actions/stripe";
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
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const _LOCALIDADES = [
  // Distritos México
  { value: "Distrito Central", label: "México - Distrito Central" },
  { value: "Distrito Occidente", label: "México - Distrito Occidente" },
  { value: "Distrito Norte", label: "México - Distrito Norte" },
  { value: "Distrito Sur", label: "México - Distrito Sur" },
  { value: "Distrito Noreste", label: "México - Distrito Noreste" },
  { value: "Distrito Noroeste", label: "México - Distrito Noroeste" },

  // Central America
  { value: "Distrito El Salvador", label: "El Salvador - Nacional" },
  { value: "Distrito Guatemala", label: "Guatemala - Nacional" },
  { value: "Distrito Honduras", label: "Honduras - Nacional" },
  { value: "Distrito Belice", label: "Belice - Nacional" },
  { value: "Distrito Nicaragua", label: "Nicaragua - Nacional" },
  { value: "Distrito Costa Rica", label: "Costa Rica - Nacional" },
  { value: "Distrito Panama", label: "Panamá - Nacional" },

  // North America
  { value: "Distrito USA Central", label: "USA - Distrito Central" },
  { value: "Distrito USA Este", label: "USA - Distrito Este" },
  { value: "Distrito USA Oeste", label: "USA - Distrito Oeste" },
  { value: "Distrito USA Sur", label: "USA - Distrito Sur" },
  { value: "Distrito Canada Este", label: "Canadá - Distrito Este" },
  { value: "Distrito Canada Oeste", label: "Canadá - Distrito Oeste" },

  { value: "Otro", label: "Mi localidad/distrito no aparece (Escribir)" },
];

const ESTADOS_POR_PAIS: Record<string, { value: string; label: string }[]> = {
  México: [
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Baja California", label: "Baja California" },
    { value: "Baja California Sur", label: "Baja California Sur" },
    { value: "Campeche", label: "Campeche" },
    { value: "Chiapas", label: "Chiapas" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Coahuila", label: "Coahuila" },
    { value: "Colima", label: "Colima" },
    { value: "Durango", label: "Durango" },
    { value: "Estado de México", label: "Estado de México" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Guerrero", label: "Guerrero" },
    { value: "Hidalgo", label: "Hidalgo" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Michoacán", label: "Michoacán" },
    { value: "Morelos", label: "Morelos" },
    { value: "Nayarit", label: "Nayarit" },
    { value: "Nuevo León", label: "Nuevo León" },
    { value: "Oaxaca", label: "Oaxaca" },
    { value: "Puebla", label: "Puebla" },
    { value: "Querétaro", label: "Querétaro" },
    { value: "Quintana Roo", label: "Quintana Roo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Sinaloa", label: "Sinaloa" },
    { value: "Sonora", label: "Sonora" },
    { value: "Tabasco", label: "Tabasco" },
    { value: "Tamaulipas", label: "Tamaulipas" },
    { value: "Tlaxcala", label: "Tlaxcala" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Yucatán", label: "Yucatán" },
    { value: "Zacatecas", label: "Zacatecas" },
  ],
  "Estados Unidos": [
    { value: "Alabama", label: "Alabama" },
    { value: "Alaska", label: "Alaska" },
    { value: "Arizona", label: "Arizona" },
    { value: "Arkansas", label: "Arkansas" },
    { value: "California", label: "California" },
    { value: "Colorado", label: "Colorado" },
    { value: "Connecticut", label: "Connecticut" },
    { value: "Delaware", label: "Delaware" },
    { value: "Florida", label: "Florida" },
    { value: "Georgia", label: "Georgia" },
    { value: "Hawaii", label: "Hawaii" },
    { value: "Idaho", label: "Idaho" },
    { value: "Illinois", label: "Illinois" },
    { value: "Indiana", label: "Indiana" },
    { value: "Iowa", label: "Iowa" },
    { value: "Kansas", label: "Kansas" },
    { value: "Kentucky", label: "Kentucky" },
    { value: "Louisiana", label: "Louisiana" },
    { value: "Maine", label: "Maine" },
    { value: "Maryland", label: "Maryland" },
    { value: "Massachusetts", label: "Massachusetts" },
    { value: "Michigan", label: "Michigan" },
    { value: "Minnesota", label: "Minnesota" },
    { value: "Mississippi", label: "Mississippi" },
    { value: "Missouri", label: "Missouri" },
    { value: "Montana", label: "Montana" },
    { value: "Nebraska", label: "Nebraska" },
    { value: "Nevada", label: "Nevada" },
    { value: "New Hampshire", label: "New Hampshire" },
    { value: "New Jersey", label: "New Jersey" },
    { value: "New Mexico", label: "New Mexico" },
    { value: "New York", label: "New York" },
    { value: "North Carolina", label: "North Carolina" },
    { value: "North Dakota", label: "North Dakota" },
    { value: "Ohio", label: "Ohio" },
    { value: "Oklahoma", label: "Oklahoma" },
    { value: "Oregon", label: "Oregon" },
    { value: "Pennsylvania", label: "Pennsylvania" },
    { value: "Rhode Island", label: "Rhode Island" },
    { value: "South Carolina", label: "South Carolina" },
    { value: "South Dakota", label: "South Dakota" },
    { value: "Tennessee", label: "Tennessee" },
    { value: "Texas", label: "Texas" },
    { value: "Utah", label: "Utah" },
    { value: "Vermont", label: "Vermont" },
    { value: "Virginia", label: "Virginia" },
    { value: "Washington", label: "Washington" },
    { value: "West Virginia", label: "West Virginia" },
    { value: "Wisconsin", label: "Wisconsin" },
    { value: "Wyoming", label: "Wyoming" },
  ],
  Canadá: [
    { value: "Alberta", label: "Alberta" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Manitoba", label: "Manitoba" },
    { value: "New Brunswick", label: "New Brunswick" },
    { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
    { value: "Nova Scotia", label: "Nova Scotia" },
    { value: "Ontario", label: "Ontario" },
    { value: "Prince Edward Island", label: "Prince Edward Island" },
    { value: "Quebec", label: "Quebec" },
    { value: "Saskatchewan", label: "Saskatchewan" },
  ],
  "El Salvador": [
    { value: "Ahuachapán", label: "Ahuachapán" },
    { value: "Cabañas", label: "Cabañas" },
    { value: "Chalatenango", label: "Chalatenango" },
    { value: "Cuscatlán", label: "Cabañas" },
    { value: "La Libertad", label: "La Libertad" },
    { value: "La Paz", label: "La Paz" },
    { value: "La Unión", label: "La Unión" },
    { value: "Morazán", label: "Morazán" },
    { value: "San Miguel", label: "San Miguel" },
    { value: "San Salvador", label: "San Salvador" },
    { value: "San Vicente", label: "San Vicente" },
    { value: "Santa Ana", label: "Santa Ana" },
    { value: "Sonsonate", label: "Sonsonate" },
    { value: "Usulután", label: "Usulután" },
  ],
  Guatemala: [
    { value: "Alta Verapaz", label: "Alta Verapaz" },
    { value: "Baja Verapaz", label: "Baja Verapaz" },
    { value: "Chimaltenango", label: "Chimaltenango" },
    { value: "Chiquimula", label: "Chiquimula" },
    { value: "El Progreso", label: "El Progreso" },
    { value: "Escuintla", label: "Escuintla" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Huehuetenango", label: "Huehuetenango" },
    { value: "Izabal", label: "Izabal" },
    { value: "Jalapa", label: "Jalapa" },
    { value: "Jutiapa", label: "Jutiapa" },
    { value: "Petén", label: "Petén" },
    { value: "Quetzaltenango", label: "Quetzaltenango" },
    { value: "Quiché", label: "Quiché" },
    { value: "Retalhuleu", label: "Retalhuleu" },
    { value: "Sacatepéquez", label: "Sacatepéquez" },
    { value: "San Marcos", label: "San Marcos" },
    { value: "Santa Rosa", label: "Santa Rosa" },
    { value: "Sololá", label: "Sololá" },
    { value: "Suchitepéquez", label: "Suchitepéquez" },
    { value: "Totonicapán", label: "Totonicapán" },
    { value: "Zacapa", label: "Zacapa" },
  ],
  Honduras: [
    { value: "Atlántida", label: "Atlántida" },
    { value: "Choluteca", label: "Choluteca" },
    { value: "Colón", label: "Colón" },
    { value: "Comayagua", label: "Comayagua" },
    { value: "Copán", label: "Copán" },
    { value: "Cortés", label: "Cortés" },
    { value: "El Paraíso", label: "El Paraíso" },
    { value: "Francisco Morazán", label: "Francisco Morazán" },
    { value: "Gracias a Dios", label: "Gracias a Dios" },
    { value: "Intibucá", label: "Intibucá" },
    { value: "Islas de la Bahía", label: "Islas de la Bahía" },
    { value: "La Paz", label: "La Paz" },
    { value: "Lempira", label: "Lempira" },
    { value: "Ocotepeque", label: "Ocotepeque" },
    { value: "Olancho", label: "Olancho" },
    { value: "Santa Bárbara", label: "Santa Bárbara" },
    { value: "Valle", label: "Valle" },
    { value: "Yoro", label: "Yoro" },
  ],
};

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
  const [isAgeRestrictedModalOpen, setIsAgeRestrictedModalOpen] =
    React.useState(false);
  const [detectedAge, setDetectedAge] = React.useState<number | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState<
    "success" | "error" | null
  >(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = React.useState<
    string | null
  >(null);
  const [config, setConfig] = React.useState({
    fullPaymentPrice: 1500,
    registrationFeePrice: 500,
    stripePercentage: "3.6",
    stripeFixedFee: 3,
  });
  const [dbLocalities, setDbLocalities] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const [settingsData, localitiesData] = await Promise.all([
        getSettings(),
        getLocalities(),
      ]);
      if (settingsData) setConfig(settingsData);
      if (localitiesData) setDbLocalities(localitiesData);
    };
    loadData();
  }, []);

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

  const filteredStates = React.useMemo(() => {
    const states = ESTADOS_POR_PAIS[formData.pais] || [];
    return [...states, { value: "Otro", label: "Otro (Escribir)" }];
  }, [formData.pais]);

  // Filter localities based on selected country
  const filteredLocalities = React.useMemo(() => {
    const options = dbLocalities
      .filter((loc) => loc.country === formData.pais)
      .map((loc) => ({ value: loc.name, label: loc.name }));

    return [
      ...options,
      { value: "Otro", label: "Mi localidad no aparece (Escribir)" },
    ];
  }, [dbLocalities, formData.pais]);

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

  const simulateStripePayment = async (userId: string) => {
    setIsProcessing(true);

    const result = await createCheckoutSession(
      userId,
      formData.tipoPago as "completo" | "inscripcion",
    );

    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || "Error al conectar con Stripe");

      setIsProcessing(false);
    }
  };

  const handleFinalAction = async () => {
    setIsProcessing(true);

    // 1. Siempre guardar primero en la base de datos

    const result = await handleSubmit(false); // No cambiar de step automáticamente

    if (result.success) {
      if (formData.metodoPago === "tarjeta") {
        // 2. Si es tarjeta, ir a Stripe

        if (result.userId) {
          await simulateStripePayment(result.userId);
        } else {
          alert("Error: No se pudo obtener el ID del usuario.");

          setIsProcessing(false);
        }
      } else {
        // 2. Si es efectivo/transf, ir al step de éxito

        setStep(9);
      }
    } else {
      alert(result.error || "Hubo un error al procesar tu registro");

      setIsProcessing(false);
    }
  };

  const handleSubmit = async (shouldChangeStep = true) => {
    // setIsProcessing lo maneja el que lo llama

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("apellido", formData.apellido);
    data.append("telefono", formData.telefono);
    data.append("password", formData.password);
    data.append("edad", formData.edad);
    data.append("genero", formData.genero);
    data.append("tallaPlayera", formData.tallaPlayera);
    data.append(
      "pais",
      formData.pais === "Otro" ? formData.otroPais : formData.pais,
    );
    data.append("estado", formData.estado);
    data.append("localidad", formData.localidad);
    data.append("alergias", formData.alergias);
    data.append("padecimiento", formData.padecimiento);
    data.append("medicamento", formData.medicamento);
    data.append("dosisFrecuencia", formData.dosisFrecuencia);
    if (formData.contactoEmergencia) {
      data.append("contactoNombre", formData.contactoEmergencia.nombre);
      data.append("contactoTelefono", formData.contactoEmergencia.telefono);
    }
    data.append("tipoPago", formData.tipoPago);
    data.append("metodoPago", formData.metodoPago);
    if (formData.documento) data.append("documento", formData.documento);
    if (formData.fotoPerfil) data.append("fotoPerfil", formData.fotoPerfil);
    if (formData.comprobantePago)
      data.append("comprobantePago", formData.comprobantePago);

    const result = await registerUser(data);

    if (result.success) {
      if (shouldChangeStep) setStep(9);

      return { success: true, userId: result.userId };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "documento" | "comprobantePago" | "fotoPerfil",
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (field === "documento") {
      setFormData({ ...formData, documento: file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await verifyAgeFromDocument(file);
    } else {
      setFormData({ ...formData, [field]: file });
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        if (field === "fotoPerfil") setProfilePreviewUrl(url);
      }
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

  const verifyAgeFromDocument = async (file: File) => {
    setIsVerifying(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;
      const result = await verifyDocumentAge(base64Image);
      if (result.success) {
        if (!result.isValid) {
          alert(
            `Lo sentimos, el sistema detectó una edad de ${result.age} años en tu identificación. El congreso es exclusivo para jóvenes de 15 a 29 años.`,
          );
          setFormData({ ...formData, documento: null });
          setPreviewUrl(null);
          return false;
        }
        return true;
      } else {
        return true;
      }
    } catch (error) {
      console.error("Error en validación OCR:", error);
      return true;
    } finally {
      setIsVerifying(false);
    }
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
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden">
                        {isVerifying && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                            <p className="text-xs font-black text-secondary uppercase tracking-widest animate-pulse">
                              Verificando Edad...
                            </p>
                          </div>
                        )}
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
                          disabled={isVerifying}
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
                    disabled={isVerifying}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-[2] h-14 font-bold shadow-lg"
                    disabled={!isStep2Valid || isVerifying}
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
                  onChange={(e) =>
                    setFormData({ ...formData, pais: e.target.value })
                  }
                />
                <SearchableSelect
                  label="Estado / Departamento"
                  placeholder="Busca tu estado..."
                  options={filteredStates}
                  value={formData.estado}
                  onChange={(val) => setFormData({ ...formData, estado: val })}
                />
                {formData.estado === "Otro" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      label="Escribe tu Estado"
                      placeholder="Nombre de tu estado o provincia"
                      value={formData.estado === "Otro" ? "" : formData.estado}
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
                  value={formData.localidad}
                  onChange={(val) =>
                    setFormData({ ...formData, localidad: val })
                  }
                />
                {formData.localidad === "Otro" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      label="Escribe tu Localidad"
                      placeholder="Nombre de tu ciudad o sede"
                      value={
                        formData.localidad === "Otro" ? "" : formData.localidad
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, localidad: e.target.value })
                      }
                    />
                  </motion.div>
                )}
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
                className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <h2 className="text-lg font-bold text-secondary uppercase tracking-tight">
                  Salud
                </h2>
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
                      onClick={() =>
                        toggleHealthField("padecimiento", "Ninguna")
                      }
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
                      onClick={() =>
                        toggleHealthField("medicamento", "Ninguno")
                      }
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
                className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                    <UserIcon size={32} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">
                    ¡Queremos <span className="text-primary">Conocerte</span>!
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Sube una foto tuya para completar tu perfil y tu gafete
                    digital.
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
                        <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest px-4 leading-tight text-center">
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
                <div className="bg-gray-50 p-4 rounded-xl text-[10px] h-32 overflow-auto text-gray-500 border border-gray-100 italic leading-relaxed space-y-2">
                  <p className="font-bold uppercase tracking-widest text-secondary">
                    Términos y Condiciones del CNGRS26
                  </p>
                  <p>1. Acepto que mi registro es personal e intransferible.</p>
                  <p>
                    2. Autorizo el uso de mi imagen en fotografías y videos con
                    fines promocionales del evento.
                  </p>
                  <p>
                    3. Me comprometo a seguir el código de conducta y respeto
                    mutuo durante todas las sesiones.
                  </p>
                  <p>
                    4. Entiendo que los pagos realizados no son reembolsables en
                    caso de cancelación por parte del asistente.
                  </p>
                  <p>
                    5. JIDI Internacional no se hace responsable por objetos
                    perdidos durante el congreso.
                  </p>
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
                    disabled={!isStep6Valid}
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
            )}

            {step === 7 && (
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
                    onClick={() =>
                      setFormData({ ...formData, tipoPago: "completo" })
                    }
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
                      <p className="font-bold text-secondary text-sm">
                        Pago Completo
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                        ${config.fullPaymentPrice} MXN
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tipoPago: "inscripcion" })
                    }
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
                      <p className="font-bold text-secondary text-sm">
                        Solo Inscripción
                      </p>
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
                        setFormData({ ...formData, metodoPago: m.id as any })
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
                          Hubo un error al procesar tu tarjeta. Intenta de
                          nuevo.
                        </p>
                      </motion.div>
                    )}
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
                  </div>
                )}
                {formData.metodoPago === "transferencia" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-blue-800">
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Datos Bancarios (SPEI)
                      </p>
                      <p className="text-xs font-bold">Banco: BBVA</p>
                      <p className="text-xs font-bold">
                        CLABE: 0123 4567 8901 2345 67
                      </p>
                      <p className="text-xs font-bold">
                        Nombre: JIDI Internacional A.C.
                      </p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                      <Camera className="h-8 w-8 text-primary mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase text-center px-4 leading-tight">
                        {formData.comprobantePago
                          ? formData.comprobantePago.name
                          : "Subir Comprobante SPEI"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, "comprobantePago")}
                      />
                    </label>
                  </div>
                )}
                {formData.metodoPago === "efectivo" && (
                  <div className="space-y-4 text-center">
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4 text-amber-800">
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Número de Referencia (OXXO)
                      </p>
                      <p className="text-4xl font-black tracking-tighter text-secondary">
                        {formData.telefono}
                      </p>
                      <p className="text-[11px] leading-relaxed font-medium">
                        Acude a cualquier sucursal y realiza el depósito a la
                        cuenta vinculada usando este número.
                      </p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all">
                      <Camera className="h-8 w-8 text-primary mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase text-center px-4 leading-tight">
                        {formData.comprobantePago
                          ? formData.comprobantePago.name
                          : "Subir Ticket OXXO"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, "comprobantePago")}
                      />
                    </label>
                  </div>
                )}
                <div className="flex flex-col gap-3 pt-2">
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
                  <Button
                    variant="outline"
                    className="h-12 border-gray-200"
                    disabled={isProcessing}
                    onClick={handleBack}
                  >
                    Atrás
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 9 && (
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
                        Pendiente de Liquidar
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed mt-1">
                        Tienes hasta el 15 de Octubre para pagar el resto ($800
                        MXN).
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Hemos enviado los detalles de tu registro vía SMS.
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

        <div className="flex justify-center gap-3 py-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                step === i
                  ? "w-10 bg-primary shadow-sm shadow-primary/30"
                  : "w-2 bg-gray-300",
              )}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <ModalTitle className="text-xl font-black text-secondary uppercase tracking-tight">
            Contacto de Emergencia
          </ModalTitle>
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

      {/* AGE RESTRICTION MODAL */}

      <Modal isOpen={isAgeRestrictedModalOpen} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle className="text-2xl font-black text-secondary uppercase tracking-tighter text-center">
            Evento <span className="text-primary">Restringido</span>
          </ModalTitle>
        </ModalHeader>

        <ModalContent className="space-y-6 text-center">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-inner">
            <ShieldAlert size={48} />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-black text-secondary uppercase tracking-tight">
              Límite de edad excedido
            </p>

            <p className="text-sm text-gray-500 leading-relaxed font-medium px-4">
              Lo sentimos, nuestro sistema ha detectado que tienes{" "}
              <span className="font-black text-red-500">
                {detectedAge} años
              </span>
              . El <span className="text-primary font-bold">CNGRS26</span> es
              una experiencia diseñada exclusivamente para jóvenes de{" "}
              <span className="font-bold">15 a 29 años</span>.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Si crees que esto es un error, por favor contacta a soporte técnico.
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            className="w-full h-12 uppercase font-black text-xs tracking-widest"
            onClick={() => router.push("/")}
          >
            Regresar al Inicio
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}
