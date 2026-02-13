"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const PENDING_PAYMENTS = [
  {
    id: 1,
    user: "Juan Pérez",
    amount: 1000,
    method: "SPEI",
    date: "Hace 5 min",
    status: "revision",
  },
  {
    id: 2,
    user: "Ana Martínez",
    amount: 800,
    method: "Efectivo",
    date: "Hace 20 min",
    status: "revision",
  },
  {
    id: 3,
    user: "Luis Rodríguez",
    amount: 1000,
    method: "SPEI",
    date: "Hace 1 hora",
    status: "revision",
  },
];

interface Payment {
  id: number;
  user: string;
  amount: number;
  method: string;
  date: string;
  status: string;
}

export default function AdminPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(
    null,
  );

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Tesorería y Finanzas
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Validación de <span className="text-primary">Pagos</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Queue List */}
        <div className="lg:col-span-8 space-y-4">
          {PENDING_PAYMENTS.map((payment, idx) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-secondary uppercase tracking-tight">
                      {payment.user}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      {payment.method} •{" "}
                      <span className="text-primary">
                        ${payment.amount} MXN
                      </span>{" "}
                      • {payment.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-black uppercase text-primary"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    Ver Comprobante
                  </Button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <button
                      type="button"
                      className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Resumen SPEI">
            <div className="space-y-4">
              <StatRow label="Pendientes" value="12" color="amber" />
              <StatRow label="Aprobados hoy" value="45" color="green" />
              <StatRow
                label="Total Recaudado"
                value="$45,000"
                color="primary"
              />
            </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <FileText size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">
                Cierre de Caja
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2 mb-6">
                Genera el reporte diario de pagos
              </p>
              <Button className="w-full font-black uppercase text-[10px] tracking-widest">
                Descargar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPROBANTE MODAL */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      >
        <ModalHeader onClose={() => setSelectedPayment(null)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
            Comprobante de <span className="text-primary">Pago</span>
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-6 pt-4">
          <div className="bg-gray-100 rounded-[2rem] h-80 flex items-center justify-center relative overflow-hidden border-2 border-dashed border-gray-200">
            <FileText size={64} className="text-gray-300" />
            <p className="absolute bottom-6 text-[10px] font-black uppercase text-gray-400">
              Simulación de Imagen de Comprobante
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                Monto Declarado
              </p>
              <p className="text-lg font-black text-secondary">
                ${selectedPayment?.amount} MXN
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                Método
              </p>
              <p className="text-lg font-black text-secondary uppercase">
                {selectedPayment?.method}
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setSelectedPayment(null)}
          >
            Rechazar
          </Button>
          <Button
            className="flex-[2] shadow-lg shadow-primary/20"
            onClick={() => {
              alert("Pago aprobado con éxito");
              setSelectedPayment(null);
            }}
          >
            Aprobar Pago
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-black uppercase",
          color === "amber"
            ? "text-amber-600"
            : color === "green"
              ? "text-green-600"
              : "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
