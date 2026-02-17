"use client";

import { motion } from "framer-motion";
import {
  Lock,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProfileClientProps {
  user: any;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [healthData, setHealthData] = React.useState({
    alergias: user.healthInfo?.allergies || "Ninguna",
    padecimiento: user.healthInfo?.conditions || "Ninguna",
    medicamento: user.healthInfo?.medications || "Ninguno",
    dosisFrecuencia: user.healthInfo?.dosageFrequency || "N/A",
  });
  const [isSaving, setIsSaving] = React.useState(false);

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
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-white rounded-3xl overflow-hidden mb-4 border border-white/20 shadow-inner flex items-center justify-center">
                {user.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    className="w-full h-full object-cover"
                    alt="Perfil"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary">
                    {user.firstName[0]}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                {user.phone}
              </p>
              <div className="mt-8 w-full bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Estatus
                    </p>
                    <p className="text-sm font-bold text-primary uppercase tracking-tight">
                      {user.registrationStatus}
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
                Resumen
              </h3>
              <ProfileStaticItem
                icon={<Phone size={14} />}
                label="Teléfono"
                value={user.phone}
              />
              <ProfileStaticItem
                icon={<MapPin size={14} />}
                label="Origen"
                value={`${user.country}, ${user.state}`}
              />
              <ProfileStaticItem
                icon={<UserIcon size={14} />}
                label="Emergencia"
                value={user.emergencyContact?.name || "No registrado"}
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard title="Datos Personales">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full w-fit mb-6">
              <Lock size={12} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Solo Lectura
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReadOnlyField
                label="Nombre Completo"
                value={`${user.firstName} ${user.lastName}`}
              />
              <ReadOnlyField label="Talla de Playera" value={user.shirtSize} />
              <ReadOnlyField label="Edad" value={`${user.age} años`} />
              <ReadOnlyField label="Género" value={user.gender} />
            </div>
          </DashboardCard>

          <DashboardCard
            className="border-primary/20 shadow-primary/5"
            title="Información Médica"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Alergias"
                  value={healthData.alergias}
                  onChange={(e) =>
                    setHealthData({ ...healthData, alergias: e.target.value })
                  }
                />
                <Input
                  label="Padecimientos"
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
                  className="w-full sm:w-auto h-12 px-10 font-black uppercase text-xs shadow-xl shadow-primary/20"
                >
                  {isSaving ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save size={16} className="mr-2" /> Guardar Información
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DashboardCard>
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-gray-300">{icon}</div>
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
      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm font-bold text-secondary/50">
        {value}
      </div>
    </div>
  );
}
