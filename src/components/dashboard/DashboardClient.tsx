"use client";

import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  AlertCircle,
  Banknote,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  History,
  Lock,
  MapPin,
  Megaphone,
  Pin,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import * as React from "react";
import { createCheckoutSessionForBalance, uploadManualPaymentProof } from "@/app/actions/stripe";
import { DashboardAction } from "@/components/dashboard/DashboardAction";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EventItem } from "@/components/dashboard/EventItem";
// Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

interface DashboardClientProps {
  user: any;
  upcomingEvents: any[];
  config: any;
  pinnedNotifications?: any[];
}

export function DashboardClient({ 
  user, 
  upcomingEvents, 
  config,
  pinnedNotifications = []
}: DashboardClientProps) {
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentFile, setPaymentFile] = React.useState<File | null>(null);
  const [balanceMethod, setBalanceMethod] = React.useState<"tarjeta" | "transferencia" | "efectivo">("tarjeta");
  
  const [isValidationPending, setIsValidationPending] = React.useState(
    user.payments?.some((p: any) => p.status === "revision") || false
  );

  // Calcular balance
  const totalRequired = config?.fullPaymentPrice || 1500;
  const totalPaid = user.payments
    ?.filter((p: any) => p.status === "completado")
    .reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
  
  const balance = totalRequired - totalPaid;
  const isFullyPaid = balance <= 0;

  const qrRef = React.useRef<SVGSVGElement>(null);

  const handleBalancePayment = async () => {
    setIsProcessing(true);
    if (balanceMethod === "tarjeta") {
      const result = await createCheckoutSessionForBalance(user.id, balance);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error);
        setIsProcessing(false);
      }
    } else {
      if (!paymentFile) {
        alert("Por favor sube tu comprobante");
        setIsProcessing(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", paymentFile);
      formData.append("method", balanceMethod);
      
      const result = await uploadManualPaymentProof(user.id, balance, formData);
      if (result.success) {
        alert("Comprobante enviado. El staff lo revisará pronto.");
        setIsStatusModalOpen(false);
        setIsValidationPending(true);
      } else {
        alert(result.error);
      }
      setIsProcessing(false);
    }
  };

  const currentStatus = isValidationPending
    ? "validacion"
    : user.registrationStatus;

  const downloadTicket = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    // Colores de la marca
    const primaryColor = [56, 178, 178]; // #38b2b2
    const secondaryColor = [21, 27, 46]; // #151b2e

    // Fondo y diseño
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 148, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CNGRS 26", 15, 25);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.text("PASE DIGITAL DE ACCESO", 15, 32);

    // Datos del Usuario
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.text(`${user.firstName} ${user.lastName}`, 15, 60);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("ID DE REGISTRO:", 15, 68);
    doc.setTextColor(0, 0, 0);
    doc.text(user.phone, 15, 73);

    doc.setTextColor(150, 150, 150);
    doc.text("ESTATUS:", 80, 68);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(currentStatus.toUpperCase(), 80, 73);

    // Espacio para el QR
    doc.setDrawColor(230, 230, 230);
    doc.rect(39, 90, 70, 70);

    // Obtener la imagen del QR desde el DOM
    const svg = qrRef.current;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        doc.addImage(pngUrl, "PNG", 44, 95, 60, 60);
        doc.save(`Ticket_CNGRS26_${user.firstName}.pdf`);
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 pb-32 md:pb-12">
      {/* QR Oculto para exportación */}
      <div className="sr-only">
        <QRCodeSVG value={user.id} size={200} ref={qrRef} />
      </div>

      <header className="mb-8 md:mb-12">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
            Panel de Control
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Hola, <span className="text-primary">{user.firstName}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative"
          >
            <h2 className="text-sm font-black text-secondary/40 uppercase tracking-[0.2em] mb-6">
              Pase Digital
            </h2>

            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                currentStatus === "completado" && setIsQRModalOpen(true)
              }
              className={cn(
                "p-6 rounded-[2rem] border-2 border-dashed mb-6 transition-all relative overflow-hidden group",
                currentStatus === "completado"
                  ? "bg-gray-50 border-gray-100 hover:scale-105 cursor-zoom-in"
                  : "bg-gray-100 border-gray-200 cursor-not-allowed grayscale",
              )}
            >
              {currentStatus === "completado" ? (
                <QRCodeSVG
                  value={user.id}
                  size={180}
                  className="text-secondary group-hover:text-primary transition-colors"
                />
              ) : (
                <div className="w-[180px] h-[180px] flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Lock size={32} className="text-gray-300" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                    Se activará al completar tu pago
                  </p>
                </div>
              )}
            </div>

            <p
              className={cn(
                "text-2xl font-black uppercase tracking-tighter mb-8",
                currentStatus === "completado"
                  ? "text-secondary"
                  : "text-gray-300",
              )}
            >
              {currentStatus === "completado" ? user.phone : "ID BLOQUEADO"}
            </p>

            <Button
              className="w-full h-12 font-black uppercase text-xs shadow-xl shadow-primary/20"
              onClick={downloadTicket}
              disabled={currentStatus !== "completado"}
            >
              {currentStatus === "completado" ? (
                <>
                  <Download size={16} className="mr-2" /> Descargar Boleto
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" /> No disponible
                </>
              )}
            </Button>
          </motion.div>

          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className={cn(
              "w-full p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all hover:scale-[1.02] cursor-pointer text-left",
              currentStatus === "completado"
                ? "bg-green-50 border-green-100 text-green-700"
                : currentStatus === "parcial"
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : currentStatus === "validacion"
                    ? "bg-gray-50 border-gray-200 text-gray-600"
                    : "bg-amber-50 border-amber-100 text-amber-700",
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                currentStatus === "completado"
                  ? "bg-white text-green-600"
                  : currentStatus === "validacion"
                    ? "bg-white text-gray-400"
                    : "bg-white text-amber-600",
              )}
            >
              {currentStatus === "completado" ? (
                <CheckCircle2 size={24} />
              ) : currentStatus === "validacion" ? (
                <History size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Estatus
              </p>
              <p className="font-black uppercase text-lg leading-none">
                {currentStatus === "completado"
                  ? "Validado"
                  : currentStatus === "validacion"
                    ? "En Revisión"
                    : "Pendiente"}
              </p>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6 lg:space-y-8">
          {/* Avisos Fijados */}
          {pinnedNotifications.length > 0 && (
            <div className="space-y-4">
              {pinnedNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] relative overflow-hidden group"
                >
                  <div className="absolute top-4 right-6 opacity-20">
                    <Pin size={16} className="text-primary fill-primary rotate-45" />
                  </div>
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Megaphone size={20} className="text-secondary" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-[11px] font-medium text-secondary/70 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push("/dashboard/notifications")}
                      className="h-8 w-8 rounded-lg bg-white/50 flex items-center justify-center text-primary hover:bg-white transition-colors mt-1"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <DashboardAction
              icon={<Calendar />}
              label="Agenda"
              color="blue"
              onClick={() => router.push("/dashboard/agenda")}
            />
            <DashboardAction
              icon={<MapPin />}
              label="Sede"
              color="purple"
              onClick={() => router.push("/dashboard/venue")}
            />
          </div>

          {/* Sección de Liquidación de Pago */}
          {!isFullyPaid && !isValidationPending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <DashboardCard className="bg-amber-50 border-amber-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Banknote size={120} className="text-amber-600" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                    <Banknote size={32} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">
                      Liquidación Pendiente
                    </h3>
                    <p className="text-xs font-bold text-amber-800/60 uppercase tracking-widest mt-1">
                      Saldo por pagar: <span className="text-amber-600 font-black text-sm">${balance} MXN</span>
                    </p>
                  </div>
                  <Button 
                    className="w-full sm:w-auto h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-200"
                    onClick={() => setIsStatusModalOpen(true)}
                  >
                    Liquidar Ahora
                  </Button>
                </div>
              </DashboardCard>
            </motion.div>
          )}

          <DashboardCard
            title="Mi Agenda Hoy"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black text-primary p-0 h-auto"
                onClick={() => router.push("/dashboard/agenda")}
              >
                Ver todo
              </Button>
            }
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <motion.div key={event.id} variants={itemVariants}>
                    <EventItem {...event} />
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    No hay actividades programadas
                  </p>
                </div>
              )}
            </motion.div>
          </DashboardCard>
        </div>
      </div>

      {/* QR ZOOM MODAL */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)}>
        <ModalHeader onClose={() => setIsQRModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase text-center tracking-tighter">
            Tu Pase
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="flex flex-col items-center justify-center py-8">
          <QRCodeSVG value={user.id} size={260} className="text-secondary" />
          <p className="font-black text-2xl mt-6 uppercase">{user.phone}</p>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={() => setIsQRModalOpen(false)}
            className="w-full h-12 uppercase font-black text-xs"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      {/* STATUS MODAL */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      >
        <ModalHeader onClose={() => setIsStatusModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase text-center tracking-tighter">
            Estado de Pago
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-6 pt-2 text-center">
          {currentStatus === "completado" ? (
            <div className="space-y-4 py-4">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-black uppercase text-secondary">
                ¡Registro Exitoso!
              </h3>
              <p className="text-sm text-gray-500">
                Ya estás listo para el CNGRS26.
              </p>
            </div>
          ) : currentStatus === "validacion" ? (
            <div className="space-y-4 py-4">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto animate-pulse">
                <History size={48} />
              </div>
              <h3 className="text-xl font-black uppercase text-secondary">
                En Revisión
              </h3>
              <p className="text-sm text-gray-500 font-medium px-4">
                Estamos validando tu último pago. En cuanto el staff lo apruebe, se actualizará tu saldo.
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                  <Banknote size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-amber-700 mb-1">
                    Monto a Liquidar
                  </p>
                  <p className="text-xl font-black text-amber-900 leading-none">
                    ${balance} MXN
                  </p>
                  {config?.priceDeadline && (
                    <p className="text-[9px] font-bold text-primary uppercase mt-2 tracking-widest">
                      Vence el {new Date(config.priceDeadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Selector de Método */}
              <div className="grid grid-cols-3 gap-2">
                {(["tarjeta", "transferencia", "efectivo"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setBalanceMethod(method)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      balanceMethod === method
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-white border-gray-100 text-gray-400 hover:border-primary/30"
                    )}
                  >
                    <span className="text-[9px] font-black uppercase tracking-tighter">{method}</span>
                  </button>
                ))}
              </div>

              {balanceMethod !== "tarjeta" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-3">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Instrucciones de Pago</p>
                    {balanceMethod === "transferencia" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Banco</span>
                          <span className="text-xs font-black text-secondary">{config.bankName || "BBVA"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">CLABE</span>
                          <span className="text-xs font-black text-secondary tracking-tighter">{config.bankCLABE || "0123 4567 8901 2345 67"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Nombre</span>
                          <span className="text-[10px] font-black text-primary uppercase text-right leading-tight">{config.bankHolder || "JIDI Internacional A.C."}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center py-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Referencia de Pago (OXXO)</p>
                        <p className="text-3xl font-black text-primary tracking-tighter">
                          {config.oxxoReference === "Tu número de teléfono" ? user.phone : config.oxxoReference}
                        </p>
                        <p className="text-[9px] font-medium text-gray-500 leading-relaxed italic px-4">
                          Menciona esta referencia al cajero para realizar tu depósito en efectivo.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all group">
                      <Upload className="h-6 w-6 text-primary mb-2 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-black text-gray-400 uppercase text-center px-4">
                        {paymentFile ? paymentFile.name : "Subir comprobante de pago"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none">
                      Pago seguro con Stripe
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      label="Número de Tarjeta"
                      placeholder="0000 0000 0000 0000"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Vencimiento" placeholder="MM/YY" />
                      <Input label="CVV" placeholder="123" />
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 font-medium text-center px-4 leading-relaxed italic">
                    Al hacer clic, serás redirigido para confirmar la transacción de forma segura.
                  </p>
                </div>
              )}

              <Button
                className="w-full h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
                disabled={isProcessing || (balanceMethod !== "tarjeta" && !paymentFile)}
                onClick={handleBalancePayment}
              >
                {isProcessing ? "Procesando..." : balanceMethod === "tarjeta" ? "Liquidar con Tarjeta" : "Enviar Comprobante"}
              </Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
