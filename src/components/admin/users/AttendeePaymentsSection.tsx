"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { deletePayment } from "@/app/actions/admin-payments";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PaymentEditorModal, type PaymentRow } from "./PaymentEditorModal";

type Props = {
  userId: string;
  payments: PaymentRow[];
  onChanged: () => void;
};

export function AttendeePaymentsSection({
  userId,
  payments,
  onChanged,
}: Props) {
  // `payment: null` = alta manual; `null` = modal cerrado
  const [editing, setEditing] = React.useState<{
    payment: PaymentRow | null;
  } | null>(null);

  const handleDelete = async (payment: PaymentRow) => {
    if (
      !confirm(
        `¿Eliminar el pago de $${payment.amount.toLocaleString("es-MX")} MXN? Se borra también su comprobante.`,
      )
    )
      return;
    const result = await deletePayment(payment.id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    onChanged();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">
            Historial de Pagos
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] font-black uppercase tracking-widest"
            onClick={() => setEditing({ payment: null })}
          >
            <Plus size={14} className="mr-1" /> Agregar pago
          </Button>
        </div>
        <div className="space-y-3">
          {payments.length > 0 ? (
            [...payments]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((payment) => {
                const statusConfig: Record<
                  string,
                  {
                    label: string;
                    textColor: string;
                    bgColor: string;
                    icon: React.ReactNode;
                  }
                > = {
                  completado: {
                    label: "Aprobado",
                    textColor: "text-green-600",
                    bgColor: "bg-green-50",
                    icon: <CheckCircle2 size={16} />,
                  },
                  revision: {
                    label: "En Revisión",
                    textColor: "text-amber-600",
                    bgColor: "bg-amber-50",
                    icon: <Clock size={16} />,
                  },
                  pendiente: {
                    label: "Pendiente",
                    textColor: "text-gray-400",
                    bgColor: "bg-gray-100",
                    icon: <Clock size={16} />,
                  },
                  rechazado: {
                    label: "Rechazado",
                    textColor: "text-red-500",
                    bgColor: "bg-red-50",
                    icon: <AlertCircle size={16} />,
                  },
                };
                const typeLabel: Record<string, string> = {
                  completo: "Pago Completo",
                  inscripcion: "Inscripción",
                };
                const methodLabel: Record<string, string> = {
                  tarjeta: "Tarjeta",
                  transferencia: "Transferencia",
                  efectivo: "Efectivo",
                };
                const status =
                  statusConfig[payment.status] ?? statusConfig.pendiente;
                return (
                  <div
                    key={payment.id}
                    className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                          status.bgColor,
                          status.textColor,
                        )}
                      >
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary uppercase tracking-tight">
                          ${payment.amount.toLocaleString("es-MX")} MXN
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {typeLabel[payment.type] ?? payment.type} •{" "}
                          {methodLabel[payment.method] ?? payment.method}
                        </p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "es-MX",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl",
                          status.bgColor,
                          status.textColor,
                        )}
                      >
                        {status.label}
                      </span>
                      <button
                        type="button"
                        title="Editar pago"
                        onClick={() => setEditing({ payment })}
                        className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        title="Eliminar pago"
                        onClick={() => handleDelete(payment)}
                        className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                      {payment.proofUrl && payment.status !== "rechazado" && (
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-all"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Sin pagos registrados
              </p>
            </div>
          )}
        </div>
      </div>

      <PaymentEditorModal
        userId={userId}
        payment={editing?.payment ?? null}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSaved={onChanged}
      />
    </>
  );
}
