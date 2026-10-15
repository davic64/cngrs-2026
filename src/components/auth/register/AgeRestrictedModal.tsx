import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

type Props = {
  isOpen: boolean;
  detectedAge: number | null;
};

export function AgeRestrictedModal({ isOpen, detectedAge }: Props) {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalHeader>
        <ModalTitle className="text-2xl font-black text-secondary uppercase tracking-tighter text-center">
          Evento <span className="text-primary">Restringido</span>
        </ModalTitle>
      </ModalHeader>

      <ModalContent className="space-y-6 text-center">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-inner">
          <ShieldAlert size={48} />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-black text-secondary uppercase tracking-tight">
            Límite de edad excedido
          </p>

          <p className="text-sm text-gray-500 leading-relaxed font-medium px-4">
            Lo sentimos, nuestro sistema ha detectado que tienes{" "}
            <span className="font-black text-red-500">{detectedAge} años</span>.
            El <span className="text-primary font-bold">CNGRS26</span> requiere
            una edad mínima de <span className="font-bold">15 años</span>.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Si crees que esto es un error, por favor contacta a soporte técnico.
        </div>
      </ModalContent>

      <ModalFooter>
        <Button
          className="w-full h-12 uppercase font-black text-xs tracking-widest"
          onClick={() => router.push("/")}
        >
          Regresar al Inicio
        </Button>
      </ModalFooter>
    </Modal>
  );
}
