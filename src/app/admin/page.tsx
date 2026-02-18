import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  redirect("/admin/dashboard");
}
