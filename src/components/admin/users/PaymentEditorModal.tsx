"use client";

import * as React from "react";
import { createPayment, updatePayment } from "@/app/actions/admin-payments";
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

export type PaymentRow = {
  id: number;
  amount: number;
  type: string;
  method: string;
  status: string;
  rejectionReason: string | null;
  proofUrl: string | null;
  createdAt: string | Date;
};

type Props = {
  userId: string;
  payment: PaymentRow | null; // null = alta manual
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const toForm = (p: PaymentRow | null) => ({
  amount: p ? String(p.amount) : "",
  type: p?.type ?? "completo",
  method: p?.method ?? "efectivo",
  status: p?.status ?? "completado",
  rejectionReason: p?.rejectionReason ?? "",
});

export function PaymentEditorModal({
  userId,
  payment,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = React.useState(() => toForm(payment));
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sólo al abrir
  React.useEffect(() => {
    if (isOpen) {
      setForm(toForm(payment));
      setError("");
    }
  }, [isOpen, payment?.id]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    const result = payment
      ? await updatePayment(payment.id, form)
      : await createPayment(userId, form);
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
          {payment ? "Editar Pago" : "Agregar Pago"}
        </ModalTitle>
      </ModalHeader>

      <ModalContent className="space-y-4 pt-4">
        <Input
          label="Monto (MXN)"
          inputMode="numeric"
          value={form.amount}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              amount: e.target.value.replace(/[^0-9]/g, ""),
            }))
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo"
            options={[
              { value: "completo", label: "Pago Completo" },
              { value: "inscripcion", label: "Inscripción" },
            ]}
            value={form.type}
            onChange={set("type")}
          />
          <Select
            label="Método"
            options={[
              { value: "tarjeta", label: "Tarjeta" },
              { value: "transferencia", label: "Transferencia" },
              { value: "efectivo", label: "Efectivo" },
            ]}
            value={form.method}
            onChange={set("method")}
          />
        </div>
        <Select
          label="Estatus"
          options={[
            { value: "completado", label: "Aprobado" },
            { value: "revision", label: "En Revisión" },
            { value: "pendiente", label: "Pendiente" },
            { value: "rechazado", label: "Rechazado" },
          ]}
          value={form.status}
          onChange={set("status")}
        />
        {form.status === "rechazado" && (
          <Input
            label="Motivo del rechazo"
            value={form.rejectionReason}
            onChange={set("rejectionReason")}
          />
        )}
        {form.method === "tarjeta" && (
          <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            Editar un pago con tarjeta no modifica el cobro en Stripe.
          </p>
        )}
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
