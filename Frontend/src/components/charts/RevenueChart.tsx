import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  title?: string;
  data: { name: string; revenue: number; orders?: number }[];
}

const RevenueChart = ({ title = "Revenue Trends", data }: RevenueChartProps) => {
  const hasPoints = Array.isArray(data) && data.length > 0;
  const allZeroRevenue =
    hasPoints && data.every((point) => Number(point.revenue || 0) === 0);

  return (
    <Card className="heritage-card">
      <CardHeader>
        <CardTitle className="text-lg font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasPoints ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              No revenue data for this period yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allZeroRevenue && (
              <p className="text-sm text-muted-foreground">
                No revenue data in the last 4 weeks
              </p>
            )}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    domain={[0, "dataMax + 100"]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;