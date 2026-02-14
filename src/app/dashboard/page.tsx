import { redirect } from "next/navigation";
import { getSettings } from "@/app/actions/admin";
import { getSessionUser } from "@/app/actions/auth";
import { getUpcomingEvents } from "@/app/actions/events";
import { getPinnedNotifications } from "@/app/actions/notifications";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [user, upcomingEvents, config, pinnedNotifs] = await Promise.all([
    getSessionUser(),
    getUpcomingEvents(2),
    getSettings(),
    getPinnedNotifications(),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardClient 
      user={user} 
      upcomingEvents={upcomingEvents} 
      config={config}
      pinnedNotifications={pinnedNotifs}
    />
  );
}
