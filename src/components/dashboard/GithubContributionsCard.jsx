import { GitCommitHorizontal, Flame } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';
import { Heatmap } from './Heatmap';

function colorScale(count) {
  if (count <= 0) return 'bg-slate-100 dark:bg-white/5';
  if (count < 3) return 'bg-blue-200 dark:bg-blue-900';
  if (count < 6) return 'bg-blue-300 dark:bg-blue-700';
  if (count < 10) return 'bg-blue-500 dark:bg-blue-500';
  return 'bg-blue-700 dark:bg-blue-400';
}

export function GithubContributionsCard({ data }) {
  const year = new Date().getFullYear();
  return (
    <DashboardCard title="GitHub Contributions" accent={`Year ${year}`} icon={GitCommitHorizontal}>
      <p className="text-sm text-slate-500 dark:text-white/60 mb-3">
        Total contributions:{' '}
        <span className="font-semibold text-slate-800 dark:text-white/90">{data.totalContributions.toLocaleString()}</span>
      </p>
      <Heatmap
        valuesByDate={data.valuesByDate}
        colorScale={colorScale}
        formatTooltip={(iso, count) => `${iso}: ${count} contribution${count === 1 ? '' : 's'}`}
      />
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg px-3 py-1.5">
        <Flame size={15} />
        Current streak: {data.currentStreak} day{data.currentStreak === 1 ? '' : 's'}
      </div>
      <PlaceholderNote source={data.source} />
    </DashboardCard>
  );
}
