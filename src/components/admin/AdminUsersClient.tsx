"use client";

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Upload,
} from "lucide-react";
import * as React from "react";
import { updateUserDocument } from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
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

      {/* USER DETAILS MODAL */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
        {selectedUser && (
          <>
            <ModalHeader onClose={() => setSelectedUser(null)}>
              <ModalTitle className="text-2xl font-black uppercase tracking-tighter">
                Expediente del <span className="text-primary">Asistente</span>
              </ModalTitle>
            </ModalHeader>
            <ModalContent className="space-y-8 pt-4 overflow-y-auto max-h-[70vh]">
              {/* Profile & Document Visuals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Foto de Perfil
                  </p>
                  <div className="h-48 rounded-[1.5rem] bg-gray-100 overflow-hidden border border-gray-200">
                    <img
                      src={selectedUser.profilePhotoUrl}
                      className="w-full h-full object-cover"
                      alt="Perfil"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Identificación / INE
                  </p>
                  <div className="h-48 rounded-[1.5rem] bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                    {selectedUser.documentUrl?.endsWith(".pdf") ? (
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="text-primary" />
                        <span className="text-[10px] font-bold mt-2">
                          Documento PDF
                        </span>
                      </div>
                    ) : (
                      <img
                        src={selectedUser.documentUrl}
                        className="w-full h-full object-cover"
                        alt="Documento"
                      />
                    )}
                    <a
                      href={selectedUser.documentUrl}
                      target="_blank"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <ExternalLink className="text-white" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Upload Responsiva */}
              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-tight">
                    Carta Responsiva
                  </h4>
                  {selectedUser.documentUrl ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase bg-white px-2 py-1 rounded-md shadow-sm">
                      <CheckCircle2 size={10} /> Recibida
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase bg-white px-2 py-1 rounded-md shadow-sm">
                      <AlertCircle size={10} /> Pendiente
                    </span>
                  )}
                </div>
                <label className="w-full flex items-center justify-center gap-3 h-14 bg-white border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 transition-all group">
                  {isUploading ? (
                    <span className="text-xs font-bold text-primary animate-pulse">
                      Subiendo...
                    </span>
                  ) : (
                    <>
                      <Upload
                        size={18}
                        className="text-primary group-hover:translate-y-[-2px] transition-transform"
                      />
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                        Subir o Actualizar Responsiva
                      </span>
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
                <p className="text-[9px] text-gray-400 mt-3 text-center uppercase font-bold tracking-widest italic">
                  Acepta formatos JPG, PNG o PDF
                </p>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoItem label="Edad" value={`${selectedUser.age} años`} />
                <InfoItem label="Talla" value={selectedUser.shirtSize} />
                <InfoItem
                  label="Salud"
                  value={selectedUser.healthInfo?.allergies || "Sin alergias"}
                />
                <InfoItem
                  label="Emergencia"
                  value={selectedUser.emergencyContact?.name || "No registrado"}
                />
              </div>
            </ModalContent>
            <ModalFooter>
              <Button className="w-full" onClick={() => setSelectedUser(null)}>
                Cerrar Expediente
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-secondary uppercase leading-none">
        {value}
      </p>
    </div>
  );
}
