// Persistencia del registro en curso (localStorage, TTL 24 h).
// Claves y forma serializada fijas: usuarios con un registro a medias lo retoman tras un despliegue.

const REG_KEY = "cngrs_reg_data";
const REG_EXPIRY_KEY = "cngrs_reg_expiry";
const TTL_24H = 24 * 60 * 60 * 1000;

export type SavedRegistration = {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  edad?: string;
  genero?: string;
  telefono?: string;
  contactoEmergencia?: { nombre: string; telefono: string } | null;
  pais?: string;
  otroPais?: string;
  estado?: string;
  localidad?: string;
  alergias?: string;
  padecimiento?: string;
  medicamento?: string;
  dosisFrecuencia?: string;
  tallaPlayera?: string;
  aceptaTerminos?: boolean;
  tipoPago?: "completo" | "inscripcion" | "";
  metodoPago?: "tarjeta" | "transferencia" | "efectivo" | "";
  profilePhotoUrl?: string;
  documentUrl?: string;
  sessionId?: string;
  baseAmount?: number;
};

export function saveRegText(data: SavedRegistration) {
  try {
    localStorage.setItem(REG_KEY, JSON.stringify(data));
    localStorage.setItem(REG_EXPIRY_KEY, String(Date.now() + TTL_24H));
  } catch {}
}

export function loadRegText(): SavedRegistration | null {
  try {
    const exp = localStorage.getItem(REG_EXPIRY_KEY);
    if (!exp || Date.now() > Number(exp)) {
      clearRegStorage();
      return null;
    }
    const raw = localStorage.getItem(REG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearRegStorage() {
  try {
    localStorage.removeItem(REG_KEY);
    localStorage.removeItem(REG_EXPIRY_KEY);
  } catch {}
}
