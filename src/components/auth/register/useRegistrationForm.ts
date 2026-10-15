import * as React from "react";
import type { RegistrationFormData } from "./types";

const INITIAL_FORM: RegistrationFormData = {
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
};

export const MIN_AGE = 15;

// Condición para habilitar "Siguiente" en cada paso.
const stepValidators: Record<number, (f: RegistrationFormData) => boolean> = {
  1: (f) =>
    !!(
      f.nombre &&
      f.apellido &&
      f.password &&
      f.edad &&
      f.genero &&
      f.telefono &&
      f.contactoEmergencia
    ),
  2: (f) => parseInt(f.edad, 10) >= MIN_AGE && !!f.documento,
  3: (f) =>
    !!((f.pais === "Otro" ? f.otroPais : f.pais) && f.estado && f.localidad),
  4: (f) =>
    !!(f.alergias && f.padecimiento && f.medicamento && f.dosisFrecuencia),
  5: (f) => !!f.fotoPerfil,
  6: (f) => !!(f.tallaPlayera && f.aceptaTerminos),
  7: (f) => !!(f.tipoPago && f.metodoPago),
  8: (f) => (f.metodoPago === "tarjeta" ? true : !!f.comprobantePago),
};

export function useRegistrationForm() {
  const [formData, setFormData] =
    React.useState<RegistrationFormData>(INITIAL_FORM);

  const edadInt = React.useMemo(
    () => parseInt(formData.edad, 10),
    [formData.edad],
  );
  const isEdadValida = edadInt >= MIN_AGE;
  const needsResponsiva = edadInt >= MIN_AGE && edadInt <= 17;

  const isStepValid = (step: number) =>
    stepValidators[step]?.(formData) ?? true;

  return {
    formData,
    setFormData,
    edadInt,
    isEdadValida,
    needsResponsiva,
    isStepValid,
  };
}
