import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3 group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            ref={ref}
            {...props}
          />
          <div
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            className={cn(
              "h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer",
              checked
                ? "bg-primary border-primary shadow-sm shadow-primary/20"
                : "border-gray-300 group-hover:border-primary bg-white",
            )}
            onClick={() => {
              const event = {
                target: { checked: !checked },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(event);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const event = {
                  target: { checked: !checked },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange?.(event);
              }
            }}
          >
            <Check
              className={cn(
                "h-3.5 w-3.5 text-white stroke-[4] transition-transform duration-200 scale-0",
                checked && "scale-100",
              )}
            />
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-xs font-medium text-secondary/70 leading-tight cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
