import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import ChangePasswordClient from "@/components/dashboard/ChangePasswordClient";

export default async function ChangePasswordPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  // If password reset is not required, redirect to dashboard
  if (!user.passwordResetRequired) {
    redirect("/dashboard");
  }

  return <ChangePasswordClient userId={user.id} />;
}
