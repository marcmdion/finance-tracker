"use client";

import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import type { SankeyData } from "@/lib/types";

interface CustomSankeyNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  isDark?: boolean;
  payload?: {
    name: string;
    displayLabel?: string;
    value: number;
    totalFlow?: number;
  };
}

function CustomSankeyNode({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  isDark = false,
  payload,
}: CustomSankeyNodeProps) {
  if (!payload) return null;

  const percent = payload.totalFlow
    ? Math.round((payload.value / payload.totalFlow) * 100)
    : 0;
  const pushLeft =
    payload.name.includes("(Income)") || payload.name.includes("(Deficit)");

  const labelFill = isDark ? "oklch(0.9 0.01 265)" : "oklch(0.28 0.03 265)";
  const subFill = isDark ? "oklch(0.68 0.02 265)" : "oklch(0.52 0.025 265)";
  const labelStroke = isDark
    ? "oklch(0.13 0.014 265 / 0.92)"
    : "oklch(0.99 0 0 / 0.85)";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 2)}
        fill={CHART_COLORS[index % CHART_COLORS.length]}
        rx={4}
        opacity={isDark ? 0.88 : 0.92}
      />
      <text
        textAnchor={pushLeft ? "end" : "start"}
        x={pushLeft ? x - 10 : x + width + 10}
        y={y + height / 2 - 6}
        fontSize={11}
        fontWeight={500}
        fill={labelFill}
        stroke={labelStroke}
        strokeWidth={3}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {payload.displayLabel || payload.name}
      </text>
      <text
        textAnchor={pushLeft ? "end" : "start"}
        x={pushLeft ? x - 10 : x + width + 10}
        y={y + height / 2 + 10}
        fontSize={10}
        fontWeight={400}
        fill={subFill}
        stroke={labelStroke}
        strokeWidth={3}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        ${payload.value.toFixed(2)} · {percent}%
      </text>
    </g>
  );
}

interface SankeyChartProps {
  sankeyData: SankeyData | null;
}

export function SankeyChart({ sankeyData }: SankeyChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const tooltipStyle = isDark
    ? {
        borderRadius: "12px",
        border: "1px solid oklch(0.92 0.01 265 / 0.11)",
        boxShadow: "0 8px 24px oklch(0 0 0 / 0.35)",
        fontSize: "12px",
        background: "oklch(0.18 0.016 265 / 0.96)",
        color: "oklch(0.92 0.008 265)",
      }
    : {
        borderRadius: "12px",
        border: "1px solid oklch(0.91 0.008 265 / 0.75)",
        boxShadow: "0 8px 24px oklch(0.2 0.02 265 / 0.06)",
        fontSize: "12px",
        background: "oklch(0.998 0.002 265 / 0.95)",
        color: "oklch(0.22 0.02 265)",
      };

  return (
    <div className="surface flex flex-col overflow-hidden lg:col-span-2">
      <div className="border-b border-border/50 px-6 py-5">
        <p className="label-caps mb-1">Current cycle</p>
        <h2 className="text-lg font-medium tracking-[-0.02em]">Cash flow</h2>
      </div>
      <div className="flex-grow overflow-x-auto px-2 pb-4">
        <div
          className="min-w-[750px] transition-all duration-300"
          style={{
            height: sankeyData
              ? `${Math.max(400, sankeyData.nodes.length * 45)}px`
              : "400px",
          }}
        >
          {sankeyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                node={(props) => (
                  <CustomSankeyNode {...props} isDark={isDark} />
                )}
                nodePadding={40}
                margin={{ top: 20, bottom: 20, left: 140, right: 140 }}
                link={{
                  stroke: isDark
                    ? "oklch(0.55 0.03 265)"
                    : "oklch(0.75 0.02 265)",
                  strokeOpacity: isDark ? 0.45 : 0.35,
                }}
              >
                <Tooltip
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  contentStyle={tooltipStyle}
                />
              </Sankey>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
              No data to visualize for this cycle yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
