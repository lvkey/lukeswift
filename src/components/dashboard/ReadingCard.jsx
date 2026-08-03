import { BookOpen, Target } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';

export function ReadingCard({ data }) {
  return (
    <DashboardCard title="Reading List & Growth" icon={BookOpen}>
      <ul className="space-y-3 mb-5">
        {data.items.map((item) => (
          <li key={item.title}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-700 dark:text-white/80">{item.title}</span>
              <span className="text-slate-400 dark:text-white/40">{item.progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: `${item.progressPct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-white/70 mb-2">
        <Target size={14} /> Personal Goals
      </h3>
      <ul className="space-y-1.5 text-sm text-slate-500 dark:text-white/60">
        {data.goals.map((goal) => (
          <li key={goal}>- {goal}</li>
        ))}
      </ul>
      <PlaceholderNote source={data.source}>Hand-maintained in src/data/reading-list.json</PlaceholderNote>
    </DashboardCard>
  );
}
