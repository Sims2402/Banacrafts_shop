import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface Props {
  title: string;
  data: {
    month: string;
    revenue: number;
  }[];
}

const RevenueChart = ({ title, data }: Props) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* ✅ FULL MONTH + YEAR SHOWN */}
          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value: number) => [`₹${value}`, "Revenue"]}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#7f1d1d"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;