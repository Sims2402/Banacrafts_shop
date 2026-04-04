import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProductsChartProps {
  title?: string;
  data: { name: string; value: number; sales?: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(25 80% 55%)", // terracotta variant
  "hsl(40 60% 50%)", // gold variant
];

const TopProductsChart = ({ title = "Top Products", data }: TopProductsChartProps) => {
  const chartData = data.filter((d) => d.value > 0);

  return (
    <Card className="heritage-card">
      <CardHeader>
        <CardTitle className="text-lg font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              No sales data yet. When customers buy your products, share of sales
              by product will appear here.
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => {
                    const short =
                      name.length > 12 ? `${name.slice(0, 12)}…` : name;
                    return `${short} ${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} sold`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.slice(0, 4).map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate text-muted-foreground">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;