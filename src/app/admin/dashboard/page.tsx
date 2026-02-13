import { getAdminStats, getPendingPayments } from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const pendingPayments = await getPendingPayments();

  return <AdminDashboardClient stats={stats} pendingPayments={pendingPayments} />;
}
