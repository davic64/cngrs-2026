"use client";

import { motion } from "framer-motion";
import { Banknote, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";

interface Payment {
  id: number;
  amount: number;
  type: string;
  method: "tarjeta" | "transferencia" | "efectivo";
  status: "pendiente" | "revision" | "completado" | "rechazado";
  proofUrl: string | null;
  createdAt: Date;
}

interface PaymentsClientProps {
  payments: any[];
}

export function PaymentsClient({ payments }: PaymentsClientProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completado":
        return <CheckCircle2 size={20} className="text-green-500" />;
      case "revision":
      case "pendiente":
        return <Clock size={20} className="text-amber-500" />;
      case "rechazado":
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completado":
        return "Completado";
      case "revision":
        return "En Revisión";
      case "pendiente":
        return "Pendiente";
      case "rechazado":
        return "Rechazado";
      default:
        return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "tarjeta":
        return "Tarjeta (Stripe)";
      case "transferencia":
        return "Transferencia SPEI";
      case "efectivo":
        return "Efectivo (OXXO)";
      default:
        return method;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Historial Financiero
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Mis <span className="text-primary">Pagos</span>
        </h1>
      </header>

      <DashboardCard title="Historial de Transacciones">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Concepto
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Método
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Monto
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Estatus
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Prueba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Banknote size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      No hay pagos registrados
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-secondary">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(payment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-secondary uppercase tracking-tighter">
                        {payment.type === "completo"
                          ? "Pago Total"
                          : payment.type === "inscripcion"
                            ? "Inscripción"
                            : "Abono"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {getMethodText(payment.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-secondary">
                        ${payment.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(payment.status)}
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-tighter",
                            payment.status === "completado"
                              ? "text-green-600"
                              : payment.status === "rechazado"
                                ? "text-red-600"
                                : "text-amber-600",
                          )}
                        >
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payment.proofUrl ? (
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                        >
                          <FileText size={16} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <Banknote size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">
            Nota sobre comisiones
          </h4>
          <p className="text-[10px] text-blue-700/70 leading-relaxed mt-1">
            Los pagos realizados con tarjeta incluyen una comisión por
            procesamiento de Stripe. El monto mostrado aquí es el valor neto
            aplicado a tu registro.
          </p>
        </div>
      </div>
    </div>
  );
}
