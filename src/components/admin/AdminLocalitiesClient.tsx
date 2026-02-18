"use client";

import { motion } from "framer-motion";
import { Building2, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import * as React from "react";
import {
  createLocality,
  deleteLocality,
  updateLocality,
} from "@/app/actions/admin";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Select } from "@/components/ui/Select";

const ESTADOS_POR_PAIS: Record<string, { value: string; label: string }[]> = {
  México: [
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Baja California", label: "Baja California" },
    { value: "Baja California Sur", label: "Baja California Sur" },
    { value: "Campeche", label: "Campeche" },
    { value: "Chiapas", label: "Chiapas" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Coahuila", label: "Coahuila" },
    { value: "Colima", label: "Colima" },
    { value: "Durango", label: "Durango" },
    { value: "Estado de México", label: "Estado de México" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Guerrero", label: "Guerrero" },
    { value: "Hidalgo", label: "Hidalgo" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Michoacán", label: "Michoacán" },
    { value: "Morelos", label: "Morelos" },
    { value: "Nayarit", label: "Nayarit" },
    { value: "Nuevo León", label: "Nuevo León" },
    { value: "Oaxaca", label: "Oaxaca" },
    { value: "Puebla", label: "Puebla" },
    { value: "Querétaro", label: "Querétaro" },
    { value: "Quintana Roo", label: "Quintana Roo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Sinaloa", label: "Sinaloa" },
    { value: "Sonora", label: "Sonora" },
    { value: "Tabasco", label: "Tabasco" },
    { value: "Tamaulipas", label: "Tamaulipas" },
    { value: "Tlaxcala", label: "Tlaxcala" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Yucatán", label: "Yucatán" },
    { value: "Zacatecas", label: "Zacatecas" },
  ],
  "Estados Unidos": [
    { value: "Alabama", label: "Alabama" },
    { value: "Alaska", label: "Alaska" },
    { value: "Arizona", label: "Arizona" },
    { value: "Arkansas", label: "Arkansas" },
    { value: "California", label: "California" },
    { value: "Colorado", label: "Colorado" },
    { value: "Connecticut", label: "Connecticut" },
    { value: "Delaware", label: "Delaware" },
    { value: "Florida", label: "Florida" },
    { value: "Georgia", label: "Georgia" },
    { value: "Hawaii", label: "Hawaii" },
    { value: "Idaho", label: "Idaho" },
    { value: "Illinois", label: "Illinois" },
    { value: "Indiana", label: "Indiana" },
    { value: "Iowa", label: "Iowa" },
    { value: "Kansas", label: "Kansas" },
    { value: "Kentucky", label: "Kentucky" },
    { value: "Louisiana", label: "Louisiana" },
    { value: "Maine", label: "Maine" },
    { value: "Maryland", label: "Maryland" },
    { value: "Massachusetts", label: "Massachusetts" },
    { value: "Michigan", label: "Michigan" },
    { value: "Minnesota", label: "Minnesota" },
    { value: "Mississippi", label: "Mississippi" },
    { value: "Missouri", label: "Missouri" },
    { value: "Montana", label: "Montana" },
    { value: "Nebraska", label: "Nebraska" },
    { value: "Nevada", label: "Nevada" },
    { value: "New Hampshire", label: "New Hampshire" },
    { value: "New Jersey", label: "New Jersey" },
    { value: "New Mexico", label: "New Mexico" },
    { value: "New York", label: "New York" },
    { value: "North Carolina", label: "North Carolina" },
    { value: "North Dakota", label: "North Dakota" },
    { value: "Ohio", label: "Ohio" },
    { value: "Oklahoma", label: "Oklahoma" },
    { value: "Oregon", label: "Oregon" },
    { value: "Pennsylvania", label: "Pennsylvania" },
    { value: "Rhode Island", label: "Rhode Island" },
    { value: "South Carolina", label: "South Carolina" },
    { value: "South Dakota", label: "South Dakota" },
    { value: "Tennessee", label: "Tennessee" },
    { value: "Texas", label: "Texas" },
    { value: "Utah", label: "Utah" },
    { value: "Vermont", label: "Vermont" },
    { value: "Virginia", label: "Virginia" },
    { value: "Washington", label: "Washington" },
    { value: "West Virginia", label: "West Virginia" },
    { value: "Wisconsin", label: "Wisconsin" },
    { value: "Wyoming", label: "Wyoming" },
  ],
  Canadá: [
    { value: "Alberta", label: "Alberta" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Manitoba", label: "Manitoba" },
    { value: "New Brunswick", label: "New Brunswick" },
    { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
    { value: "Nova Scotia", label: "Nova Scotia" },
    { value: "Ontario", label: "Ontario" },
    { value: "Prince Edward Island", label: "Prince Edward Island" },
    { value: "Quebec", label: "Quebec" },
    { value: "Saskatchewan", label: "Saskatchewan" },
  ],
  "El Salvador": [
    { value: "Ahuachapán", label: "Ahuachapán" },
    { value: "Cabañas", label: "Cabañas" },
    { value: "Chalatenango", label: "Chalatenango" },
    { value: "Cuscatlán", label: "Cabañas" },
    { value: "La Libertad", label: "La Libertad" },
    { value: "La Paz", label: "La Paz" },
    { value: "La Unión", label: "La Unión" },
    { value: "Morazán", label: "Morazán" },
    { value: "San Miguel", label: "San Miguel" },
    { value: "San Salvador", label: "San Salvador" },
    { value: "San Vicente", label: "San Vicente" },
    { value: "Santa Ana", label: "Santa Ana" },
    { value: "Sonsonate", label: "Sonsonate" },
    { value: "Usulután", label: "Usulután" },
  ],
  Guatemala: [
    { value: "Alta Verapaz", label: "Alta Verapaz" },
    { value: "Baja Verapaz", label: "Baja Verapaz" },
    { value: "Chimaltenango", label: "Chimaltenango" },
    { value: "Chiquimula", label: "Chiquimula" },
    { value: "El Progreso", label: "El Progreso" },
    { value: "Escuintla", label: "Escuintla" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Huehuetenango", label: "Huehuetenango" },
    { value: "Izabal", label: "Izabal" },
    { value: "Jalapa", label: "Jalapa" },
    { value: "Jutiapa", label: "Jutiapa" },
    { value: "Petén", label: "Petén" },
    { value: "Quetzaltenango", label: "Quetzaltenango" },
    { value: "Quiché", label: "Quiché" },
    { value: "Retalhuleu", label: "Retalhuleu" },
    { value: "Sacatepéquez", label: "Sacatepéquez" },
    { value: "San Marcos", label: "San Marcos" },
    { value: "Santa Rosa", label: "Santa Rosa" },
    { value: "Sololá", label: "Sololá" },
    { value: "Suchitepéquez", label: "Suchitepéquez" },
    { value: "Totonicapán", label: "Totonicapán" },
    { value: "Zacapa", label: "Zacapa" },
  ],
  Honduras: [
    { value: "Atlántida", label: "Atlántida" },
    { value: "Choluteca", label: "Choluteca" },
    { value: "Colón", label: "Colón" },
    { value: "Comayagua", label: "Comayagua" },
    { value: "Copán", label: "Copán" },
    { value: "Cortés", label: "Cortés" },
    { value: "El Paraíso", label: "El Paraíso" },
    { value: "Francisco Morazán", label: "Francisco Morazán" },
    { value: "Gracias a Dios", label: "Gracias a Dios" },
    { value: "Intibucá", label: "Intibucá" },
    { value: "Islas de la Bahía", label: "Islas de la Bahía" },
    { value: "La Paz", label: "La Paz" },
    { value: "Lempira", label: "Lempira" },
    { value: "Ocotepeque", label: "Ocotepeque" },
    { value: "Olancho", label: "Olancho" },
    { value: "Santa Bárbara", label: "Santa Bárbara" },
    { value: "Valle", label: "Valle" },
    { value: "Yoro", label: "Yoro" },
  ],
};

const COUNTRIES = [
  "México",
  "Estados Unidos",
  "Canadá",
  "El Salvador",
  "Guatemala",
  "Honduras",
];

interface Locality {
  id: number;
  name: string;
  state: string;
  country: string;
}

interface EditState {
  name: string;
  state: string;
  country: string;
  isSaving: boolean;
}

export function AdminLocalitiesClient({
  initialLocalities,
}: {
  initialLocalities: Locality[];
}) {
  const [localities, setLocalities] =
    React.useState<Locality[]>(initialLocalities);
  const [newLocality, setNewLocality] = React.useState({
    name: "",
    state: "",
    country: "México",
  });
  const [showManualState, setShowManualState] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);

  // Filter state for the list
  const [filterCountry, setFilterCountry] = React.useState("");
  const [filterState, setFilterState] = React.useState("");

  // Edit state: maps locality id → edit data
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState<EditState>({
    name: "",
    state: "",
    country: "",
    isSaving: false,
  });

  const handleAdd = async () => {
    if (!newLocality.name || !newLocality.state) return;
    setIsAdding(true);
    await createLocality(newLocality);
    setLocalities((prev) => [
      ...prev,
      { id: Date.now(), ...newLocality },
    ]);
    setNewLocality({ ...newLocality, name: "", state: "" });
    setShowManualState(false);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    await deleteLocality(id);
    setLocalities((prev) => prev.filter((l) => l.id !== id));
  };

  const handleEditStart = (loc: Locality) => {
    setEditingId(loc.id);
    setEditData({
      name: loc.name,
      state: loc.state,
      country: loc.country,
      isSaving: false,
    });
  };

  const handleEditSave = async (id: number) => {
    if (!editData.name || !editData.state) return;
    setEditData((prev) => ({ ...prev, isSaving: true }));
    await updateLocality(id, {
      name: editData.name,
      state: editData.state,
      country: editData.country,
    });
    setLocalities((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, name: editData.name, state: editData.state, country: editData.country }
          : l,
      ),
    );
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const statesOptions = React.useMemo(() => {
    const options = ESTADOS_POR_PAIS[newLocality.country] || [];
    return [
      ...options,
      { value: "Otro", label: "Otro (Escribir manualmente)" },
    ];
  }, [newLocality.country]);

  // States for the selected filter country
  const filterStateOptions = React.useMemo(() => {
    if (!filterCountry) return [];
    return ESTADOS_POR_PAIS[filterCountry] || [];
  }, [filterCountry]);

  // States for editing
  const editStateOptions = React.useMemo(() => {
    const options = ESTADOS_POR_PAIS[editData.country] || [];
    return [
      ...options,
      { value: "Otro", label: "Otro (Escribir manualmente)" },
    ];
  }, [editData.country]);

  const filteredLocalities = React.useMemo(() => {
    return localities.filter((loc) => {
      if (filterCountry && loc.country !== filterCountry) return false;
      if (filterState && loc.state !== filterState) return false;
      return true;
    });
  }, [localities, filterCountry, filterState]);

  // Group filtered localities by country
  const visibleCountries = filterCountry
    ? [filterCountry]
    : COUNTRIES;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <header>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Configuración Geográfica
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tighter">
          Gestión de <span className="text-primary">Localidades</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Add New */}
        <div className="lg:col-span-4">
          <DashboardCard title="Agregar Sede/Distrito">
            <div className="space-y-4">
              <Select
                label="País"
                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                value={newLocality.country}
                onChange={(e) =>
                  setNewLocality({
                    ...newLocality,
                    country: e.target.value,
                    state: "",
                  })
                }
              />
              <SearchableSelect
                label="Estado / Departamento"
                placeholder="Busca tu estado..."
                options={statesOptions}
                value={showManualState ? "Otro" : newLocality.state}
                onChange={(val) => {
                  if (val === "Otro") {
                    setShowManualState(true);
                    setNewLocality({ ...newLocality, state: "" });
                  } else {
                    setShowManualState(false);
                    setNewLocality({ ...newLocality, state: val });
                  }
                }}
              />
              {showManualState && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    label="Escribe el Estado"
                    placeholder="Nombre del estado"
                    value={newLocality.state}
                    onChange={(e) =>
                      setNewLocality({ ...newLocality, state: e.target.value })
                    }
                  />
                </motion.div>
              )}
              <Input
                label="Nombre de la Localidad"
                placeholder="Ej. Guadalajara, Santa Tecla..."
                value={newLocality.name}
                onChange={(e) =>
                  setNewLocality({ ...newLocality, name: e.target.value })
                }
              />
              <Button
                onClick={handleAdd}
                disabled={isAdding || !newLocality.name || !newLocality.state}
                className="w-full h-12 shadow-lg shadow-primary/20 font-black uppercase text-xs tracking-widest mt-2"
              >
                <Plus size={18} className="mr-2" />
                Registrar Localidad
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Main: List by Country */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select
                label="Filtrar por País"
                options={[
                  { value: "", label: "Todos los países" },
                  ...COUNTRIES.map((c) => ({ value: c, label: c })),
                ]}
                value={filterCountry}
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  setFilterState("");
                }}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Filtrar por Estado"
                options={[
                  { value: "", label: filterCountry ? "Todos los estados" : "Selecciona un país" },
                  ...filterStateOptions.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })),
                ]}
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                disabled={!filterCountry}
              />
            </div>
          </div>

          {visibleCountries.map((country) => {
            const countryLocs = filteredLocalities.filter(
              (l) => l.country === country,
            );
            if (countryLocs.length === 0) return null;

            return (
              <div key={country} className="space-y-3">
                <h3 className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] ml-2">
                  {country}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {countryLocs.map((loc) =>
                    editingId === loc.id ? (
                      <motion.div
                        key={loc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white p-4 rounded-2xl border border-primary/30 shadow-sm space-y-3"
                      >
                        <Select
                          label="País"
                          options={COUNTRIES.map((c) => ({
                            value: c,
                            label: c,
                          }))}
                          value={editData.country}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              country: e.target.value,
                              state: "",
                            })
                          }
                        />
                        <SearchableSelect
                          label="Estado"
                          placeholder="Selecciona estado..."
                          options={editStateOptions}
                          value={editData.state}
                          onChange={(val) =>
                            setEditData({
                              ...editData,
                              state: val === "Otro" ? "" : val,
                            })
                          }
                        />
                        <Input
                          label="Nombre"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                        <div className="flex gap-2 pt-1">
                          <Button
                            className="flex-1 h-9 text-xs"
                            onClick={() => handleEditSave(loc.id)}
                            disabled={
                              editData.isSaving ||
                              !editData.name ||
                              !editData.state
                            }
                          >
                            <Check size={14} className="mr-1" />
                            {editData.isSaving ? "Guardando..." : "Guardar"}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 px-3"
                            onClick={handleEditCancel}
                            disabled={editData.isSaving}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={loc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-secondary uppercase tracking-tight">
                              {loc.name}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              {loc.state}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditStart(loc)}
                            className="text-gray-300 hover:text-primary transition-colors p-2"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            );
          })}

          {filteredLocalities.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <Building2 size={48} className="text-gray-100 mx-auto mb-4" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                No hay localidades registradas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
