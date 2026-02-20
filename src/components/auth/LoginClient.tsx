"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, HelpCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { loginUser } from "@/app/actions/auth";
import { sendPasswordResetRequest } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

export function LoginClient() {
  const router = useRouter();
  const [telefono, setTelefono] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = React.useState(false);
  const [resetPhone, setResetPhone] = React.useState("");
  const [resetMessage, setResetMessage] = React.useState("");
  const [isSubmittingReset, setIsSubmittingReset] = React.useState(false);
  const [resetError, setResetError] = React.useState("");
  const [resetSuccess, setResetSuccess] = React.useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      // No need to check session here, middleware handles it
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("telefono", telefono);
    formData.append("password", password);
    formData.append("rememberMe", rememberMe.toString());

    const result = await loginUser(formData);

    if (result.success) {
      if (result.isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string, setter: (v: string) => void) => {
    const cleanValue = value.replace(/[^0-9+]/g, "").slice(0, 20);
    setter(cleanValue);
  };

  const handlePasswordResetSubmit = async () => {
    setResetError("");
    setIsSubmittingReset(true);

    const result = await sendPasswordResetRequest(resetPhone, resetMessage);

    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetPhone("");
        setResetMessage("");
        setResetSuccess(false);
      }, 3000);
    } else {
      setResetError(result.error || "Error al enviar la solicitud");
      setIsSubmittingReset(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-secondary uppercase tracking-tighter">
            Iniciar <span className="text-primary">Sesión</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Ingresa tus datos para acceder al CNGRS26
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-4xl shadow-xl shadow-black/5 border border-gray-100 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Teléfono"
                type="tel"
                inputMode="tel"
                placeholder="Tu número de celular"
                value={telefono}
                onChange={(e) => handlePhoneChange(e.target.value, setTelefono)}
                required
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <div className="flex justify-end px-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-bold text-primary uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>

            <div className="px-1 py-2">
              <Checkbox
                label="Mantener sesión iniciada"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 shadow-md shadow-primary/10 uppercase tracking-widest"
              disabled={!telefono || !password || isLoading}
            >
              {isLoading ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-gray-300 font-bold tracking-widest">
                O
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">
              ¿Aún no tienes cuenta?
            </p>
            <Link href="/auth/register" className="w-full">
              <Button
                variant="outline"
                className="w-full h-11 border-secondary/20 text-secondary hover:bg-secondary hover:text-white transition-all"
              >
                Crear una cuenta
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-10 space-y-1">
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary/30 uppercase">
            Yo Soy • JIDI • CNGRS26
          </p>
          <p className="text-[10px] font-semibold text-secondary/40 tracking-wider">
            Desarrollado por{" "}
            <span className="text-primary/60 font-bold">LDV</span>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      >
        <ModalHeader onClose={() => setIsForgotModalOpen(false)}>
          <ModalTitle className="text-2xl font-black uppercase tracking-tighter text-center">
            ¿Olvidaste tu <span className="text-primary">Contraseña?</span>
          </ModalTitle>
        </ModalHeader>
        <ModalContent className="pt-4 space-y-6">
          <AnimatePresence mode="wait">
            {!resetSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex gap-3">
                  <HelpCircle
                    size={20}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-black text-blue-700 mb-2">
                      Solicita tu cambio de contraseña
                    </p>
                    <p className="text-xs text-blue-600/70 leading-relaxed">
                      Completa el formulario y nuestro equipo procesará tu
                      solicitud inmediatamente.
                    </p>
                  </div>
                </div>

                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center uppercase tracking-widest">
                    {resetError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-secondary mb-2 uppercase tracking-widest">
                      Tu Teléfono
                    </label>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="10 dígitos"
                      value={resetPhone}
                      onChange={(e) =>
                        handlePhoneChange(e.target.value, setResetPhone)
                      }
                      disabled={isSubmittingReset}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Número internacional (ej: +5551234567 o 5551234567)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-2 uppercase tracking-widest">
                      Describe tu solicitud
                    </label>
                    <textarea
                      value={resetMessage}
                      onChange={(e) => setResetMessage(e.target.value)}
                      placeholder="Cuéntanos por qué necesitas cambiar tu contraseña..."
                      className="w-full h-20 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      disabled={isSubmittingReset}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Mínimo 20 caracteres
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-secondary">
                    ¡Solicitud Enviada!
                  </p>
                  <p className="text-xs text-gray-500">
                    El equipo de soporte revisará tu solicitud y te contactará
                    pronto.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalContent>
        <ModalFooter>
          {!resetSuccess && (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                disabled={isSubmittingReset}
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetPhone("");
                  setResetMessage("");
                  setResetError("");
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                disabled={
                  isSubmittingReset ||
                  resetPhone.length < 5 ||
                  resetMessage.length < 20
                }
                onClick={handlePasswordResetSubmit}
              >
                {isSubmittingReset ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send size={14} className="mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </>
          )}
          {resetSuccess && (
            <Button
              className="flex-1 rounded-xl"
              onClick={() => {
                setIsForgotModalOpen(false);
                setResetPhone("");
                setResetMessage("");
                setResetSuccess(false);
                setResetError("");
              }}
            >
              Listo
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </main>
  );
}
