import { getNotifications } from "@/app/actions/notifications";
import { AdminNotificationsClient } from "@/components/admin/AdminNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notices = await getNotifications();

  return <AdminNotificationsClient initialNotices={notices} />;
}
