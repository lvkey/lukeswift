import { useEffect } from 'react';
import { Sun, Moon, BookOpen, LayoutGrid } from 'lucide-react';
import { useDarkMode } from '../lib/useDarkMode';
import dashboardData from '../data/dashboard-data.json';
import { GithubContributionsCard } from '../components/dashboard/GithubContributionsCard';
import { ImmersioCard } from '../components/dashboard/ImmersioCard';
import { FinancesCard } from '../components/dashboard/FinancesCard';
import { HealthCard } from '../components/dashboard/HealthCard';
import { ReadingCard } from '../components/dashboard/ReadingCard';
import { WeatherCard } from '../components/dashboard/WeatherCard';

// Static for v1: modules render in this fixed order/column, no drag-and-drop
// yet. Kept as a plain ordered config (rather than hardcoded JSX per slot) so
// a future rearrangeable-layout pass only has to add interactivity around
// this list, not redesign it.
const MAIN_COLUMN = [
  { key: 'github', render: () => <GithubContributionsCard data={dashboardData.github} /> },
  { key: 'immersio', render: () => <ImmersioCard data={dashboardData.immersio} /> },
  { key: 'finances', render: () => <FinancesCard data={dashboardData.finances} /> },
];

const SIDE_COLUMN = [
  { key: 'health', render: () => <HealthCard data={dashboardData.health} /> },
  { key: 'reading', render: () => <ReadingCard data={dashboardData.reading} /> },
  { key: 'weather', render: () => <WeatherCard data={dashboardData.weather} /> },
];

export default function Dashboard() {
  const [isDark, setIsDark] = useDarkMode();

  useEffect(() => {
    document.title = "Luke Swift — Home";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white/90 p-3 sm:p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-white/90">Luke's Home</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 shadow-sm transition-colors"
            >
              <LayoutGrid size={15} />
              Projects
            </a>
            <a
              href="https://blg.lukeswift.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 shadow-sm transition-colors"
            >
              <BookOpen size={15} />
              Blog
            </a>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-9 h-9 shrink-0 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shadow-sm transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {MAIN_COLUMN.map((m) => (
              <div key={m.key}>{m.render()}</div>
            ))}
          </div>
          <div className="space-y-4">
            {SIDE_COLUMN.map((m) => (
              <div key={m.key}>{m.render()}</div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
