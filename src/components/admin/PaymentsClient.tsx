"use client";

import { motion } from "framer-motion";
import { Clock, FileText } from "lucide-react";
import * as React from "react";
import { validatePayment } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

interface PaymentsClientProps {
  initialPayments: any[];
}

export function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [selectedPayment, setSelectedPayment] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleValidation = async (status: "completado" | "rechazado") => {
    if (!selectedPayment) return;
    setIsProcessing(true);

    const result = await validatePayment(selectedPayment.id, status);

    if (result.success) {
      alert(
        `Pago ${status === "completado" ? "aprobado" : "rechazado"} correctamente.`,
      );
      setSelectedPayment(null);
    } else {
      alert("Error al procesar la validación.");
    }
    setIsProcessing(false);
  };

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
        <div className="lg:col-span-8 space-y-4">
          {initialPayments.length > 0 ? (
            initialPayments.map((payment, idx) => (
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
                        {payment.user?.firstName} {payment.user?.lastName}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        {payment.method} •{" "}
                        <span className="text-primary">
                          ${payment.amount} MXN
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-black uppercase text-primary"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    Revisar Comprobante
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 italic text-gray-400 uppercase font-black text-xs tracking-widest">
              No hay pagos pendientes de revisión
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Instrucciones">
            <p className="text-xs text-gray-500 leading-relaxed">
              Al aprobar un pago completo, el estatus del asistente cambiará
              automáticamente a <strong>Validado</strong> y se le notificará vía
              correo/SMS.
            </p>
          </DashboardCard>
        </div>
      </div>

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      >
        <ModalHeader onClose={() => setSelectedPayment(null)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter text-center">
            Revisar <span className="text-primary">Comprobante</span>
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-6 pt-4">
          <div className="bg-gray-100 rounded-[2rem] h-80 flex flex-col items-center justify-center relative overflow-hidden border-2 border-dashed border-gray-200">
            {selectedPayment?.proofUrl ? (
              <img
                src={selectedPayment.proofUrl}
                className="w-full h-full object-contain"
                alt="Comprobante"
              />
            ) : (
              <>
                <FileText size={64} className="text-gray-300" />
                <p className="text-[10px] font-black uppercase text-gray-400 mt-4">
                  Imagen no disponible
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                Monto a Validar
              </p>
              <p className="text-lg font-black text-secondary">
                ${selectedPayment?.amount} MXN
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                Tipo
              </p>
              <p className="text-lg font-black text-primary uppercase">
                {selectedPayment?.type}
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 text-red-500 hover:bg-red-50"
            disabled={isProcessing}
            onClick={() => handleValidation("rechazado")}
          >
            Rechazar
          </Button>
          <Button
            className="flex-[2] shadow-lg shadow-primary/20"
            disabled={isProcessing}
            onClick={() => handleValidation("completado")}
          >
            {isProcessing ? "Procesando..." : "Aprobar Pago"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
