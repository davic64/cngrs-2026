import { getPendingPayments } from "@/app/actions/admin";
import { PaymentsClient } from "@/components/admin/PaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const pendingPayments = await getPendingPayments();

  return <PaymentsClient initialPayments={pendingPayments} />;
}
