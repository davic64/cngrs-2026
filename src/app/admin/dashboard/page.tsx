import {
  getAdminStats,
  getLocalities,
  getPendingPayments,
  getSettings,
} from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const pendingPayments = await getPendingPayments();
  const config = await getSettings();
  const allLocalities = await getLocalities();

  return (
    <AdminDashboardClient
      stats={stats}
      pendingPayments={pendingPayments}
      config={config}
      allLocalities={allLocalities}
    />
  );
}
