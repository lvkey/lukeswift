import { Sun, Moon, Link2, ArrowUpRight, Sparkles, FolderGit2 } from 'lucide-react';
import { useDarkMode } from './lib/useDarkMode';

const PROJECTS = [
  {
    name: 'Budget App',
    description: 'A budgeting dashboard that survived contact with my actual finances.',
    href: 'https://bgt.lukeswift.net',
  },
  {
    name: 'Immersio',
    description: 'A no-paywall language immersion tracker — log sessions, streaks, and stats.',
    href: 'https://lng.lukeswift.net',
  },
  {
    name: 'Project Three',
    description: 'Built at an hour that was not good for decision-making. Still standing, somehow.',
    href: '#',
  },
  {
    name: 'Project Four',
    description: 'TBD name, TBD scope, fully committed vibes.',
    href: '#',
  },
];

function ProjectCard({ name, description, href }) {
  const isExternal = href !== '#';
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex flex-col justify-between bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all min-w-0"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <FolderGit2 size={18} />
          </div>
          <ArrowUpRight
            size={18}
            className="text-slate-300 dark:text-white/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0"
          />
        </div>
        <h3 className="mt-4 font-semibold text-slate-800 dark:text-white/90 truncate">{name}</h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-white/60 leading-relaxed">{description}</p>
      </div>
    </a>
  );
}

export default function App() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white/90 p-3 sm:p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
        <div className="flex justify-between items-center">
          <span className="font-semibold tracking-tight text-slate-800 dark:text-white/90">Luke Swift</span>
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-9 h-9 shrink-0 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shadow-sm transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full px-3 py-1">
            <Sparkles size={13} />
            Certified Vibecoder
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white/90">
            Projects
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-white/60 leading-relaxed">
            This is where I keep my vibecoded projects and 2 a.m. ramblings that seemed
            like genius at the time and mostly held up in the morning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 transition-colors"
          >
            <Link2 size={16} />
            More on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
