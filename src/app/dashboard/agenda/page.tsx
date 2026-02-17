import { getAgendaDays } from "@/app/actions/admin";
import { getEvents } from "@/app/actions/events";
import { AgendaClient } from "@/components/dashboard/AgendaClient";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [events, days] = await Promise.all([getEvents(), getAgendaDays()]);

  return <AgendaClient initialEvents={events} days={days} />;
}
