import { getEvents } from "@/app/actions/events";
import { AdminAgendaClient } from "@/components/admin/AdminAgendaClient";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  const events = await getEvents();

  return <AdminAgendaClient initialEvents={events} />;
}
