import { getLocalities } from "@/app/actions/admin";
import { AdminLocalitiesClient } from "@/components/admin/AdminLocalitiesClient";

export const dynamic = "force-dynamic";

export default async function AdminLocalitiesPage() {
  const localities = await getLocalities();

  return <AdminLocalitiesClient initialLocalities={localities} />;
}
