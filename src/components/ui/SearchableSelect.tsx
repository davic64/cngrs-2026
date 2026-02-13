"use client";

import { ChevronDown, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-secondary/80 ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            error && "border-red-500",
            isOpen && "ring-2 ring-primary/20 border-primary",
          )}
        >
          <span className={cn("truncate", !value && "text-gray-400")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-black/10 overflow-hidden"
            >
              <div className="p-2 border-b border-gray-50 flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400 ml-2" />
                <input
                  className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
                  placeholder="Escribe para filtrar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full px-3 py-2.5 text-left text-sm rounded-xl transition-colors mb-0.5 last:mb-0",
                        value === option.value
                          ? "bg-primary text-white font-bold"
                          : "hover:bg-primary/5 text-secondary",
                      )}
                    >
                      {option.label}
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    No hay resultados
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
