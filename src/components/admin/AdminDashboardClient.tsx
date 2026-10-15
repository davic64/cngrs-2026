"use client";

import type { AdminStats } from "@/app/actions/admin-stats";
import { CapacityCard } from "@/components/admin/dashboard/CapacityCard";
import { CartaPanel } from "@/components/admin/dashboard/CartaPanel";
import { CostsPanel } from "@/components/admin/dashboard/CostsPanel";
import { FinanceCard } from "@/components/admin/dashboard/FinanceCard";
import { PendingPaymentsCard } from "@/components/admin/dashboard/PendingPaymentsCard";
import { RegistrationsChart } from "@/components/admin/dashboard/RegistrationsChart";
import { RejectedPaymentsCard } from "@/components/admin/dashboard/RejectedPaymentsCard";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { TermsPanel } from "@/components/admin/dashboard/TermsPanel";
import { TopLocalities } from "@/components/admin/dashboard/TopLocalities";
import { useSettingsForm } from "@/components/admin/dashboard/useSettingsForm";

interface AdminDashboardClientProps {
  stats: AdminStats;
  pendingPayments: any[];
  rejectedPayments: any[];
  config: any;
  cartaResponsivaUrl: string | null;
}

export function AdminDashboardClient({
  stats,
  pendingPayments,
  rejectedPayments,
  config,
  cartaResponsivaUrl,
}: AdminDashboardClientProps) {
  const settingsForm = useSettingsForm(config);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Métricas del Congreso
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Panel de <span className="text-primary">Control</span>
        </h1>
      </header>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CapacityCard capacity={stats.capacity} />
            <FinanceCard finance={stats.finance} />
          </div>

          <RegistrationsChart days={stats.registrationsByDay} />

          <PendingPaymentsCard payments={pendingPayments} />

          <RejectedPaymentsCard payments={rejectedPayments} />

          <TermsPanel form={settingsForm} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <TopLocalities localities={stats.topLocalities} />

          <CostsPanel form={settingsForm} />

          <CartaPanel initialUrl={cartaResponsivaUrl} />
        </div>
      </div>
    </div>
  );
}
