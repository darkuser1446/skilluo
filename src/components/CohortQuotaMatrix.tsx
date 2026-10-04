"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Lock,
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
    // Sort candidates primarily by rank or overallScore descending
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
          // Top tier (top 15) receives flame orange (#F07C27), next tier receives gold (#FFB703)
          state = i <= 15 ? "selected" : "qualified_gold";
        } else if (candidate.selectionStatus === "PENDING" || (candidate.overallScore || 0) >= 85) {
          state = "pending";
        } else {
          state = "open";
        }
      } else if (isStudentView) {
        // In student view when candidate list is not fully populated, synthesize cohort progression
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
      className={`rounded-2xl p-5 sm:p-6 bg-[#070B14]/90 border border-slate-800 shadow-xl backdrop-blur-md ${className}`}
    >
      {/* ── HEADER & QUOTA PROGRESS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight">
              Super 60 Cohort Intake Matrix
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30">
              60 SEATS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isStudentView
              ? "Live cohort intake matrix representing all 60 induction seats in the workshop."
              : "Visual pipeline of all 60 induction seats. Click any square tile to inspect candidate metrics."}
          </p>
        </div>

        {/* Quota Progress Summary */}
        <div className="flex items-center gap-3 bg-[#0F172A] px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Quota Filled</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-white">{counts.selected}</span>
              <span className="text-slate-500 text-[11px]">/ 60 ({completionPercent}%)</span>
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden self-center">
            <div
              className="h-full bg-gradient-to-r from-brand-orange to-[#FFB703] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (counts.selected / 60) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── FILTER CHIPS & LEGEND ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 pb-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterState("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterState === "ALL"
                ? "bg-brand-orange text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All (60)
          </button>
          <button
            type="button"
            onClick={() => setFilterState("SELECTED")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterState === "SELECTED"
                ? "bg-brand-orange text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            Qualified ({counts.selected})
          </button>
          <button
            type="button"
            onClick={() => setFilterState("PENDING")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterState === "PENDING"
                ? "bg-[#FFB703] text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilterState("OPEN")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterState === "OPEN"
                ? "bg-slate-700 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Open ({counts.open})
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-brand-orange border border-brand-orange/60" />
            <span>Top Tier (#F07C27)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#FFB703] border border-[#FFB703]/60" />
            <span>Qualified (#FFB703)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/50" />
            <span>Pending Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#0F172A] border border-slate-700" />
            <span>Open Seat</span>
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

            let tileClasses = "border transition-all duration-150 aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative cursor-pointer font-mono select-none text-xs ";

            if (isDimmed) {
              tileClasses += "opacity-25 grayscale border-slate-800 bg-[#0F172A]/40 ";
            } else if (item.state === "selected") {
              tileClasses += "bg-gradient-to-br from-brand-orange/30 to-brand-orange/10 border-brand-orange/70 text-white shadow-[0_0_10px_rgba(240,124,39,0.25)] hover:shadow-[0_0_16px_rgba(240,124,39,0.45)] hover:scale-105 ";
            } else if (item.state === "qualified_gold") {
              tileClasses += "bg-gradient-to-br from-[#FFB703]/30 to-[#FFB703]/10 border-[#FFB703]/70 text-amber-200 shadow-[0_0_10px_rgba(255,183,3,0.25)] hover:shadow-[0_0_16px_rgba(255,183,3,0.45)] hover:scale-105 ";
            } else if (item.state === "pending") {
              tileClasses += "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:scale-105 ";
            } else {
              tileClasses += "bg-[#0F172A]/70 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300 hover:scale-105 ";
            }

            if (isSelected) {
              tileClasses += "ring-2 ring-white ring-offset-2 ring-offset-[#070B14] scale-105 z-10 ";
            }

            if (item.isCurrentStudent) {
              tileClasses += "ring-2 ring-brand-orange ring-offset-2 ring-offset-[#070B14] animate-pulse ";
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
                {/* Seat Number Tag */}
                <span className="text-[10px] font-bold tracking-tight">
                  {item.seatNumber}
                </span>

                {/* State Micro-Indicator */}
                <div className="mt-0.5">
                  {item.state === "selected" && (
                    <Flame className="w-2.5 h-2.5 text-brand-orange fill-brand-orange" />
                  )}
                  {item.state === "qualified_gold" && (
                    <Trophy className="w-2.5 h-2.5 text-[#FFB703] fill-[#FFB703]/40" />
                  )}
                  {item.state === "pending" && (
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                  )}
                  {item.state === "open" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 block" />
                  )}
                </div>

                {/* Current Student Badge */}
                {item.isCurrentStudent && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white text-[8px] font-black px-1 rounded-full uppercase shadow">
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
            <div className="mt-3 p-3 rounded-xl bg-[#0F172A] border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs border ${
                    hoveredItem.state === "selected"
                      ? "bg-brand-orange/20 text-brand-orange border-brand-orange/40"
                      : hoveredItem.state === "qualified_gold"
                      ? "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40"
                      : hoveredItem.state === "pending"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  #{hoveredItem.seatNumber}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{hoveredItem.candidate?.studentName || "Open Super 60 Seat"}</span>
                    {hoveredItem.isCurrentStudent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-orange text-white font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {hoveredItem.candidate?.college || "Unfilled Seat · Open for Qualification"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right font-mono text-xs">
                {hoveredItem.candidate?.overallScore !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Composite</span>
                    <strong className="text-white font-bold">
                      {hoveredItem.candidate.overallScore}%
                    </strong>
                  </div>
                )}
                {hoveredItem.candidate?.rank && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Rank</span>
                    <strong className="text-[#FFB703] font-bold">
                      #{hoveredItem.candidate.rank}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      hoveredItem.state === "selected"
                        ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                        : hoveredItem.state === "qualified_gold"
                        ? "bg-[#FFB703]/15 text-[#FFB703] border-[#FFB703]/30"
                        : hoveredItem.state === "pending"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
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

      {/* ── SMOOTH CLICK INSPECTION DRAWER / CARD ── */}
      {activeInspectedSeat && (
        <div className="mt-4 p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border flex-shrink-0 ${
                activeInspectedSeat.state === "selected"
                  ? "bg-brand-orange/20 text-brand-orange border-brand-orange/40"
                  : activeInspectedSeat.state === "qualified_gold"
                  ? "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40"
                  : activeInspectedSeat.state === "pending"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              #{activeInspectedSeat.seatNumber}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-white text-sm">
                  Seat #{activeInspectedSeat.seatNumber}:{" "}
                  {activeInspectedSeat.candidate?.studentName || "Available Cohort Seat"}
                </h4>
                {activeInspectedSeat.isCurrentStudent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-brand-orange text-white">
                    YOUR SEAT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
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
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="bg-[#070B14] px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Rank</span>
                <span className="font-bold text-[#FFB703]">
                  #{activeInspectedSeat.candidate.rank ?? activeInspectedSeat.seatNumber}
                </span>
              </div>
              <div className="bg-[#070B14] px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Score</span>
                <span className="font-bold text-white">
                  {activeInspectedSeat.candidate.overallScore ?? "--"}%
                </span>
              </div>
              {activeInspectedSeat.candidate.attendancePercentage !== undefined && (
                <div className="bg-[#070B14] px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Attendance</span>
                  <span className="font-bold text-emerald-400">
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
