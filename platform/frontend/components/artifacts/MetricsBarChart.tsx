"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatNumber } from "@/lib/utils";

interface MetricsBarChartProps {
  rows: Record<string, any>[];
  columns: string[];
  title?: string | null;
  valueSuffix?: string | null;
}

export const MetricsBarChart: React.FC<MetricsBarChartProps> = ({
  rows,
  columns,
  title,
  valueSuffix = "",
}) => {
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0 || !columns || columns.length < 2) return [];

    const labelKey = columns[0];
    const valueKey = columns[1];

    return rows.map((r) => ({
      name: String(r[labelKey] ?? ""),
      value: Number(r[valueKey] ?? 0),
    }));
  }, [rows, columns]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-black tracking-tight text-[#141413] sm:text-sm">
            {title}
          </h4>
        </div>
      )}

      <div className="h-[230px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 0, bottom: 24 }}
          >
            <XAxis
              dataKey="name"
              stroke="#141413"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={{ stroke: "#141413", strokeWidth: 1.5 }}
              tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)}
              angle={-20}
              textAnchor="end"
              height={36}
            />
            <YAxis
              stroke="#141413"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: "#141413", strokeWidth: 1.5 }}
              tickFormatter={(v) => formatNumber(v, valueSuffix || "")}
            />
            <Tooltip
              cursor={{ fill: "rgba(242, 201, 76, 0.15)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border-[1.5px] border-[#141413] bg-white p-2.5 font-sans shadow-[3px_3px_0px_#141413]">
                      <p className="text-xs font-black text-[#141413]">
                        {data.name}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#57534E]">
                        Value:{" "}
                        <span className="font-mono text-[#141413]">
                          {formatNumber(data.value, valueSuffix || "")}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill="#F2C94C"
              stroke="#141413"
              strokeWidth={1.5}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#F2C94C" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

