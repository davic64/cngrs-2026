import type { AdminStats } from "@/app/actions/admin-stats";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const short = (date: string) => {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
};

export function RegistrationsChart({
  days,
}: {
  days: AdminStats["registrationsByDay"];
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((acc, d) => acc + d.count, 0);

  return (
    <DashboardCard title="Registros por día">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest -mt-4 mb-4">
        Últimos {days.length} días • {total} registros
      </p>
      <div className="flex items-end gap-1 h-32">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${short(d.date)}: ${d.count}`}
            className="flex-1 h-full flex items-end"
          >
            <div
              className={
                d.count
                  ? "w-full rounded-t bg-primary"
                  : "w-full h-px bg-gray-200"
              }
              style={
                d.count ? { height: `${(d.count / max) * 100}%` } : undefined
              }
            />
          </div>
        ))}
      </div>
      {days.length > 0 && (
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
          <span>{short(days[0].date)}</span>
          <span>{short(days[days.length - 1].date)}</span>
        </div>
      )}
    </DashboardCard>
  );
}
