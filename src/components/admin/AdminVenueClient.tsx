"use client";

import { motion } from "framer-motion";
import {
  Car,
  Coffee,
  ExternalLink,
  MapPin,
  Plus,
  Save,
  Shield,
  Trash2,
  Trees,
  Wifi,
} from "lucide-react";
import * as React from "react";
import { updateVenue } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const AVAILABLE_ICONS = [
  { id: "wifi", icon: <Wifi size={18} />, label: "Wi-Fi" },
  { id: "coffee", icon: <Coffee size={18} />, label: "Snacks" },
  { id: "parking", icon: <Car size={18} />, label: "Parking" },
  { id: "shield", icon: <Shield size={18} />, label: "Seguridad" },
  { id: "outdoor", icon: <Trees size={18} />, label: "Aire Libre" },
];

export function AdminVenueClient({ initialVenue }: { initialVenue: any }) {
  const [venue, setVenue] = React.useState(initialVenue);
  const [isSaving, setIsSaving] = React.useState(false);

  // Parse services from JSON string
  const [services, setServices] = React.useState<any[]>(() => {
    try {
      return venue.services ? JSON.parse(venue.services) : [];
    } catch (e) {
      return [];
    }
  });

  const [newService, setNewService] = React.useState({
    iconId: "wifi",
    label: "",
  });

  const handleAddService = () => {
    if (!newService.label) return;
    setServices([...services, newService]);
    setNewService({ iconId: "wifi", label: "" });
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateVenue({
      ...venue,
      services: JSON.stringify(services),
    });
    setIsSaving(false);
    alert("Sede actualizada correctamente");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Configuración Global
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Gestionar <span className="text-primary">Sede</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <DashboardCard title="Información Principal">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre de la Sede"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                />
                <Input
                  label="Sitio Web (Opcional)"
                  value={venue.websiteUrl || ""}
                  onChange={(e) =>
                    setVenue({ ...venue, websiteUrl: e.target.value })
                  }
                />
              </div>
              <Input
                label="Dirección Completa"
                value={venue.address}
                onChange={(e) =>
                  setVenue({ ...venue, address: e.target.value })
                }
              />
              <Input
                label="Google Maps URL"
                value={venue.mapsUrl}
                onChange={(e) =>
                  setVenue({ ...venue, mapsUrl: e.target.value })
                }
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Descripción de la Sede
                </label>
                <textarea
                  className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary/30 transition-all text-sm font-medium text-secondary"
                  value={venue.description}
                  onChange={(e) =>
                    setVenue({ ...venue, description: e.target.value })
                  }
                />
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <DashboardCard title="Amenidades y Servicios">
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
                <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                  Agregar Nueva Amenidad
                </p>
                <div className="flex gap-2">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setNewService({ ...newService, iconId: item.id })
                      }
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                        newService.iconId === item.id
                          ? "bg-primary text-secondary shadow-lg shadow-primary/20"
                          : "bg-white text-gray-400 border border-gray-100 hover:border-primary/30",
                      )}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre (ej. Wi-Fi de alta velocidad)"
                    value={newService.label}
                    onChange={(e) =>
                      setNewService({ ...newService, label: e.target.value })
                    }
                  />
                  <Button onClick={handleAddService} className="h-11 px-4">
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {
                          AVAILABLE_ICONS.find((i) => i.id === service.iconId)
                            ?.icon
                        }
                      </div>
                      <span className="text-xs font-black text-secondary uppercase tracking-tight">
                        {service.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Sin amenidades registradas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DashboardCard>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-sm"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? "Guardando..." : "Guardar Cambios en Sede"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
