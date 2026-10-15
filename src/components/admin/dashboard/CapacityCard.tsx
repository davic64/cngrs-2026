import type { AdminStats } from "@/app/actions/admin-stats";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";

function Bar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-black text-secondary">
          {used}/{limit}
        </p>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100
              ? "bg-red-500"
              : pct >= 90
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {Math.max(0, limit - used)} lugares disponibles
      </p>
    </div>
  );
}

export function CapacityCard({
  capacity,
}: {
  capacity: AdminStats["capacity"];
}) {
  return (
    <DashboardCard title="Cupos">
      <div className="space-y-6">
        <Bar
          label="Generales (hasta 29 años)"
          used={capacity.regular.used}
          limit={capacity.regular.limit}
        />
        <Bar
          label="Acompañantes (30+ años)"
          used={capacity.adults.used}
          limit={capacity.adults.limit}
        />
      </div>
    </DashboardCard>
  );
}
