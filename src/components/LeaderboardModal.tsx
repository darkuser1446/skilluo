"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy, X, Search, Download, Clock, CheckCircle2, XCircle, Award, Users } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  labName: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  durationSec: number | null;
  submittedAt: string;
  isCurrentUser?: boolean;
}

interface LeaderboardModalProps {
  assessmentId: string;
  assessmentTitle?: string;
  onClose: () => void;
}

export default function LeaderboardModal({
  assessmentId,
  assessmentTitle,
  onClose,
}: LeaderboardModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    title: string;
    totalMarks: number;
    totalParticipants: number;
    leaderboard: LeaderboardEntry[];
  } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLab, setSelectedLab] = useState("ALL");

  useEffect(() => {
    let mounted = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/leaderboard`);
        if (res.ok) {
          const json = await res.json();
          if (mounted) setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      mounted = false;
    };
  }, [assessmentId]);

  const distinctLabs = useMemo(() => {
    if (!data?.leaderboard) return [];
    return Array.from(new Set(data.leaderboard.map((e) => e.labName).filter(Boolean)));
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (!data?.leaderboard) return [];
    return data.leaderboard.filter((e) => {
      const matchesLab = selectedLab === "ALL" || e.labName === selectedLab;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.studentName.toLowerCase().includes(q) ||
        e.labName.toLowerCase().includes(q);
      return matchesLab && matchesSearch;
    });
  }, [data, search, selectedLab]);

  const stats = useMemo(() => {
    if (!data?.leaderboard || data.leaderboard.length === 0) {
      return { topScore: 0, avgScore: 0, passCount: 0 };
    }
    const scores = data.leaderboard.map((e) => e.score);
    const topScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passThreshold = (data.totalMarks || 100) * 0.5;
    const passCount = scores.filter((s) => s >= passThreshold).length;
    return { topScore, avgScore, passCount };
  }, [data]);

  const exportCSV = () => {
    if (!data?.leaderboard) return;
    const headers = [
      "Rank",
      "Candidate Name",
      "Laboratory Track",
      "Score",
      "Total Marks",
      "Percentage",
      "Correct Answers",
      "Incorrect Answers",
      "Duration (Seconds)",
      "Submitted At",
    ];
    const rows = filteredEntries.map((e) => [
      e.rank,
      e.studentName,
      e.labName,
      e.score,
      e.totalMarks,
      `${Math.round((e.score / (e.totalMarks || 100)) * 100)}%`,
      e.correctCount,
      e.incorrectCount,
      e.durationSec ?? "—",
      new Date(e.submittedAt).toLocaleString(),
    ]);

    const csv = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.title || "assessment").replace(/[^a-z0-9]/gi, "_")}_leaderboard.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#FFB703] border-b-[3px] border-[#111111] p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111111] text-[#FFB703] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 inline-block">
                OFFICIAL TEST LEADERBOARD
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-[#111111] tracking-tight truncate max-w-md sm:max-w-xl">
                {data?.title || assessmentTitle || "Assessment Leaderboard"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-rose-500 hover:text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#111111] font-black text-lg transition-all cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="bg-[#FFF0E5] border-b-[2px] border-[#111111] p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Participants</span>
            <span className="font-black text-lg text-[#111111]">
              {data?.totalParticipants ?? 0} Students
            </span>
          </div>
          <div className="bg-white border border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Highest Score</span>
            <span className="font-black text-lg text-emerald-700">
              {stats.topScore} / {data?.totalMarks || 100}
            </span>
          </div>
          <div className="bg-white border border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Average Score</span>
            <span className="font-black text-lg text-[#F07C27]">
              {stats.avgScore} / {data?.totalMarks || 100}
            </span>
          </div>
          <div className="bg-white border border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Passing Cohort</span>
            <span className="font-black text-lg text-blue-900">
              {stats.passCount} / {data?.totalParticipants ?? 0}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 sm:p-4 border-b-[2px] border-[#111111] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name or lab..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-1.5 text-xs font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-1.5 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Laboratory Tracks</option>
              {distinctLabs.map((lab) => (
                <option key={lab} value={lab}>
                  🏛️ {lab}
                </option>
              ))}
            </select>

            <button
              onClick={exportCSV}
              disabled={filteredEntries.length === 0}
              className="px-3 py-1.5 bg-[#F07C27] hover:bg-[#d96614] text-white border-[2px] border-[#111111] font-mono text-xs font-bold shadow-[2px_2px_0px_#111111] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA]">
          {loading ? (
            <div className="p-12 text-center font-mono text-xs text-slate-500">
              <div className="w-8 h-8 border-2 border-[#F07C27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading real-time test rankings...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-slate-500 bg-white border-[2px] border-[#111111]">
              No submissions found for the selected filter.
            </div>
          ) : (
            <div className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#111111] text-white uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                    <th className="py-2.5 px-4 min-w-[180px]">Student Name</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Laboratory Track</th>
                    <th className="py-2.5 px-3 text-center min-w-[100px]">Score</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Accuracy</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Time</th>
                    <th className="py-2.5 px-3 text-right min-w-[120px]">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20">
                  {filteredEntries.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop3 = entry.rank <= 3;
                    const timeFormatted = entry.durationSec
                      ? `${Math.floor(entry.durationSec / 60)}m ${entry.durationSec % 60}s`
                      : "—";
                    const pct = Math.round((entry.score / (entry.totalMarks || 100)) * 100);

                    return (
                      <tr
                        key={entry.studentId}
                        className={`transition-colors ${
                          entry.isCurrentUser
                            ? "bg-[#FFF0E5] font-black"
                            : isTop1
                            ? "bg-amber-50/70"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-2.5 px-3 text-center font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#FFB703] text-[#111111] border border-[#111111] rounded-full font-black text-xs shadow-[1px_1px_0px_#111111]">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 text-[#111111] border border-[#111111] rounded-full font-black text-xs shadow-[1px_1px_0px_#111111]">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-700 text-white border border-[#111111] rounded-full font-black text-xs shadow-[1px_1px_0px_#111111]">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-600 font-bold">#{entry.rank}</span>
                          )}
                        </td>

                        {/* Student Name */}
                        <td className="py-2.5 px-4 font-bold text-[#111111]">
                          <div className="flex items-center gap-2">
                            <span>{entry.studentName}</span>
                            {entry.isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-[#F07C27] text-white text-[9px] font-black uppercase border border-[#111111]">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Lab */}
                        <td className="py-2.5 px-3 text-slate-700 font-bold">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-950 border border-blue-900 text-[10px]">
                            {entry.labName}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 border border-[#111111] font-black text-xs shadow-[1px_1px_0px_#111111] ${
                            pct >= 75 ? "bg-emerald-500 text-white" : pct >= 50 ? "bg-amber-400 text-[#111111]" : "bg-rose-500 text-white"
                          }`}>
                            {entry.score} / {entry.totalMarks}
                          </span>
                        </td>

                        {/* Accuracy */}
                        <td className="py-2.5 px-3 text-center text-[11px] font-bold">
                          <span className="text-emerald-700">✓ {entry.correctCount}</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-rose-700">✕ {entry.incorrectCount}</span>
                        </td>

                        {/* Time */}
                        <td className="py-2.5 px-3 text-center text-slate-600 font-bold text-[11px]">
                          {timeFormatted}
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-right text-slate-500 text-[10px] font-bold">
                          {new Date(entry.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t-[2px] border-[#111111] flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
          <span>
            Ranked by Score (highest), followed by completion speed. Answer keys remain confidential.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#111111] hover:bg-[#F07C27] text-white font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#111111] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
