export function DashboardCard({ title, accent, icon: Icon, badge, children }) {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Icon size={16} />
            </div>
          )}
          <h2 className="font-semibold text-slate-800 dark:text-white/90">
            {title}
            {accent && <span className="ml-1.5 font-normal text-slate-400 dark:text-white/40">| {accent}</span>}
          </h2>
        </div>
        {badge && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-white/40 bg-slate-100 dark:bg-white/5 rounded-full px-2 py-0.5 shrink-0">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function PlaceholderNote({ source, children = 'Placeholder data' }) {
  if (source === 'live') return null;
  return <p className="mt-3 text-xs text-slate-400 dark:text-white/30">{children}</p>;
}
