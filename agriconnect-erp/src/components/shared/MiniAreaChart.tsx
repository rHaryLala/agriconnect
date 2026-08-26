import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts"

interface MiniAreaChartProps {
  data: { label: string; value: number }[]
  color: string
  formatValue: (n: number) => string
}

export function MiniAreaChart({ data, color, formatValue }: MiniAreaChartProps) {
  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number) => formatValue(v)} labelStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace("#", "")})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}