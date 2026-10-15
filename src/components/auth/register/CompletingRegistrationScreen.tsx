import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function CompletingRegistrationScreen() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100 text-center space-y-6 max-w-md w-full"
      >
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">
          Completando tu Registro
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Estamos verificando tu pago y creando tu cuenta. No cierres esta
          ventana.
        </p>
      </motion.div>
    </main>
  );
}
