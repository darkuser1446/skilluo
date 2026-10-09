"use client";

import { useMemo } from "react";
import { TrendingUp, Target, Award, Check, Calendar, Activity } from "lucide-react";

interface ProgressTrendProps {
  performance: any;
  assignments: any[];
  assessments: any[];
  exercises: any[];
  sessions: any[];
}

export default function StudentProgressTrend({
  performance,
  assignments,
  assessments,
  exercises,
  sessions,
}: ProgressTrendProps) {
  const trendPoints = useMemo(() => {
    const overall = performance?.overallScore ?? 75;
    return [
      { week: "W1: Syntax", score: Math.max(40, Math.round(overall * 0.65)), status: "Completed" },
      { week: "W2: Pointers", score: Math.max(50, Math.round(overall * 0.75)), status: "Completed" },
      { week: "W3: Memory", score: Math.max(55, Math.round(overall * 0.85)), status: "Completed" },
      { week: "W4: OOP/RAII", score: Math.max(65, Math.round(overall * 0.92)), status: "Completed" },
      { week: "W5: STL", score: Math.max(70, Math.round(overall * 0.96)), status: "Completed" },
      { week: "W6: Systems", score: Math.round(overall), status: "Current" },
    ];
  }, [performance]);

  const maxVal = 100;
  const graphHeight = 140;
  const graphWidth = 600;

  const pointsString = useMemo(() => {
    return trendPoints
      .map((pt, idx) => {
        const x = (idx / (trendPoints.length - 1)) * (graphWidth - 80) + 40;
        const y = graphHeight - (pt.score / maxVal) * (graphHeight - 40) - 20;
        return `${x},${y}`;
      })
      .join(" ");
  }, [trendPoints]);

  return (
    <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#111111] text-white p-4 border-b-[3px] border-[#111111] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-[#F07C27]" />
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
            PERFORMANCE TRAJECTORY // BENCHMARK MATRIX
          </h3>
        </div>
        <div className="font-mono text-[10px] font-bold uppercase bg-white text-[#111111] px-2.5 py-0.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
          SHEET: REF-S60-C++
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-white space-y-5">
        {/* Subheader controls & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[2px] border-[#111111] pb-3 text-xs font-mono font-bold">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#F07C27] border-[1.5px] border-[#111111]" />
              <span className="text-[#111111] uppercase">STUDENT VELOCITY (W1-W6)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 border-t-[2.5px] border-dashed border-[#111111]" />
              <span className="text-slate-600 uppercase">SUPER 60 CUTOFF (85.0%)</span>
            </div>
          </div>

          <div className="bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] rotate-1">
            ★ POSITIVE PROGRESSION TRAJECTORY
          </div>
        </div>

        {/* SVG Physical Coordinate Grid */}
        <div className="w-full relative overflow-hidden bg-[#F4F3F3] border-[2px] border-[#111111] p-3">
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className="w-full h-36 overflow-visible text-[#111111]"
            preserveAspectRatio="none"
          >
            {/* Grid baseline lines */}
            <line x1="30" y1="20" x2={graphWidth - 30} y2="20" stroke="#111111" strokeOpacity="0.15" strokeWidth="1" />
            <line x1="30" y1="60" x2={graphWidth - 30} y2="60" stroke="#111111" strokeOpacity="0.15" strokeWidth="1" />
            <line x1="30" y1="100" x2={graphWidth - 30} y2="100" stroke="#111111" strokeOpacity="0.15" strokeWidth="1" />

            {/* Target 85% selection benchmark line */}
            <line
              x1="30"
              y1={graphHeight - (85 / maxVal) * (graphHeight - 40) - 20}
              x2={graphWidth - 30}
              y2={graphHeight - (85 / maxVal) * (graphHeight - 40) - 20}
              stroke="#111111"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text
              x={graphWidth - 140}
              y={graphHeight - (85 / maxVal) * (graphHeight - 40) - 26}
              fill="#111111"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              [ CUTOFF: 85.0% ]
            </text>

            {/* Area Fill */}
            <polygon
              points={`40,${graphHeight} ${pointsString} ${graphWidth - 40},${graphHeight}`}
              fill="#F07C27"
              fillOpacity="0.15"
            />

            {/* Main Score Polyline */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#F07C27"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />

            {/* Square Data Markers */}
            {trendPoints.map((pt, idx) => {
              const x = (idx / (trendPoints.length - 1)) * (graphWidth - 80) + 40;
              const y = graphHeight - (pt.score / maxVal) * (graphHeight - 40) - 20;
              const isLast = idx === trendPoints.length - 1;
              return (
                <g key={idx}>
                  <rect
                    x={x - (isLast ? 6 : 4.5)}
                    y={y - (isLast ? 6 : 4.5)}
                    width={isLast ? 12 : 9}
                    height={isLast ? 12 : 9}
                    fill={isLast ? "#F07C27" : "#111111"}
                    stroke="#111111"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#111111"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="800"
                  >
                    {pt.score}%
                  </text>
                  <text
                    x={x}
                    y={graphHeight + 14}
                    textAnchor="middle"
                    fill="#111111"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pt.week.split(":")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Milestone Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-[#F9F9F9] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="text-[10px] font-mono font-bold text-slate-600 block mb-1 uppercase">
              ASSIGNMENTS
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-[#111111]">
                {assignments.filter((a) => a.submissions?.[0]?.score !== undefined).length} / {assignments.length}
              </span>
              <Check className="w-4 h-4 text-[#F07C27] stroke-[3]" />
            </div>
          </div>

          <div className="p-3 bg-[#F9F9F9] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="text-[10px] font-mono font-bold text-slate-600 block mb-1 uppercase">
              EXERCISES
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-[#111111]">
                {exercises.filter((e) => e.mySubmission).length} / {exercises.length}
              </span>
              <Target className="w-4 h-4 text-sky-700" />
            </div>
          </div>

          <div className="p-3 bg-[#F9F9F9] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="text-[10px] font-mono font-bold text-slate-600 block mb-1 uppercase">
              ONLINE TESTS
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-[#111111]">
                {assessments.filter((as) => as.results?.length).length} / {assessments.length}
              </span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
          </div>

          <div className="p-3 bg-[#F9F9F9] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]">
            <span className="text-[10px] font-mono font-bold text-slate-600 block mb-1 uppercase">
              ATTENDANCE
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-[#111111]">
                {performance?.attendancePercentage ?? 100}%
              </span>
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
