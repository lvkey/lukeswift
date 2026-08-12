import { useEffect } from 'react';
import { Sun, Moon, BookOpen, LayoutGrid } from 'lucide-react';
import { useDarkMode } from '../lib/useDarkMode';
import { Button } from '../components/ui/button';
import dashboardData from '../data/dashboard-data.json';
import { GithubContributionsCard } from '../components/dashboard/GithubContributionsCard';
import { LangfolioCard } from '../components/dashboard/LangfolioCard';
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
  { key: 'langfolio', render: () => <LangfolioCard data={dashboardData.langfolio} /> },
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
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img src="/favicon.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm shrink-0" />
            <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-800 dark:text-white/90 truncate">Luke's Home</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button asChild variant="outline" className="text-muted-foreground hover:text-foreground">
              <a href="/" aria-label="Projects">
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Projects</span>
              </a>
            </Button>
            <Button asChild variant="outline" className="text-muted-foreground hover:text-foreground">
              <a href="https://blg.lukeswift.net" target="_blank" rel="noopener noreferrer" aria-label="Blog">
                <BookOpen size={15} />
                <span className="hidden sm:inline">Blog</span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        </header>

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
