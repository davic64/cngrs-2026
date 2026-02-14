"use client";

import {
  Bell,
  Building2,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";
import { logoutUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Vista General",
      href: "/admin/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: "Asistentes",
      href: "/admin/users",
    },
    {
      icon: <Building2 size={20} />,
      label: "Localidades",
      href: "/admin/localities",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Pagos Pendientes",
      href: "/admin/payments",
    },
    {
      icon: <MapPin size={20} />,
      label: "Gestionar Sede",
      href: "/admin/venue",
    },
    {
      icon: <Calendar size={20} />,
      label: "Gestionar Agenda",
      href: "/admin/agenda",
    },
    {
      icon: <Bell size={20} />,
      label: "Enviar Avisos",
      href: "/admin/notifications",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* SIDEBAR - Admin Desktop */}
      <aside className="hidden md:flex w-72 bg-secondary text-white flex-col p-8 sticky top-0 h-screen shadow-2xl">
        <div className="mb-12">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            ADMIN <span className="text-primary">CNGRS</span>
          </h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">
            Panel de Control
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <AdminSidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onClick={() => router.push(item.href)}
            />
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 h-12 text-white/40 hover:text-red-400 hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-secondary text-white px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-black uppercase tracking-tighter">
          ADMIN <span className="text-primary">C26</span>
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="h-10 w-10 flex items-center justify-center text-white/60"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Navigation Info for Mobile */}
        <div className="md:hidden flex overflow-x-auto bg-white border-b border-gray-100 p-2 gap-2 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                pathname === item.href
                  ? "bg-primary text-secondary"
                  : "bg-gray-50 text-gray-400",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}

function AdminSidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "primary" : "ghost"}
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-4 h-12 font-black text-[10px] uppercase tracking-widest transition-all",
        active
          ? "bg-primary text-secondary shadow-lg shadow-primary/20 translate-x-1"
          : "text-white/40 hover:text-white hover:bg-white/5",
      )}
    >
      {icon}
      {label}
    </Button>
  );
}
