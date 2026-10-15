"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";

type Props = { payments: any[] };

export function PendingPaymentsCard({ payments }: Props) {
  const router = useRouter();

  return (
    <DashboardCard
      title="Validaciones Pendientes"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] font-black text-primary uppercase tracking-widest"
          onClick={() => router.push("/admin/payments")}
        >
          Ver todo
        </Button>
      }
    >
      <div className="space-y-4">
        {payments.slice(0, 3).map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => router.push("/admin/payments")}
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-secondary shadow-sm">
                {payment.user?.firstName[0]}
              </div>
              <div>
                <p className="text-sm font-black text-secondary uppercase tracking-tight">
                  {payment.user?.firstName} {payment.user?.lastName}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  ${payment.amount} MXN • {payment.method}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        ))}
        {payments.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6 uppercase font-bold tracking-widest">
            Sin pendientes por ahora
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
