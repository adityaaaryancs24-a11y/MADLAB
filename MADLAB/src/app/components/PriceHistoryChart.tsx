import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceDot } from "recharts";
import { motion } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PriceHistoryChartProps {
  data: Array<{ date: string; price: number }>;
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const currentPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(1);

  // Add unique ID to each data point to prevent duplicate key warnings
  const chartData = data.map((item, index) => ({
    ...item,
    id: `${item.date}-${index}`,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isMin = payload.price === minPrice;
    const isMax = payload.price === maxPrice;
    const isCurrent = payload.date === data[data.length - 1]?.date;

    if (isMin) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#2ECC71" stroke="#0A0E15" strokeWidth={2} />
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#2ECC71" fontSize={10} fontWeight="bold">Low</text>
        </g>
      );
    }
    if (isMax) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#EF4444" stroke="#0A0E15" strokeWidth={2} />
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#EF4444" fontSize={10} fontWeight="bold">High</text>
        </g>
      );
    }
    if (isCurrent && !isMin && !isMax) {
      return <circle cx={cx} cy={cy} r={5} fill="#3B82F6" stroke="#0A0E15" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {priceChange < 0 ? (
            <TrendingDown className="w-5 h-5 text-[#2ECC71]" />
          ) : (
            <TrendingUp className="w-5 h-5 text-[#F4A261]" />
          )}
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide">
            Price History
          </h3>
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-white">
            ₹{currentPrice.toFixed(2)}
          </span>
          <span
            className={`text-base font-bold px-3 py-1 rounded-xl ${
              priceChange < 0 
                ? "text-[#2ECC71] bg-[#2ECC71]/20" 
                : "text-[#F4A261] bg-[#F4A261]/20"
            }`}
          >
            {priceChange < 0 ? "↓" : "↑"} ₹{Math.abs(priceChange).toFixed(2)} ({priceChangePercent}%)
          </span>
        </div>
        <p className="text-xs text-white/50 font-semibold">Last 30 days</p>
      </div>

      <ResponsiveContainer width="100%" height={200} key="price-chart">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)]}
            tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#12171F",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
            labelStyle={{ color: "#2ECC71", fontWeight: "bold" }}
            formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#2ECC71"
            strokeWidth={3}
            fill="url(#colorPrice)"
            isAnimationActive={true}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#fff", stroke: "#2ECC71", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}