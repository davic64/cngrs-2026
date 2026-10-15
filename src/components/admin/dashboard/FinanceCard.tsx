import type { AdminStats } from "@/app/actions/admin-stats";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatMxn } from "./StatCards";

const METHODS = [
  { key: "tarjeta", label: "Tarjeta" },
  { key: "transferencia", label: "Transferencia" },
  { key: "efectivo", label: "Efectivo" },
] as const;

export function FinanceCard({ finance }: { finance: AdminStats["finance"] }) {
  const totals = [
    { label: "Validado", value: finance.validated, tone: "text-green-600" },
    { label: "En revisión", value: finance.inReview, tone: "text-amber-600" },
    { label: "Por cobrar", value: finance.receivable, tone: "text-secondary" },
  ];

  return (
    <DashboardCard title="Finanzas">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {totals.map((t) => (
            <div key={t.label}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t.label}
              </p>
              <p className={`text-lg font-black mt-1 ${t.tone}`}>
                {formatMxn(t.value)}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Validado por método
          </p>
          {METHODS.map((m) => (
            <div key={m.key} className="flex justify-between text-sm">
              <span className="font-bold text-secondary/70">{m.label}</span>
              <span className="font-black text-secondary">
                {formatMxn(finance.byMethod[m.key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
