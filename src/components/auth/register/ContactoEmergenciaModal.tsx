import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

type Contacto = { nombre: string; telefono: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tempContacto: Contacto;
  setTempContacto: (contacto: Contacto) => void;
  saveContacto: () => void;
};

export function ContactoEmergenciaModal({
  isOpen,
  onClose,
  tempContacto,
  setTempContacto,
  saveContacto,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ModalTitle className="text-xl font-black text-secondary uppercase tracking-tight">
          Contacto de Emergencia
        </ModalTitle>
        <ModalDescription className="text-xs font-bold uppercase tracking-widest mt-1">
          ¿A quién llamamos en caso de emergencia?
        </ModalDescription>
      </ModalHeader>

      <ModalContent className="space-y-4 pt-4">
        <Input
          label="Nombre"
          value={tempContacto.nombre}
          onChange={(e) =>
            setTempContacto({ ...tempContacto, nombre: e.target.value })
          }
        />
        <Input
          label="Teléfono"
          value={tempContacto.telefono}
          onChange={(e) =>
            setTempContacto({
              ...tempContacto,
              telefono: e.target.value.replace(/[^0-9]/g, ""),
            })
          }
        />
      </ModalContent>

      <ModalFooter className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="flex-1 font-bold" onClick={saveContacto}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
