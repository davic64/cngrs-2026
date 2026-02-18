import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // Server-side validation: ensure user is logged in
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  // If user is admin, redirect to admin dashboard
  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // If password reset is required, redirect to change password page
  if (user.passwordResetRequired) {
    redirect("/auth/change-password");
  }

  const navItems = [
    {
      icon: "LayoutDashboard",
      label: "Inicio",
      href: "/dashboard",
    },
    {
      icon: "Calendar",
      label: "Agenda",
      href: "/dashboard/agenda",
    },
    {
      icon: "MapPin",
      label: "Sede",
      href: "/dashboard/venue",
    },
    {
      icon: "CreditCard",
      label: "Pagos",
      href: "/dashboard/payments",
    },
    {
      icon: "Bell",
      label: "Avisos",
      href: "/dashboard/notifications",
    },
    {
      icon: "User",
      label: "Perfil",
      href: "/dashboard/profile",
    },
  ];

  return (
    <DashboardLayoutClient navItems={navItems}>
      {children}
    </DashboardLayoutClient>
  );
}
