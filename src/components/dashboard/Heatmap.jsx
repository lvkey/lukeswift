import { useState } from 'react';

// Generalized from immersio/src/components/ActivityHeatmap.jsx so both the
// GitHub and Immersio cards can share one grid/tooltip implementation.

function buildCells(valuesByDate, weeks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align the grid so the last column ends on today, weeks running Sun-Sat.
  const end = new Date(today);
  const endDow = end.getDay();
  const start = new Date(end);
  start.setDate(start.getDate() - endDow - (weeks - 1) * 7);

  const cells = [];
  const cursor = new Date(start);
  for (let i = 0; i < weeks * 7; i += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    cells.push({ iso, value: valuesByDate[iso] ?? 0, isFuture: cursor > today });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function Heatmap({ valuesByDate, weeks = 14, colorScale, formatTooltip }) {
  const [hovered, setHovered] = useState(null);
  const cells = buildCells(valuesByDate, weeks);
  const columns = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {columns.map((column, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {column.map((cell) => (
              <div
                key={cell.iso}
                onMouseEnter={() => setHovered(cell)}
                onMouseLeave={() => setHovered((h) => (h?.iso === cell.iso ? null : h))}
                className={`w-3.5 h-3.5 rounded-sm ${cell.isFuture ? 'invisible' : colorScale(cell.value)}`}
              />
            ))}
          </div>
        ))}
      </div>
      {hovered && (
        <div className="mt-2 text-xs text-slate-500 dark:text-white/50">{formatTooltip(hovered.iso, hovered.value)}</div>
      )}
    </div>
  );
}
