"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

export default function LoginPage() {
  const router = useRouter();
  const [telefono, setTelefono] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  // Forgot Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = React.useState(false);
  const [forgotPhone, setForgotPhone] = React.useState("");
  const [isRecoverySent, setIsRecoverySent] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect
    router.push("/dashboard");
  };

  const handlePhoneChange = (value: string, setter: (v: string) => void) => {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    setter(cleanValue);
  };

  const handleRecoverPassword = () => {
    setIsRecoverySent(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setIsRecoverySent(false);
      setForgotPhone("");
    }, 3000);
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
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 space-y-6">
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
              />
              <div className="space-y-1">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 shadow-md shadow-primary/10 uppercase tracking-widest"
              disabled={!telefono || !password}
            >
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
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
        <div className="text-center mt-10">
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary/30 uppercase">
            Yo Soy • JIDI • CNGRS26
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      >
        <ModalHeader onClose={() => setIsForgotModalOpen(false)}>
          <ModalTitle>Recuperar Contraseña</ModalTitle>
          <ModalDescription>
            Ingresa tu teléfono y te enviaremos un código para restablecer tu
            cuenta.
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="pt-4">
          <AnimatePresence mode="wait">
            {!isRecoverySent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Input
                  label="Teléfono Registrado"
                  type="tel"
                  placeholder="000 000 0000"
                  value={forgotPhone}
                  onChange={(e) =>
                    handlePhoneChange(e.target.value, setForgotPhone)
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-secondary">¡Código Enviado!</p>
                  <p className="text-xs text-gray-500">
                    Revisa tus mensajes SMS en breve.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalContent>
        {!isRecoverySent && (
          <ModalFooter>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl"
              disabled={forgotPhone.length < 10}
              onClick={handleRecoverPassword}
            >
              Enviar Código
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </main>
  );
}
