import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side validation: ensure user is admin
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const navItems = [
    {
      icon: "LayoutDashboard",
      label: "Vista General",
      href: "/admin/dashboard",
    },
    {
      icon: "Users",
      label: "Asistentes",
      href: "/admin/users",
    },
    {
      icon: "Building2",
      label: "Localidades",
      href: "/admin/localities",
    },
    {
      icon: "CreditCard",
      label: "Pagos Pendientes",
      href: "/admin/payments",
    },
    {
      icon: "Banknote",
      label: "Métodos de Pago",
      href: "/admin/payments-config",
    },
    {
      icon: "MapPin",
      label: "Gestionar Sede",
      href: "/admin/venue",
    },
    {
      icon: "Calendar",
      label: "Gestionar Agenda",
      href: "/admin/agenda",
    },
    {
      icon: "Bell",
      label: "Enviar Avisos",
      href: "/admin/notifications",
    },
    {
      icon: "MessageCircle",
      label: "Soporte",
      href: "/admin/soporte",
    },
  ];

  return <AdminLayoutClient navItems={navItems}>{children}</AdminLayoutClient>;
}
