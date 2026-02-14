import { getSettings } from "@/app/actions/admin";
import { AdminPaymentsConfigClient } from "@/components/admin/AdminPaymentsConfigClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsConfigPage() {
  const config = await getSettings();

  return <AdminPaymentsConfigClient config={config} />;
}
