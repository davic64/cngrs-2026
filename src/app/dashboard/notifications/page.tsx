"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Megaphone,
  MessageSquare,
  Pin,
  Send,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
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

const NOTIFICATIONS = [
  {
    id: 1,
    title: "¡Inscripciones a Talleres Abiertas!",
    message:
      "Ya puedes elegir tus talleres desde la sección de Agenda. El cupo es limitado para las sesiones de la tarde. Te recomendamos elegir pronto para asegurar tu lugar en los temas de tu interés.",
    fullContent:
      "Estamos emocionados de anunciar que el sistema de inscripción para los talleres del CNGRS26 ya está disponible. Podrás encontrar una variedad de temas que van desde liderazgo hasta tecnología y fe. Recuerda que cada taller tiene un cupo máximo de 50 personas para garantizar una experiencia personalizada. ¡No te quedes fuera!",
    type: "important",
    time: "Ahora",
    isPinned: true,
  },
  {
    id: 2,
    title: "Cambio de Auditorio",
    message:
      "La conferencia magistral de las 10:00 AM se ha movido al Auditorio Principal (Planta Alta).",
    fullContent:
      "Debido a la alta demanda y para mayor comodidad de todos los asistentes, la conferencia del Dr. Armando Guerra se llevará a cabo en el Auditorio Principal en lugar de la Sala B. Agradecemos su comprensión.",
    type: "urgent",
    time: "Hace 15 min",
    isPinned: false,
  },
  {
    id: 3,
    title: "Kit de Bienvenida",
    message:
      "Ya puedes recoger tu playera oficial y gafete en el lobby principal.",
    fullContent:
      "El área de registro estará entregando kits de bienvenida hasta las 6:00 PM. Es indispensable presentar tu código QR digital o el ID de registro para recibir tu material.",
    type: "info",
    time: "Hace 2 horas",
    isPinned: false,
  },
  {
    id: 4,
    title: "Cena de Bienvenida",
    message:
      "Te esperamos a las 8:00 PM en el jardín central para nuestra noche de apertura.",
    fullContent:
      "Preparamos una noche especial con música en vivo y una cena tradicional para dar inicio a este gran congreso. El punto de reunión es el jardín central del Centro de Convenciones.",
    type: "event",
    time: "Hace 5 horas",
    isPinned: false,
  },
];

export default function NotificationsPage() {
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedNotif, setSelectedNotif] = React.useState<any>(null);
  const [supportMessage, setSupportMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const openDetails = (notif: any) => {
    setSelectedNotif(notif);
    setIsDetailsModalOpen(true);
  };

  const handleSendSupport = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSupportModalOpen(false);
      setSupportMessage("");
      alert("Mensaje enviado al equipo de staff. Te contactaremos pronto.");
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 space-y-8 pb-32 md:pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left border-b border-gray-100 pb-8">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
            Centro de Noticias
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Avisos <span className="text-primary">Oficiales</span>
          </h1>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] font-black uppercase text-gray-400 hover:text-primary"
          >
            Marcar todo como leído
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-10">
          {/* Pinned Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-primary">
              <Pin size={14} className="fill-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest">
                Anuncio Fijado
              </h2>
            </div>
            {NOTIFICATIONS.filter((n) => n.isPinned).map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DashboardCard className="bg-primary/5 border-primary/20 relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                    <Megaphone size={120} className="text-primary" />
                  </div>
                  <div className="flex gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Megaphone size={24} />
                    </div>
                    <div className="space-y-2 relative z-10 text-left">
                      <h3 className="text-lg font-black text-secondary uppercase tracking-tight leading-tight">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-secondary/70 leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      <div className="pt-2 flex items-center gap-4">
                        <Button
                          size="sm"
                          className="h-9 px-6 text-[9px] font-black uppercase tracking-widest"
                          onClick={() => openDetails(notif)}
                        >
                          Ver Detalles
                        </Button>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </motion.div>
            ))}
          </section>

          {/* Regular Feed */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2 text-gray-400">
              <Clock size={14} />
              <h2 className="text-[10px] font-black uppercase tracking-widest">
                Recientes
              </h2>
            </div>

            <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {NOTIFICATIONS.filter((n) => !n.isPinned).map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div
                    className={cn(
                      "absolute -left-[21px] top-6 h-3 w-3 rounded-full border-2 border-white shadow-sm z-10",
                      notif.type === "urgent" ? "bg-red-500" : "bg-primary",
                    )}
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetails(notif)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && openDetails(notif)
                    }
                    className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 hover:border-primary/20 transition-all group cursor-pointer text-left"
                  >
                    <div className="flex gap-4 items-start">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                          notif.type === "urgent"
                            ? "bg-red-50 text-red-500"
                            : notif.type === "info"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-purple-50 text-purple-500",
                        )}
                      >
                        {notif.type === "urgent" ? (
                          <AlertTriangle size={18} />
                        ) : notif.type === "info" ? (
                          <Info size={18} />
                        ) : (
                          <MessageSquare size={18} />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-secondary uppercase tracking-tight text-base leading-none group-hover:text-primary transition-colors">
                            {notif.title}
                          </h3>
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          {notif.message}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-200 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6">
          <DashboardCard title="Ayuda">
            <div className="space-y-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                ¿Tienes dudas sobre el programa o problemas con tu acceso?
                Nuestro staff está listo para ayudarte.
              </p>
              <Button
                variant="outline"
                className="w-full h-11 text-[10px] font-black uppercase tracking-widest"
                onClick={() => setIsSupportModalOpen(true)}
              >
                Contactar Staff
              </Button>
            </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">
                Gafete Digital Validado
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">
                No necesitas imprimir nada
              </p>
            </div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </aside>
      </div>

      {/* SUPPORT MODAL */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      >
        <ModalHeader onClose={() => setIsSupportModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
            Mandar <span className="text-primary">Mensaje</span>
          </ModalTitle>
          <ModalDescription className="text-[10px] font-bold uppercase tracking-widest mt-2">
            Nuestro staff recibirá tu mensaje de inmediato
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-6 pt-4">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
              "Hola staff, necesito ayuda con mi registro en los talleres de la
              tarde..."
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">
                Tu Mensaje
              </label>
              <textarea
                className="w-full min-h-[120px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                placeholder="Escribe aquí tu duda o problema..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsSupportModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 shadow-lg shadow-primary/20"
            disabled={!supportMessage || isSending}
            onClick={handleSendSupport}
          >
            {isSending ? (
              "Enviando..."
            ) : (
              <>
                <Send size={16} className="mr-2" /> Enviar
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      >
        {selectedNotif && (
          <>
            <ModalHeader onClose={() => setIsDetailsModalOpen(false)}>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                    selectedNotif.type === "urgent"
                      ? "bg-red-100 text-red-600"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {selectedNotif.type}
                </span>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> {selectedNotif.time}
                </span>
              </div>
              <ModalTitle className="text-2xl font-black uppercase tracking-tighter leading-tight">
                {selectedNotif.title}
              </ModalTitle>
            </ModalHeader>
            <ModalContent className="space-y-6 pt-2">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-sm text-secondary/80 leading-relaxed font-medium">
                  {selectedNotif.fullContent}
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-3 border border-primary/10">
                <Info size={18} className="text-primary shrink-0" />
                <p className="text-[10px] font-bold text-secondary/60 uppercase leading-tight">
                  Esta es una notificación oficial enviada por el comité
                  organizador de CNGRS26.
                </p>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button
                className="w-full"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Entendido
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
