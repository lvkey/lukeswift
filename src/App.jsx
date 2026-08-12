import { Sun, Moon, Link2, ArrowUpRight, Sparkles, Wallet, Languages, Flame, BookOpen, LayoutGrid } from 'lucide-react';
import { useDarkMode } from './lib/useDarkMode';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from './components/ui/card';
import { TchbaeLogo } from './components/icons/TchbaeLogo';

const PROJECTS = [
  {
    name: 'Ledgr',
    description: 'A budgeting dashboard that survived contact with my actual finances.',
    href: 'https://bgt.lukeswift.net',
    icon: Wallet,
  },
  {
    name: 'Langfolio',
    description: 'A no-paywall language immersion tracker — log sessions, streaks, and stats.',
    href: 'https://mylangfolio.com',
    icon: Languages,
  },
  {
    name: 'TCHBAE',
    description: 'That Could Have Been An Email — flags meetings before you have to sit through them.',
    href: 'https://cbe.lukeswift.net',
    icon: TchbaeLogo,
  },
  {
    name: 'Project Four',
    description: 'TBD name, TBD scope, fully committed vibes.',
    href: '#',
    icon: Flame,
  },
];

function ProjectCard({ name, description, href, icon: Icon }) {
  const isExternal = href !== '#';
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="block h-full min-w-0"
    >
      <Card className="h-full gap-3 transition-shadow hover:shadow-md hover:ring-foreground/15">
        <CardHeader>
          <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Icon size={18} />
          </div>
          <CardAction>
            <ArrowUpRight size={18} className="text-muted-foreground/50" />
          </CardAction>
          <CardTitle className="mt-3 truncate">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </CardContent>
      </Card>
    </a>
  );
}

export default function App() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img src="/favicon.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm shrink-0" />
            <span className="font-semibold text-base sm:text-lg tracking-tight truncate">Luke Swift</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button asChild variant="outline" className="text-muted-foreground hover:text-foreground">
              <a href="/dashboard" aria-label="Dashboard">
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Dashboard</span>
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

        <main className="space-y-10 sm:space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-4 pt-4 sm:pt-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full px-3 py-1">
              <Sparkles size={13} />
              Certified Vibecoder
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Projects
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              This is where I keep my vibecoded projects and 2 a.m. ramblings that seemed
              like genius at the time and mostly held up in the morning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </main>

        <div className="flex justify-center pt-4">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <a href="#">
              <Link2 size={16} />
              More on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
