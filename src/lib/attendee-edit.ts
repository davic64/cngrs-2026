export type AttendeeEdit = {
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  gender: "M" | "F" | "Otro";
  shirtSize: string;
  country: string;
  state: string;
  locality: string;
  contactName: string;
  contactPhone: string;
  allergies: string;
  conditions: string;
  medications: string;
  dosageFrequency: string;
};

// [clave, etiqueta para el admin]: texto obligatorio, mismas reglas que el registro.
const TEXT_FIELDS: [keyof AttendeeEdit, string][] = [
  ["firstName", "el nombre"],
  ["lastName", "el apellido"],
  ["phone", "el teléfono"],
  ["shirtSize", "la talla de playera"],
  ["country", "el país"],
  ["state", "el estado"],
  ["locality", "la localidad"],
  ["contactName", "el nombre del contacto de emergencia"],
  ["contactPhone", "el teléfono del contacto de emergencia"],
  ["allergies", "las alergias"],
  ["conditions", "los padecimientos"],
  ["medications", "los medicamentos"],
  ["dosageFrequency", "la dosis/frecuencia"],
];

export function validateAttendeeEdit(
  input: Record<string, unknown>,
): { ok: true; data: AttendeeEdit } | { ok: false; error: string } {
  const data: Record<string, unknown> = {};

  for (const [key, label] of TEXT_FIELDS) {
    const value = String(input[key] ?? "").trim();
    if (!value) return { ok: false, error: `Falta ${label}.` };
    data[key] = value;
  }

  const age = Number(input.age);
  if (!Number.isInteger(age) || age < 15) {
    return { ok: false, error: "La edad es inválida (mínimo 15 años)." };
  }
  data.age = age;

  const gender = input.gender;
  if (gender !== "M" && gender !== "F" && gender !== "Otro") {
    return { ok: false, error: "El género es inválido." };
  }
  data.gender = gender;

  return { ok: true, data: data as AttendeeEdit };
}
