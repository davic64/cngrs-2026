import { getEvents } from "@/app/actions/events";
import { AdminAgendaClient } from "@/components/admin/AdminAgendaClient";

export default async function AdminAgendaPage() {
  const events = await getEvents();

  return <AdminAgendaClient initialEvents={events} />;
}
