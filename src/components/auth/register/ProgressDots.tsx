import { cn } from "@/lib/utils";

export function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-3 py-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            step === i
              ? "w-10 bg-primary shadow-sm shadow-primary/30"
              : "w-2 bg-gray-300",
          )}
        />
      ))}
    </div>
  );
}
