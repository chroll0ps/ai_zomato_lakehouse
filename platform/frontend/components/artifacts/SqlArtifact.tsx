"use client";

import React, { useState } from "react";
import { Database, Code2, Copy, Check, BarChart3, Table2 } from "lucide-react";
import { SqlResult } from "@/types/chat";
import { MetricsBarChart } from "./MetricsBarChart";
import { formatNumber } from "@/lib/utils";

interface SqlArtifactProps {
  sqlResult: SqlResult;
}

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "DESC", "ASC",
  "LIMIT", "AS", "AND", "OR", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ROUND", "SUM", "AVG", "COUNT", "DISTINCT", "WITH", "JOIN", "ON",
  "IN", "IS", "NOT", "NULL", "COUNT_IF", "DIV0", "IFF"
]);

export const SqlArtifact: React.FC<SqlArtifactProps> = ({ sqlResult }) => {
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table">(
    sqlResult.can_chart ? "chart" : "table"
  );

  const handleCopy = () => {
    if (!sqlResult.sql) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sqlResult.sql).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const renderSqlLines = (sql: string) => {
    const lines = sql.split("\n");
    return lines.map((line, lineIdx) => {
      const tokens = line.match(
        /('[^']*'|"[^"]*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[^\sA-Za-z0-9_']+|\s+)/g
      ) || [line];

      return (
        <div key={lineIdx} className="leading-6">
          <span className="inline-block w-6 select-none pr-3 text-right text-[11px] text-[#78716C]">
            {lineIdx + 1}
          </span>
          {tokens.map((tok, i) => {
            if (tok.startsWith("'") || tok.startsWith('"')) {
              return (
                <span key={i} className="text-[#6EE7B7]">
                  {tok}
                </span>
              );
            }
            if (/^\d+(\.\d+)?$/.test(tok)) {
              return (
                <span key={i} className="text-[#FCA5A5]">
                  {tok}
                </span>
              );
            }
            if (SQL_KEYWORDS.has(tok.toUpperCase())) {
              return (
                <span key={i} className="font-bold text-[#F2C94C]">
                  {tok}
                </span>
              );
            }
            return (
              <span key={i} className="text-[#F7F3EA]">
                {tok}
              </span>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border-[1.5px] border-[#141413]/25 bg-[#F7F3EA] p-4">
      <div>
        {/* Top Controls: Result Header, SQL Toggle, Copy Button, View Switcher */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#57534E]">
              <Database className="h-3.5 w-3.5 text-[#141413]" />
              Snowflake Result ({sqlResult.row_count} rows)
            </span>

            <button
              type="button"
              onClick={() => setShowSql((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border-[1.5px] border-[#141413] bg-white px-2 py-1 text-[11px] font-bold text-[#141413] transition-colors hover:bg-[#EFE9DC]"
            >
              <Code2 className="h-3 w-3" />
              <span>{showSql ? "Hide SQL" : "View SQL"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-lg bg-[#141413] px-2.5 py-1 text-[11px] font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-[#F2C94C]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Chart / Table View Switcher */}
          {sqlResult.can_chart && (
            <div className="inline-flex rounded-lg border-[1.5px] border-[#141413] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  viewMode === "chart"
                    ? "bg-[#141413] text-[#F7F3EA]"
                    : "text-[#141413] hover:bg-[#F7F3EA]"
                }`}
              >
                <BarChart3 className="h-3 w-3" />
                Chart View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  viewMode === "table"
                    ? "bg-[#141413] text-[#F7F3EA]"
                    : "text-[#141413] hover:bg-[#F7F3EA]"
                }`}
              >
                <Table2 className="h-3 w-3" />
                Data Table
              </button>
            </div>
          )}
        </div>

        {/* Collapsible SQL Block */}
        {showSql && (
          <div className="mb-3.5 overflow-x-auto rounded-xl border-[1.5px] border-[#141413] bg-[#141413] px-3.5 py-3 font-mono text-xs shadow-[2px_2px_0px_#F2C94C]">
            {renderSqlLines(sqlResult.sql)}
          </div>
        )}

        {/* Chart View or Data Table */}
        {viewMode === "chart" && sqlResult.can_chart ? (
          <MetricsBarChart
            rows={sqlResult.rows}
            columns={sqlResult.columns}
            title={sqlResult.chart_title}
            valueSuffix={sqlResult.value_suffix || ""}
          />
        ) : (
          <div className="max-h-[280px] overflow-auto rounded-xl border-[1.5px] border-[#141413] bg-white custom-scroll">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="sticky top-0 z-10 border-b-[1.5px] border-[#141413] bg-[#EFE9DC]">
                  {sqlResult.columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 font-black uppercase tracking-wider text-[#141413]"
                    >
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sqlResult.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-[#141413]/15 last:border-b-0 hover:bg-[#F7F3EA]/70"
                  >
                    {sqlResult.columns.map((col, cIdx) => (
                      <td
                        key={col}
                        className={`px-3 py-2 ${
                          cIdx === 0
                            ? "font-bold text-[#141413]"
                            : "font-mono font-semibold text-[#141413]"
                        }`}
                      >
                        {typeof row[col] === "number"
                          ? formatNumber(
                              row[col],
                              cIdx === 1 ? sqlResult.value_suffix || "" : ""
                            )
                          : String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

