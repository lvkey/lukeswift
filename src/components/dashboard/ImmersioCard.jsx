import { Languages, BookOpen } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';
import { Heatmap } from './Heatmap';

function colorScale(minutes) {
  if (minutes <= 0) return 'bg-slate-100 dark:bg-white/5';
  if (minutes < 15) return 'bg-indigo-200 dark:bg-indigo-900';
  if (minutes < 30) return 'bg-indigo-300 dark:bg-indigo-700';
  if (minutes < 60) return 'bg-indigo-500 dark:bg-indigo-500';
  return 'bg-indigo-700 dark:bg-indigo-400';
}

function formatMinutes(totalMinutes) {
  const minutes = Math.round(totalMinutes);
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function ImmersioCard({ data }) {
  return (
    <DashboardCard title="Immersio" accent="Language Learning" icon={Languages}>
      <p className="text-sm text-slate-500 dark:text-white/60 mb-3">
        Total logged: <span className="font-semibold text-slate-800 dark:text-white/90">{formatMinutes(data.totalMinutes)}</span>
      </p>
      <Heatmap
        valuesByDate={data.valuesByDate}
        colorScale={colorScale}
        formatTooltip={(iso, minutes) => `${iso}: ${minutes > 0 ? formatMinutes(minutes) : 'no sessions'}`}
      />
      <div className="mt-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-1.5">
          <BookOpen size={15} />
          Streak: {data.currentStreak} day{data.currentStreak === 1 ? '' : 's'}
        </div>
        <p className="text-sm text-slate-500 dark:text-white/60">
          Lessons: <span className="font-semibold text-slate-800 dark:text-white/90">{data.lessons.completed} / {data.lessons.goal}</span>
        </p>
      </div>
      <PlaceholderNote source={data.source} />
      <PlaceholderNote source={data.lessons.source}>Lesson count is placeholder (Immersio doesn't track discrete lessons yet)</PlaceholderNote>
    </DashboardCard>
  );
}
