import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-secondary">
      {/* Efecto de degradado sutil en el fondo */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/40" />

      {/* Logos at the top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center items-center gap-6 p-10">
        <div className="relative h-10 w-20 sm:h-12 sm:w-24 brightness-0 invert opacity-60 hover:opacity-100 transition-opacity">
          <Image
            src="/logos/logo_idi.png"
            alt="Logo IDI"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="relative h-10 w-20 sm:h-12 sm:w-24 brightness-0 invert opacity-60 hover:opacity-100 transition-opacity">
          <Image
            src="/logos/logo_jidi.png"
            alt="Logo JIDI"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-sm px-6 text-center sm:max-w-xl">
        <h1 className="mb-12 text-5xl font-extrabold tracking-tighter text-white drop-shadow-2xl sm:text-7xl">
          Bienvenid@ a <span className="text-primary">CNGRS26</span>
        </h1>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/register" className="w-full sm:w-48">
            <Button className="h-14 w-full text-base font-bold uppercase tracking-widest sm:h-12">
              Registrarse
            </Button>
          </Link>

          <Link href="/auth/login" className="w-full sm:w-48">
            <Button
              variant="outline"
              className="h-14 w-full border-white text-base font-bold uppercase tracking-widest text-white hover:bg-white hover:text-secondary sm:h-12 transition-all duration-300"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 z-10 text-center">
        <p className="text-[10px] md:text-sm font-medium tracking-[0.3em] text-white/40 uppercase">
          Yo Soy • Congreso Internacional • JIDI
        </p>
      </div>
    </main>
  );
}
