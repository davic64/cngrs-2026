export type PaymentEdit = {
  amount: number;
  type: "completo" | "inscripcion";
  method: "tarjeta" | "transferencia" | "efectivo";
  status: "pendiente" | "revision" | "completado" | "rechazado";
  rejectionReason: string | null;
};

const TYPES = ["completo", "inscripcion"];
const METHODS = ["tarjeta", "transferencia", "efectivo"];
const STATUSES = ["pendiente", "revision", "completado", "rechazado"];

export function validatePaymentEdit(
  input: Record<string, unknown>,
): { ok: true; data: PaymentEdit } | { ok: false; error: string } {
  const amount = Number(input.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, error: "El monto debe ser un entero mayor a 0." };
  }
  if (!TYPES.includes(String(input.type))) {
    return { ok: false, error: "El tipo de pago es inválido." };
  }
  if (!METHODS.includes(String(input.method))) {
    return { ok: false, error: "El método de pago es inválido." };
  }
  if (!STATUSES.includes(String(input.status))) {
    return { ok: false, error: "El estatus del pago es inválido." };
  }

  // El motivo sólo existe mientras el pago está rechazado
  const reason = String(input.rejectionReason ?? "").trim();
  if (input.status === "rechazado" && !reason) {
    return { ok: false, error: "Indica el motivo del rechazo." };
  }

  return {
    ok: true,
    data: {
      amount,
      type: input.type as PaymentEdit["type"],
      method: input.method as PaymentEdit["method"],
      status: input.status as PaymentEdit["status"],
      rejectionReason: input.status === "rechazado" ? reason : null,
    },
  };
}
