import type { AdminStats } from "@/app/actions/admin-stats";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function TopLocalities({
  localities,
}: {
  localities: AdminStats["topLocalities"];
}) {
  const max = Math.max(1, ...localities.map((l) => l.count));

  return (
    <DashboardCard title="Top Localidades">
      <div className="space-y-4">
        {localities.map((l) => (
          <div key={l.locality} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-secondary truncate pr-2">
                {l.locality}
              </span>
              <span className="font-black text-secondary">{l.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(l.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {localities.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6 uppercase font-bold tracking-widest">
            Sin registros
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
