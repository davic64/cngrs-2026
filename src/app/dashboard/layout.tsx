"use client";

import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { getSessionUser, logoutUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAdmin = async () => {
      const user = await getSessionUser();
      if (user && user.role === "admin") {
        router.push("/admin/dashboard");
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Inicio",
      href: "/dashboard",
    },
    {
      icon: <Calendar size={20} />,
      label: "Agenda",
      href: "/dashboard/agenda",
    },
    { icon: <MapPin size={20} />, label: "Sede", href: "/dashboard/venue" },
    {
      icon: <CreditCard size={20} />,
      label: "Pagos",
      href: "/dashboard/payments",
    },
    {
      icon: <Bell size={20} />,
      label: "Avisos",
      href: "/dashboard/notifications",
    },
    { icon: <User size={20} />, label: "Perfil", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col p-8 sticky top-0 h-screen shadow-xl shadow-black/[0.02]">
        <div className="mb-12">
          <h1 className="text-2xl font-black text-secondary uppercase tracking-tighter">
            CNGRS <span className="text-primary">26</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onClick={() => router.push(item.href)}
            />
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-50">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 h-12 text-gray-400 hover:text-red-500 hover:bg-red-50 font-bold uppercase text-[10px] tracking-widest transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* MOBILE TOP BAR - For Logout and Branding */}
      <div className="md:hidden bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-black text-secondary uppercase tracking-tighter">
          CNGRS <span className="text-primary">26</span>
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen">{children}</div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {navItems.map((item) => (
          <NavButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}
      </nav>
    </div>
  );
}

function SidebarItem({
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
          ? "shadow-lg shadow-primary/20 translate-x-1"
          : "text-gray-400 hover:text-secondary hover:bg-gray-50",
      )}
    >
      {icon}
      {label}
    </Button>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all flex-1",
        active ? "text-primary scale-105" : "text-gray-300",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-2xl transition-all",
          active ? "bg-primary/10 shadow-inner" : "bg-transparent",
        )}
      >
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </button>
  );
}
