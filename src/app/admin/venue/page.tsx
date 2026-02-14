import { getVenue } from "@/app/actions/admin";
import { AdminVenueClient } from "@/components/admin/AdminVenueClient";

export const dynamic = "force-dynamic";

export default async function AdminVenuePage() {
  const venue = await getVenue();

  return <AdminVenueClient initialVenue={venue} />;
}
