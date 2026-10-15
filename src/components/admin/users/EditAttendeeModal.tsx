"use client";

import * as React from "react";
import { updateAttendee } from "@/app/actions/admin-attendees";
import { ESTADOS_POR_PAIS } from "@/components/auth/register/locations";
import type { Localities } from "@/components/auth/register/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

type Attendee = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  gender: string;
  shirtSize: string;
  country: string;
  state: string;
  locality: string;
  emergencyContact?: { name: string; phone: string } | null;
  healthInfo?: {
    allergies: string | null;
    conditions: string | null;
    medications: string | null;
    dosageFrequency: string | null;
  } | null;
};

type Props = {
  user: Attendee;
  localities: Localities;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const toForm = (u: Attendee) => ({
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone,
  age: String(u.age),
  gender: u.gender,
  shirtSize: u.shirtSize,
  country: u.country,
  state: u.state,
  locality: u.locality,
  contactName: u.emergencyContact?.name ?? "",
  contactPhone: u.emergencyContact?.phone ?? "",
  allergies: u.healthInfo?.allergies ?? "",
  conditions: u.healthInfo?.conditions ?? "",
  medications: u.healthInfo?.medications ?? "",
  dosageFrequency: u.healthInfo?.dosageFrequency ?? "",
});

export function EditAttendeeModal({
  user,
  localities,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = React.useState(() => toForm(user));
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Reinicia el formulario cada vez que se abre con el asistente vigente
  // biome-ignore lint/correctness/useExhaustiveDependencies: sólo al abrir
  React.useEffect(() => {
    if (isOpen) {
      setForm(toForm(user));
      setError("");
    }
  }, [isOpen, user.id]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Sugerencias (el texto sigue siendo libre)
  const countries = [
    ...new Set([
      ...Object.keys(ESTADOS_POR_PAIS),
      ...localities.map((l) => l.country),
    ]),
  ];
  const states = [
    ...new Set([
      ...(ESTADOS_POR_PAIS[form.country] ?? []).map((s) => s.value),
      ...localities
        .filter((l) => l.country === form.country)
        .map((l) => l.state),
    ]),
  ];
  const localityNames = localities
    .filter((l) => l.country === form.country && l.state === form.state)
    .map((l) => l.name);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    const result = await updateAttendee(user.id, form);
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (!result.changed) {
      setError("No hay cambios que guardar.");
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ModalTitle className="text-xl font-black text-secondary uppercase tracking-tight">
          Editar Asistente
        </ModalTitle>
      </ModalHeader>

      <ModalContent className="space-y-4 pt-4 max-h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={form.firstName}
            onChange={set("firstName")}
          />
          <Input
            label="Apellido"
            value={form.lastName}
            onChange={set("lastName")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                phone: e.target.value.replace(/[^0-9]/g, ""),
              }))
            }
          />
          <Input
            label="Edad"
            inputMode="numeric"
            value={form.age}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                age: e.target.value.replace(/[^0-9]/g, "").slice(0, 2),
              }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Género"
            options={[
              { value: "M", label: "Masculino" },
              { value: "F", label: "Femenino" },
              { value: "Otro", label: "Otro" },
            ]}
            value={form.gender}
            onChange={set("gender")}
          />
          <Select
            label="Talla de Playera"
            options={[
              { value: "S", label: "Chica (S)" },
              { value: "M", label: "Mediana (M)" },
              { value: "L", label: "Grande (L)" },
              { value: "XL", label: "Extra Grande (XL)" },
              { value: "XXL", label: "Extra Extra Grande (XXL)" },
            ]}
            value={form.shirtSize}
            onChange={set("shirtSize")}
          />
        </div>

        <Input
          label="País"
          list="edit-countries"
          value={form.country}
          onChange={set("country")}
        />
        <datalist id="edit-countries">
          {countries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Estado / Depto"
              list="edit-states"
              value={form.state}
              onChange={set("state")}
            />
            <datalist id="edit-states">
              {states.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <Input
              label="Localidad"
              list="edit-localities"
              value={form.locality}
              onChange={set("locality")}
            />
            <datalist id="edit-localities">
              {localityNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
        </div>

        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pt-2">
          Contacto de Emergencia
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={form.contactName}
            onChange={set("contactName")}
          />
          <Input
            label="Teléfono"
            value={form.contactPhone}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                contactPhone: e.target.value.replace(/[^0-9]/g, ""),
              }))
            }
          />
        </div>

        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pt-2">
          Salud
        </p>
        <Input
          label="Alergias"
          value={form.allergies}
          onChange={set("allergies")}
        />
        <Input
          label="Padecimientos"
          value={form.conditions}
          onChange={set("conditions")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Medicamentos"
            value={form.medications}
            onChange={set("medications")}
          />
          <Input
            label="Dosis / Frecuencia"
            value={form.dosageFrequency}
            onChange={set("dosageFrequency")}
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </p>
        )}
      </ModalContent>

      <ModalFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          className="flex-1 font-bold"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
