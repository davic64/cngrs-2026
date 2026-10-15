import type { getLocalities } from "@/app/actions/admin";

export type Localities = Awaited<ReturnType<typeof getLocalities>>;

export type RegistrationConfig = {
  fullPaymentPrice: number;
  registrationFeePrice: number;
  stripePercentage: string;
  stripeFixedFee: number;
  termsAndConditions: string;
  bankName: string | null;
  bankCLABE: string | null;
  bankHolder: string | null;
  oxxoCardNumber?: string | null;
};

export type RegistrationFormData = {
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

export type SelectOption = { value: string; label: string };
