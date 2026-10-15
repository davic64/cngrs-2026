import * as React from "react";

// Estado de la verificación del documento de identidad (paso 2, OCR en navegador).
export function useDocumentCheck() {
  const [isDocumentVerified, setIsDocumentVerified] = React.useState(false);
  const [isIdValidating, setIsIdValidating] = React.useState(false);
  const [idCheckError, setIdCheckError] = React.useState<string | null>(null);
  const [idAttempts, setIdAttempts] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  return {
    isDocumentVerified,
    setIsDocumentVerified,
    isIdValidating,
    setIsIdValidating,
    idCheckError,
    setIdCheckError,
    idAttempts,
    setIdAttempts,
    previewUrl,
    setPreviewUrl,
  };
}
