import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import { ProfileClient } from "@/components/dashboard/ProfileClient";

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileClient user={user} />;
}
