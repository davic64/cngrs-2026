import { getAgendaDays } from "@/app/actions/admin";
import { getEvents } from "@/app/actions/events";
import { AdminAgendaClient } from "@/components/admin/AdminAgendaClient";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  const [events, days] = await Promise.all([getEvents(), getAgendaDays()]);

  return <AdminAgendaClient initialEvents={events} initialDays={days} />;
}
