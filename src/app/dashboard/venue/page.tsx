import {
  Car,
  Coffee,
  ExternalLink,
  MapPin,
  Navigation,
  Shield,
  Trees,
  Wifi,
} from "lucide-react";
import { getVenueInfo } from "@/app/actions/venue";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function VenuePage() {
  const venue = await getVenueInfo();

  if (!venue) return null;

  // Parse services from DB or use defaults
  let services = [];
  try {
    services = (venue as any).services
      ? JSON.parse((venue as any).services)
      : [];
  } catch (e) {
    services = [];
  }

  // Map icon strings to components
  const iconMap: Record<string, React.ReactNode> = {
    wifi: <Wifi size={20} />,
    coffee: <Coffee size={20} />,
    parking: <Car size={20} />,
    shield: <Shield size={20} />,
    outdoor: <Trees size={20} />,
  };

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
            <div className="relative z-10 space-y-6">
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
            {services.map((service: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3 shadow-xl shadow-black/[0.02] hover:border-primary/20 transition-all"
              >
                <div className="text-primary">
                  {iconMap[service.iconId] || <Navigation size={20} />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary text-center leading-tight">
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real Google Maps Embed */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] h-[450px] lg:h-full w-full relative overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              title="Mapa de la Sede"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
