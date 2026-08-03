import { Wallet, PiggyBank, TrendingUp } from 'lucide-react';
import { DashboardCard, PlaceholderNote } from './DashboardCard';
import { formatIncome, formatCompactCurrency, formatSignedCurrency } from '../../lib/format';

function amountClass(value) {
  return value < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white/90';
}

function VarianceBar({ name, budgeted, actual, variance }) {
  const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 150) : 0;
  const over = actual > budgeted;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-slate-500 dark:text-white/60">{name}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${over ? 'bg-red-400 dark:bg-red-500' : 'bg-emerald-400 dark:bg-emerald-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`w-20 shrink-0 text-right font-medium ${over ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
        {formatSignedCurrency(variance)} {over ? '(Over)' : '(Under)'}
      </span>
    </div>
  );
}

export function FinancesCard({ data }) {
  return (
    <DashboardCard title="Finances" accent={data.scenarioName} icon={Wallet}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <p className="text-xs font-medium text-blue-50">Net Annual Income</p>
          <p className="text-lg font-bold mt-1 truncate">{formatIncome(data.netAnnualIncome)}</p>
        </div>
        {[1, 2, 3].map((years) => (
          <div key={years} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-white/60 flex items-center gap-1">
              <TrendingUp size={13} /> {years}-Year
            </p>
            <p className={`text-lg font-bold mt-1 truncate ${amountClass(data.horizons[years])}`}>
              {formatCompactCurrency(data.horizons[years])}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">Budget Variance</h3>
        <PiggyBank size={15} className="text-slate-300 dark:text-white/20" />
      </div>
      <div className="space-y-2.5">
        {data.budgetVariance.categories.map((c) => (
          <VarianceBar key={c.name} {...c} />
        ))}
      </div>
      {data.budgetVariance.totalVariance !== null && (
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-white/80">
          Total variance: {formatSignedCurrency(data.budgetVariance.totalVariance)}
        </p>
      )}
      <PlaceholderNote source={data.source} />
      <PlaceholderNote source={data.budgetVariance.source}>
        Budget variance is placeholder — no actual spending imported into Ledgr yet
      </PlaceholderNote>
    </DashboardCard>
  );
}
