import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import { LoginClient } from "@/components/auth/LoginClient";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
  }
  return <LoginClient />;
}
