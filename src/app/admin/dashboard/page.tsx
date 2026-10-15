import { redirect } from "next/navigation";
import {
  getCartaResponsivaTemplate,
  getLocalities,
  getPendingPayments,
  getRejectedPayments,
  getSettings,
} from "@/app/actions/admin";
import { getAdminStats } from "@/app/actions/admin-stats";
import { getSessionUser } from "@/app/actions/auth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/auth/login");
  }

  if (sessionUser.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    stats,
    pendingPayments,
    rejectedPayments,
    config,
    allLocalities,
    cartaResponsiva,
  ] = await Promise.all([
    getAdminStats(),
    getPendingPayments(),
    getRejectedPayments(),
    getSettings(),
    getLocalities(),
    getCartaResponsivaTemplate(),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      pendingPayments={pendingPayments}
      rejectedPayments={rejectedPayments}
      config={config}
      cartaResponsivaUrl={
        cartaResponsiva.success ? (cartaResponsiva.templateUrl ?? null) : null
      }
    />
  );
}
