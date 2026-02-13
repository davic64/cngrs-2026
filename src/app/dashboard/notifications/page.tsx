import { getNotifications } from "@/app/actions/notifications";
import { NotificationsClient } from "@/components/dashboard/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return <NotificationsClient initialNotifications={notifications} />;
}
