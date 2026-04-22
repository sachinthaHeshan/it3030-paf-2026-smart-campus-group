"use client";

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

interface BookingHeatmapProps {
  cells: HeatmapCell[];
  maxCount: number;
  weeks: number;
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function dayLabelFromDow(dow: number): string {
  const idx = (dow + 6) % 7;
  return DAY_LABELS[idx];
}

export default function BookingHeatmap({
  cells,
  maxCount,
  weeks,
}: BookingHeatmapProps) {
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );
  for (const c of cells) {
    if (c.day < 0 || c.day > 6 || c.hour < 0 || c.hour > 23) continue;
    grid[c.day][c.hour] = c.count;
  }

  return (
    <div className="w-full">
      <div className="flex">
        <div className="w-10 shrink-0" />
        <div
          className="grid gap-px flex-1 min-w-0"
          style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="text-[9px] text-muted text-center"
              style={{ visibility: h % 3 === 0 ? "visible" : "hidden" }}
            >
              {h}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-px mt-1">
        {DAY_ORDER.map((dow) => (
          <div key={dow} className="flex items-center">
            <div className="w-10 shrink-0 text-[10.5px] text-muted font-medium pr-2 text-right">
              {dayLabelFromDow(dow)}
            </div>
            <div
              className="grid gap-px flex-1 min-w-0"
              style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
            >
              {Array.from({ length: 24 }).map((_, h) => {
                const count = grid[dow][h];
                const density = maxCount > 0 ? count / maxCount : 0;
                const bg =
                  count > 0
                    ? `rgba(220, 38, 38, ${Math.max(density, 0.08)})`
                    : "rgb(243, 244, 246)";
                return (
                  <div
                    key={h}
                    className="aspect-square rounded-sm"
                    style={{ backgroundColor: bg }}
                    title={`${dayLabelFromDow(dow)} ${formatHour(h)} \u2014 ${count} booking${count === 1 ? "" : "s"}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>Last {weeks} week{weeks === 1 ? "" : "s"} (approved + cancelled)</span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-px">
            {[0.08, 0.25, 0.5, 0.75, 1].map((d) => (
              <div
                key={d}
                className="h-3 w-4 rounded-sm"
                style={{ backgroundColor: `rgba(220, 38, 38, ${d})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
