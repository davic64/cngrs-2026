"use client";

import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  History,
  Lock,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import * as React from "react";
import { DashboardAction } from "@/components/dashboard/DashboardAction";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EventItem } from "@/components/dashboard/EventItem";
// Components
import { Button } from "@/components/ui/Button";
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
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

interface DashboardClientProps {
  user: any;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [paymentFile, setPaymentFile] = React.useState<File | null>(null);
  const [isValidationPending, setIsValidationPending] = React.useState(
    user.lastPayment?.status === "revision",
  );

  const qrRef = React.useRef<SVGSVGElement>(null);

  const nextEvents = [
    {
      id: 1,
      title: "Conferencia Magistral",
      speaker: "Dr. Armando Guerra",
      time: "10:00 AM",
      location: "Auditorio Principal",
    },
    {
      id: 2,
      title: "Taller: Liderazgo",
      speaker: "Mtra. Paz Ensuera",
      time: "12:30 PM",
      location: "Sala B",
    },
  ];

  const handleUpload = () => {
    setIsValidationPending(true);
    setIsStatusModalOpen(false);
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
                    Se activará al validar tu pago
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
              {nextEvents.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <EventItem {...event} />
                </motion.div>
              ))}
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
              <p className="text-sm text-gray-500">
                Estamos validando tu comprobante. Te avisaremos pronto.
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                <Clock className="text-amber-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase text-amber-700 mb-1">
                    Pago Pendiente
                  </p>
                  <p className="text-xs font-bold text-amber-900/70">
                    Sube tu comprobante para que podamos validar tu acceso.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">
                  Subir Comprobante
                </p>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50">
                  <Camera className="h-8 w-8 text-primary mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    {paymentFile ? paymentFile.name : "Subir archivo"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setPaymentFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
              <Button
                className="w-full h-12 font-black uppercase text-xs"
                disabled={!paymentFile}
                onClick={handleUpload}
              >
                Enviar Comprobante
              </Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
