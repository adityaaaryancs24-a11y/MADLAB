import React, { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Circle,
  Line,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 160;
const PADDING_H = 16;
const PADDING_V = 20;

export interface PriceChartPoint {
  date: string;
  price: number;
}

interface NativePriceChartProps {
  data: PriceChartPoint[];
}

function buildSmoothPath(
  points: { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

export function NativePriceChart({ data }: NativePriceChartProps) {
  const chartWidth = SCREEN_WIDTH - 48; // account for px-6 padding on both sides

  const { points, linePath, fillPath, minPrice, maxPrice, tickLabels } =
    useMemo(() => {
      if (!data || data.length < 2) {
        return {
          points: [],
          linePath: "",
          fillPath: "",
          minPrice: 0,
          maxPrice: 0,
          tickLabels: [],
        };
      }

      const prices = data.map((d) => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;

      const drawWidth = chartWidth - PADDING_H * 2;
      const drawHeight = CHART_HEIGHT - PADDING_V * 2;

      const points = data.map((d, i) => ({
        x: PADDING_H + (i / (data.length - 1)) * drawWidth,
        y: PADDING_V + (1 - (d.price - minPrice) / priceRange) * drawHeight,
      }));

      const linePath = buildSmoothPath(points);

      // Fill path: close the area under the line
      const fillPath =
        linePath +
        ` L${points[points.length - 1].x},${CHART_HEIGHT - PADDING_V}` +
        ` L${points[0].x},${CHART_HEIGHT - PADDING_V} Z`;

      // Pick up to 5 evenly spaced date labels
      const step = Math.max(1, Math.floor((data.length - 1) / 4));
      const tickIndices = [
        0,
        ...Array.from({ length: 3 }, (_, k) => (k + 1) * step).filter(
          (idx) => idx < data.length - 1
        ),
        data.length - 1,
      ].filter((v, i, a) => a.indexOf(v) === i);

      const tickLabels = tickIndices.map((idx) => ({
        x: PADDING_H + (idx / (data.length - 1)) * drawWidth,
        label: data[idx].date,
      }));

      return { points, linePath, fillPath, minPrice, maxPrice, tickLabels };
    }, [data, chartWidth]);

  if (!data || data.length < 2) {
    return (
      <View
        style={{
          height: CHART_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          Not enough price history to display chart
        </Text>
      </View>
    );
  }

  const lastPoint = points[points.length - 1];

  return (
    <Animated.View
      entering={FadeInDown.delay(310).springify()}
      style={{ marginBottom: 16 }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Price History
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#4ADE80",
            }}
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            30 days
          </Text>
        </View>
      </View>

      {/* SVG chart */}
      <View
        style={{
          backgroundColor: "#111827",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.05)",
          overflow: "hidden",
          paddingBottom: 28, // room for date labels
        }}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y =
              PADDING_V +
              fraction * (CHART_HEIGHT - PADDING_V * 2);
            return (
              <Line
                key={fraction}
                x1={PADDING_H}
                y1={y}
                x2={chartWidth - PADDING_H}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
            );
          })}

          {/* Gradient fill */}
          <Path d={fillPath} fill="url(#priceGrad)" />

          {/* Line */}
          <Path
            d={linePath}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current price dot */}
          <Circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={5}
            fill="#4ADE80"
            stroke="#0A0E15"
            strokeWidth={2}
          />
        </Svg>

        {/* Date tick labels */}
        <View
          style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            flexDirection: "row",
            paddingHorizontal: PADDING_H,
          }}
        >
          {tickLabels.map((tick, i) => (
            <Text
              key={i}
              style={{
                position: "absolute",
                left: tick.x - 20,
                color: "rgba(255,255,255,0.3)",
                fontSize: 9,
                fontWeight: "600",
                width: 40,
                textAlign: "center",
              }}
            >
              {tick.label}
            </Text>
          ))}
        </View>

        {/* Y-axis price labels */}
        <View
          style={{
            position: "absolute",
            top: PADDING_V,
            right: PADDING_H + 4,
            height: CHART_HEIGHT - PADDING_V * 2,
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 9,
              fontWeight: "600",
            }}
          >
            ₹{maxPrice.toFixed(0)}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 9,
              fontWeight: "600",
            }}
          >
            ₹{minPrice.toFixed(0)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
