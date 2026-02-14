"use client";

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import * as React from "react";
import { deleteUser, updateUserDetails, updateUserDocument } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface AdminUsersClientProps {
  initialUsers: any[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar a este asistente?")) return;
    await deleteUser(id);
    setSelectedUser(null);
    alert("Usuario eliminado");
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedUser) return;
    await updateUserDetails(selectedUser.id, { registrationStatus: status });
    setSelectedUser({ ...selectedUser, registrationStatus: status });
    alert("Estado actualizado");
  };

  const handleUploadResponsiva = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("documento", file);

    const result = await updateUserDocument(selectedUser.id, formData);
    if (result.success) {
      alert("Carta responsiva subida con éxito.");
      setSelectedUser({ ...selectedUser, documentUrl: result.url });
    } else {
      alert("Error al subir el archivo.");
    }
    setIsUploading(false);
  };

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
      </header>

      <DashboardCard>
        <div className="mb-8">
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Asistente
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Estatus
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100">
                        {user.profilePhotoUrl ? (
                          <img
                            src={user.profilePhotoUrl}
                            className="w-full h-full object-cover"
                            alt="Profile"
                          />
                        ) : (
                          <div className="bg-gray-100 w-full h-full flex items-center justify-center font-bold text-gray-400">
                            {user.firstName[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-secondary uppercase">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md",
                        user.registrationStatus === "completado"
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600",
                      )}
                    >
                      {user.registrationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* USER DETAILS DRAWER */}
      <Drawer 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)}
        title={
          <span className="uppercase tracking-tighter">
            Expediente <span className="text-primary">Digital</span>
          </span>
        }
        footer={
          selectedUser && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-green-200 text-green-600 hover:bg-green-50 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all"
                  onClick={() => handleUpdateStatus("completado")}
                >
                  <CheckCircle2 size={16} className="mr-2" /> Validar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all"
                  onClick={() => handleUpdateStatus("pendiente")}
                >
                  <AlertCircle size={16} className="mr-2" /> Suspender
                </Button>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  <Trash2 size={16} className="mr-2" /> Eliminar
                </Button>
                <Button 
                  className="flex-[2] rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" 
                  onClick={() => setSelectedUser(null)}
                >
                  Cerrar Expediente
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                ID: {selectedUser.id.split("-")[0]} • {selectedUser.phone}
              </p>
            </div>

            {/* Header Info: Photo and Status */}
            <div className="flex flex-col gap-6 items-center bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
              <div className="relative group">
                <div className="h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white shrink-0">
                  {selectedUser.profilePhotoUrl ? (
                    <img
                      src={selectedUser.profilePhotoUrl}
                      className="w-full h-full object-cover"
                      alt="Perfil"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl font-black text-gray-300">
                      {selectedUser.firstName[0]}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center",
                  selectedUser.registrationStatus === "completado" ? "bg-green-500" : "bg-amber-500"
                )}>
                  {selectedUser.registrationStatus === "completado" ? (
                    <CheckCircle2 size={24} className="text-white" />
                  ) : (
                    <AlertCircle size={24} className="text-white" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-secondary uppercase tracking-tight">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500">
                    {selectedUser.age} años
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500">
                    Talla {selectedUser.shirtSize}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500">
                    {selectedUser.gender === "M" ? "Masculino" : selectedUser.gender === "F" ? "Femenino" : "Otro"}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-column Info */}
            <div className="grid grid-cols-1 gap-6">
              {/* Contact & Location */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">
                  Ubicación y Contacto
                </h4>
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 grid grid-cols-2 gap-6 shadow-sm">
                  <InfoItem label="País" value={selectedUser.country} />
                  <InfoItem label="Estado / Depto" value={selectedUser.state} />
                  <InfoItem label="Localidad" value={selectedUser.locality} className="col-span-2" />
                </div>
              </div>

              {/* Health & Emergencies */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">
                  Salud y Emergencia
                </h4>
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <InfoItem 
                      label="Contacto Emergencia" 
                      value={selectedUser.emergencyContact?.name || "No registrado"} 
                      subValue={selectedUser.emergencyContact?.phone}
                    />
                    <InfoItem 
                      label="Alergias / Padecimientos" 
                      value={selectedUser.healthInfo?.allergies || "Ninguna"} 
                      subValue={selectedUser.healthInfo?.conditions !== "Ninguna" ? selectedUser.healthInfo?.conditions : undefined}
                    />
                  </div>
                  <InfoItem 
                    label="Medicamentos" 
                    value={selectedUser.healthInfo?.medications || "Ninguno"} 
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4 pb-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">
                Documentación Legal
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-[2.5rem] p-2 border border-gray-100 aspect-video relative group overflow-hidden shadow-inner">
                  {selectedUser.documentUrl ? (
                    <>
                      {selectedUser.documentUrl.toLowerCase().endsWith(".pdf") ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[2.2rem]">
                          <FileText size={48} className="text-primary mb-2" />
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ver PDF</span>
                        </div>
                      ) : (
                        <img
                          src={selectedUser.documentUrl}
                          className="w-full h-full object-cover rounded-[2.2rem]"
                          alt="Documento"
                        />
                      )}
                      <a
                        href={selectedUser.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                      >
                        <Button variant="primary" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">
                          <ExternalLink size={14} className="mr-2" /> Ampliar Identificación
                        </Button>
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[2.2rem] border-2 border-dashed border-gray-200">
                      <AlertCircle size={40} className="text-gray-200 mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Pendiente</span>
                    </div>
                  )}
                </div>

                {selectedUser.age < 18 && (
                  <label className={cn(
                    "w-full flex items-center justify-center gap-4 h-20 bg-white border-2 border-dashed rounded-[2rem] cursor-pointer hover:bg-primary/5 transition-all group",
                    isUploading ? "border-primary animate-pulse" : "border-gray-200 hover:border-primary/30"
                  )}>
                    {isUploading ? (
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Subiendo Archivo...</span>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Upload size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Cargar Responsiva</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Formatos JPG, PNG o PDF</p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleUploadResponsiva}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function InfoItem({ label, value, subValue, className }: { label: string; value: string; subValue?: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
        {label}
      </p>
      <p className="text-xs font-bold text-secondary uppercase leading-tight">
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] font-medium text-primary leading-none mt-1">
          {subValue}
        </p>
      )}
    </div>
  );
}
