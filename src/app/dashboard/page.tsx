import { getSessionUser } from "@/app/actions/auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardClient user={user} />;
}
