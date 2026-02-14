"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapse({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapseProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group text-left"
      >
        <h2 className="text-sm font-black text-secondary uppercase tracking-[0.15em]">
          {title}
        </h2>
        <div
          className={cn(
            "h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all",
            isOpen && "rotate-180 bg-primary/10 text-primary"
          )}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-8 pb-8 pt-2 border-t border-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
