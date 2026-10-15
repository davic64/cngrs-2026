"use client";

import { Phone, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

type Props = { payments: any[] };

export function RejectedPaymentsCard({ payments }: Props) {
  const router = useRouter();

  return (
    <DashboardCard title="Pagos Rechazados">
      <div className="space-y-4">
        {payments.map((payment) => {
          const typeLabel =
            payment.type === "completo"
              ? "Pago Completo"
              : payment.type === "inscripcion"
                ? "Inscripción"
                : payment.type;
          const phone: string = payment.user?.phone ?? "";
          const waNumber = phone.replace(/\D/g, "");
          return (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-4 p-4 bg-red-50/60 rounded-2xl border border-red-100 hover:border-red-200 transition-all cursor-pointer"
              onClick={() =>
                router.push(`/admin/users?user=${payment.user?.id}`)
              }
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-secondary uppercase tracking-tight truncate">
                    {payment.user?.firstName} {payment.user?.lastName}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {typeLabel} • ${payment.amount} MXN
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 shrink-0 bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-primary/30 transition-all"
              >
                <Phone size={14} className="text-primary" />
                <div className="text-left leading-none">
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest">
                    Contactar
                  </p>
                  <p className="text-[11px] font-bold text-secondary">
                    {phone}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
        {payments.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6 uppercase font-bold tracking-widest">
            Sin pagos rechazados
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
