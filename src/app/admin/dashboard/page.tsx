import {
  getAdmins,
  getAdminStats,
  getLocalities,
  getPendingPayments,
  getSettings,
  getVenue,
} from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, pendingPayments, config, allLocalities, admins] =
    await Promise.all([
      getAdminStats(),
      getPendingPayments(),
      getSettings(),
      getLocalities(),
      getAdmins(),
    ]);

  return (
    <AdminDashboardClient
      stats={stats}
      pendingPayments={pendingPayments}
      config={config}
      admins={admins}
    />
  );
}
