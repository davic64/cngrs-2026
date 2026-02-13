import { getEvents } from "@/app/actions/events";
import { AgendaClient } from "@/components/dashboard/AgendaClient";

export default async function AgendaPage() {
  const events = await getEvents();

  return <AgendaClient initialEvents={events} />;
}
