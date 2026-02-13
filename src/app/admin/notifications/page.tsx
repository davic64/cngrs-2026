import { getNotifications } from "@/app/actions/notifications";
import { AdminNotificationsClient } from "@/components/admin/AdminNotificationsClient";

export default async function AdminNotificationsPage() {
  const notices = await getNotifications();

  return <AdminNotificationsClient initialNotices={notices} />;
}
