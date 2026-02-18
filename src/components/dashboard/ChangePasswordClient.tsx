"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { changePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ChangePasswordClientProps {
  userId: string;
}

export default function ChangePasswordClient({
  userId,
}: ChangePasswordClientProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    const result = await changePassword(userId, currentPassword, newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      setError(result.error || "Error al cambiar la contraseña");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-secondary uppercase tracking-tighter">
            Cambia tu <span className="text-primary">Contraseña</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Por seguridad, debes establecer una nueva contraseña
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-4xl shadow-xl shadow-black/5 border border-gray-100 space-y-6">
          {/* Alert */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-amber-700 mb-1">
                Acción Requerida
              </p>
              <p className="text-xs text-amber-600/70 leading-relaxed">
                Tu contraseña anterior fue reseteada. Crea una nueva contraseña
                segura para proteger tu cuenta.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-secondary">
                  ¡Contraseña Actualizada!
                </p>
                <p className="text-xs text-gray-500">
                  Redirigiendo a tu dashboard...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Contraseña Actual"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">
                  Requisitos de seguridad:
                </p>
                <ul className="text-[10px] text-gray-600 space-y-1">
                  <li
                    className={`flex items-center gap-2 ${
                      newPassword.length >= 6
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Mínimo 6 caracteres
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      newPassword === confirmPassword && newPassword.length > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Las contraseñas coinciden
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full h-11 shadow-md shadow-primary/10 uppercase tracking-widest"
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  isLoading
                }
              >
                {isLoading ? (
                  "Actualizando..."
                ) : (
                  <>
                    Cambiar Contraseña
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary/30 uppercase">
            Yo Soy • JIDI • CNGRS26
          </p>
        </div>
      </motion.div>
    </div>
  );
}
