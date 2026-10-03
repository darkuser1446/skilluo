"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Sliders,
  Star,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  Save,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface Workshop {
  id: string;
  name: string;
  year: number;
  slug: string;
  status: string;
  _count: any;
  evaluationConfig: any;
  startDate: string;
  endDate: string;
}

interface Candidate {
  studentId: string;
  studentName: string;
  college: string;
  assignmentsScore: number;
  assessmentsScore: number;
  attendancePercentage: number;
  doubtsResolved: number;
  overallScore: number;
  rank: number;
  status: string;
}

interface Counts {
  totalStudents: number;
  selected: number;
  rejected: number;
  pending: number;
  averageScore: number;
}

interface Lab {
  id: string;
  name: string;
  schedule?: string;
  capacity?: number;
  mentors: any[];
  students: any[];
  _count: any;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  isActive: boolean;
  createdAt: string;
  labStudents?: any[];
  labMentors?: any[];
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  category: string;
  isAnonymous: boolean;
  student?: any;
  mentor?: any;
  lab?: any;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [counts, setCounts] = useState<Counts>({
    totalStudents: 0,
    selected: 0,
    rejected: 0,
    pending: 0,
    averageScore: 0,
  });
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [mentors, setMentors] = useState<UserItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "selection" | "workshops" | "labs" | "users" | "weights" | "feedback"
  >("selection");
  const [loading, setLoading] = useState(true);

  // Candidate filters
  const [candidateSearch, setCandidateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  // Workshop creation
  const [wsName, setWsName] = useState("");
  const [wsYear, setWsYear] = useState<number>(2027);
  const [wsSlug, setWsSlug] = useState("");
  const [wsStart, setWsStart] = useState("2027-06-01");
  const [wsEnd, setWsEnd] = useState("2027-07-31");
  const [creatingWs, setCreatingWs] = useState(false);

  // Lab creation
  const [labName, setLabName] = useState("");
  const [labSchedule, setLabSchedule] = useState("");
  const [labCapacity, setLabCapacity] = useState(30);
  const [creatingLab, setCreatingLab] = useState(false);

  // User creation
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState<"STUDENT" | "MENTOR" | "ADMIN">("STUDENT");
  const [uCollege, setUCollege] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Evaluation weights
  const [weights, setWeights] = useState({
    assignments: 30,
    assessments: 35,
    attendance: 15,
    exercises: 10,
    doubts: 5,
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsSaved, setWeightsSaved] = useState(false);

  // Lab assignment
  const [assignStudentId, setAssignStudentId] = useState("");
  const [assignLabId, setAssignLabId] = useState("");
  const [assignMentorId, setAssignMentorId] = useState("");
  const [assignMentorLabId, setAssignMentorLabId] = useState("");

  // Feedback state
  const [feedbackLabId, setFeedbackLabId] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    try {
      const wsRes = await fetch("/api/workshops");
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        const list: Workshop[] = wsData.data.workshops || [];
        setWorkshops(list);
        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedWorkshopId(firstId);
          if (list[0].evaluationConfig) {
            const cfg = list[0].evaluationConfig;
            setWeights({
              assignments: cfg.assignments ?? 30,
              assessments: cfg.assessments ?? 35,
              attendance: cfg.attendance ?? 15,
              exercises: cfg.exercises ?? 10,
              doubts: cfg.doubts ?? 5,
            });
          }
          await Promise.all([
            loadReports(firstId),
            loadLabs(firstId),
            loadUsers(""),
            loadMentors(firstId),
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const loadReports = async (wId: string) => {
    const res = await fetch(`/api/admin/reports?workshopId=${wId}`);
    if (res.ok) {
      const data = await res.json();
      setCandidates(data.data.candidates || []);
      setCounts(data.data.counts || {});
    }
  };

  const loadLabs = async (wId: string) => {
    const res = await fetch(`/api/labs?workshopId=${wId}`);
    if (res.ok) {
      const data = await res.json();
      setLabs(data.data.labs || []);
    }
  };

  const loadUsers = async (role: string) => {
    const res = await fetch(`/api/users${role ? `?role=${role}` : ""}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.data.users || []);
    }
  };

  const loadMentors = async (wId: string) => {
    const res = await fetch(`/api/mentors?workshopId=${wId}`);
    if (res.ok) {
      const data = await res.json();
      setMentors(data.data.mentors || []);
    }
  };

  const loadFeedbacks = async (labId: string) => {
    if (!labId) return;
    const res = await fetch(`/api/feedback/lab/${labId}?workshopId=${selectedWorkshopId}`);
    if (res.ok) {
      const data = await res.json();
      setFeedbacks(data.data.feedbacks || []);
    }
  };

  const handleWorkshopChange = async (id: string) => {
    setSelectedWorkshopId(id);
    const ws = workshops.find((w) => w.id === id);
    if (ws?.evaluationConfig) {
      const cfg = ws.evaluationConfig;
      setWeights({
        assignments: cfg.assignments ?? 30,
        assessments: cfg.assessments ?? 35,
        attendance: cfg.attendance ?? 15,
        exercises: cfg.exercises ?? 10,
        doubts: cfg.doubts ?? 5,
      });
    }
    await Promise.all([loadReports(id), loadLabs(id), loadMentors(id)]);
  };

  const handleSelectionAction = async (
    studentId: string,
    status: "SELECTED" | "REJECTED" | "ENROLLED"
  ) => {
    const res = await fetch(`/api/admin/selection/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId: selectedWorkshopId, status }),
    });
    if (res.ok) {
      setCandidates((prev) =>
        prev.map((c) => (c.studentId === studentId ? { ...c, status } : c))
      );
      await loadReports(selectedWorkshopId);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWs(true);
    const res = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: wsName,
        year: Number(wsYear),
        slug: wsSlug || `skill-up-${wsYear}`,
        startDate: wsStart,
        endDate: wsEnd,
      }),
    });
    if (res.ok) {
      alert("New workshop edition successfully deployed!");
      init();
    }
    setCreatingWs(false);
  };

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLab(true);
    const res = await fetch("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workshopId: selectedWorkshopId,
        name: labName,
        schedule: labSchedule,
        capacity: labCapacity,
      }),
    });
    if (res.ok) {
      setLabName("");
      setLabSchedule("");
      await loadLabs(selectedWorkshopId);
    }
    setCreatingLab(false);
  };

  const handleDeleteLab = async (labId: string) => {
    if (!confirm("Delete this lab? Enrolled students will be unlinked.")) return;
    const res = await fetch(`/api/labs/${labId}`, { method: "DELETE" });
    if (res.ok) await loadLabs(selectedWorkshopId);
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLabId || !assignStudentId) return;
    const res = await fetch(`/api/labs/${assignLabId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: assignStudentId, workshopId: selectedWorkshopId }),
    });
    if (res.ok) {
      setAssignStudentId("");
      await loadLabs(selectedWorkshopId);
    }
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMentorLabId || !assignMentorId) return;
    const res = await fetch(`/api/labs/${assignMentorLabId}/mentors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId: assignMentorId, isLead: false }),
    });
    if (res.ok) {
      setAssignMentorId("");
      await loadLabs(selectedWorkshopId);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uName,
        email: uEmail,
        password: uPassword,
        role: uRole,
        college: uCollege,
      }),
    });
    if (res.ok) {
      setUName("");
      setUEmail("");
      setUPassword("");
      setUCollege("");
      await loadUsers(userRoleFilter);
      alert("User account provisioned!");
    } else {
      const d = await res.json();
      alert(d?.error?.message || "Failed to create user");
    }
    setCreatingUser(false);
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm("Deactivate this user account?")) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) await loadUsers(userRoleFilter);
  };

  const handleSaveWeights = async () => {
    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    if (total !== 100) {
      alert(`Weights must sum to 100% (currently ${total}%)`);
      return;
    }
    setSavingWeights(true);
    const res = await fetch(`/api/workshops/${selectedWorkshopId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluationConfig: weights }),
    });
    if (res.ok) {
      setWeightsSaved(true);
      setTimeout(() => setWeightsSaved(false), 2500);
      await loadReports(selectedWorkshopId);
    }
    setSavingWeights(false);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchSearch =
      candidateSearch === "" ||
      c.studentName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.college?.toLowerCase().includes(candidateSearch.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchScore = c.overallScore >= minScoreFilter;
    return matchSearch && matchStatus && matchScore;
  });

  const weightTotal = Object.values(weights).reduce((s, v) => s + v, 0);

  const TABS = [
    { id: "selection", label: "Candidate Selection Pipeline", icon: Trophy, count: counts.totalStudents },
    { id: "workshops", label: "Workshops Management", icon: Calendar, count: workshops.length },
    { id: "labs", label: "Labs & Allocation", icon: Layers, count: labs.length },
    { id: "users", label: "Platform Users", icon: Users, count: users.length },
    { id: "weights", label: "Evaluation Formula Weights", icon: Sliders, count: null },
    { id: "feedback", label: "Feedback Explorer", icon: MessageSquare, count: feedbacks.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER: Super 60 Quota Progress ── */}
      <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#111C35]/95 to-[#0D1527]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left: Administrative Context */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SUPER 60 EXECUTIVE HEADQUARTERS
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">Decision Authority</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Candidate Selection Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Evaluator authority for Super 60 induction. Automated real-time formula computation and multi-year audit logs.
            </p>

            {/* Target Workshop Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-slate-400 font-mono">Scoping Workshop:</span>
              <select
                value={selectedWorkshopId}
                onChange={(e) => handleWorkshopChange(e.target.value)}
                className="bg-[#070B14] border border-slate-700 text-brand-orange font-mono font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-orange"
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#0B1120] text-white">
                    {w.name} ({w.year}) — {w.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Super 60 Quota Progress Box */}
          <div className="lg:col-span-5 bg-[#070B14]/80 rounded-2xl p-5 border border-slate-800 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  SUPER 60 INTAKE QUOTA
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-3xl text-emerald-400">
                    {counts.selected || 0}
                  </span>
                  <span className="text-slate-500 font-display font-bold text-lg">/ 60 Qualified</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Cohort Completion:</span>
                <strong className="text-emerald-400">
                  {(((counts.selected || 0) / 60) * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, ((counts.selected || 0) / 60) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 bg-[#0F172A]/70 border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
            TOTAL CANDIDATES
          </span>
          <span className="font-display font-black text-2xl text-white">
            {counts.totalStudents || 0}
          </span>
          <span className="text-[11px] font-mono text-slate-500 block mt-1">Enrolled in edition</span>
        </div>

        <div className="rounded-2xl p-4 bg-[#0F172A]/70 border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
            SELECTED FOR SUPER 60
          </span>
          <span className="font-display font-black text-2xl text-emerald-400">
            {counts.selected || 0}
          </span>
          <span className="text-[11px] font-mono text-emerald-400/80 block mt-1">
            Induction Approved
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-[#0F172A]/70 border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
            AVERAGE CANDIDATE SCORE
          </span>
          <span className="font-display font-black text-2xl text-brand-orange">
            {counts.averageScore || 0}%
          </span>
          <span className="text-[11px] font-mono text-brand-orange/80 block mt-1">
            Aggregate formula
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-[#0F172A]/70 border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
            PENDING EVALUATION
          </span>
          <span className="font-display font-black text-2xl text-amber-400">
            {counts.pending || 0}
          </span>
          <span className="text-[11px] font-mono text-amber-400/80 block mt-1">
            Awaiting final decision
          </span>
        </div>
      </div>

      {/* ── ADMIN TABS ── */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 overflow-x-auto text-xs font-semibold scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 font-bold shadow-[0_0_15px_rgba(240,124,39,0.15)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-brand-orange text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: CANDIDATE SELECTION PIPELINE
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "selection" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl p-4 bg-[#0F172A]/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate by name, institution..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-orange font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {["ALL", "SELECTED", "PENDING", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statusFilter === st
                        ? "bg-brand-orange text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Min Score Cutoff Filter */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#070B14] px-3 py-1.5 rounded-xl border border-slate-800">
                <span>Cutoff: ≥ {minScoreFilter}%</span>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="w-20 accent-brand-orange cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Candidate Table */}
          <div className="rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Candidate</th>
                    <th className="py-3 px-3">College / Dept</th>
                    <th className="py-3 px-3">Assign. (30%)</th>
                    <th className="py-3 px-3">Assess. (35%)</th>
                    <th className="py-3 px-3">Attend. (15%)</th>
                    <th className="py-3 px-3">Overall Score</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Selection Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                        No candidates match the specified filter criteria.
                      </td>
                    </tr>
                  )}
                  {filteredCandidates.map((c) => (
                    <tr key={c.studentId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            c.rank === 1
                              ? "text-brand-gold text-sm"
                              : c.rank === 2
                              ? "text-slate-300"
                              : c.rank === 3
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          #{c.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-sans font-bold text-white text-sm">
                          {c.studentName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">
                        {c.college || "Engineering"}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{c.assignmentsScore}%</td>
                      <td className="py-3 px-3 text-slate-300">{c.assessmentsScore}%</td>
                      <td className="py-3 px-3 text-slate-300">{c.attendancePercentage}%</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-brand-orange text-sm">
                          {c.overallScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === "SELECTED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : c.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleSelectionAction(c.studentId, "SELECTED")}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold text-[11px] transition-all"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleSelectionAction(c.studentId, "REJECTED")}
                          className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[11px] transition-all"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: WORKSHOPS MANAGEMENT
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "workshops" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-bold text-white text-base">
              Deployed Workshop Editions ({workshops.length})
            </h3>
            {workshops.map((w) => (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{w.name}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      w.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
                  <span>Year: {w.year}</span>
                  <span>Slug: {w.slug}</span>
                  <span>Labs: {w._count?.labs || 0}</span>
                  <span>Enrolled: {w._count?.enrollments || 0}</span>
                  <span>Assignments: {w._count?.assignments || 0}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-orange" />
              Deploy Workshop Edition
            </h3>

            <form onSubmit={handleCreateWorkshop} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Edition Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skill Up 2027"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Edition Year
                </label>
                <input
                  type="number"
                  required
                  value={wsYear}
                  onChange={(e) => setWsYear(Number(e.target.value))}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={wsStart}
                    onChange={(e) => setWsStart(e.target.value)}
                    className="w-full bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={wsEnd}
                    onChange={(e) => setWsEnd(e.target.value)}
                    className="w-full bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingWs}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
              >
                {creatingWs ? "Deploying Edition..." : "Deploy Workshop"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: LABS & ALLOCATION
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "labs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lab Cards */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-display font-bold text-white text-base">
              Laboratory Tracks ({labs.length})
            </h3>
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{lab.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Cap: {lab.capacity || 30}
                    </span>
                    <button
                      onClick={() => handleDeleteLab(lab.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <span>Enrolled: {lab._count?.students || 0}</span>
                  <span>Assignments: {lab._count?.assignments || 0}</span>
                  <span>Sessions: {lab._count?.sessions || 0}</span>
                </div>

                {/* Mentors */}
                {lab.mentors?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">
                      Lead Mentors:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.mentors.map((m: any) => (
                        <span
                          key={m.mentor?.id}
                          className="px-2 py-0.5 text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded font-mono"
                        >
                          {m.mentor?.name} {m.isLead ? "(Lead)" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Students */}
                {lab.students?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">
                      Enrolled Students:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.students.map((s: any) => (
                        <span
                          key={s.student?.id}
                          className="px-2 py-0.5 text-[10px] bg-slate-900 text-slate-300 border border-slate-800 rounded font-mono"
                        >
                          {s.student?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Allocation Actions Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Create Lab */}
            <div className="rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-3">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-orange" />
                Create Laboratory Track
              </h4>
              <form onSubmit={handleCreateLab} className="space-y-2.5">
                <input
                  required
                  placeholder="Lab name (e.g. Lab C — Distributed Systems)"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                />
                <input
                  placeholder="Schedule (e.g. Tue/Thu 18:00 - 20:30)"
                  value={labSchedule}
                  onChange={(e) => setLabSchedule(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={labCapacity}
                  onChange={(e) => setLabCapacity(Number(e.target.value))}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  disabled={creatingLab}
                  className="w-full py-2 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50"
                >
                  {creatingLab ? "Creating..." : "Create Lab"}
                </button>
              </form>
            </div>

            {/* Assign Student to Lab */}
            <div className="rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-3">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Assign Student to Lab
              </h4>
              <form onSubmit={handleAssignStudent} className="space-y-2.5">
                <select
                  value={assignLabId}
                  onChange={(e) => setAssignLabId(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Select Target Lab...</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Student User ID"
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase hover:brightness-110"
                >
                  Assign Candidate
                </button>
              </form>
            </div>

            {/* Assign Mentor to Lab */}
            <div className="rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-3">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-400" />
                Assign Mentor to Lab
              </h4>
              <form onSubmit={handleAssignMentor} className="space-y-2.5">
                <select
                  value={assignMentorLabId}
                  onChange={(e) => setAssignMentorLabId(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select Target Lab...</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <select
                  value={assignMentorId}
                  onChange={(e) => setAssignMentorId(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select Mentor...</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold uppercase hover:brightness-110"
                >
                  Assign Mentor
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: PLATFORM USERS & PROVISIONING
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-display font-bold text-white text-base">
                User Directory ({users.length})
              </h3>
              <div className="flex gap-1.5 text-xs font-mono">
                {["", "STUDENT", "MENTOR", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRoleFilter(r);
                      loadUsers(r);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      userRoleFilter === r
                        ? "bg-brand-orange text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {r || "ALL"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-white text-sm">
                          {u.name}
                        </td>
                        <td className="py-3 px-3 text-slate-300">{u.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/30"
                                : u.role === "MENTOR"
                                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold ${
                              u.isActive ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {u.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {u.isActive && u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleDeactivateUser(u.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Provision User Form */}
          <div className="lg:col-span-4 rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-3">
            <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-orange" />
              Provision Account
            </h4>
            <form onSubmit={handleCreateUser} className="space-y-2.5">
              <input
                required
                placeholder="Full Name"
                value={uName}
                onChange={(e) => setUName(e.target.value)}
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={uEmail}
                onChange={(e) => setUEmail(e.target.value)}
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
              />
              <input
                required
                type="password"
                placeholder="Password (min 6 chars)"
                value={uPassword}
                onChange={(e) => setUPassword(e.target.value)}
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
              />
              <select
                value={uRole}
                onChange={(e) => setURole(e.target.value as any)}
                className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-orange"
              >
                <option value="STUDENT">Student Candidate</option>
                <option value="MENTOR">Super 60 Mentor</option>
                <option value="ADMIN">System Administrator</option>
              </select>
              {uRole === "STUDENT" && (
                <input
                  placeholder="Institution / College"
                  value={uCollege}
                  onChange={(e) => setUCollege(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                />
              )}
              <button
                type="submit"
                disabled={creatingUser}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50"
              >
                {creatingUser ? "Provisioning..." : "Provision Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 5: EVALUATION FORMULA WEIGHTS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "weights" && (
        <div className="max-w-xl rounded-2xl p-6 sm:p-7 bg-[#0F172A]/80 border border-slate-800/80 shadow-xl space-y-6">
          <div>
            <span className="text-[10px] font-mono text-brand-orange uppercase font-bold tracking-wider">
              EVALUATION ENGINE
            </span>
            <h3 className="font-display font-bold text-2xl text-white mt-0.5">
              Configurable Component Weights
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust how the candidate performance formula computes the overall score for this workshop edition. Persisted directly into the database.
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="capitalize text-slate-300 font-bold">{key} Component:</span>
                  <span className="text-brand-orange font-bold text-sm">{weights[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-orange cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Sum Check */}
          <div
            className={`p-4 rounded-xl font-mono text-xs font-bold flex items-center justify-between border ${
              weightTotal === 100
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            <span>Total Sum: {weightTotal}%</span>
            <span>{weightTotal === 100 ? "✓ 100% Perfectly Balanced" : `Unbalanced (${weightTotal}%)`}</span>
          </div>

          <button
            onClick={handleSaveWeights}
            disabled={savingWeights || weightTotal !== 100}
            className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orangeLight text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {weightsSaved
                ? "Weights Saved & Re-calculated!"
                : savingWeights
                ? "Saving..."
                : "Save Weights to Database"}
            </span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 6: FEEDBACK EXPLORER
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="font-display font-bold text-white text-base">
              Faculty Feedback Explorer
            </h3>
            <select
              value={feedbackLabId}
              onChange={(e) => {
                setFeedbackLabId(e.target.value);
                loadFeedbacks(e.target.value);
              }}
              className="bg-[#070B14] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-brand-orange"
            >
              <option value="">Select Laboratory Track...</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-2xl p-12 bg-[#0F172A]/70 border border-slate-800 text-center text-slate-500 font-mono text-xs">
              Select a laboratory track above to inspect candidate feedback.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < f.rating
                              ? "text-brand-gold fill-brand-gold drop-shadow-[0_0_6px_rgba(255,184,0,0.5)]"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30 uppercase">
                      {f.category}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 font-sans italic">&quot;{f.comment}&quot;</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                    <span>From: {f.isAnonymous ? "Anonymous Candidate" : f.student?.name}</span>
                    <span>Mentor: {f.mentor?.name || "Lead"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
