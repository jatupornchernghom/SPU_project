"use client";

import { useState } from "react";

const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;
const compactBaht = (n: number) => (n >= 1000 ? `฿${+(n / 1000).toFixed(1)}K` : `฿${n}`);

function formatDay(date: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T00:00:00+07:00`).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", ...opts });
}

/** Rounds the axis max up to 1 / 2 / 5 × 10^n so ticks are clean numbers. */
function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

/** Daily revenue as columns, one series (the title names it, so no legend). */
export function DailyRevenueChart({ data }: { data: { date: string; orders: number; revenue: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const ticks = [max, max / 2, 0];
  const peak = data.reduce((best, d, i) => (d.revenue > data[best].revenue ? i : best), 0);
  const labelEvery = data.length > 10 ? 2 : 1;
  const hovered = active === null ? null : data[active];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex gap-2 h-48">
        <div className="flex flex-col justify-between text-[10px] text-muted-foreground tabular-nums text-right w-10 -my-1.5">
          {ticks.map((t) => (
            <span key={t}>{compactBaht(t)}</span>
          ))}
        </div>
        <div className="relative flex-1" onPointerLeave={() => setActive(null)}>
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${(1 - t / max) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${formatDay(d.date, { day: "numeric", month: "short" })}: ${baht(d.revenue)}, ${d.orders} ออเดอร์`}
                className="relative flex-1 h-full flex items-end justify-center outline-none group"
              >
                {i === peak && d.revenue > 0 && (
                  <span
                    className="absolute text-[10px] font-semibold text-foreground tabular-nums whitespace-nowrap"
                    style={{ bottom: `calc(${(d.revenue / max) * 100}% + 4px)` }}
                  >
                    {compactBaht(d.revenue)}
                  </span>
                )}
                <span
                  className={`w-full max-w-6 rounded-t-[4px] transition-opacity group-focus-visible:ring-2 group-focus-visible:ring-ring ${
                    active !== null && active !== i ? "opacity-40" : ""
                  }`}
                  style={{
                    height: `${(d.revenue / max) * 100}%`,
                    minHeight: d.revenue > 0 ? 2 : 0,
                    background: "var(--chart-1)",
                  }}
                />
              </button>
            ))}
          </div>
          {hovered && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md whitespace-nowrap"
              style={{ left: `${((active! + 0.5) / data.length) * 100}%` }}
            >
              <p className="font-semibold text-foreground tabular-nums">{baht(hovered.revenue)}</p>
              <p className="text-muted-foreground">
                {formatDay(hovered.date, { weekday: "short", day: "numeric", month: "short" })} · {hovered.orders} ออเดอร์
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-10" />
        <div className="flex-1 flex gap-[2px]">
          {data.map((d, i) => (
            <span key={d.date} className="flex-1 text-center text-[10px] text-muted-foreground tabular-nums">
              {(data.length - 1 - i) % labelEvery === 0 ? formatDay(d.date, { day: "numeric" }) : ""}
            </span>
          ))}
        </div>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground w-fit">ดูเป็นตาราง</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="font-medium py-1">วันที่</th>
              <th className="font-medium py-1 text-right">ออเดอร์</th>
              <th className="font-medium py-1 text-right">รายได้</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.date} className="border-t border-border">
                <td className="py-1">{formatDay(d.date, { weekday: "short", day: "numeric", month: "short" })}</td>
                <td className="py-1 text-right">{d.orders}</td>
                <td className="py-1 text-right">{baht(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Ranked horizontal bars (best sellers, revenue by restaurant); every bar carries its value. */
export function RankBarChart({
  rows,
  emptyText = "ยังไม่มีข้อมูล",
}: {
  rows: { label: string; value: number; valueLabel: string; detail?: string }[];
  emptyText?: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1" title={r.detail}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-foreground truncate">{r.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{r.detail}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3">
              <div
                className="h-full rounded-r-[4px]"
                style={{ width: `${(r.value / max) * 100}%`, minWidth: 2, background: "var(--chart-1)" }}
              />
            </div>
            <span className="w-14 text-right text-xs font-semibold text-foreground tabular-nums">{r.valueLabel}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
