// Runs before `vite build` (and before `vite` in dev, via the predev hook).
// Fetches everything the dashboard needs into one JSON file so the page stays
// fully static - no client-side fetching, no secrets in the browser bundle.
// Every module reports { source: 'live' | 'placeholder' } so the UI (and any
// future maintainer) can tell at a glance which numbers are real. Secrets are
// read via plain process.env, never anything VITE_-prefixed, so Vite never
// gets a chance to inline them into client-shipped JS.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'dashboard-data.json');

// Minimal .env.local loader for local dev - CI sets real env vars/secrets
// directly, so an existing value always wins over the file. Not needed
// (and won't exist) in CI; missing file is silently ignored.
async function loadDotEnvLocal() {
  try {
    const raw = await readFile(path.join(ROOT, '.env.local'), 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // no .env.local - fine, modules fall back to placeholder data
  }
}
await loadDotEnvLocal();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'lvkey';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Taigum, QLD 4018, Australia
const WEATHER_LATITUDE = -27.317;
const WEATHER_LONGITUDE = 152.974;
const WEATHER_LOCATION = 'Taigum, QLD';

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function currentStreakDays(valuesByDate, today = new Date()) {
  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  // If today has no activity yet, that's fine - check from yesterday so an
  // in-progress day doesn't look like a broken streak.
  if (!(valuesByDate.get(toISODate(cursor)) > 0)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (valuesByDate.get(toISODate(cursor)) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// --- GitHub contributions -------------------------------------------------
// GitHub's public per-user contributions fragment (the same markup that
// backs the profile page calendar) needs no auth for a public profile. Each
// day is an empty <td data-date=... id="contribution-day-component-X-Y">
// immediately followed by a sibling <tool-tip for="contribution-day-component-X-Y">
// carrying the human-readable count - the \2 backreference below ties each
// td to its own tool-tip by that id rather than assuming document order.
// Parsing is best-effort: any failure (markup change, private profile,
// network error) falls back to placeholder data rather than breaking the build.
async function fetchGithubContributions() {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
      headers: {
        'User-Agent': 'lukeswift-dashboard-bot (+https://lukeswift.net)',
        Accept: 'text/html',
      },
    });
    if (!res.ok) throw new Error(`GitHub contributions fetch failed: ${res.status}`);
    const html = await res.text();

    const cellRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-\d+-\d+)"[^>]*><\/td>\s*<tool-tip[^>]*for="\2"[^>]*>([^<]*)<\/tool-tip>/g;
    const valuesByDate = new Map();
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      const [, isoDate, , tooltipText] = match;
      const countMatch = tooltipText.match(/(\d+)\s+contributions?/);
      const noContributions = /No contributions/i.test(tooltipText);
      const count = noContributions ? 0 : countMatch ? Number(countMatch[1]) : 0;
      valuesByDate.set(isoDate, count);
    }

    if (valuesByDate.size < 50) throw new Error('Parsed too few contribution cells - markup likely changed');

    const totalContributions = [...valuesByDate.values()].reduce((sum, v) => sum + v, 0);

    return {
      source: 'live',
      username: GITHUB_USERNAME,
      totalContributions,
      currentStreak: currentStreakDays(valuesByDate),
      valuesByDate: Object.fromEntries(valuesByDate),
    };
  } catch (err) {
    console.warn('[dashboard-data] GitHub contributions: falling back to placeholder -', err.message);
    return placeholderGithub();
  }
}

function placeholderGithub() {
  return {
    source: 'placeholder',
    username: GITHUB_USERNAME,
    totalContributions: 1432,
    currentStreak: 12,
    valuesByDate: {},
  };
}

// --- Immersio (shared Supabase project) -----------------------------------
async function supabaseSelect(table, query) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase env vars not set');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${table} fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchImmersio() {
  try {
    const logs = await supabaseSelect('immersio_logs', 'select=minutes,log_date&order=log_date.desc&limit=5000');

    const valuesByDate = new Map();
    let totalMinutes = 0;
    for (const log of logs) {
      const minutes = Number(log.minutes) || 0;
      totalMinutes += minutes;
      valuesByDate.set(log.log_date, (valuesByDate.get(log.log_date) || 0) + minutes);
    }

    return {
      source: 'live',
      totalMinutes,
      currentStreak: currentStreakDays(valuesByDate),
      valuesByDate: Object.fromEntries(valuesByDate),
      // Immersio has no "lessons" concept in its schema (it tracks minutes by
      // activity, not discrete lessons) - this stays a placeholder until that
      // feature exists.
      lessons: { source: 'placeholder', completed: 215, goal: 1500 },
    };
  } catch (err) {
    console.warn('[dashboard-data] Immersio: falling back to placeholder -', err.message);
    return placeholderImmersio();
  }
}

function placeholderImmersio() {
  return {
    source: 'placeholder',
    totalMinutes: 0,
    currentStreak: 0,
    valuesByDate: {},
    lessons: { source: 'placeholder', completed: 215, goal: 1500 },
  };
}

// --- Finances / Ledgr (shared Supabase project) ---------------------------
// Ported from Ledgr's src/lib/tax.js - duplicated rather than shared since
// these are two independent repos/deployments.
const INCOME_TAX_BRACKETS = [
  { upTo: 18200, rate: 0 },
  { upTo: 45000, rate: 0.15 },
  { upTo: 135000, rate: 0.3 },
  { upTo: 190000, rate: 0.37 },
  { upTo: Infinity, rate: 0.45 },
];

function calculateIncomeTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let lowerBound = 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= lowerBound) break;
    tax += (Math.min(taxableIncome, bracket.upTo) - lowerBound) * bracket.rate;
    lowerBound = bracket.upTo;
  }
  return tax;
}

const MEDICARE_LEVY_LOWER_THRESHOLD = 28011;
const MEDICARE_LEVY_UPPER_THRESHOLD = 35013;

function calculateMedicareLevy(taxableIncome) {
  if (taxableIncome <= MEDICARE_LEVY_LOWER_THRESHOLD) return 0;
  if (taxableIncome <= MEDICARE_LEVY_UPPER_THRESHOLD) return (taxableIncome - MEDICARE_LEVY_LOWER_THRESHOLD) * 0.1;
  return taxableIncome * 0.02;
}

const HELP_THRESHOLD_1 = 69528;
const HELP_THRESHOLD_2 = 129717;
const HELP_THRESHOLD_3 = 186050;
const HELP_BASE_AT_THRESHOLD_2 = (HELP_THRESHOLD_2 - HELP_THRESHOLD_1) * 0.15;

function calculateHelpRepayment(taxableIncome) {
  if (taxableIncome < HELP_THRESHOLD_1) return 0;
  if (taxableIncome <= HELP_THRESHOLD_2) return (taxableIncome - HELP_THRESHOLD_1) * 0.15;
  if (taxableIncome <= HELP_THRESHOLD_3) return HELP_BASE_AT_THRESHOLD_2 + (taxableIncome - HELP_THRESHOLD_2) * 0.17;
  return taxableIncome * 0.1;
}

function calculateAfterTaxIncome(grossIncome, { medicareLevy = true, hecsHelp = false } = {}) {
  const income = Math.max(Number(grossIncome) || 0, 0);
  const incomeTax = calculateIncomeTax(income);
  const medicare = medicareLevy ? calculateMedicareLevy(income) : 0;
  const help = hecsHelp ? calculateHelpRepayment(income) : 0;
  return { netIncome: income - incomeTax - medicare - help };
}

const DAYS_IN_PERIOD = { Week: 7, Fortnight: 14, Month: 365 / 12, Quarter: 365 / 4, Year: 365 };

// Falls back for a brand-new Ledgr install with no Actuals profile or
// imported statements yet.
function placeholderBudgetVariance() {
  return {
    source: 'placeholder',
    categories: [
      { name: 'Groceries', budgeted: 400, actual: 368, variance: -32 },
      { name: 'Utilities', budgeted: 200, actual: 215, variance: 15 },
      { name: 'Discretionary', budgeted: 300, actual: 190, variance: -110 },
    ],
    totalVariance: -127,
  };
}

// Ported from Ledgr's src/lib/expenseCategories.js and src/lib/data.js
// (convertCost) - duplicated rather than shared since these are two
// independent repos/deployments, same as the tax functions above.
const EXPENSE_CATEGORY_GROUPS = [
  { name: 'Groceries', keywords: ['groceries', 'grocery', 'supermarket'] },
  { name: 'Dining', keywords: ['restaurant', 'cafe', 'coffee', 'takeaway', 'take-away', 'dining', 'lunch', 'dinner'] },
  { name: 'Utilities', keywords: ['water', 'electric', 'gas', 'internet', 'phone', 'mobile', 'utilit', 'broadband'] },
  { name: 'Vehicle', keywords: ['car', 'vehicle', 'rego', 'registration', 'fuel', 'petrol', 'parking', 'toll'] },
  { name: 'Transport', keywords: ['transport', 'rideshare', 'taxi', 'train', 'bus', 'tram', 'flight', 'travel'] },
  { name: 'Shopping', keywords: ['shopping', 'retail', 'clothing', 'homewares'] },
  { name: 'Subscriptions', keywords: ['netflix', 'youtube', 'spotify', 'disney', 'hulu', 'prime video', 'icloud', 'streaming', 'subscription', 'apple music'] },
  { name: 'Health & Fitness', keywords: ['health', 'medical', 'physio', 'psych', 'dental', 'doctor', 'gym', 'fitness', 'pharmacy'] },
  { name: 'Education', keywords: ['school', 'tutor', 'course', 'education', 'training', 'language'] },
];

function categorizeExpenseName(name) {
  const lower = (name || '').toLowerCase();
  const group = EXPENSE_CATEGORY_GROUPS.find((g) => g.keywords.some((kw) => lower.includes(kw)));
  return group ? group.name : null;
}

function convertCost(amount, fromFreq, toFreq) {
  const dailyRate = amount / DAYS_IN_PERIOD[fromFreq];
  return dailyRate * DAYS_IN_PERIOD[toFreq];
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

// Picks the most recently *completed* calendar month present in the
// transactions, so a still-in-progress month never reads as "under budget"
// just because it isn't over yet. Falls back to the latest month available
// if every imported transaction is from the current month.
function pickSnapshotMonth(monthKeys, now = new Date()) {
  const currentMonth = now.toISOString().slice(0, 7);
  const completed = [...monthKeys].filter((m) => m < currentMonth).sort();
  if (completed.length > 0) return completed[completed.length - 1];
  const all = [...monthKeys].sort();
  return all[all.length - 1] ?? null;
}

// Mirrors the category rollup in Ledgr's VarianceView (matched_expense_id is
// ignored here - the dashboard only needs a category-level snapshot, not a
// per-line one). Expense lines whose category the auto-categorizer can't
// place (e.g. "Rent", "Insurance") and transaction categories with no
// matching budget line both fall into a single "Other" catch-all, so no
// spend is silently dropped from the totals.
async function computeBudgetVariance(scenarioExpenses) {
  const profiles = await supabaseSelect('actual_profiles', 'select=id&order=created_at&limit=1');
  if (profiles.length === 0) throw new Error('No Actuals profile found');
  const profileId = profiles[0].id;

  const transactions = await supabaseSelect(
    'transactions',
    `select=txn_date,amount,category,excluded,import_batches!inner(profile_id)&import_batches.profile_id=eq.${profileId}`
  );
  const spend = transactions.filter((t) => !t.excluded && Number(t.amount) < 0);
  if (spend.length === 0) throw new Error('No actual spending imported yet');

  const snapshotMonth = pickSnapshotMonth(spend.map((t) => monthKey(t.txn_date)));
  const monthSpend = spend.filter((t) => monthKey(t.txn_date) === snapshotMonth);

  const budgetedByCategory = new Map();
  let otherBudgeted = 0;
  for (const e of scenarioExpenses) {
    const monthly = convertCost(Number(e.cost) || 0, e.freq, 'Month');
    const category = categorizeExpenseName(e.name);
    if (category) budgetedByCategory.set(category, (budgetedByCategory.get(category) || 0) + monthly);
    else otherBudgeted += monthly;
  }

  const actualByCategory = new Map();
  let otherActual = 0;
  for (const t of monthSpend) {
    const spendAmount = Math.abs(Number(t.amount));
    if (t.category && budgetedByCategory.has(t.category)) {
      actualByCategory.set(t.category, (actualByCategory.get(t.category) || 0) + spendAmount);
    } else {
      otherActual += spendAmount;
    }
  }

  const round2 = (n) => Math.round(n * 100) / 100;
  const categories = [...budgetedByCategory.entries()].map(([name, budgeted]) => ({
    name,
    budgeted: round2(budgeted),
    actual: round2(actualByCategory.get(name) || 0),
    variance: round2((actualByCategory.get(name) || 0) - budgeted),
  }));
  if (otherBudgeted > 0 || otherActual > 0) {
    categories.push({ name: 'Other', budgeted: round2(otherBudgeted), actual: round2(otherActual), variance: round2(otherActual - otherBudgeted) });
  }

  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActual = categories.reduce((sum, c) => sum + c.actual, 0);

  return { source: 'live', categories, totalVariance: round2(totalActual - totalBudgeted) };
}

async function fetchFinances() {
  try {
    const [scenarios, expenses, userSettings] = await Promise.all([
      supabaseSelect('scenarios', 'select=*&order=position'),
      supabaseSelect('expenses', 'select=*'),
      // Anonymous auth means multiple user_id rows can exist if this was ever
      // opened from more than one browser/device; the most recently updated
      // row is treated as the active session. Fine for a single-user app.
      supabaseSelect('user_settings', 'select=*&order=updated_at.desc&limit=1'),
    ]);

    if (scenarios.length === 0) throw new Error('No scenarios found');

    const selectedId = userSettings[0]?.selected_scenario_id;
    const scenario = scenarios.find((s) => s.id === selectedId) || scenarios[0];
    const scenarioExpenses = expenses.filter((e) => e.scenario_id === scenario.id);

    const { netIncome: netAnnualIncome } = calculateAfterTaxIncome(scenario.income, {
      medicareLevy: scenario.medicare_levy ?? true,
      hecsHelp: scenario.hecs_help ?? false,
    });

    const totalAnnualExpenses = scenarioExpenses.reduce(
      (sum, e) => sum + (Number(e.cost) || 0) / DAYS_IN_PERIOD[e.freq] * DAYS_IN_PERIOD.Year,
      0
    );
    const annualSavings = netAnnualIncome - totalAnnualExpenses;

    // Independent try/catch: a missing Actuals profile shouldn't take the
    // income/savings figures above down to placeholder too.
    let budgetVariance;
    try {
      budgetVariance = await computeBudgetVariance(scenarioExpenses);
    } catch (err) {
      console.warn('[dashboard-data] Budget variance: falling back to placeholder -', err.message);
      budgetVariance = placeholderBudgetVariance();
    }

    return {
      source: 'live',
      scenarioName: scenario.name,
      netAnnualIncome,
      annualSavings,
      horizons: Object.fromEntries([1, 2, 3, 5].map((years) => [years, annualSavings * years])),
      budgetVariance,
    };
  } catch (err) {
    console.warn('[dashboard-data] Finances: falling back to placeholder -', err.message);
    return placeholderFinances();
  }
}

function placeholderFinances() {
  return {
    source: 'placeholder',
    scenarioName: 'Overview',
    netAnnualIncome: 0,
    annualSavings: 0,
    horizons: { 1: 0, 2: 0, 3: 0, 5: 0 },
    budgetVariance: placeholderBudgetVariance(),
  };
}

// --- Health metrics (placeholder - no data source chosen yet) -------------
function placeholderHealth() {
  return {
    source: 'placeholder',
    todaySteps: 8103,
    stepsGoal: 10000,
    activeCalories: 489,
    activeMinutes: 55,
    weeklyBars: [
      { day: 'Sun', value: 5200 },
      { day: 'Mon', value: 4100 },
      { day: 'Tue', value: 8103 },
      { day: 'Wed', value: 3800 },
      { day: 'Thu', value: 2600 },
      { day: 'Fri', value: 3400 },
      { day: 'Sat', value: 3900 },
    ],
  };
}

// --- Weather (Open-Meteo, free & keyless) ---------------------------------
const WEATHER_CODE_LABELS = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy',
  45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
  75: 'Heavy snow', 80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

async function fetchWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LATITUDE}&longitude=${WEATHER_LONGITUDE}&current=temperature_2m,weather_code&daily=temperature_2m_max,weather_code&timezone=Australia%2FBrisbane&forecast_days=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo fetch failed: ${res.status}`);
    const data = await res.json();

    const dayNames = data.daily.time.map((iso) =>
      new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { weekday: 'short' })
    );

    return {
      source: 'live',
      location: WEATHER_LOCATION,
      current: {
        tempC: Math.round(data.current.temperature_2m),
        condition: WEATHER_CODE_LABELS[data.current.weather_code] || 'Unknown',
      },
      forecast: data.daily.time.map((iso, i) => ({
        day: dayNames[i],
        tempC: Math.round(data.daily.temperature_2m_max[i]),
        condition: WEATHER_CODE_LABELS[data.daily.weather_code[i]] || 'Unknown',
      })),
    };
  } catch (err) {
    console.warn('[dashboard-data] Weather: falling back to placeholder -', err.message);
    return placeholderWeather();
  }
}

function placeholderWeather() {
  return {
    source: 'placeholder',
    location: WEATHER_LOCATION,
    current: { tempC: 24, condition: 'Partly cloudy' },
    forecast: [
      { day: 'Mon', tempC: 24, condition: 'Clear' },
      { day: 'Tue', tempC: 24, condition: 'Cloudy' },
      { day: 'Wed', tempC: 24, condition: 'Light rain' },
      { day: 'Thu', tempC: 24, condition: 'Rain' },
      { day: 'Fri', tempC: 24, condition: 'Cloudy' },
    ],
  };
}

// --- Reading list (manually maintained, not fetched) ----------------------
async function loadReadingList() {
  try {
    const raw = await readFile(path.join(OUT_DIR, 'reading-list.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { source: 'placeholder', items: [], goals: [] };
  }
}

async function main() {
  const [github, langfolio, finances, weather, reading] = await Promise.all([
    fetchGithubContributions(),
    fetchImmersio(),
    fetchFinances(),
    fetchWeather(),
    loadReadingList(),
  ]);

  const data = {
    generatedAt: new Date().toISOString(),
    github,
    langfolio,
    finances,
    health: placeholderHealth(),
    reading,
    weather,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(data, null, 2));
  console.log(`[dashboard-data] wrote ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((err) => {
  console.error('[dashboard-data] fatal error', err);
  process.exit(1);
});
