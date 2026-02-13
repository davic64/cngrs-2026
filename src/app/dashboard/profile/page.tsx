"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Heart,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  const [healthData, setHealthData] = React.useState({
    alergias: "Ninguna",
    padecimiento: "Ninguna",
    medicamento: "Ninguno",
    dosisFrecuencia: "N/A",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const user = {
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "5512345678",
    email: "juan.perez@email.com",
    pais: "México",
    estado: "CDMX",
    talla: "Mediana (M)",
    tipoPago: "Pago Completo",
    id: "CNGRS-2026-042",
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Información de salud actualizada correctamente.");
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 space-y-8 pb-32 md:pb-12">
      <header className="text-center md:text-left">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Información de Cuenta
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Mi <span className="text-primary">Perfil</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Hero Card */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-white/10 rounded-3xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                <span className="text-4xl font-black text-primary">
                  {user.nombre[0]}
                </span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {user.nombre} {user.apellido}
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                {user.id}
              </p>

              <div className="mt-8 w-full bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Estatus de Pago
                    </p>
                    <p className="text-sm font-bold text-primary uppercase tracking-tight">
                      {user.tipoPago}
                    </p>
                  </div>
                  <ShieldCheck className="text-primary h-6 w-6" />
                </div>
              </div>
            </div>
          </motion.div>

          <DashboardCard className="p-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest border-b border-gray-50 pb-3">
                Resumen de Contacto
              </h3>
              <ProfileStaticItem
                icon={<Phone size={14} />}
                label="Teléfono"
                value={user.telefono}
              />
              <ProfileStaticItem
                icon={<Mail size={14} />}
                label="Email"
                value={user.email}
              />
              <ProfileStaticItem
                icon={<MapPin size={14} />}
                label="Origen"
                value={`${user.pais}, ${user.estado}`}
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column - Data Sections */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-secondary uppercase tracking-tighter">
                Datos Personales
              </h3>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <Lock size={12} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Solo Lectura
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReadOnlyField label="Nombre(s)" value={user.nombre} />
              <ReadOnlyField label="Apellido(s)" value={user.apellido} />
              <ReadOnlyField label="Talla de Playera" value={user.talla} />
              <ReadOnlyField label="ID de Registro" value={user.id} />

              <div className="sm:col-span-2 mt-2">
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest bg-gray-50 p-3 rounded-xl border border-gray-100">
                  ⚠️ Estos datos fueron validados durante tu registro y no pueden
                  ser modificados.
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="border-primary/20 shadow-primary/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-secondary uppercase tracking-tighter">
                  Información Médica
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actualiza estos datos si es necesario
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Alergias"
                  placeholder="Ej. Penicilina, Polen..."
                  value={healthData.alergias}
                  onChange={(e) =>
                    setHealthData({ ...healthData, alergias: e.target.value })
                  }
                />
                <Input
                  label="Padecimientos"
                  placeholder="Ej. Asma, Diabetes..."
                  value={healthData.padecimiento}
                  onChange={(e) =>
                    setHealthData({
                      ...healthData,
                      padecimiento: e.target.value,
                    })
                  }
                />
                <Input
                  label="Medicamento"
                  placeholder="Nombre del medicamento"
                  value={healthData.medicamento}
                  onChange={(e) =>
                    setHealthData({
                      ...healthData,
                      medicamento: e.target.value,
                    })
                  }
                />
                <Input
                  label="Dosis / Frecuencia"
                  placeholder="Ej. 1 cada 8 horas"
                  value={healthData.dosisFrecuencia}
                  onChange={(e) =>
                    setHealthData({
                      ...healthData,
                      dosisFrecuencia: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto h-12 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
                >
                  {isSaving ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Guardar Información
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DashboardCard>

          <div className="p-6 bg-blue-50 rounded-[2rem] flex items-start gap-4 border border-blue-100">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-blue-500">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
                Nota Médica
              </p>
              <p className="text-xs leading-relaxed text-blue-900/70 font-medium italic">
                En caso de emergencia, nuestro equipo médico consultará esta
                información. Por favor, asegúrate de que sea lo más precisa
                posible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStaticItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="text-gray-300 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-xs font-bold text-secondary uppercase tracking-tight">
        {value}
      </span>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </p>
      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm font-bold text-secondary/50 select-none">
        {value}
      </div>
    </div>
  );
}
