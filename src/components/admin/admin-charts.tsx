"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AdminCharts({
  revenueSeries,
  brandSeries,
}: {
  revenueSeries: { day: string; revenue: number; orders: number }[];
  brandSeries: { brand: string; total: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="border border-border/60 bg-secondary/20 p-3 sm:p-5">
        <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:mb-4 sm:text-xs">
          Revenue · 30 days
        </h2>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueSeries}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#a39e94", fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                width={40}
                tick={{ fill: "#a39e94", fontSize: 10 }}
                tickFormatter={(v) =>
                  Number(v) >= 1000
                    ? `${Math.round(Number(v) / 1000)}k`
                    : String(v)
                }
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#d4af37"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border border-border/60 bg-secondary/20 p-3 sm:p-5">
        <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:mb-4 sm:text-xs">
          Top brands
        </h2>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={brandSeries}
              margin={{ top: 4, right: 4, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="brand"
                tick={{ fill: "#a39e94", fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={48}
                tickFormatter={(v) =>
                  String(v).length > 10 ? `${String(v).slice(0, 9)}…` : String(v)
                }
              />
              <YAxis
                width={40}
                tick={{ fill: "#a39e94", fontSize: 10 }}
                tickFormatter={(v) =>
                  Number(v) >= 1000
                    ? `${Math.round(Number(v) / 1000)}k`
                    : String(v)
                }
              />
              <Tooltip />
              <Bar dataKey="total" fill="#d4af37" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
