"use client";

import {
  Eye,
  FileText,
  Filter,
  Mail,
  MoreVertical,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";
import * as React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const MOCK_USERS = [
  {
    id: "CNGRS-001",
    name: "Juan Pérez",
    status: "completado",
    gender: "M",
    size: "M",
    phone: "5512345678",
  },
  {
    id: "CNGRS-002",
    name: "Ana Martínez",
    status: "parcial",
    gender: "F",
    size: "S",
    phone: "5523456789",
  },
  {
    id: "CNGRS-003",
    name: "Luis Rodríguez",
    status: "pendiente",
    gender: "M",
    size: "L",
    phone: "5534567890",
  },
  {
    id: "CNGRS-004",
    name: "Elena Gómez",
    status: "completado",
    gender: "F",
    size: "M",
    phone: "5545678901",
  },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
            Base de Datos
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
            Gestión de <span className="text-primary">Asistentes</span>
          </h1>
        </div>
        <Button className="font-black uppercase text-[10px] tracking-widest px-8">
          Exportar Excel
        </Button>
      </header>

      <DashboardCard>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre, ID o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "Todos los estatus" },
              { value: "completado", label: "Completados" },
              { value: "parcial", label: "Parciales" },
              { value: "pendiente", label: "Pendientes" },
            ]}
            defaultValue="all"
          />
          <Button
            variant="outline"
            className="font-black uppercase text-[10px] tracking-widest"
          >
            Filtrar
          </Button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Asistente
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  ID / Teléfono
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Estatus
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Talla
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center font-black text-secondary text-xs uppercase">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-bold text-secondary uppercase">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-secondary/70">
                        {user.id}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {user.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md",
                        user.status === "completado"
                          ? "bg-green-50 text-green-600"
                          : user.status === "parcial"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600",
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-secondary">
                      {user.size}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        title="Ver Detalle"
                        className="p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        title="Validar"
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        <UserCheck size={18} />
                      </button>
                      <button
                        type="button"
                        title="Más opciones"
                        className="p-2 text-gray-400 hover:text-secondary transition-colors cursor-pointer"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
