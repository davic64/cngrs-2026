"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  MessageSquare, 
  Clock,
  Pin,
  CheckCircle2,
  ChevronRight,
  Megaphone,
  Send
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from "@/components/ui/Modal";

interface NotificationsClientProps {
  initialNotifications: any[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
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
      alert("Tu mensaje ha sido enviado al staff.");
    }, 1500);
  };

  const pinnedNotifs = initialNotifications.filter(n => n.isPinned);
  const recentNotifs = initialNotifications.filter(n => !n.isPinned);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 space-y-8 pb-32 md:pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left border-b border-gray-100 pb-8">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Centro de Noticias</p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Avisos <span className="text-primary">Oficiales</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Pinned Section */}
          {pinnedNotifs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-primary">
                <Pin size={14} className="fill-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Anuncios Importantes</h2>
              </div>
              {pinnedNotifs.map((notif) => (
                <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <DashboardCard className="bg-primary/5 border-primary/20 relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                      <Megaphone size={120} className="text-primary" />
                    </div>
                    <div className="flex gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary text-secondary flex items-center justify-center shrink-0 shadow-lg">
                        <Megaphone size={24} />
                      </div>
                      <div className="space-y-2 relative z-10 text-left">
                        <h3 className="text-lg font-black text-secondary uppercase tracking-tight leading-tight">{notif.title}</h3>
                        <p className="text-sm text-secondary/70 leading-relaxed font-medium line-clamp-2">{notif.message}</p>
                        <div className="pt-2">
                           <Button size="sm" className="h-9 px-6 text-[9px] font-black uppercase tracking-widest" onClick={() => openDetails(notif)}>Ver Detalles</Button>
                        </div>
                      </div>
                    </div>
                  </DashboardCard>
                </motion.div>
              ))}
            </section>
          )}

          {/* Regular Feed */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2 text-gray-400">
               <Clock size={14} />
               <h2 className="text-[10px] font-black uppercase tracking-widest">Feed de Noticias</h2>
            </div>
            
            <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {recentNotifs.length > 0 ? recentNotifs.map((notif, idx) => (
                <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <div className={cn("absolute -left-[21px] top-6 h-3 w-3 rounded-full border-2 border-white shadow-sm z-10", notif.type === 'urgent' ? "bg-red-500" : "bg-primary")} />
                  <div role="button" tabIndex={0} onClick={() => openDetails(notif)} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100 hover:border-primary/20 transition-all group cursor-pointer text-left">
                    <div className="flex gap-4 items-start">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", 
                        notif.type === 'urgent' ? "bg-red-50 text-red-500" : 
                        notif.type === 'info' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500")}>
                        {notif.type === 'urgent' ? <AlertTriangle size={18} /> : notif.type === 'info' ? <Info size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-secondary uppercase tracking-tight text-base group-hover:text-primary transition-colors">{notif.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{notif.message}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-200 mt-1 group-hover:text-primary transition-all" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center py-10">No hay avisos recientes</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <DashboardCard title="Ayuda">
             <div className="space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed">¿Dudas sobre el programa o problemas con tu acceso?</p>
                <Button variant="outline" className="w-full h-11 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsSupportModalOpen(true)}>Contactar Staff</Button>
             </div>
          </DashboardCard>

          <div className="bg-secondary rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-secondary/10">
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20"><CheckCircle2 size={32} className="text-primary" /></div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Gafete Digital</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">Validado</p>
             </div>
          </div>
        </aside>
      </div>

      {/* SUPPORT MODAL */}
      <Modal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)}>
        <ModalHeader onClose={() => setIsSupportModalOpen(false)}><ModalTitle className="text-2xl font-black uppercase tracking-tighter">Mandar <span className="text-primary">Mensaje</span></ModalTitle></ModalHeader>
        <ModalContent className="space-y-6 pt-4">
          <textarea className="w-full min-h-[120px] bg-white border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Describe tu duda aquí..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
        </ModalContent>
        <ModalFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setIsSupportModalOpen(false)}>Cancelar</Button>
          <Button className="flex-1" disabled={!supportMessage || isSending} onClick={handleSendSupport}>{isSending ? "Enviando..." : <><Send size={16} className="mr-2" /> Enviar</>}</Button>
        </ModalFooter>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        {selectedNotif && (
          <>
            <ModalHeader onClose={() => setIsDetailsModalOpen(false)}>
              <ModalTitle className="text-2xl font-black uppercase tracking-tighter leading-tight">{selectedNotif.title}</ModalTitle>
            </ModalHeader>
            <ModalContent className="space-y-6 pt-2">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-sm text-secondary/80 leading-relaxed font-medium">{selectedNotif.fullContent}</p>
              </div>
            </ModalContent>
            <ModalFooter><Button className="w-full" onClick={() => setIsDetailsModalOpen(false)}>Entendido</Button></ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
