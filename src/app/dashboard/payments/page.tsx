import { getSessionUser } from "@/app/actions/auth";
import { PaymentsClient } from "@/components/dashboard/PaymentsClient";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <PaymentsClient payments={user.payments || []} />;
}
