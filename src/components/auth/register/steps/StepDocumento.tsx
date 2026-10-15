import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/Button";
import { CartaResponsivaTabs } from "@/components/ui/CartaResponsivaTabs/CartaResponsivaTabs";
import { PhotoUploadTabs } from "@/components/ui/PhotoUploadTab/PhotoUploadTabs";
import { verifyIsIdDocument } from "@/lib/id-check";
import type { RegistrationFormData } from "../types";

type Props = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  handleNext: () => void;
  handleBack: () => void;
  isStepValid: (step: number) => boolean;
  cartaTemplateLoading: boolean;
  cartaTemplateUrl: string | null;
  handleDownloadCartaTemplate: () => Promise<void>;
  idAttempts: number;
  setIdAttempts: React.Dispatch<React.SetStateAction<number>>;
  idCheckError: string | null;
  setIdCheckError: React.Dispatch<React.SetStateAction<string | null>>;
  isDocumentVerified: boolean;
  setIsDocumentVerified: React.Dispatch<React.SetStateAction<boolean>>;
  isIdValidating: boolean;
  setIsIdValidating: React.Dispatch<React.SetStateAction<boolean>>;
  needsResponsiva: boolean;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

export function StepDocumento({
  formData,
  setFormData,
  handleNext,
  handleBack,
  isStepValid,
  cartaTemplateLoading,
  cartaTemplateUrl,
  handleDownloadCartaTemplate,
  idAttempts,
  setIdAttempts,
  idCheckError,
  setIdCheckError,
  isDocumentVerified,
  setIsDocumentVerified,
  isIdValidating,
  setIsIdValidating,
  needsResponsiva,
  previewUrl,
  setPreviewUrl,
}: Props) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6 bg-white p-5 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-secondary uppercase tracking-tight leading-none">
              {needsResponsiva ? "Responsiva" : "Identificación"}
            </h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
              {needsResponsiva ? "Menores de 18" : "INE o Pasaporte"}
            </p>
          </div>
        </div>
        {!needsResponsiva && (
          <p className="text-xs text-gray-500 font-medium leading-snug -mt-2">
            <span className="font-bold text-secondary">En México:</span> INE o
            Pasaporte.{" "}
            <span className="font-bold text-secondary">Fuera de México:</span>{" "}
            solo Pasaporte (USA, Canadá, El Salvador, Guatemala, Honduras...).
          </p>
        )}

        {/* Carta Responsiva para menores */}
        {needsResponsiva ? (
          <CartaResponsivaTabs
            templateUrl={cartaTemplateUrl}
            templateLoading={cartaTemplateLoading}
            onDownloadTemplate={handleDownloadCartaTemplate}
            onFileSelect={(file) => {
              setFormData({ ...formData, documento: file });
              const url = URL.createObjectURL(file);
              setPreviewUrl(url);
              // Auto-verify para responsiva
              setIsDocumentVerified(true);
            }}
            previewUrl={previewUrl}
            fileName={formData.documento?.name}
            onRemove={() => {
              setFormData({ ...formData, documento: null });
              setPreviewUrl(null);
              setIsDocumentVerified(false);
            }}
            isLoading={false}
          />
        ) : (
          /* PhotoUploadTabs para adultos (Identificación - SOLO CÁMARA) */
          <div className="space-y-4">
            <PhotoUploadTabs
              cameraOnly={true}
              onFileSelect={async (file) => {
                setFormData({ ...formData, documento: file });
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                setIsIdValidating(true);
                setIsDocumentVerified(false);
                setIdCheckError(null);
                let isId = false;
                try {
                  isId = await verifyIsIdDocument(file);
                } catch (e) {
                  console.error("Error validando ID:", e);
                  isId = true; // ponytail: don't block users if OCR engine fails
                }
                const attempts = idAttempts + 1;
                setIdAttempts(attempts);
                setIsIdValidating(false);
                // Accept if it looks like an ID, or after 3 tries let it
                // through for admin review (avoid locking out real users).
                if (isId || attempts >= 3) {
                  setIsDocumentVerified(true);
                } else {
                  setIsDocumentVerified(false);
                  setIdCheckError(
                    "No reconocimos una identificación oficial. Asegúrate de que se lea bien (INE, pasaporte, etc.).",
                  );
                }
              }}
              previewUrl={previewUrl}
              fileName={formData.documento?.name}
              onRemove={() => {
                setFormData({ ...formData, documento: null });
                setPreviewUrl(null);
                setIsDocumentVerified(false);
                setIsIdValidating(false);
                setIdCheckError(null);
              }}
              width="w-full"
              height="h-64"
              isLoading={isIdValidating}
              isVerified={isDocumentVerified}
              verificationMessage="Identificación Validada"
              errorMessage={idCheckError}
              subMessage={null}
            />{" "}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-14"
          onClick={handleBack}
          disabled={false}
        >
          Atrás
        </Button>
        <Button
          className="flex-[2] h-14 font-bold shadow-lg"
          disabled={!isStepValid(2) || !isDocumentVerified}
          onClick={handleNext}
        >
          Siguiente
        </Button>
      </div>
    </motion.div>
  );
}
