"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  Check,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";

export interface CohortCandidate {
  studentId?: string;
  studentName?: string;
  college?: string;
  overallScore?: number;
  rank?: number;
  selectionStatus?: "SELECTED" | "PENDING" | "REJECTED" | string;
  labName?: string;
  labId?: string | null;
  assignmentsScore?: number;
  assessmentsScore?: number;
  attendancePercentage?: number;
  doubtsResolved?: number;
}

export interface CohortQuotaMatrixProps {
  candidates?: CohortCandidate[];
  totalSeats?: number;
  selectedStudentId?: string;
  currentStudentRank?: number;
  currentStudentScore?: number;
  currentStudentName?: string;
  currentStudentStatus?: string;
  isStudentView?: boolean;
  onSelectCandidate?: (candidate: CohortCandidate | null, seatNumber: number) => void;
  className?: string;
}

export default function CohortQuotaMatrix({
  candidates = [],
  totalSeats = 60,
  selectedStudentId,
  currentStudentRank,
  currentStudentScore,
  currentStudentName,
  currentStudentStatus,
  isStudentView = false,
  onSelectCandidate,
  className = "",
}: CohortQuotaMatrixProps) {
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(
    isStudentView && currentStudentRank && currentStudentRank <= totalSeats
      ? currentStudentRank
      : 1
  );
  const [filterState, setFilterState] = useState<"ALL" | "SELECTED" | "PENDING" | "OPEN">("ALL");

  // Map candidates to seats (sorted by rank or selection)
  const seatData = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return (b.overallScore || 0) - (a.overallScore || 0);
    });

    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      const candidate = sorted[i - 1];
      let state: "selected" | "qualified_gold" | "pending" | "open" | "locked" = "open";

      if (candidate) {
        if (candidate.selectionStatus === "SELECTED") {
          state = i <= 15 ? "selected" : "qualified_gold";
        } else if (candidate.selectionStatus === "PENDING" || (candidate.overallScore || 0) >= 85) {
          state = "pending";
        } else {
          state = "open";
        }
      } else if (isStudentView) {
        if (currentStudentRank && i === currentStudentRank) {
          state = currentStudentStatus === "SELECTED" ? "selected" : (currentStudentScore || 0) >= 85 ? "qualified_gold" : "pending";
        } else if (i <= 28) {
          state = i <= 15 ? "selected" : "qualified_gold";
        } else if (i <= 45) {
          state = "pending";
        } else {
          state = "open";
        }
      }

      const isCurrentStudent = isStudentView && currentStudentRank === i;

      seats.push({
        seatNumber: i,
        candidate: candidate || (isCurrentStudent ? {
          studentName: currentStudentName || "You",
          overallScore: currentStudentScore || 0,
          rank: currentStudentRank,
          college: "Your Institution",
          selectionStatus: currentStudentStatus || "PENDING",
        } : null),
        state,
        isCurrentStudent,
      });
    }

    return seats;
  }, [candidates, totalSeats, isStudentView, currentStudentRank, currentStudentScore, currentStudentName, currentStudentStatus]);

  // Aggregate counts
  const counts = useMemo(() => {
    let selected = 0;
    let pending = 0;
    let open = 0;
    seatData.forEach((s) => {
      if (s.state === "selected" || s.state === "qualified_gold") selected++;
      else if (s.state === "pending") pending++;
      else open++;
    });
    return { selected, pending, open };
  }, [seatData]);

  const activeInspectedSeat = useMemo(() => {
    if (selectedSeat === null) return null;
    return seatData.find((s) => s.seatNumber === selectedSeat) || null;
  }, [selectedSeat, seatData]);

  const completionPercent = ((counts.selected / totalSeats) * 100).toFixed(0);

  const filteredSeats = useMemo(() => {
    if (filterState === "ALL") return seatData;
    if (filterState === "SELECTED")
      return seatData.map((s) => ({
        ...s,
        dimmed: s.state !== "selected" && s.state !== "qualified_gold",
      }));
    if (filterState === "PENDING")
      return seatData.map((s) => ({ ...s, dimmed: s.state !== "pending" }));
    if (filterState === "OPEN")
      return seatData.map((s) => ({ ...s, dimmed: s.state !== "open" }));
    return seatData;
  }, [seatData, filterState]);

  const handleSeatClick = (seatNumber: number, candidate: CohortCandidate | null) => {
    setSelectedSeat(seatNumber);
    if (onSelectCandidate) {
      onSelectCandidate(candidate, seatNumber);
    }
  };

  return (
    <div
      className={`bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-5 sm:p-6 text-[#111111] ${className}`}
    >
      {/* ── HEADER & QUOTA PROGRESS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#F07C27]">
              <Flame className="w-4 h-4 fill-[#F07C27]" />
            </span>
            <h3 className="font-display font-black text-base sm:text-lg text-[#111111] uppercase tracking-tight">
              SUPER 60 INTAKE MATRIX
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#111111] text-white border-[2px] border-[#111111]">
              [ 60 SEATS ]
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {isStudentView
              ? "Live cohort intake matrix representing all 60 induction seats in the workshop."
              : "Visual pipeline of all 60 induction seats. Click any square tile to inspect candidate metrics."}
          </p>
        </div>

        {/* Quota Progress Summary */}
        <div className="flex items-center gap-3 bg-[#F4F3F3] px-3.5 py-2 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs">
          <div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">QUOTA FILLED</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black text-[#111111]">{counts.selected}</span>
              <span className="text-slate-600 text-[11px] font-bold">/ 60 ({completionPercent}%)</span>
            </div>
          </div>
          <div className="w-20 h-3 bg-white border-[1.5px] border-[#111111] overflow-hidden self-center">
            <div
              className="h-full bg-[#F07C27] transition-all duration-500"
              style={{ width: `${Math.min(100, (counts.selected / 60) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── FILTER BUTTONS & LEGEND ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 pb-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterState("ALL")}
            className={`px-2.5 py-1 font-bold border-[2px] border-[#111111] transition-all cursor-pointer ${
              filterState === "ALL"
                ? "bg-[#111111] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-slate-100"
            }`}
          >
            ALL (60)
          </button>
          <button
            type="button"
            onClick={() => setFilterState("SELECTED")}
            className={`px-2.5 py-1 font-bold border-[2px] border-[#111111] transition-all cursor-pointer flex items-center gap-1 ${
              filterState === "SELECTED"
                ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-slate-100"
            }`}
          >
            QUALIFIED ({counts.selected})
          </button>
          <button
            type="button"
            onClick={() => setFilterState("PENDING")}
            className={`px-2.5 py-1 font-bold border-[2px] border-[#111111] transition-all cursor-pointer flex items-center gap-1 ${
              filterState === "PENDING"
                ? "bg-[#FFF0E5] text-[#111111] shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-slate-100"
            }`}
          >
            PENDING ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilterState("OPEN")}
            className={`px-2.5 py-1 font-bold border-[2px] border-[#111111] transition-all cursor-pointer flex items-center gap-1 ${
              filterState === "OPEN"
                ? "bg-slate-200 text-[#111111] shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-slate-100"
            }`}
          >
            OPEN ({counts.open})
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#F07C27] border-[1.5px] border-[#111111]" />
            <span>TOP TIER</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#FFF0E5] border-[1.5px] border-[#111111]" />
            <span>QUALIFIED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#F4F3F3] border-[1.5px] border-[#111111]" />
            <span>PENDING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-white border-[1.5px] border-[#111111]" />
            <span>OPEN</span>
          </div>
        </div>
      </div>

      {/* ── 60-CELL SQUARE MATRIX GRID ── */}
      <div className="relative pt-2">
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 sm:gap-2">
          {filteredSeats.map((item) => {
            const isHovered = hoveredSeat === item.seatNumber;
            const isSelected = selectedSeat === item.seatNumber;
            const isDimmed = (item as any).dimmed;

            let tileClasses = "border-[2px] border-[#111111] transition-all duration-150 aspect-square p-1 flex flex-col items-center justify-center relative cursor-pointer font-mono select-none text-xs ";

            if (isDimmed) {
              tileClasses += "opacity-25 grayscale bg-slate-100 ";
            } else if (item.state === "selected") {
              tileClasses += "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 ";
            } else if (item.state === "qualified_gold") {
              tileClasses += "bg-[#FFF0E5] text-[#111111] shadow-[2px_2px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 ";
            } else if (item.state === "pending") {
              tileClasses += "bg-[#F4F3F3] text-slate-800 shadow-[2px_2px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 ";
            } else {
              tileClasses += "bg-white text-slate-400 hover:bg-slate-50 ";
            }

            if (isSelected) {
              tileClasses += "ring-2 ring-[#111111] ring-offset-2 scale-105 z-10 ";
            }

            return (
              <div
                key={item.seatNumber}
                onClick={() => handleSeatClick(item.seatNumber, item.candidate)}
                onMouseEnter={() => setHoveredSeat(item.seatNumber)}
                onMouseLeave={() => setHoveredSeat(null)}
                className={tileClasses}
                title={`Seat #${item.seatNumber}: ${item.candidate?.studentName || "Open Seat"}`}
              >
                <span className="text-[10px] font-black tracking-tight">
                  {item.seatNumber}
                </span>

                <div className="mt-0.5">
                  {item.state === "selected" && (
                    <Flame className="w-2.5 h-2.5 fill-white text-white" />
                  )}
                  {item.state === "qualified_gold" && (
                    <Trophy className="w-2.5 h-2.5 text-[#F07C27]" />
                  )}
                  {item.state === "pending" && (
                    <Clock className="w-2.5 h-2.5 text-slate-700" />
                  )}
                  {item.state === "open" && (
                    <span className="w-1.5 h-1.5 bg-slate-300 block" />
                  )}
                </div>

                {item.isCurrentStudent && (
                  <span className="absolute -top-2 -right-2 bg-[#111111] text-white text-[8px] font-mono font-black px-1 border-[1.5px] border-[#111111] shadow-[1px_1px_0px_#111111] uppercase">
                    YOU
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── HOVER TOOLTIP ── */}
        {hoveredSeat !== null && (() => {
          const hoveredItem = seatData.find((s) => s.seatNumber === hoveredSeat);
          if (!hoveredItem) return null;
          return (
            <div className="mt-3 p-3 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-mono font-black text-xs text-[#111111]">
                  #{hoveredItem.seatNumber}
                </div>
                <div>
                  <div className="font-display font-black text-[#111111] uppercase flex items-center gap-1.5">
                    <span>{hoveredItem.candidate?.studentName || "Open Super 60 Seat"}</span>
                    {hoveredItem.isCurrentStudent && (
                      <span className="text-[9px] font-mono px-1 bg-[#111111] text-white font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">
                    {hoveredItem.candidate?.college || "Unfilled Seat · Open for Qualification"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right font-mono text-xs">
                {hoveredItem.candidate?.overallScore !== undefined && (
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Composite</span>
                    <strong className="text-[#111111] font-black">
                      {hoveredItem.candidate.overallScore}%
                    </strong>
                  </div>
                )}
                {hoveredItem.candidate?.rank && (
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Rank</span>
                    <strong className="text-[#F07C27] font-black">
                      #{hoveredItem.candidate.rank}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Status</span>
                  <span className="inline-block px-1.5 py-0.5 bg-white border-[1.5px] border-[#111111] text-[9px] font-bold uppercase">
                    {hoveredItem.state === "selected"
                      ? "Top Tier Qualified"
                      : hoveredItem.state === "qualified_gold"
                      ? "Qualified Seat"
                      : hoveredItem.state === "pending"
                      ? "Pending Review"
                      : "Open Quota"}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── SMOOTH CLICK INSPECTION CARD ── */}
      {activeInspectedSeat && (
        <div className="mt-4 p-4 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-mono font-black text-sm text-[#111111] flex-shrink-0">
              #{activeInspectedSeat.seatNumber}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-[#111111] uppercase text-sm">
                  Seat #{activeInspectedSeat.seatNumber}:{" "}
                  {activeInspectedSeat.candidate?.studentName || "Available Cohort Seat"}
                </h4>
                {activeInspectedSeat.isCurrentStudent && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-black bg-[#F07C27] text-white border-[1px] border-[#111111]">
                    YOUR SEAT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-mono">
                {activeInspectedSeat.candidate
                  ? `${activeInspectedSeat.candidate.college || "Participant"} · ${
                      activeInspectedSeat.candidate.labName || "General Cohort Lab"
                    }`
                  : "Seat currently unfilled. Awaiting upcoming benchmark assessments and assignment evaluations."}
              </p>
            </div>
          </div>

          {/* Metrics Pill Group */}
          {activeInspectedSeat.candidate && (
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <div className="bg-white px-3 py-1 border-[1.5px] border-[#111111]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Rank</span>
                <span className="font-black text-[#F07C27]">
                  #{activeInspectedSeat.candidate.rank ?? activeInspectedSeat.seatNumber}
                </span>
              </div>
              <div className="bg-white px-3 py-1 border-[1.5px] border-[#111111]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Score</span>
                <span className="font-black text-[#111111]">
                  {activeInspectedSeat.candidate.overallScore ?? "--"}%
                </span>
              </div>
              {activeInspectedSeat.candidate.attendancePercentage !== undefined && (
                <div className="bg-white px-3 py-1 border-[1.5px] border-[#111111]">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Attendance</span>
                  <span className="font-black text-emerald-700">
                    {activeInspectedSeat.candidate.attendancePercentage}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
