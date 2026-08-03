import { HeartPulse, Footprints } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';

export function HealthCard({ data }) {
  const maxValue = Math.max(...data.weeklyBars.map((b) => b.value), 1);
  return (
    <DashboardCard title="Daily Health Metrics" icon={HeartPulse}>
      <div className="flex items-end gap-2 h-24 mb-4">
        {data.weeklyBars.map((bar) => (
          <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end h-20 rounded-t bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div
                className="w-full bg-blue-400 dark:bg-blue-500 rounded-t"
                style={{ height: `${(bar.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-white/40">{bar.day}</span>
          </div>
        ))}
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-white/60 flex items-center gap-1.5">
            <Footprints size={14} /> Today's steps
          </dt>
          <dd className="font-semibold text-slate-800 dark:text-white/90">
            {data.todaySteps.toLocaleString()} / {data.stepsGoal.toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-white/60">Active calories</dt>
          <dd className="font-semibold text-slate-800 dark:text-white/90">{data.activeCalories} kcal</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-white/60">Active minutes</dt>
          <dd className="font-semibold text-slate-800 dark:text-white/90">{data.activeMinutes} min</dd>
        </div>
      </dl>
      <PlaceholderNote source={data.source}>No fitness data source connected yet</PlaceholderNote>
    </DashboardCard>
  );
}
