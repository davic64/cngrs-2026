import { uploadRegistrationFiles } from "@/app/actions/auth";
import { loadRegText, saveRegText } from "@/lib/registration-storage";
import type { RegistrationFormData } from "./types";

export type UploadedFiles = {
  profileUrl: string;
  docUrl: string;
  sessionId: string;
};

// FormData que esperan registerUser() y savePendingRegistration().
export function buildRegistrationData(
  formData: RegistrationFormData,
  files?: UploadedFiles,
) {
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
  data.append("tipoPago", formData.tipoPago || "");
  data.append("metodoPago", formData.metodoPago || "");
  if (files?.profileUrl) data.append("profilePhotoUrl", files.profileUrl);
  if (files?.docUrl) data.append("documentUrl", files.docUrl);
  if (files?.sessionId) data.append("sessionId", files.sessionId);
  return data;
}

// Sube foto y documento a R2 y guarda el texto del formulario + URLs en localStorage.
// Si la subida falla igual guarda el texto, para poder retomar el registro.
export async function uploadAndSaveRegistration(
  formData: RegistrationFormData,
): Promise<UploadedFiles | null> {
  const fileData = new FormData();
  if (formData.fotoPerfil) fileData.append("fotoPerfil", formData.fotoPerfil);
  if (formData.documento) fileData.append("documento", formData.documento);
  fileData.append("edad", formData.edad);

  const result = await uploadRegistrationFiles(fileData);

  const {
    documento: _d,
    fotoPerfil: _f,
    comprobantePago: _c,
    ...textData
  } = formData;
  saveRegText({
    ...textData,
    profilePhotoUrl: result.success ? result.profileUrl : undefined,
    documentUrl: result.success ? result.docUrl : undefined,
    sessionId: result.success ? result.sessionId : undefined,
  });

  if (!result.success) return null;
  return {
    profileUrl: result.profileUrl || "",
    docUrl: result.docUrl || "",
    sessionId: result.sessionId || "",
  };
}

// Reusa los archivos ya subidos al pasar al paso 8; sólo sube si no existen
// y hay archivos locales (sesión restaurada sin archivos → no hay nada que subir).
// Devuelve null si la subida falla.
export async function ensureUploadedFiles(
  formData: RegistrationFormData,
): Promise<UploadedFiles | null> {
  const saved = loadRegText();
  if (saved?.profilePhotoUrl && saved?.sessionId) {
    return {
      profileUrl: saved.profilePhotoUrl,
      docUrl: saved.documentUrl || "",
      sessionId: saved.sessionId,
    };
  }
  if (formData.fotoPerfil || formData.documento) {
    return uploadAndSaveRegistration(formData);
  }
  return { profileUrl: "", docUrl: "", sessionId: "" };
}
