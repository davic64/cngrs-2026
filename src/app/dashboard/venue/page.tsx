import {
  Car,
  Coffee,
  ExternalLink,
  MapPin,
  Navigation,
  Shield,
  Wifi,
} from "lucide-react";
import { getVenueInfo } from "@/app/actions/venue";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";

export default async function VenuePage() {
  const venue = await getVenueInfo();

  const services = [
    { icon: <Wifi size={20} />, label: "Wi-Fi Gratuito" },
    { icon: <Coffee size={20} />, label: "Área de Snacks" },
    { icon: <Car size={20} />, label: "Estacionamiento" },
    { icon: <Shield size={20} />, label: "Servicio Médico" },
  ];

  if (!venue) return null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col p-4 sm:p-8 pb-32 md:pb-12">
      <header className="mb-10 text-center md:text-left">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Ubicación del Evento
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Donde Sucede la <span className="text-primary">Magia</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-7 space-y-6">
          <DashboardCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <MapPin size={180} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="h-14 w-14 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <MapPin size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">
                  {venue.name}
                </h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {venue.address}
                </p>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                {venue.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full h-12 px-8 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-primary/20">
                    <Navigation size={16} className="mr-2" />
                    Abrir en Maps
                  </Button>
                </a>
                {venue.websiteUrl && (
                  <a
                    href={venue.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-12 px-8 uppercase font-black text-[10px] tracking-widest"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Sitio Web
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </DashboardCard>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3 shadow-xl shadow-black/[0.02] hover:border-primary/20 transition-all"
              >
                <div className="text-primary">{service.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary text-center leading-tight">
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Visual Representation */}
        <div className="lg:col-span-5">
          <div className="bg-gray-200 rounded-[2rem] h-[350px] lg:h-full w-full relative overflow-hidden group shadow-2xl border-4 border-white">
            {/* Simulación de Mapa con diseño CNGRS */}
            <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl whitespace-nowrap z-20 border border-white/10">
                  ¡Te esperamos aquí!
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-secondary" />
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full animate-ping absolute -inset-2 opacity-40" />
                <div className="h-8 w-8 bg-primary rounded-full relative z-10 border-4 border-white shadow-lg flex items-center justify-center text-secondary">
                  <MapPin size={14} />
                </div>
              </div>

              {/* Decorative map elements */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-2 bg-secondary rounded-full rotate-45" />
                <div className="absolute top-1/2 right-1/3 w-40 h-2 bg-secondary rounded-full -rotate-12" />
                <div className="absolute bottom-1/4 left-1/2 w-2 h-48 bg-secondary rounded-full" />
              </div>
            </div>

            {/* Controles del mapa simulados */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <button
                type="button"
                className="h-10 w-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-secondary font-black hover:bg-gray-50 cursor-pointer border border-gray-100 transition-transform active:scale-95"
              >
                +
              </button>
              <button
                type="button"
                className="h-10 w-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-secondary font-black hover:bg-gray-50 cursor-pointer border border-gray-100 transition-transform active:scale-95"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
