"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  History,
  MapPin,
  QrCode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { DashboardAction } from "@/components/dashboard/DashboardAction";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EventItem } from "@/components/dashboard/EventItem";
// Components
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// Variants for fluid animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98], // Smooth custom cubic-bezier
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [paymentFile, setPaymentFile] = React.useState<File | null>(null);
  const [isValidationPending, setIsValidationPending] = React.useState(false);

  // Mock data
  const user = {
    nombre: "Juan",
    apellido: "Pérez",
    status: "pendiente",
    id: "CNGRS-2026-042",
    metodoPago: "transferencia", // 'transferencia' (SPEI) or 'efectivo'
    montoPendiente: 1000,
    fechaLimitePrecio: "15 de Octubre",
  };

  const nextEvents = [
    {
      id: 1,
      title: "Conferencia Magistral: El Futuro es Hoy",
      speaker: "Dr. Armando Guerra",
      time: "10:00 AM",
      location: "Auditorio Principal",
    },
    {
      id: 2,
      title: "Taller: Liderazgo Transformador",
      speaker: "Mtra. Paz Ensuera",
      time: "12:30 PM",
      location: "Sala B",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPaymentFile(file);
  };

  const handleUpload = () => {
    setIsValidationPending(true);
    setIsStatusModalOpen(false);
  };

  // Determine current display status
  const currentStatus = isValidationPending ? "validacion" : user.status;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 pb-32 md:pb-12">
      <header className="mb-8 md:mb-12">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
            Panel de Control
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Hola, <span className="text-primary">{user.nombre}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
          >
            <h2 className="text-sm font-black text-secondary/40 uppercase tracking-[0.2em] mb-6">
              Pase de Acceso Digital
            </h2>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsQRModalOpen(true)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setIsQRModalOpen(true)
              }
              className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-100 mb-6 transform transition-all hover:scale-105 hover:border-primary/30 duration-500 cursor-zoom-in group"
            >
              <QrCode
                size={180}
                className="text-secondary group-hover:text-primary transition-colors"
              />
            </div>

            <div className="space-y-1 mb-8">
              <p className="text-2xl font-black text-secondary uppercase tracking-tighter">
                {user.id}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Muestra este código al ingresar
              </p>
            </div>

            <Button
              className="w-full h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              onClick={() => alert("Generando PDF...")}
            >
              <Download size={16} className="mr-2" />
              Descargar Boleto
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
                  : currentStatus === "parcial"
                    ? "bg-white text-blue-600"
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
                Estatus de Registro
              </p>
              <p className="font-black uppercase tracking-tighter text-lg leading-none">
                {currentStatus === "completado"
                  ? "Validado y Pagado"
                  : currentStatus === "parcial"
                    ? "Parcialmente Pagado"
                    : currentStatus === "validacion"
                      ? "Validación Pendiente"
                      : "Pendiente de Pago"}
              </p>
            </div>
            <ChevronRight size={20} className="opacity-30" />
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6 lg:space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <DashboardAction
              icon={<Calendar />}
              label="Ver Agenda"
              color="blue"
              onClick={() => router.push("/dashboard/agenda")}
            />
            <DashboardAction
              icon={<MapPin />}
              label="Mapa Sede"
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
                className="text-[10px] font-black uppercase tracking-widest text-primary p-0 h-auto hover:bg-transparent"
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

          <div className="bg-secondary rounded-[2rem] p-6 text-white/90 flex items-start gap-4 shadow-xl">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Tip del Congreso
              </p>
              <p className="text-xs leading-relaxed font-medium">
                Llega 15 minutos antes a tus talleres preferidos, el cupo es
                limitado y se llena rápido.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)}>
        <ModalHeader onClose={() => setIsQRModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter text-center">
            Pase de <span className="text-primary">Acceso</span>
          </ModalTitle>
          <ModalDescription className="text-center font-bold uppercase text-[10px] tracking-widest mt-2">
            ID: {user.id}
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="flex flex-col items-center justify-center py-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-inner border-4 border-gray-50 mb-6">
            <QrCode size={260} className="text-secondary" />
          </div>
          <p className="font-black text-secondary text-3xl tracking-tighter uppercase">
            {user.id}
          </p>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={() => setIsQRModalOpen(false)}
            className="w-full h-12 uppercase font-black text-xs tracking-widest"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      >
        <ModalHeader onClose={() => setIsStatusModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter text-center">
            Estado de <span className="text-primary">Pago</span>
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-6 pt-2">
          {currentStatus === "completado" && (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-black text-secondary uppercase tracking-tighter">
                ¡Todo en Orden!
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Tu registro ha sido validado correctamente.
              </p>
            </div>
          )}

          {currentStatus === "validacion" && (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100">
                <History size={48} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-secondary uppercase tracking-tighter">
                En Validación
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Hemos recibido tu comprobante. Nuestro staff lo validará en un
                lapso de 24 a 48 horas. Recibirás un aviso por SMS.
              </p>
            </div>
          )}

          {(currentStatus === "parcial" || currentStatus === "pendiente") && (
            <div className="space-y-6">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                <div className="flex gap-3 items-start">
                  <Clock className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">
                      Tiempo Restante para Pagar
                    </p>
                    <CountdownDisplay type={user.metodoPago} />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-amber-900/60 uppercase leading-tight">
                  Seleccionaste pago vía{" "}
                  {user.metodoPago === "transferencia"
                    ? "SPEI / Transferencia"
                    : "Efectivo"}
                  . Sube tu comprobante antes de que expire el tiempo.
                </p>
              </div>

              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-red-700 uppercase leading-tight">
                    Límite de precio actual: {user.fechaLimitePrecio}
                  </p>
                  <p className="text-[9px] font-bold text-red-600 uppercase mt-0.5 opacity-70">
                    El costo subirá $200 MXN después de esta fecha.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                  Monto a Pagar:
                </span>
                <span className="text-xl font-black text-primary">
                  ${user.montoPendiente} MXN
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">
                  Subir Comprobante
                </p>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {paymentFile
                        ? paymentFile.name
                        : "Tomar foto o elegir archivo"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          {(currentStatus === "parcial" || currentStatus === "pendiente") && (
            <Button
              className="w-full h-12 uppercase font-black text-xs tracking-widest shadow-xl shadow-primary/20"
              disabled={!paymentFile}
              onClick={handleUpload}
            >
              Enviar para Validación
            </Button>
          )}
          {(currentStatus === "validacion" ||
            currentStatus === "completado") && (
            <Button
              className="w-full h-12 uppercase font-black text-xs tracking-widest"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cerrar
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

function CountdownDisplay({ type }: { type: string }) {
  // Initial seconds based on type: 3h for transfer, 24h for cash
  const initialSeconds = type === "transferencia" ? 3 * 3600 : 24 * 3600;
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => (v < 10 ? `0${v}` : v)).join(":");
  };

  return (
    <p className="text-2xl font-black text-amber-600 tracking-tighter tabular-nums">
      {formatTime(seconds)}
    </p>
  );
}
