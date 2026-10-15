import { motion } from "framer-motion";
import { User as UserIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { PhotoUploadTabs } from "@/components/ui/PhotoUploadTab/PhotoUploadTabs";
import type { RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  profilePreviewUrl: string | null;
  setProfilePreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

export function StepFoto({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
  profilePreviewUrl,
  setProfilePreviewUrl,
}: Props) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
          <UserIcon size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">
          ¡Queremos <span className="text-primary">Conocerte</span>!
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Sube una foto tuya para completar tu perfil y tu gafete digital.
        </p>
        <PhotoUploadTabs
          onFileSelect={(file) => {
            setFormData({ ...formData, fotoPerfil: file });
            const url = URL.createObjectURL(file);
            setProfilePreviewUrl(url);
          }}
          previewUrl={profilePreviewUrl}
          fileName={formData.fotoPerfil?.name}
          onRemove={() => {
            setFormData({ ...formData, fotoPerfil: null });
            setProfilePreviewUrl(null);
          }}
          circular={true}
          label="Tomarse una Foto"
          description="Sube una foto donde se vea bien tu rostro"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1 h-14" onClick={handleBack}>
          Atrás
        </Button>
        <Button
          className="flex-[2] h-14 font-bold shadow-lg"
          disabled={!isStepValid(5)}
          onClick={handleNext}
        >
          Siguiente
        </Button>
      </div>
    </motion.div>
  );
}
