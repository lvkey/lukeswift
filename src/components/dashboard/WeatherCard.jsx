import { CloudSun } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';

export function WeatherCard({ data }) {
  return (
    <DashboardCard title={data.location} icon={CloudSun}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-3xl font-bold text-slate-800 dark:text-white/90">{data.current.tempC}°C</p>
        <p className="text-sm text-slate-500 dark:text-white/60">{data.current.condition}</p>
      </div>
      <div className="grid grid-cols-5 gap-2 text-center">
        {data.forecast.map((day) => (
          <div key={day.day} className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-400 dark:text-white/40">{day.day}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-white/80">{day.tempC}°</span>
          </div>
        ))}
      </div>
      <PlaceholderNote source={data.source} />
    </DashboardCard>
  );
}
