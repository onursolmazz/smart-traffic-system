import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ViolationType } from "../types/dashboard";

interface ViolationChartProps {
  data: ViolationType[];
}

function ViolationChart({ data }: ViolationChartProps) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
          />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ViolationChart;