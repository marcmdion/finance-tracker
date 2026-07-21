"use client";

import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import type { SankeyData } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomSankeyNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
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
  payload,
}: CustomSankeyNodeProps) {
  if (!payload) return null;

  const percent = payload.totalFlow
    ? Math.round((payload.value / payload.totalFlow) * 100)
    : 0;
  const pushLeft =
    payload.name.includes("(Income)") || payload.name.includes("(Deficit)");

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 2)}
        fill={CHART_COLORS[index % CHART_COLORS.length]}
        rx={2}
      />
      <text
        textAnchor={pushLeft ? "end" : "start"}
        x={pushLeft ? x - 8 : x + width + 8}
        y={y + height / 2 - 6}
        fontSize={12}
        fontWeight={600}
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {payload.displayLabel || payload.name}
      </text>
      <text
        textAnchor={pushLeft ? "end" : "start"}
        x={pushLeft ? x - 8 : x + width + 8}
        y={y + height / 2 + 10}
        fontSize={11}
        fontWeight={500}
        fill="#475569"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        ${payload.value.toFixed(2)} ({percent}%)
      </text>
    </g>
  );
}

interface SankeyChartProps {
  sankeyData: SankeyData | null;
}

export function SankeyChart({ sankeyData }: SankeyChartProps) {
  return (
    <Card className="flex flex-col overflow-hidden lg:col-span-2">
      <CardHeader>
        <CardTitle>Expense Allocation (Current Cycle)</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-x-auto pb-2">
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
                node={<CustomSankeyNode />}
                nodePadding={40}
                margin={{ top: 20, bottom: 20, left: 140, right: 140 }}
                link={{ stroke: "#cbd5e1", strokeOpacity: 0.4 }}
              >
                <Tooltip
                  formatter={(value) =>
                    `$${Number(value).toFixed(2)}`
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  }}
                />
              </Sankey>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
              No expense data available to visualize for this cycle.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
