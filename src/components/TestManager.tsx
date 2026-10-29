"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Clock,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  BookMarked,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  Unlock,
  RotateCcw,
  Shield,
  ShieldAlert,
  Edit3,
  Copy,
  Calendar,
  Star,
  Check,
  Trophy,
  Sparkles,
  Eye,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import LeaderboardModal from "@/components/LeaderboardModal";
import FormattedPrompt from "@/components/FormattedPrompt";

/* ───────────────────────── types ───────────────────────── */

interface Question {
  prompt: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  kind: "choice" | "text";
  correctOptionIndex?: number;
}

interface BankQuestion {
  id: string;
  topic?: string | null;
  difficulty: string;
  prompt: string;
  options?: string[] | null;
  correctAnswer?: string | null;
  marks: number;
}

interface Result {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    email?: string;
    college?: string;
    rollNumber?: string;
    phone?: string;
    branch?: string;
  };
  score: number;
  status: string;
  isLocked?: boolean;
  violationCount?: number;
  violationReason?: string;
  unlockedAt?: string | null;
  unlockedBy?: string | null;
  answers?: Record<string, string> | null;
  correctCount?: number | null;
  incorrectCount?: number | null;
  unansweredCount?: number | null;
  durationSec?: number | null;
  feedback?: string | null;
  submittedAt: string;
}

interface Assessment {
  id: string;
  title: string;
  description?: string | null;
  targetLabIds?: string[];
  targetAudience?: string | null;
  type: string;
  totalMarks: number;
  passingMarks?: number | null;
  durationMinutes?: number | null;
  allowedViolations?: number | null;
  instructions?: string | null;
  startsAt: string;
  endsAt: string;
  lab?: { id: string; name: string } | null;
  questions: { id: string; prompt: string; options?: unknown; correctAnswer?: string | null; marks: number }[];
  results?: Result[];
}

interface TestManagerProps {
  workshopId: string;
  labs: { id: string; name: string }[];
  isMentorView?: boolean;
  mentorLabId?: string;
  defaultType?: "ASSIGNMENT" | "TEST" | "QUIZ" | "PROGRAMMING";
}

const inputCls =
  "w-full px-3 py-2 bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] text-xs font-mono focus:outline-none focus:bg-white shadow-[2px_2px_0px_#111111] transition-all";
const labelCls = "block text-[11px] font-mono text-[#111111] uppercase tracking-wider mb-1.5 font-bold";
const btnPrimary =
  "px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 flex items-center gap-1.5 justify-center cursor-pointer";
const btnGhost =
  "px-3 py-1.5 border-[2px] border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer";

const emptyQuestion = (): Question => ({
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
  kind: "choice",
  correctOptionIndex: undefined,
});

/* ───────────────────────── component ───────────────────────── */

export default function TestManager({
  workshopId,
  labs,
  isMentorView = false,
  mentorLabId,
  defaultType = "ASSIGNMENT",
}: TestManagerProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [resultsFor, setResultsFor] = useState<Assessment | null>(null);
  const [grading, setGrading] = useState<{ studentId: string; score: string; feedback: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [showBank, setShowBank] = useState(false);
  const [batchCountMap, setBatchCountMap] = useState<Record<string, number>>({});
  const [resultQuestions, setResultQuestions] = useState<any[]>([]);
  const [selectedResultLab, setSelectedResultLab] = useState<string | "ALL">(
    mentorLabId || "ALL"
  );
  const [inspectingResult, setInspectingResult] = useState<Result | null>(null);
  const [resultFilterStatus, setResultFilterStatus] = useState<"ALL" | "SUBMITTED" | "LOCKED" | "SELECTED">("ALL");
  const [resultSearchQuery, setResultSearchQuery] = useState<string>("");

  // create-form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"ASSIGNMENT" | "TEST" | "QUIZ" | "PROGRAMMING">(
    defaultType
  );
  const [targetLabMode, setTargetLabMode] = useState<"ALL" | "SINGLE" | "MULTIPLE">(
    mentorLabId ? "SINGLE" : "ALL"
  );
  const [labId, setLabId] = useState(mentorLabId || "");
  const [selectedTargetLabIds, setSelectedTargetLabIds] = useState<string[]>([]);
  const [filterTestStatus, setFilterTestStatus] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "UPCOMING">("ALL");
  const [filterType, setFilterType] = useState<string>(defaultType || "ALL");
  const [leaderboardAssessment, setLeaderboardAssessment] = useState<{ id: string; title: string } | null>(null);
  const [passingMarks, setPassingMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [antiCheatEnabled, setAntiCheatEnabled] = useState(false);
  const [allowedViolations, setAllowedViolations] = useState("0");
  const [instructions, setInstructions] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [bankTopic, setBankTopic] = useState("C++ Basics");

  // edit-test modal state
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"ASSIGNMENT" | "TEST" | "QUIZ" | "PROGRAMMING">("ASSIGNMENT");
  const [editLabId, setEditLabId] = useState("");
  const [editDurationMinutes, setEditDurationMinutes] = useState("90");
  const [editPassingMarks, setEditPassingMarks] = useState("50");
  const [editAntiCheatEnabled, setEditAntiCheatEnabled] = useState(false);
  const [editAllowedViolations, setEditAllowedViolations] = useState("0");
  const [editInstructions, setEditInstructions] = useState("");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);

  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);

  const load = async () => {
    try {
      const [aRes, bRes] = await Promise.all([
        fetch(`/api/assessments?workshopId=${workshopId}`),
        fetch(`/api/question-bank?workshopId=${workshopId}`),
      ]);
      if (aRes.ok) {
        const d = await aRes.json();
        setAssessments(d.data?.assessments || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        setBank(d.data?.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) {
      setLoading(true);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType(defaultType);
    setLabId(mentorLabId || "");
    setTargetLabMode(mentorLabId ? "SINGLE" : "ALL");
    setSelectedTargetLabIds([]);
    setPassingMarks("");
    setDurationMinutes("30");
    setAntiCheatEnabled(false);
    setAllowedViolations("0");
    setInstructions("");
    setStartsAt("");
    setEndsAt("");
    setQuestions([emptyQuestion()]);
  };

  /* ── create test ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) return flash("Add at least one question", false);

    // ── MCQ Correct Answer Validation ──
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        flash(`Please enter a prompt for Question #${i + 1}`, false);
        return;
      }
      if (q.kind === "choice") {
        const cleanOpts = q.options.map((o) => o.trim()).filter(Boolean);
        if (cleanOpts.length < 2) {
          flash(`Question #${i + 1} must have at least 2 non-empty options.`, false);
          return;
        }
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          flash(`Please select the radio button next to the correct answer for Question #${i + 1}.`, false);
          return;
        }
        const matchesOption = cleanOpts.some(
          (opt) => opt.toLowerCase() === q.correctAnswer.trim().toLowerCase()
        );
        if (!matchesOption) {
          flash(`The selected correct answer for Question #${i + 1} must match one of its options.`, false);
          return;
        }
      }
    }

    setBusy(true);
    try {
      let finalLabId: string | undefined = undefined;
      let finalTargetLabIds: string[] = [];
      if (targetLabMode === "SINGLE") {
        finalLabId = labId || mentorLabId || undefined;
      } else if (targetLabMode === "MULTIPLE") {
        finalTargetLabIds = selectedTargetLabIds;
      } else if (targetLabMode === "ALL") {
        finalTargetLabIds = labs.map((l) => l.id);
      }

      const isScreeningTest = type === "TEST" && !isMentorView && targetLabMode === "ALL" && !labId;
      const targetAudience = isScreeningTest ? "ALL" : "LABS";

      const payload = {
        workshopId,
        labId: finalLabId,
        targetLabIds: finalTargetLabIds,
        targetAudience,
        title,
        description: description || undefined,
        type,
        totalMarks,
        passingMarks: passingMarks ? Number(passingMarks) : Math.round(totalMarks * 0.6),
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        allowedViolations: antiCheatEnabled ? (allowedViolations ? Number(allowedViolations) : 3) : 0,
        instructions: instructions || description || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        questions: questions.map((q) => ({
          prompt: q.prompt,
          options: q.kind === "choice" ? q.options.filter((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer || undefined,
          marks: Number(q.marks) || 1,
        })),
      };
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create test");

      flash(`Test "${title}" created and students notified`);
      setShowCreate(false);
      resetForm();
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to create test", false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete test "${name}"? This removes all its results too.`)) return;
    try {
      const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      flash("Test deleted");
      setExpandedId(null);
      await load();
    } catch {
      flash("Failed to delete test", false);
    }
  };

  const toLocalInput = (dateStr?: string | Date) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const handleOpenEdit = (a: Assessment) => {
    setEditingAssessment(a);
    setEditTitle(a.title);
    setEditType((a.type as any) || "ASSIGNMENT");
    setEditLabId(a.lab?.id || "");
    setEditDurationMinutes(a.durationMinutes ? String(a.durationMinutes) : "90");
    setEditPassingMarks(a.passingMarks ? String(a.passingMarks) : String(Math.round(a.totalMarks * 0.6)));
    const hasAntiCheat = Boolean(a.allowedViolations && a.allowedViolations > 0);
    setEditAntiCheatEnabled(hasAntiCheat);
    setEditAllowedViolations(hasAntiCheat ? String(a.allowedViolations) : "0");
    setEditInstructions(a.instructions || "");
    setEditStartsAt(toLocalInput(a.startsAt));
    setEditEndsAt(toLocalInput(a.endsAt));

    const mappedQuestions: Question[] = (a.questions || []).map((q: any) => {
      const opts = Array.isArray(q.options) && q.options.length > 0 ? (q.options as string[]) : ["", "", "", ""];
      const correct = q.correctAnswer || "";
      const correctIdx = opts.findIndex((o) => o.trim().toLowerCase() === correct.trim().toLowerCase());
      return {
        prompt: q.prompt || "",
        options: opts,
        correctAnswer: correct,
        marks: q.marks || 1,
        kind: Array.isArray(q.options) && q.options.length > 0 ? "choice" : "text",
        correctOptionIndex: correctIdx >= 0 ? correctIdx : undefined,
      };
    });
    setEditQuestions(mappedQuestions.length > 0 ? mappedQuestions : [emptyQuestion()]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;

    const hasSubmissions = (editingAssessment.results?.length || 0) > 0;

    // Validate edit questions if modifying questions on a test with 0 submissions
    if (!hasSubmissions && editQuestions.length > 0) {
      for (let i = 0; i < editQuestions.length; i++) {
        const q = editQuestions[i];
        if (!q.prompt.trim()) {
          flash(`Please enter a prompt for Question #${i + 1}`, false);
          return;
        }
        if (q.kind === "choice") {
          const cleanOpts = q.options.map((o) => o.trim()).filter(Boolean);
          if (cleanOpts.length < 2) {
            flash(`Question #${i + 1} must have at least 2 non-empty options.`, false);
            return;
          }
          if (!q.correctAnswer || !q.correctAnswer.trim()) {
            flash(`Please select the radio button next to the correct answer for Question #${i + 1}.`, false);
            return;
          }
          const matchesOption = cleanOpts.some(
            (opt) => opt.toLowerCase() === q.correctAnswer.trim().toLowerCase()
          );
          if (!matchesOption) {
            flash(`The designated correct answer for Question #${i + 1} must match one of its options.`, false);
            return;
          }
        }
      }
    }

    setBusy(true);
    try {
      const payload: any = {
        title: editTitle,
        type: editType,
        labId: editLabId || null,
        durationMinutes: editDurationMinutes ? Number(editDurationMinutes) : null,
        passingMarks: editPassingMarks ? Number(editPassingMarks) : null,
        allowedViolations: editAntiCheatEnabled ? (editAllowedViolations ? Number(editAllowedViolations) : 3) : 0,
        instructions: editInstructions || null,
        startsAt: new Date(editStartsAt).toISOString(),
        endsAt: new Date(editEndsAt).toISOString(),
      };

      if (!hasSubmissions && editQuestions.length > 0) {
        payload.questions = editQuestions.map((q) => ({
          prompt: q.prompt,
          options: q.kind === "choice" ? q.options.filter((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer || undefined,
          marks: Number(q.marks) || 1,
        }));
      }

      const res = await fetch(`/api/assessments/${editingAssessment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to update test");
      flash(`Test "${editTitle}" updated successfully`);
      setEditingAssessment(null);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to save test updates", false);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLive = async (a: Assessment, makeLive: boolean) => {
    setBusy(true);
    try {
      const now = new Date();
      let startsAt: string;
      let endsAt: string;
      if (makeLive) {
        // Starts 5 minutes ago so it's active immediately
        startsAt = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        // Ends 24 hours from now
        endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else {
        // Postpone to 7 days later so it becomes offline / draft
        startsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        endsAt = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();
      }
      const res = await fetch(`/api/assessments/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt, endsAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to update test schedule");
      flash(makeLive ? `Test "${a.title}" is now LIVE!` : `Test "${a.title}" has been taken offline.`);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to update test schedule", false);
    } finally {
      setBusy(false);
    }
  };

  const handleQuickSetToday = (a: Assessment) => handleToggleLive(a, true);

  const handleDuplicate = async (a: Assessment) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${a.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to fetch test for reuse");
      const full = data.data?.assessment;
      if (!full) throw new Error("Assessment not found");

      setTitle(`${full.title} (Reused)`);
      setType((full.type as any) || "TEST");
      setLabId(full.labId || "");
      setDurationMinutes(full.durationMinutes ? String(full.durationMinutes) : "90");
      setPassingMarks(full.passingMarks ? String(full.passingMarks) : "50");
      const hasAntiCheat = Boolean(full.allowedViolations && full.allowedViolations > 0);
      setAntiCheatEnabled(hasAntiCheat);
      setAllowedViolations(hasAntiCheat ? String(full.allowedViolations) : "0");
      setInstructions(full.instructions || "");

      const now = new Date();
      setStartsAt(toLocalInput(now));
      setEndsAt(toLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000)));

      if (full.questions && full.questions.length > 0) {
        setQuestions(
          full.questions.map((q: any) => ({
            prompt: q.prompt,
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["", ""],
            correctAnswer: q.correctAnswer || "",
            marks: Number(q.marks) || 1,
            kind: Array.isArray(q.options) && q.options.length > 0 ? "choice" : "text",
          }))
        );
      }

      setShowCreate(true);
      flash(`Reused "${full.title}" with all ${full.questions?.length || 0} questions loaded into draft!`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      flash(err.message || "Failed to reuse test", false);
    } finally {
      setBusy(false);
    }
  };

  const handleExportRound2ShortlistCSV = (a: Assessment, resList: Result[]) => {
    // Sort strictly by Score DESC, and durationSec ASC for tie-breaking
    const sorted = [...resList].sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      const xDur = x.durationSec != null ? x.durationSec : 999999;
      const yDur = y.durationSec != null ? y.durationSec : 999999;
      return xDur - yDur;
    });

    const passMark = a.passingMarks ?? Math.round(a.totalMarks * 0.6);
    const topTarget = batchCountMap[a.id] ?? 60;

    const headers = [
      "Lab Allocation Rank",
      "Candidate Name",
      "Registration / Roll No",
      "Email Address",
      "Phone Number",
      "College / Institute",
      "Branch",
      "Score",
      "Max Marks",
      "Percentage",
      "Time Taken (Seconds)",
      "Time Taken (Formatted)",
      "Lab Allocation Status",
      "Qualification Tier",
      "Proctoring Status",
      "Violation Strikes",
      "Submitted At",
    ];

    const rows = sorted.map((r, idx) => {
      const isLockedCandidate = r.isLocked || r.status === "LOCKED" || r.status === "DISQUALIFIED";
      const passed = r.score >= passMark && !isLockedCandidate;
      const rank = idx + 1;
      const durSec = r.durationSec ?? 0;
      const formattedDuration = r.durationSec
        ? `${Math.floor(r.durationSec / 60)}m ${r.durationSec % 60}s`
        : "N/A";

      const round2Status = isLockedCandidate
        ? "DISQUALIFIED (PROCTORING LOCKOUT)"
        : rank <= topTarget && passed
        ? "QUALIFIED FOR LAB ALLOCATION (SUPER 60)"
        : passed
        ? "WAITLISTED (PASSED BENCHMARK)"
        : "DID NOT QUALIFY";

      const tier = isLockedCandidate
        ? "DISQUALIFIED"
        : rank <= 10 && passed
        ? "TIER 1 (ALPHA ACCELERATOR)"
        : rank <= topTarget && passed
        ? "TIER 2 (SUPER 60 CORE)"
        : "TIER 3 (GENERAL POOL)";

      return [
        rank,
        r.student?.name || "Student",
        r.student?.rollNumber || "N/A",
        r.student?.email || "N/A",
        r.student?.phone || "N/A",
        r.student?.college || "N/A",
        r.student?.branch || "N/A",
        r.score,
        a.totalMarks,
        `${Math.round((r.score / a.totalMarks) * 100)}%`,
        durSec,
        formattedDuration,
        round2Status,
        tier,
        isLockedCandidate ? `LOCKED (${r.violationCount ?? 0} strikes)` : "CLEAN",
        r.violationCount ?? 0,
        new Date(r.submittedAt).toLocaleString(),
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${a.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Lab_Shortlist.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── results & grading ── */
  const openResults = async (a: Assessment) => {
    if (expandedId === a.id) {
      setExpandedId(null);
      setResults(null);
      setResultsFor(null);
      setResultQuestions([]);
      setInspectingResult(null);
      setSelectedResultLab(mentorLabId || "ALL");
      return;
    }
    setResultsFor(a);
    setExpandedId(a.id);
    setGrading(null);
    setResults(null);
    setSelectedResultLab(mentorLabId || "ALL");
    setInspectingResult(null);
    setResultSearchQuery("");
    setResultFilterStatus("ALL");
    try {
      const res = await fetch(`/api/assessments/${a.id}/results`);
      if (res.ok) {
        const d = await res.json();
        setResults(d.data?.results || []);
        setResultQuestions(d.data?.questions || a.questions || []);
      }
    } catch {
      setResults([]);
      setResultQuestions(a.questions || []);
    }
  };

  const submitGrade = async () => {
    if (!grading || !resultsFor) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${resultsFor.id}/results`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: grading.studentId,
          score: Number(grading.score),
          feedback: grading.feedback || undefined,
          status: "COMPLETED",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || "Grading failed");
      }
      flash("Score recorded — student notified");
      setGrading(null);
      await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Grading failed", false);
    } finally {
      setBusy(false);
    }
  };

  const handleUnlockCandidate = async (assessmentId: string, studentId: string, studentName: string) => {
    if (!confirm(`Unlock test session for ${studentName}? This clears the proctoring lock and sets status to PENDING_REVIEW.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "UNLOCK" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Unlock failed");
      flash(`Candidate ${studentName} unlocked successfully`);
      if (resultsFor) await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to unlock candidate", false);
    } finally {
      setBusy(false);
    }
  };

  const handleRetestCandidate = async (assessmentId: string, studentId: string, studentName: string) => {
    if (!confirm(`Allow RETEST for ${studentName}? This deletes their previous attempt so they can take the test again cleanly.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "RETEST" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to allow retest");
      flash(`Retest authorized for ${studentName}. Previous attempt cleared.`);
      if (resultsFor) await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to allow retest", false);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateCandidateStatus = async (
    assessmentId: string,
    studentId: string,
    action: "SELECT_ROUND2" | "SELECT_FOR_LABS" | "WAITLIST" | "REJECT" | "CLEAR_SELECTION",
    studentName: string
  ) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to update candidate status");
      flash(
        `Candidate ${studentName}: ${
          (action === "SELECT_ROUND2" || action === "SELECT_FOR_LABS")
            ? "Selected for Lab Allocation"
            : action === "WAITLIST"
            ? "Placed on Waitlist"
            : action === "REJECT"
            ? "Marked as Not Selected"
            : "Selection reset"
        }`
      );
      if (resultsFor) await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to update candidate", false);
    } finally {
      setBusy(false);
    }
  };

  const handleBatchSelectTop = async (assessmentId: string, count: number = 60) => {
    if (
      !confirm(
        `Automatically select the Top ${count} ranked candidates for Super 60 Lab Allocation? All selected candidates will be designated for Lab Allocation.`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BATCH_SELECT_TOP", topCount: count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to batch select candidates");
      flash(data.data?.message || `Top ${count} candidates selected for Lab Allocation!`);
      if (resultsFor) await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to batch select", false);
    } finally {
      setBusy(false);
    }
  };

  const handleExportResultsCSV = (a: Assessment, resList: Result[]) => {
    const headers = [
      "Roll Number",
      "Student Name",
      "Email",
      "Phone",
      "College",
      "Branch",
      "Score",
      "Total Marks",
      "Percentage",
      "Status",
      "Violations Count",
      "Violation Reason",
      "Is Locked",
      "Submitted At",
    ];
    const rows = resList.map((r) => [
      r.student?.rollNumber || "N/A",
      r.student?.name || "Student",
      r.student?.email || "N/A",
      r.student?.phone || "N/A",
      r.student?.college || "N/A",
      r.student?.branch || "N/A",
      r.score,
      a.totalMarks,
      `${Math.round((r.score / a.totalMarks) * 100)}%`,
      r.status,
      r.violationCount ?? 0,
      r.violationReason || "None",
      r.isLocked ? "YES" : "NO",
      new Date(r.submittedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${a.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── question bank ── */
  const saveToBank = async (q: Question) => {
    if (!q.prompt.trim()) return flash("Write the question first", false);
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          topic: bankTopic,
          prompt: q.prompt,
          options: q.kind === "choice" ? q.options.filter((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer || undefined,
          marks: Number(q.marks) || 5,
        }),
      });
      if (!res.ok) throw new Error();
      flash("Saved to question bank");
      const bRes = await fetch(`/api/question-bank?workshopId=${workshopId}`);
      if (bRes.ok) setBank((await bRes.json()).data?.questions || []);
    } catch {
      flash("Could not save to bank", false);
    }
  };

  const applyBankQuestion = (b: BankQuestion) => {
    const opts = Array.isArray(b.options) ? (b.options as string[]) : [];
    setQuestions((prev) => [
      ...prev,
      {
        prompt: b.prompt,
        options: opts.length >= 2 ? [...opts] : ["", ""],
        correctAnswer: b.correctAnswer || "",
        marks: b.marks,
        kind: opts.length >= 2 ? "choice" : "text",
      },
    ]);
    flash("Question added to the test draft");
  };

  const deleteBankQuestion = async (id: string) => {
    try {
      await fetch(`/api/question-bank/${id}`, { method: "DELETE" });
      setBank((prev) => prev.filter((b) => b.id !== id));
    } catch {
      /* ignore */
    }
  };

  const updateQ = (idx: number, patch: Partial<Question>) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  /* ───────────────────────── render ───────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase font-black text-[#F07C27] block">
            {isMentorView ? "[ MENTOR // LABORATORY ]" : "[ ADMIN // CONTROL ]"}
          </span>
          <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#F07C27]" />{" "}
            {isMentorView
              ? defaultType === "ASSIGNMENT"
                ? "Laboratory Assignments"
                : "Laboratory Tests & Quizzes"
              : "Assignments & Tests Management"}
          </h3>
          <p className="text-xs text-slate-700 font-mono mt-0.5">
            {isMentorView
              ? defaultType === "ASSIGNMENT"
                ? "Deploy and manage open-book laboratory assignments, review student submissions, and assign scores"
                : "Schedule laboratory tests, inspect student test responses, and monitor proctoring status"
              : "Create and publish assignments, MCQ tests, and quizzes to all labs or selected labs"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => setShowBank((v) => !v)}>
            <BookMarked className="w-3.5 h-3.5" /> Question Bank ({bank.length})
          </button>
          <button className={btnPrimary} onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate
              ? "Cancel"
              : defaultType === "ASSIGNMENT"
              ? "+ New Assignment"
              : "+ New Assignment / Test"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold flex items-center gap-2 ${
            msg.ok
              ? "bg-emerald-100 text-emerald-900"
              : "bg-rose-100 text-rose-900"
          }`}
        >
          {msg.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
          {msg.text}
        </div>
      )}

      {/* ── question bank drawer ── */}
      {showBank && (
        <div className="border-[3px] border-[#111111] p-5 bg-white shadow-[6px_6px_0px_#111111] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-display font-black text-[#111111] text-sm uppercase tracking-tight flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#F07C27]" /> Shared Question Bank
            </h4>
            <div className="flex items-center gap-2">
              <input
                value={bankTopic}
                onChange={(e) => setBankTopic(e.target.value)}
                className="px-2 py-1 bg-[#F4F3F3] border-[2px] border-[#111111] text-[11px] font-mono text-[#111111] w-36 shadow-[1px_1px_0px_#111111]"
                placeholder="Topic"
              />
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">topic tag</span>
            </div>
          </div>
          {bank.length === 0 && (
            <p className="text-xs text-slate-600 font-mono">
              Bank is empty — click “Save to bank” next to any question while building a test.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {bank.map((b) => (
              <div
                key={b.id}
                className="p-3 border-[2px] border-[#111111] bg-[#F9F9F9] shadow-[2px_2px_0px_#111111] flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#111111] font-mono font-bold truncate">{b.prompt}</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    {b.topic || "General"} · {b.difficulty} · {b.marks} pts
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => applyBankQuestion(b)}
                    className="px-2 py-1 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] text-[10px] font-mono font-bold hover:bg-[#F07C27] hover:text-white shadow-[1px_1px_0px_#111111] cursor-pointer"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteBankQuestion(b.id)}
                    className="px-2 py-1 border-[2px] border-[#111111] bg-rose-100 text-rose-800 text-[10px] font-mono font-bold hover:bg-rose-600 hover:text-white shadow-[1px_1px_0px_#111111] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── create form ── */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="border-[3px] border-[#111111] p-6 bg-white shadow-[6px_6px_0px_#111111] space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Test Title *</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unit Test 3 — Pointers & References"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className={labelCls}>Test Description / Subtitle</label>
              <input
                className={inputCls}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive MCQ assessment on memory and pointers"
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                className={inputCls}
                value={type}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setType(val);
                  if (val === "ASSIGNMENT") {
                    setAntiCheatEnabled(false);
                    setAllowedViolations("0");
                  } else if (val === "TEST") {
                    setAntiCheatEnabled(true);
                    setAllowedViolations("3");
                  }
                }}
              >
                <option value="ASSIGNMENT">Assignment (MCQ / Problems)</option>
                <option value="TEST">Test / Exam</option>
                <option value="QUIZ">Quiz</option>
                <option value="PROGRAMMING">Programming (code answers, manual review)</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 bg-[#F4F3F3] p-3 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
              <label className={labelCls}>Publish Target & Lab Selection</label>
              <div className="flex items-center gap-4 flex-wrap text-xs font-mono font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetLabMode"
                    value="ALL"
                    checked={targetLabMode === "ALL"}
                    onChange={() => setTargetLabMode("ALL")}
                    className="accent-[#F07C27]"
                  />
                  <span>All Labs at Once ({labs.length} Labs)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetLabMode"
                    value="SINGLE"
                    checked={targetLabMode === "SINGLE"}
                    onChange={() => setTargetLabMode("SINGLE")}
                    className="accent-[#F07C27]"
                  />
                  <span>Specific Single Lab</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetLabMode"
                    value="MULTIPLE"
                    checked={targetLabMode === "MULTIPLE"}
                    onChange={() => setTargetLabMode("MULTIPLE")}
                    className="accent-[#F07C27]"
                  />
                  <span>Multiple Selected Labs</span>
                </label>
              </div>

              {targetLabMode === "SINGLE" && (
                <div className="pt-2">
                  <select
                    className={inputCls}
                    value={labId}
                    onChange={(e) => setLabId(e.target.value)}
                  >
                    <option value="">Select a specific lab...</option>
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        🏛️ {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetLabMode === "MULTIPLE" && (
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {labs.map((l) => {
                    const checked = selectedTargetLabIds.includes(l.id);
                    return (
                      <label
                        key={l.id}
                        className={`flex items-center gap-2 p-2 border-[2px] border-[#111111] text-xs font-mono font-bold cursor-pointer transition-all ${
                          checked
                            ? "bg-[#FFF0E5] text-[#111111] shadow-[2px_2px_0px_#111111]"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTargetLabIds((prev) => [...prev, l.id]);
                            } else {
                              setSelectedTargetLabIds((prev) => prev.filter((id) => id !== l.id));
                            }
                          }}
                          className="accent-[#F07C27]"
                        />
                        <span className="truncate">🏛️ {l.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={300}
                className={inputCls}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Passing Marks</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                placeholder={`default ${Math.round(totalMarks * 0.6)}`}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Anti-Cheat Mechanism</label>
                <span
                  className={`text-[9px] font-mono font-black px-1.5 py-0.5 border border-[#111111] uppercase ${
                    antiCheatEnabled
                      ? "bg-rose-100 text-rose-900 border-rose-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {antiCheatEnabled ? "PROCTORED (ON)" : "OPEN BOOK (OFF)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAntiCheatEnabled(false);
                    setAllowedViolations("0");
                  }}
                  className={`py-1.5 px-2 border-[2px] border-[#111111] text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !antiCheatEnabled
                      ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#111111]"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> OFF (Disabled)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAntiCheatEnabled(true);
                    if (allowedViolations === "0") setAllowedViolations("3");
                  }}
                  className={`py-1.5 px-2 border-[2px] border-[#111111] text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    antiCheatEnabled
                      ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> ON (Active)
                </button>
              </div>

              {antiCheatEnabled ? (
                <div className="pt-1">
                  <label className="block text-[10px] font-mono text-[#111111] font-bold uppercase mb-1">
                    Strike Lockout Limit:
                  </label>
                  <select
                    className={inputCls}
                    value={allowedViolations}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAllowedViolations(v);
                      if (v === "0") setAntiCheatEnabled(false);
                    }}
                  >
                    <option value="1">1 Strike (Zero-Tolerance: Lock on 1st Violation)</option>
                    <option value="2">2 Strikes (Strict)</option>
                    <option value="3">3 Strikes (Standard - Recommended)</option>
                    <option value="5">5 Strikes (Lenient)</option>
                  </select>
                </div>
              ) : (
                <div className="p-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-[10px] font-bold">
                  ✓ Anti-Cheat Disabled (Open Book). Students can switch tabs, copy/paste, and use external IDEs with zero penalties.
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Starts At *</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Ends At *</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Instructions (optional)</label>
              <textarea
                className={inputCls}
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Read every question carefully. One attempt only — the timer auto-submits."
              />
            </div>
          </div>

          {/* questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2">
              <h4 className="font-mono font-black text-[#111111] text-sm uppercase">
                Questions ({questions.length}) — total {totalMarks} marks
              </h4>
              <button
                type="button"
                className={btnGhost}
                onClick={() => setQuestions((p) => [...p, emptyQuestion()])}
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] space-y-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black text-[#F07C27] bg-[#FFF0E5] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                    Q{idx + 1}
                  </span>
                  <select
                    className="px-2 py-1 bg-white border-[2px] border-[#111111] text-[11px] font-mono font-bold text-[#111111] shadow-[1px_1px_0px_#111111]"
                    value={q.kind}
                    onChange={(e) => updateQ(idx, { kind: e.target.value as any })}
                  >
                    <option value="choice">Multiple choice</option>
                    <option value="text">Text / Code (manual review)</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={q.marks}
                    onChange={(e) => updateQ(idx, { marks: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border-[2px] border-[#111111] text-[11px] font-mono font-bold text-[#111111] shadow-[1px_1px_0px_#111111]"
                    title="Marks"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-600">pts</span>
                  <button
                    type="button"
                    onClick={() => saveToBank(q)}
                    className="ml-auto px-2 py-1 bg-white text-purple-900 border border-[#111111] text-[10px] font-mono font-bold hover:bg-[#FFF0E5] flex items-center gap-1 shadow-[1px_1px_0px_#111111]"
                  >
                    <BookMarked className="w-3 h-3" /> Save to bank
                  </button>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestions((p) => p.filter((_, i) => i !== idx))}
                      className="px-2 py-1 bg-rose-100 text-rose-900 border border-[#111111] text-[10px] font-mono font-bold hover:bg-rose-200 shadow-[1px_1px_0px_#111111]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <textarea
                  className={inputCls}
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => updateQ(idx, { prompt: e.target.value })}
                  placeholder="Question prompt…"
                  required
                />

                {q.kind === "choice" ? (
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-mono font-bold text-slate-700 flex items-center justify-between">
                      <span>Answer Options (Select the radio button next to the single correct option):</span>
                      <span className="text-[10px] text-slate-500 font-normal">Min 2 options required</span>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const optLetter = ["A", "B", "C", "D", "E", "F", "G", "H"][oi] || String(oi + 1);
                        const isSelectedCorrect = Boolean(
                          (q.correctOptionIndex === oi) ||
                          (q.correctAnswer && q.correctAnswer.trim() !== "" && q.correctAnswer.trim().toLowerCase() === opt.trim().toLowerCase() && opt.trim() !== "")
                        );

                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-2 p-1.5 border-[2px] transition-all ${
                              isSelectedCorrect
                                ? "border-emerald-600 bg-emerald-50/80 shadow-[2px_2px_0px_#059669]"
                                : "border-[#111111] bg-white shadow-[1px_1px_0px_#111111]"
                            }`}
                          >
                            <label
                              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                              title={`Designate Option ${optLetter} as the correct answer`}
                            >
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={isSelectedCorrect}
                                onChange={() => {
                                  updateQ(idx, {
                                    correctOptionIndex: oi,
                                    correctAnswer: opt.trim() || opt,
                                  });
                                }}
                                className="w-4 h-4 accent-emerald-600 cursor-pointer"
                              />
                              <span
                                className={`px-2 py-0.5 border font-mono text-xs font-black uppercase ${
                                  isSelectedCorrect
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-[#111111] text-white border-[#111111]"
                                }`}
                              >
                                Option {optLetter}
                              </span>
                            </label>

                            <input
                              className={`flex-1 px-3 py-1.5 border-[2px] text-xs font-mono transition-all focus:outline-none ${
                                isSelectedCorrect
                                  ? "border-emerald-600 bg-white font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-600"
                                  : "border-[#111111] bg-[#F4F3F3] text-[#111111] focus:bg-white"
                              }`}
                              value={opt}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                const oldVal = q.options[oi];
                                const next = [...q.options];
                                next[oi] = newVal;
                                const patch: Partial<Question> = { options: next };
                                if (isSelectedCorrect || q.correctOptionIndex === oi || q.correctAnswer === oldVal) {
                                  patch.correctAnswer = newVal;
                                  patch.correctOptionIndex = oi;
                                }
                                updateQ(idx, patch);
                              }}
                              placeholder={`Enter text for Option ${optLetter}${oi < 2 ? " *" : ""}`}
                              required={oi < 2}
                            />

                            {isSelectedCorrect && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] whitespace-nowrap">
                                <Check className="w-3 h-3 text-white" /> Correct Answer
                              </span>
                            )}

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = q.options.filter((_, i) => i !== oi);
                                  const patch: Partial<Question> = { options: next };
                                  if (isSelectedCorrect) {
                                    patch.correctAnswer = "";
                                    patch.correctOptionIndex = undefined;
                                  } else if (q.correctOptionIndex !== undefined && q.correctOptionIndex > oi) {
                                    patch.correctOptionIndex = q.correctOptionIndex - 1;
                                  }
                                  updateQ(idx, patch);
                                }}
                                className="p-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 transition-all text-xs"
                                title={`Remove Option ${optLetter}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        className="text-[11px] font-mono text-brand-orange hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        onClick={() => updateQ(idx, { options: [...q.options, ""] })}
                      >
                        <Plus className="w-3 h-3" /> Add Option {["A", "B", "C", "D", "E", "F", "G", "H"][q.options.length] || ""}
                      </button>

                      {q.correctAnswer ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 border border-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Selected Key: Option {["A", "B", "C", "D", "E", "F", "G", "H"][q.correctOptionIndex ?? q.options.indexOf(q.correctAnswer)] || "?"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-amber-800 flex items-center gap-1 bg-amber-100 px-2 py-0.5 border border-amber-600 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Select a radio button to designate the correct answer
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-slate-500">
                    Students answer with text/code here — you grade it manually from the results panel.
                  </p>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className={`${btnPrimary} w-full sm:w-auto`} disabled={busy}>
            {busy ? "Creating…" : `Publish Test (${totalMarks} marks)`}
          </button>
        </form>
      )}

      {/* ── tests filter bar ── */}
      {assessments.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-[#F4F3F3] p-2 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
          <span className="text-[11px] font-mono font-bold text-slate-700 uppercase px-1">Type:</span>
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterType === "ALL"
                ? "bg-[#111111] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFF0E5]"
            }`}
          >
            All Types ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ASSIGNMENT")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterType === "ASSIGNMENT"
                ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-slate-800 hover:bg-[#FFF0E5]"
            }`}
          >
            📖 Assignments ({assessments.filter((a) => a.type === "ASSIGNMENT").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("TEST")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterType === "TEST"
                ? "bg-blue-600 text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-slate-800 hover:bg-[#FFF0E5]"
            }`}
          >
            📝 Tests & Quizzes ({assessments.filter((a) => a.type !== "ASSIGNMENT").length})
          </button>

          <div className="h-5 w-[2px] bg-slate-300 mx-1 hidden sm:block" />

          <span className="text-[11px] font-mono font-bold text-slate-700 uppercase px-1">Status:</span>
          <button
            type="button"
            onClick={() => setFilterTestStatus("ALL")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterTestStatus === "ALL"
                ? "bg-[#111111] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFF0E5]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterTestStatus("ACTIVE")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] flex items-center gap-1 ${
              filterTestStatus === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            ● Active ({assessments.filter((a) => {
              const now = Date.now();
              return now >= new Date(a.startsAt).getTime() && now <= new Date(a.endsAt).getTime();
            }).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTestStatus("COMPLETED")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterTestStatus === "COMPLETED"
                ? "bg-[#111111] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-slate-700 hover:bg-[#FFF0E5]"
            }`}
          >
            ✓ Completed ({assessments.filter((a) => Date.now() > new Date(a.endsAt).getTime()).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTestStatus("UPCOMING")}
            className={`px-3 py-1 font-mono text-xs font-bold transition-all border-[2px] border-[#111111] ${
              filterTestStatus === "UPCOMING"
                ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-white text-slate-700 hover:bg-[#FFF0E5]"
            }`}
          >
            ⏳ Upcoming ({assessments.filter((a) => Date.now() < new Date(a.startsAt).getTime()).length})
          </button>
        </div>
      )}

      {/* ── tests list ── */}
      {assessments.length === 0 ? (
        <div className="py-16 border-[3px] border-[#111111] bg-white shadow-[6px_6px_0px_#111111] text-center">
          <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-[#111111] text-sm font-mono font-bold uppercase">No tests created yet</p>
          <p className="text-slate-600 text-xs font-mono mt-1">
            Use “New Test” to schedule a quiz, test or programming task
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments
            .filter((a) => {
              if (filterType === "ASSIGNMENT" && a.type !== "ASSIGNMENT") return false;
              if (filterType === "TEST" && a.type === "ASSIGNMENT") return false;

              const now = Date.now();
              const isLive = now >= new Date(a.startsAt).getTime() && now <= new Date(a.endsAt).getTime();
              const isCompleted = now > new Date(a.endsAt).getTime();
              const isUpcoming = now < new Date(a.startsAt).getTime();
              if (filterTestStatus === "ACTIVE") return isLive;
              if (filterTestStatus === "COMPLETED") return isCompleted;
              if (filterTestStatus === "UPCOMING") return isUpcoming;
              return true;
            })
            .map((a) => {
            const now = Date.now();
            const isLive =
              now >= new Date(a.startsAt).getTime() && now <= new Date(a.endsAt).getTime();
            const submitted = a.results?.length || 0;
            const avg =
              submitted > 0
                ? ((a.results || []).reduce((s, r) => s + r.score, 0) / submitted).toFixed(1)
                : "—";
            const open = expandedId === a.id;

            return (
              <div
                key={a.id}
                className="border-[3px] border-[#111111] bg-white shadow-[4px_4px_0px_#111111] overflow-hidden"
              >
                <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-[#FFF0E5] text-[#111111] uppercase shadow-[1px_1px_0px_#111111]">
                        {a.type}
                      </span>
                      {isLive ? (
                        <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 shadow-[1px_1px_0px_#111111] animate-pulse">
                          ● LIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-amber-100 text-amber-950 shadow-[1px_1px_0px_#111111]">
                          ⏳ NOT LIVE (SCHEDULED: {new Date(a.startsAt).toLocaleDateString()})
                        </span>
                      )}
                      {a.lab ? (
                        <span className="px-2 py-0.5 border border-[#111111] text-[10px] font-mono font-bold text-[#111111] bg-[#F4F3F3]">
                          🏛️ {a.lab.name}
                        </span>
                      ) : a.targetLabIds && a.targetLabIds.length > 0 ? (
                        <span className="px-2 py-0.5 border border-blue-900 text-[10px] font-mono font-bold text-blue-950 bg-blue-50">
                          🏛️ {a.targetLabIds.length} Selected Labs
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 border border-[#111111] text-[10px] font-mono font-bold text-[#111111] bg-emerald-50">
                          🌐 All Labs
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono font-bold text-[#111111] text-sm mt-1 truncate uppercase">
                      {a.title}
                    </h4>
                    {a.description && (
                      <p className="text-xs font-mono text-slate-600 mt-0.5 line-clamp-1">
                        {a.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 mt-1 flex-wrap font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F07C27]" />
                        {new Date(a.startsAt).toLocaleString()} →{" "}
                        {new Date(a.endsAt).toLocaleString()}
                      </span>
                      {a.durationMinutes && <span>· {a.durationMinutes} min</span>}
                      <span>
                        · {a.questions?.length || 0} Q · {a.totalMarks} marks · pass{" "}
                        {a.passingMarks ?? Math.round(a.totalMarks * 0.6)}
                      </span>
                      {a.allowedViolations && a.allowedViolations > 0 ? (
                        <span className="text-amber-800 font-bold">· 🛡️ {a.allowedViolations} strikes max</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">· 📖 Open Book (No Anti-Cheat)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right px-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                        Submissions
                      </span>
                      <span className="text-sm font-mono font-black text-[#111111] flex items-center gap-1 justify-end">
                        <Users className="w-3.5 h-3.5 text-slate-600" /> {submitted} · avg {avg}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeaderboardAssessment({ id: a.id, title: a.title })}
                      className="px-2.5 py-1.5 border-[2px] border-[#111111] bg-[#FFB703] hover:bg-[#ffa700] text-[#111111] font-mono text-xs font-black transition-all flex items-center gap-1 shadow-[2px_2px_0px_#111111] cursor-pointer"
                      title="View test leaderboard and student rankings"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#111111]" /> Leaderboard
                    </button>
                    <button
                      onClick={() => handleToggleLive(a, !isLive)}
                      className={`px-2.5 py-1.5 border-[2px] border-[#111111] font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-[2px_2px_0px_#111111] cursor-pointer ${
                        !isLive
                          ? "bg-emerald-400 hover:bg-emerald-500 text-[#111111] font-black"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-950"
                      }`}
                      title={!isLive ? "Make test live immediately (+24h)" : "Pause test and take offline"}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#111111]" />
                      {!isLive ? "⚡ Make Live Now" : "⏸️ Take Offline"}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="px-2.5 py-1.5 border-[2px] border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-[2px_2px_0px_#111111] cursor-pointer"
                      title="Edit schedule, duration, passing marks, and strike limits"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#F07C27]" /> Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(a)}
                      className="px-2.5 py-1.5 border-[2px] border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-[2px_2px_0px_#111111] cursor-pointer"
                      title="Reuse / Duplicate test with all questions for new cohort"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-600" /> Reuse
                    </button>
                    <button className={btnGhost} onClick={() => openResults(a)}>
                      {open ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      Results
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      className="p-1.5 border-[2px] border-[#111111] bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 shadow-[2px_2px_0px_#111111] transition-all cursor-pointer"
                      title="Delete test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* results drawer */}
                {open && (
                  <div className="border-t-[2px] border-[#111111] p-4 bg-[#FFF0E5]/20">
                    {!results || resultsFor?.id !== a.id ? (
                      <p className="text-xs font-mono text-slate-600 py-4 text-center font-bold">
                        Loading results…
                      </p>
                    ) : results.length === 0 ? (
                      <p className="text-xs font-mono text-slate-600 py-4 text-center font-bold">
                        No submissions yet
                      </p>
                    ) : (
                      <div>
                        {(() => {
                          const isAssignmentOrLabTest = a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView;
                          return null;
                        })()}
                        {/* Results Drawer Header & CSV Export */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b-[2px] border-[#111111] flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black uppercase text-[#111111]">
                              Submissions & Audit ({results.length})
                            </span>
                            {results.some((r) => r.isLocked || r.status === "LOCKED") && (
                              <span className="px-2 py-0.5 border border-[#111111] bg-rose-600 text-white font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] animate-pulse">
                                ⚠️ Lockouts Detected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quantity Input & Batch Select */}
                            {!(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) && (
                              <div className="flex items-center border-[2px] border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
                                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 border-r-[2px] border-[#111111]">
                                  <span className="font-mono text-[10px] font-black text-amber-950 uppercase">Top:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={results.length || 500}
                                    value={batchCountMap[a.id] ?? 60}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      setBatchCountMap((prev) => ({
                                        ...prev,
                                        [a.id]: isNaN(val) ? 1 : Math.max(1, val),
                                      }));
                                    }}
                                    className="w-14 px-1 py-0.5 font-mono text-xs font-black text-[#111111] bg-white border border-[#111111] text-center focus:outline-none"
                                    title="Enter quantity of top candidates to select for Lab Allocation"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleBatchSelectTop(a.id, batchCountMap[a.id] ?? 60)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                                  title={`Batch select top ${batchCountMap[a.id] ?? 60} candidates for Lab Allocation`}
                                >
                                  <Check className="w-3.5 h-3.5 text-white" /> Quick Select Top {batchCountMap[a.id] ?? 60} (Labs)
                                </button>
                              </div>
                            )}
                            {!(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) && (
                              <button
                                type="button"
                                onClick={() => handleExportRound2ShortlistCSV(a, results)}
                                className="px-3 py-1 bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-[11px] font-black border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Download Lab Allocation Shortlist ranked by Score & Completion Speed (Tie-Breaker)"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Export Lab Shortlist (Excel CSV)
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleExportResultsCSV(a, results)}
                              className="px-3 py-1 bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-[11px] font-black border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Download results and proctoring logs as Excel-compatible CSV"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-700" /> Export All (CSV)
                            </button>
                          </div>
                        </div>

                        {/* Lab-Wise Performance Stats */}
                        {/* Lab-Wise Performance Stats */}
                        <div className="bg-white border-[2px] border-[#111111] p-3.5 shadow-[2px_2px_0px_#111111] mb-3">
                          <div className="font-display font-black text-xs uppercase text-[#111111] mb-2.5 flex items-center justify-between flex-wrap gap-2">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-[#F07C27]" />
                              <span>Lab-Wise Performance & Participation Breakdown</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {!(isMentorView && mentorLabId) ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedResultLab("ALL")}
                                  className={`px-2.5 py-1 text-[11px] font-mono font-bold border-[2px] border-[#111111] transition-all cursor-pointer ${
                                    selectedResultLab === "ALL"
                                      ? "bg-[#111111] text-white shadow-[2px_2px_0px_#F07C27]"
                                      : "bg-white hover:bg-[#F4F3F3] text-[#111111] shadow-[2px_2px_0px_#111111]"
                                  }`}
                                >
                                  All Labs ({results.length} Submissions)
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 text-[11px] font-mono font-bold border-[2px] border-[#111111] bg-[#111111] text-white shadow-[2px_2px_0px_#F07C27]">
                                  🏛️ {labs.find((l) => l.id === mentorLabId)?.name || "Assigned Lab"} (Lab Only)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
                            {labs
                              .filter((l) => !isMentorView || !mentorLabId || l.id === mentorLabId)
                              .map((l) => {
                              const labStudents = (l as any).students || [];
                              const eligibleCount = (l as any)._count?.students ?? labStudents.length ?? 0;
                              const labResults = results.filter((r) => {
                                return (
                                  (r.student as any)?.labStudents?.some((ls: any) => ls.labId === l.id || ls.lab?.id === l.id) ||
                                  (r.student as any)?.labStudents?.[0]?.labId === l.id ||
                                  (r.student as any)?.college?.includes(l.name)
                                );
                              });
                              const lSub = labResults.length;
                              const lPending = Math.max(0, eligibleCount - lSub);
                              const lAvg = lSub > 0 ? (labResults.reduce((s, r) => s + r.score, 0) / lSub).toFixed(1) : "0";
                              const lHigh = lSub > 0 ? Math.max(...labResults.map((r) => r.score)) : 0;
                              const passMark = a.passingMarks ?? Math.round(a.totalMarks * 0.6);
                              const passCount = labResults.filter((r) => r.score >= passMark).length;
                              const isSelected = selectedResultLab === l.id;

                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => (isMentorView && mentorLabId) ? setSelectedResultLab(mentorLabId) : setSelectedResultLab(isSelected ? "ALL" : l.id)}
                                  className={`p-3 border-[2px] text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#FFF0E5] border-[#F07C27] shadow-[3px_3px_0px_#111111] ring-2 ring-[#F07C27]"
                                      : "bg-[#F4F3F3] border-[#111111] hover:bg-white hover:border-[#F07C27] shadow-[2px_2px_0px_#111111]"
                                  }`}
                                  title={`Click to filter student results for ${l.name}`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-bold text-[#111111] truncate">🏛️ {l.name}</span>
                                    {isSelected && (
                                      <span className="text-[9px] bg-[#F07C27] text-white px-1.5 py-0.2 font-black uppercase tracking-wider">
                                        FILTERED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-700 space-y-0.5">
                                    <div className="flex justify-between">
                                      <span>Eligible:</span>
                                      <strong>{eligibleCount > 0 ? eligibleCount : (lSub > 0 ? lSub : "—")}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Submitted:</span>
                                      <strong className="text-emerald-700">{lSub}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Pending:</span>
                                      <strong className="text-rose-700">{eligibleCount > 0 ? lPending : (lSub === 0 ? "—" : 0)}</strong>
                                    </div>
                                    <div className="flex justify-between border-t border-[#111111]/20 pt-1 mt-1">
                                      <span>Avg Score:</span>
                                      <strong>{lAvg} / {a.totalMarks}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Highest:</span>
                                      <strong className="text-[#F07C27]">{lHigh} / {a.totalMarks}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Passed:</span>
                                      <strong className="text-emerald-800">{passCount}</strong>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Filter & Search Bar */}
                        <div className="mb-3 p-3 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-between flex-wrap gap-2.5 font-mono text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                              <Filter className="w-3.5 h-3.5 text-[#F07C27]" /> View Filter:
                            </span>
                            {selectedResultLab !== "ALL" ? (
                              <span className="px-2 py-0.5 bg-[#FFF0E5] border border-[#F07C27] text-[#111111] font-bold flex items-center gap-1.5">
                                🏛️ {labs.find((l) => l.id === selectedResultLab)?.name || "Selected Lab"}
                                {!(isMentorView && mentorLabId) && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedResultLab("ALL")}
                                    className="text-rose-700 hover:text-rose-900 font-black cursor-pointer ml-1"
                                    title="Clear lab filter"
                                  >
                                    ✕
                                  </button>
                                )}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-slate-700 font-bold">
                                All Labs
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-2">
                              {(["ALL", "SUBMITTED", "LOCKED", "SELECTED"] as const).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setResultFilterStatus(st)}
                                  className={`px-2 py-0.5 border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                    resultFilterStatus === st
                                      ? "bg-[#111111] text-white border-[#111111]"
                                      : "bg-white text-slate-700 border-slate-300 hover:border-[#111111]"
                                  }`}
                                >
                                  {st === "ALL" ? "All" : st === "SUBMITTED" ? "Submitted" : st === "LOCKED" ? "Locked" : "Selected"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <div className="relative w-full">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="text"
                                value={resultSearchQuery}
                                onChange={(e) => setResultSearchQuery(e.target.value)}
                                placeholder="Search by name, roll no, email…"
                                className="w-full pl-8 pr-3 py-1.5 bg-[#F4F3F3] border-[2px] border-[#111111] text-xs font-mono focus:outline-none focus:bg-white shadow-[1px_1px_0px_#111111]"
                              />
                              {resultSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setResultSearchQuery("")}
                                  className="absolute right-2 top-2 text-slate-500 hover:text-[#111111] text-xs"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Criteria Banner */}
                        {(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) ? (
                          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-[11px] flex items-center justify-between flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <strong>Lab Assignment Submissions:</strong> Enrolled lab candidates evaluated on accuracy and comprehension.
                              {!a.allowedViolations || a.allowedViolations === 0 ? " (Open-Book / Zero Anti-Cheat Restrictions)" : ` (Proctored: ${a.allowedViolations} strikes max)`}
                            </span>
                            <span className="text-[10px] uppercase font-black text-emerald-900 bg-emerald-200/80 px-2 py-0.5 border border-emerald-400">
                              Lab Evaluation Track
                            </span>
                          </div>
                        ) : (
                          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-300 text-amber-950 font-mono text-[11px] flex items-center justify-between flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-[#F07C27]" />
                              <strong>Lab Allocation Ranking:</strong> Sorted by Score (Highest First). Candidates tied on score are ranked by Time Taken (Fastest First). You can choose any top quantity or select candidates individually.
                            </span>
                            <span className="text-[10px] uppercase font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 border border-amber-400">
                              Tie-Breaker: Speed
                            </span>
                          </div>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="text-[#111111] text-[10px] uppercase font-bold border-b-[2px] border-[#111111] bg-[#FFF0E5]">
                                <th className="text-center py-2 px-2 w-14">Rank</th>
                                <th className="text-left py-2 px-3">Student & Roll No</th>
                                <th className="text-right py-2 px-3">Score</th>
                                <th className="text-right py-2 px-3">%</th>
                                <th className="text-center py-2 px-3">C / I / U</th>
                                <th className="text-right py-2 px-3">Time Taken</th>
                                <th className="text-left py-2 px-3">Submitted At</th>
                                <th className="text-center py-2 px-3">
                                  {(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) ? "Status / Completion" : "Selection & Lab Allocation"}
                                </th>
                                <th className="text-right py-2 px-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#111111]/20">
                              {[...results]
                                .filter((r) => {
                                  const effectiveLab = (isMentorView && mentorLabId) ? mentorLabId : selectedResultLab;
                                  if (effectiveLab !== "ALL") {
                                    const labObj = labs.find((l) => l.id === effectiveLab);
                                    const inLab =
                                      (r.student as any)?.labStudents?.some(
                                        (ls: any) => ls.labId === effectiveLab || ls.lab?.id === effectiveLab
                                      ) ||
                                      (r.student as any)?.labStudents?.[0]?.labId === effectiveLab ||
                                      (r.student as any)?.college?.includes(labObj?.name || "");
                                    if (!inLab) return false;
                                  }
                                  if (resultSearchQuery.trim()) {
                                    const q = resultSearchQuery.toLowerCase().trim();
                                    const name = (r.student?.name || "").toLowerCase();
                                    const roll = (r.student?.rollNumber || "").toLowerCase();
                                    const email = (r.student?.email || "").toLowerCase();
                                    if (!name.includes(q) && !roll.includes(q) && !email.includes(q)) return false;
                                  }
                                  if (resultFilterStatus === "SUBMITTED") {
                                    if (r.isLocked || r.status === "LOCKED") return false;
                                  } else if (resultFilterStatus === "LOCKED") {
                                    if (!r.isLocked && r.status !== "LOCKED") return false;
                                  } else if (resultFilterStatus === "SELECTED") {
                                    if (r.status !== "SELECTED" && r.status !== "SELECTED_ROUND2") return false;
                                  }
                                  return true;
                                })
                                .sort((x, y) => {
                                  if (y.score !== x.score) return y.score - x.score;
                                  const xDur = x.durationSec != null ? x.durationSec : 999999;
                                  const yDur = y.durationSec != null ? y.durationSec : 999999;
                                  return xDur - yDur;
                                })
                                .map((r, idx) => {
                                  const rank = idx + 1;
                                  const pct = Math.round((r.score / a.totalMarks) * 100);
                                  const pass = r.score >= (a.passingMarks ?? a.totalMarks * 0.6);
                                  const isLockedCandidate = r.isLocked || r.status === "LOCKED";
                                  const topTarget = batchCountMap[a.id] ?? 60;
                                  const isScreening = !(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView);
                                  const isRound2Qualified = isScreening && pass && !isLockedCandidate && rank <= topTarget;
                                  const isRound2Waitlist = isScreening && pass && !isLockedCandidate && rank > topTarget;
                                  const studentLabName =
                                    (r.student as any)?.labStudents?.[0]?.lab?.name ||
                                    (r.student as any)?.labStudents?.[0]?.labId ||
                                    (r.student as any)?.college ||
                                    null;

                                  return (
                                    <tr key={r.id} className="hover:bg-[#FFF0E5]/40 transition-colors">
                                      <td className="py-2.5 px-2 text-center font-black">
                                        <span
                                          className={`inline-block px-1.5 py-0.5 border font-mono text-[10px] font-black ${
                                            rank === 1
                                              ? "bg-amber-300 text-amber-950 border-amber-500 shadow-[1px_1px_0px_#111111]"
                                              : rank === 2
                                              ? "bg-slate-200 text-slate-900 border-slate-400 shadow-[1px_1px_0px_#111111]"
                                              : rank === 3
                                              ? "bg-amber-600 text-white border-amber-800 shadow-[1px_1px_0px_#111111]"
                                              : rank <= topTarget
                                              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                              : "bg-[#F4F3F3] text-slate-700 border-slate-300"
                                          }`}
                                        >
                                          #{rank}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-[#111111] font-bold">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span>{r.student?.name || "Student"}</span>
                                          {r.student?.rollNumber && (
                                            <span className="px-1.5 py-0.2 bg-[#F4F3F3] border border-[#111111] text-[10px] font-mono text-slate-800 font-bold shadow-[1px_1px_0px_#111111]">
                                              REG: {r.student.rollNumber}
                                            </span>
                                          )}
                                          {studentLabName && (
                                            <span className="px-1.5 py-0.2 bg-[#FFF0E5] border border-[#111111] text-[10px] font-mono text-[#F07C27] font-bold shadow-[1px_1px_0px_#111111]">
                                              🏛️ {studentLabName}
                                            </span>
                                          )}
                                        </div>
                                        <span className="block text-[10px] text-slate-600 font-normal">
                                          {r.student?.email}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-right text-[#111111] font-black">
                                        {r.score}/{a.totalMarks}
                                      </td>
                                      <td
                                        className={`py-2.5 px-3 text-right font-bold ${
                                          pass ? "text-emerald-700" : "text-rose-700"
                                        }`}
                                      >
                                        {pct}%
                                      </td>
                                      <td className="py-2.5 px-3 text-center text-slate-600">
                                        {r.correctCount ?? "–"} / {r.incorrectCount ?? "–"} /{" "}
                                        {r.unansweredCount ?? "–"}
                                      </td>
                                      <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                                        {r.durationSec
                                          ? `${Math.floor(r.durationSec / 60)}m ${r.durationSec % 60}s`
                                          : "–"}
                                      </td>
                                      <td className="py-2.5 px-3 text-left text-slate-700 font-mono text-[10px]">
                                        {r.submittedAt ? (
                                          <div>
                                            <span className="font-bold">{new Date(r.submittedAt).toLocaleDateString()}</span>
                                            <span className="text-slate-500 block">
                                              {new Date(r.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                          </div>
                                        ) : (
                                          "—"
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        {isLockedCandidate ? (
                                          <div className="space-y-0.5">
                                            <span className="px-2 py-0.5 border-[2px] border-rose-800 text-[10px] font-black bg-rose-600 text-white shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1">
                                              <ShieldAlert className="w-3 h-3 text-white" />
                                              LOCKED ({r.violationCount ?? 0} strikes)
                                            </span>
                                            {r.violationReason && (
                                              <span
                                                className="block text-[9px] font-mono text-rose-800 max-w-[140px] truncate mx-auto font-bold"
                                                title={r.violationReason}
                                              >
                                                {r.violationReason}
                                              </span>
                                            )}
                                          </div>
                                        ) : (a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) ? (
                                          r.status === "COMPLETED" ? (
                                            <span className="px-2 py-0.5 border-[2px] border-emerald-900 bg-emerald-600 text-white text-[10px] font-black shadow-[1px_1px_0px_#111111] inline-flex items-center gap-1">
                                              <Check className="w-3 h-3 text-white" /> COMPLETED ({pct}%)
                                            </span>
                                          ) : r.status === "PENDING_REVIEW" ? (
                                            <span className="px-2 py-0.5 border border-amber-800 bg-amber-100 text-amber-900 text-[10px] font-bold shadow-[1px_1px_0px_#111111]">
                                              PENDING REVIEW
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 border border-slate-300 bg-[#F4F3F3] text-slate-700 text-[10px] font-semibold">
                                              {r.status || "SUBMITTED"}
                                            </span>
                                          )
                                        ) : (r.status === "SELECTED" || r.status === "SELECTED_ROUND2") ? (
                                          <span className="px-2 py-0.5 border-[2px] border-emerald-900 bg-emerald-600 text-white text-[10px] font-black shadow-[1px_1px_0px_#111111] inline-flex items-center gap-1">
                                            <Check className="w-3 h-3 text-white" /> SELECTED FOR LABS
                                          </span>
                                        ) : (r.status === "WAITLIST" || r.status === "WAITLIST_ROUND2") ? (
                                          <span className="px-2 py-0.5 border border-blue-800 bg-blue-100 text-blue-900 text-[10px] font-bold shadow-[1px_1px_0px_#111111]">
                                            WAITLIST
                                          </span>
                                        ) : r.status === "REJECTED" ? (
                                          <span className="px-2 py-0.5 border border-slate-600 bg-slate-200 text-slate-800 text-[10px] font-bold shadow-[1px_1px_0px_#111111]">
                                            NOT SELECTED
                                          </span>
                                        ) : isRound2Qualified ? (
                                          <span className="px-2 py-0.5 border-[2px] border-emerald-800 bg-emerald-100 text-emerald-900 text-[10px] font-black shadow-[1px_1px_0px_#111111] inline-flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> RECOMMENDED (TOP {topTarget})
                                          </span>
                                        ) : isRound2Waitlist ? (
                                          <span className="px-2 py-0.5 border border-blue-400 bg-blue-50 text-blue-800 text-[10px] font-medium shadow-[1px_1px_0px_#111111]">
                                            WAITLIST POOL
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 border border-slate-300 bg-[#F4F3F3] text-slate-700 text-[10px] font-semibold">
                                            PENDING DECISION
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                          {/* View student question-by-question responses */}
                                          <button
                                            type="button"
                                            className="px-2 py-1 border-[2px] border-[#111111] bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-950 font-mono text-[10px] font-black shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
                                            onClick={() => setInspectingResult(r)}
                                            title="View student's question-by-question responses, correct answers, and evaluation"
                                          >
                                            <Eye className="w-3 h-3 inline" /> Responses
                                          </button>

                                          {isLockedCandidate ? (
                                            <>
                                              <button
                                                type="button"
                                                className="px-2 py-1 border-[2px] border-[#111111] bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[10px] font-black shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
                                                onClick={() =>
                                                  handleUnlockCandidate(a.id, r.studentId, r.student?.name || "Student")
                                                }
                                                title="Clear proctoring lockout and allow review"
                                              >
                                                <Unlock className="w-3 h-3" /> Unlock
                                              </button>
                                              <button
                                                type="button"
                                                className="px-2 py-1 border-[2px] border-[#111111] bg-amber-400 hover:bg-amber-300 text-[#111111] font-mono text-[10px] font-black shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
                                                onClick={() =>
                                                  handleRetestCandidate(a.id, r.studentId, r.student?.name || "Student")
                                                }
                                                title="Reset test attempt and grant retest"
                                              >
                                                <RotateCcw className="w-3 h-3" /> Retest
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              {!(a.type === "ASSIGNMENT" || a.targetAudience === "LABS" || isMentorView) && (
                                                (r.status === "SELECTED" || r.status === "SELECTED_ROUND2") ? (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleUpdateCandidateStatus(
                                                        a.id,
                                                        r.studentId,
                                                        "CLEAR_SELECTION",
                                                        r.student?.name || "Student"
                                                      )
                                                    }
                                                    className="px-2 py-1 border border-[#111111] bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] transition-all cursor-pointer flex items-center gap-1"
                                                    title="Revoke lab allocation selection"
                                                  >
                                                    <RotateCcw className="w-2.5 h-2.5" /> Deselect
                                                  </button>
                                                ) : (
                                                  <>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleUpdateCandidateStatus(
                                                          a.id,
                                                          r.studentId,
                                                          "SELECT_FOR_LABS",
                                                          r.student?.name || "Student"
                                                        )
                                                      }
                                                      className="px-2 py-1 border-[2px] border-[#111111] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-black shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
                                                      title="Select candidate for Lab Allocation"
                                                    >
                                                      <Check className="w-3 h-3 text-white" /> Select for Labs
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleUpdateCandidateStatus(
                                                          a.id,
                                                          r.studentId,
                                                          "WAITLIST",
                                                          r.student?.name || "Student"
                                                        )
                                                      }
                                                      className="px-2 py-1 border border-[#111111] bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] transition-all cursor-pointer"
                                                      title="Place on waitlist"
                                                    >
                                                      Waitlist
                                                    </button>
                                                  </>
                                                )
                                              )}
                                              <button
                                                type="button"
                                                className="px-2 py-1 border-[2px] border-[#111111] bg-white hover:bg-[#F07C27] hover:text-white text-[#111111] font-mono text-[10px] font-bold shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer flex items-center gap-1"
                                                onClick={() =>
                                                  setGrading({
                                                    studentId: r.studentId,
                                                    score: String(r.score),
                                                    feedback: r.feedback || "",
                                                  })
                                                }
                                              >
                                                <Award className="w-3 h-3 inline" /> Grade
                                              </button>
                                              <button
                                                type="button"
                                                className="px-2 py-1 border border-[#111111] bg-[#F4F3F3] hover:bg-amber-200 text-[#111111] font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] transition-all cursor-pointer flex items-center gap-1"
                                                onClick={() =>
                                                  handleRetestCandidate(a.id, r.studentId, r.student?.name || "Student")
                                                }
                                                title="Allow student a fresh retest"
                                              >
                                                <RotateCcw className="w-2.5 h-2.5" /> Retest
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>

                        {/* grading inspector for the row being graded */}
                        {grading &&
                          results
                            ?.filter((r) => r.studentId === grading.studentId)
                            .map((r) => (
                              <div
                                key={r.id}
                                className="mt-4 p-4 border-[2px] border-[#111111] bg-white shadow-[4px_4px_0px_#111111] space-y-3"
                              >
                                <h5 className="text-xs font-mono font-bold text-[#111111] uppercase">
                                  Answers — {r.student?.name}
                                  {r.status === "PENDING_REVIEW" && (
                                    <span className="ml-2 px-2 py-0.5 border border-[#111111] bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                                      NEEDS REVIEW
                                    </span>
                                  )}
                                </h5>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {a.questions?.map((q, qi) => {
                                    const ans = r.answers?.[q.id];
                                    return (
                                      <div
                                        key={q.id}
                                        className="p-3 border-[2px] border-[#111111] bg-[#F9F9F9]"
                                      >
                                        <p className="text-[11px] text-[#111111] font-mono font-bold">
                                          <span className="text-[#F07C27]">
                                            Q{qi + 1}.
                                          </span>{" "}
                                          {q.prompt}
                                        </p>
                                        <p className="text-[11px] text-emerald-800 mt-1 font-mono whitespace-pre-wrap bg-white p-2 border border-[#111111]/30">
                                          Answer: {ans || "(not answered)"}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex flex-wrap items-end gap-3 pt-2">
                                  <div>
                                    <label className={labelCls}>Score (0–{a.totalMarks})</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={a.totalMarks}
                                      className={`${inputCls} w-28`}
                                      value={grading.score}
                                      onChange={(e) =>
                                        setGrading({ ...grading, score: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[200px]">
                                    <label className={labelCls}>Feedback</label>
                                    <input
                                      className={inputCls}
                                      value={grading.feedback}
                                      onChange={(e) =>
                                        setGrading({ ...grading, feedback: e.target.value })
                                      }
                                      placeholder="Nice pointer arithmetic — watch the dangling refs."
                                    />
                                  </div>
                                  <button className={btnPrimary} disabled={busy} onClick={submitGrade}>
                                    {busy ? "Saving…" : "Save Grade"}
                                  </button>
                                  <button className={btnGhost} onClick={() => setGrading(null)}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── edit test modal ── */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="border-[4px] border-[#111111] bg-white shadow-[10px_10px_0px_#111111] max-w-3xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
              <h4 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#F07C27]" /> Edit Test Schedule & Parameters
              </h4>
              <button
                type="button"
                onClick={() => setEditingAssessment(null)}
                className="p-1 hover:bg-[#F4F3F3] border border-[#111111] text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className={labelCls}>Test Title</label>
                <input
                  className={inputCls}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    className={inputCls}
                    value={editType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setEditType(t);
                      if (t === "ASSIGNMENT") {
                        setEditAntiCheatEnabled(false);
                        setEditAllowedViolations("0");
                      } else if (!editAntiCheatEnabled) {
                        setEditAntiCheatEnabled(true);
                        setEditAllowedViolations("3");
                      }
                    }}
                  >
                    <option value="ASSIGNMENT">ASSIGNMENT</option>
                    <option value="TEST">TEST</option>
                    <option value="QUIZ">QUIZ</option>
                    <option value="PROGRAMMING">PROGRAMMING</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Target Pod / Lab</label>
                  <select
                    className={inputCls}
                    value={editLabId}
                    onChange={(e) => setEditLabId(e.target.value)}
                  >
                    <option value="">All Pods (Cohort-Wide)</option>
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={editDurationMinutes}
                    onChange={(e) => setEditDurationMinutes(e.target.value)}
                    placeholder="90"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Passing Marks</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={editPassingMarks}
                    onChange={(e) => setEditPassingMarks(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Anti-Cheat Mechanism Toggle in Edit Modal */}
              <div className="space-y-1.5 p-3 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Anti-Cheat Mechanism</label>
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.5 border border-[#111111] uppercase ${
                      editAntiCheatEnabled
                        ? "bg-rose-100 text-rose-900 border-rose-300"
                        : "bg-emerald-100 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    {editAntiCheatEnabled ? "PROCTORED (ON)" : "OPEN BOOK (OFF)"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditAntiCheatEnabled(false);
                      setEditAllowedViolations("0");
                    }}
                    className={`py-1.5 px-2 border-[2px] border-[#111111] text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !editAntiCheatEnabled
                        ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#111111]"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> OFF (Disabled)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditAntiCheatEnabled(true);
                      if (editAllowedViolations === "0") setEditAllowedViolations("3");
                    }}
                    className={`py-1.5 px-2 border-[2px] border-[#111111] text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editAntiCheatEnabled
                        ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> ON (Active)
                  </button>
                </div>

                {editAntiCheatEnabled ? (
                  <div className="pt-1">
                    <label className="block text-[10px] font-mono text-[#111111] font-bold uppercase mb-1">
                      Strike Lockout Limit:
                    </label>
                    <select
                      className={inputCls}
                      value={editAllowedViolations}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditAllowedViolations(v);
                        if (v === "0") setEditAntiCheatEnabled(false);
                      }}
                    >
                      <option value="1">1 Strike (Zero-Tolerance: Lock on 1st Violation)</option>
                      <option value="2">2 Strikes (Strict)</option>
                      <option value="3">3 Strikes (Standard - Recommended)</option>
                      <option value="5">5 Strikes (Lenient)</option>
                    </select>
                  </div>
                ) : (
                  <div className="p-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-[10px] font-bold">
                    ✓ Anti-Cheat Disabled (Open Book). Students can switch tabs, copy/paste, and use external IDEs with zero penalties.
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black uppercase text-[#111111] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F07C27]" /> Test Availability Window
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setEditStartsAt(toLocalInput(new Date(now.getTime() - 5 * 60 * 1000)));
                      setEditEndsAt(toLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000)));
                      flash("Availability window set to LIVE today (+24h)");
                    }}
                    className="px-2 py-0.5 bg-white border border-[#111111] text-[10px] font-mono font-bold hover:bg-[#111111] hover:text-white transition-all shadow-[1px_1px_0px_#111111]"
                  >
                    ⚡ Set Today (Live Now +24h)
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Starts At</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={editStartsAt}
                      onChange={(e) => setEditStartsAt(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Ends At</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={editEndsAt}
                      onChange={(e) => setEditEndsAt(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Instructions / Next Round Guidelines</label>
                <textarea
                  className={`${inputCls} h-20 resize-none`}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="e.g. 100 MCQs. 90 minutes duration. Top candidates by Score & Completion Speed will be shortlisted for Lab Allocation."
                />
              </div>

              {/* ── Question Editor & Answer Key in Edit Modal ── */}
              <div className="border-[2px] border-[#111111] bg-[#F4F3F3] p-3 space-y-3 shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center justify-between border-b border-[#111111] pb-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-[#111111]">
                    <FileText className="w-4 h-4 text-[#F07C27]" />
                    <span>Questions & Answer Keys ({editQuestions.length} Questions)</span>
                  </div>
                  {editingAssessment.results && editingAssessment.results.length > 0 ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-600 px-2 py-0.5">
                      🔒 Locked ({editingAssessment.results.length} submissions recorded)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditQuestions((prev) => [...prev, emptyQuestion()])}
                      className="px-2 py-1 bg-white border border-[#111111] text-[10px] font-mono font-bold text-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-[1px_1px_0px_#111111]"
                    >
                      + Add Question
                    </button>
                  )}
                </div>

                {editingAssessment.results && editingAssessment.results.length > 0 ? (
                  <p className="text-xs font-mono text-slate-600 py-2">
                    Questions and answer keys cannot be modified because {editingAssessment.results.length} students have already submitted results. Only schedule, duration, passing marks, and violation limits may be updated.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {editQuestions.map((eq, qi) => (
                      <div key={qi} className="p-3 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-black text-[#F07C27] bg-[#FFF0E5] px-2 py-0.5 border border-[#111111]">
                            Q{qi + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={eq.marks}
                              onChange={(e) => {
                                const m = Number(e.target.value) || 1;
                                setEditQuestions((prev) => prev.map((item, idx) => idx === qi ? { ...item, marks: m } : item));
                              }}
                              className="w-14 px-1 py-0.5 border border-[#111111] text-xs font-mono font-bold text-center"
                              title="Marks"
                            />
                            <span className="text-[10px] font-mono text-slate-500">marks</span>
                            {editQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setEditQuestions((prev) => prev.filter((_, idx) => idx !== qi))}
                                className="p-1 text-rose-700 hover:bg-rose-100 border border-rose-300"
                                title="Remove question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <textarea
                          className={inputCls}
                          rows={2}
                          value={eq.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditQuestions((prev) => prev.map((item, idx) => idx === qi ? { ...item, prompt: val } : item));
                          }}
                          placeholder="Question prompt…"
                          required
                        />

                        {eq.kind === "choice" && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-mono font-bold text-slate-600 block">
                              Options & Correct Answer (Click radio to select):
                            </span>
                            {eq.options.map((opt, oi) => {
                              const optLetter = ["A", "B", "C", "D", "E", "F", "G", "H"][oi] || String(oi + 1);
                              const isSelectedCorrect = Boolean(
                                (eq.correctOptionIndex === oi) ||
                                (eq.correctAnswer && eq.correctAnswer.trim() !== "" && eq.correctAnswer.trim().toLowerCase() === opt.trim().toLowerCase() && opt.trim() !== "")
                              );

                              return (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-1.5 p-1 border ${
                                    isSelectedCorrect
                                      ? "border-emerald-600 bg-emerald-50"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                                    <input
                                      type="radio"
                                      name={`edit-correct-${qi}`}
                                      checked={isSelectedCorrect}
                                      onChange={() => {
                                        setEditQuestions((prev) =>
                                          prev.map((item, idx) =>
                                            idx === qi
                                              ? { ...item, correctOptionIndex: oi, correctAnswer: opt.trim() || opt }
                                              : item
                                          )
                                        );
                                      }}
                                      className="w-3.5 h-3.5 accent-emerald-600"
                                    />
                                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold ${isSelectedCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-800"}`}>
                                      {optLetter}
                                    </span>
                                  </label>

                                  <input
                                    className="flex-1 px-2 py-1 border border-slate-300 text-xs font-mono focus:outline-none"
                                    value={opt}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      const oldVal = eq.options[oi];
                                      const next = [...eq.options];
                                      next[oi] = newVal;
                                      setEditQuestions((prev) =>
                                        prev.map((item, idx) => {
                                          if (idx !== qi) return item;
                                          const patch: any = { options: next };
                                          if (isSelectedCorrect || item.correctOptionIndex === oi || item.correctAnswer === oldVal) {
                                            patch.correctAnswer = newVal;
                                            patch.correctOptionIndex = oi;
                                          }
                                          return { ...item, ...patch };
                                        })
                                      );
                                    }}
                                    placeholder={`Option ${optLetter} text`}
                                    required={oi < 2}
                                  />

                                  {isSelectedCorrect && (
                                    <span className="text-[10px] font-mono font-black text-emerald-800 flex items-center gap-0.5 pr-1">
                                      <Check className="w-3 h-3 text-emerald-700" /> Key
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-[#111111]">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setEditingAssessment(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className={btnPrimary}
                >
                  {busy ? "Saving…" : "Save Test Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {leaderboardAssessment && (
        <LeaderboardModal
          assessmentId={leaderboardAssessment.id}
          assessmentTitle={leaderboardAssessment.title}
          onClose={() => setLeaderboardAssessment(null)}
        />
      )}

      {/* ── Student Question-by-Question Response Inspection Modal ── */}
      {inspectingResult && resultsFor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="border-[4px] border-[#111111] bg-white shadow-[10px_10px_0px_#111111] max-w-4xl w-full p-5 sm:p-6 space-y-4 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-[2px] border-[#111111] pb-3 gap-3 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#111111] text-white font-mono text-[10px] font-black uppercase">
                    STUDENT RESPONSE DOSSIER
                  </span>
                  <span className="px-2 py-0.5 bg-[#F07C27] text-white font-mono text-[10px] font-black uppercase">
                    {resultsFor.title}
                  </span>
                  {inspectingResult.isLocked && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-black uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> PROCTORING LOCKED
                    </span>
                  )}
                </div>
                <h3 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight">
                  {inspectingResult.student?.name || "Student"}
                </h3>
                <p className="text-xs font-mono text-slate-600">
                  {inspectingResult.student?.email} {inspectingResult.student?.rollNumber ? `• Reg: ${inspectingResult.student.rollNumber}` : ""}
                  {(inspectingResult.student as any)?.labStudents?.[0]?.lab?.name ? ` • Lab: ${(inspectingResult.student as any).labStudents[0].lab.name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingResult(null)}
                className="p-1.5 hover:bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Score & Accuracy Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs flex-shrink-0">
              <div className="p-3 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Score Achieved</span>
                <span className="font-display font-black text-2xl text-[#111111]">
                  {inspectingResult.score} / {resultsFor.totalMarks}
                </span>
                <span className="text-[10px] text-[#F07C27] font-bold block">
                  {Math.round((inspectingResult.score / resultsFor.totalMarks) * 100)}%
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border-[2px] border-emerald-900 shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] text-emerald-800 uppercase font-black block">Correct Answers</span>
                <span className="font-display font-black text-2xl text-emerald-700">
                  ✓ {inspectingResult.correctCount ?? 0}
                </span>
              </div>
              <div className="p-3 bg-rose-50 border-[2px] border-rose-900 shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] text-rose-800 uppercase font-black block">Incorrect Answers</span>
                <span className="font-display font-black text-2xl text-rose-700">
                  ✕ {inspectingResult.incorrectCount ?? 0}
                </span>
              </div>
              <div className="p-3 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Time & Submission</span>
                <span className="font-bold text-xs text-[#111111] block">
                  {inspectingResult.durationSec ? `${Math.floor(inspectingResult.durationSec / 60)}m ${inspectingResult.durationSec % 60}s` : "—"}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {new Date(inspectingResult.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Proctoring Flag Notice if applicable */}
            {inspectingResult.violationReason && (
              <div className="p-3 bg-rose-100 border-[2px] border-rose-900 text-rose-950 font-mono text-xs flex-shrink-0">
                <span className="font-black flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" /> Proctoring Log:
                </span>
                <p className="mt-1">{inspectingResult.violationReason} ({inspectingResult.violationCount ?? 1} strikes)</p>
              </div>
            )}

            {/* Question by Question Inspection List */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              <div className="font-display font-black text-xs uppercase text-[#111111] flex items-center justify-between pb-1 border-b border-[#111111]/30">
                <span>Question-by-Question Submission Breakdown ({resultQuestions.length} Questions)</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">Predefined Key Verification</span>
              </div>

              {resultQuestions.map((q, idx) => {
                const studentAns = inspectingResult.answers?.[q.id];
                const hasAnswer = Boolean(studentAns && String(studentAns).trim().length > 0);
                const isCorrect = hasAnswer && q.correctAnswer && String(studentAns).trim() === String(q.correctAnswer).trim();
                const rawOpts = q.options;
                const optionsList: string[] = Array.isArray(rawOpts)
                  ? rawOpts
                  : typeof rawOpts === "string"
                  ? (() => { try { return JSON.parse(rawOpts); } catch { return [rawOpts]; } })()
                  : [];

                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] space-y-2.5 ${
                      !hasAnswer ? "bg-slate-50/60" : isCorrect ? "bg-emerald-50/30" : "bg-rose-50/30"
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#111111] text-white font-mono text-[10px] font-black">
                          Q{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-600">
                          {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>
                      <div>
                        {!hasAnswer ? (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold border border-slate-400">
                            — Unanswered
                          </span>
                        ) : isCorrect ? (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono text-[10px] font-black border border-emerald-800 flex items-center gap-1 shadow-[1px_1px_0px_#111111]">
                            <Check className="w-3 h-3" /> Correct (+{q.marks || 1})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-black border border-rose-800 flex items-center gap-1 shadow-[1px_1px_0px_#111111]">
                            <X className="w-3 h-3" /> Incorrect (0 Marks)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <FormattedPrompt prompt={q.prompt} />

                    {/* Options List */}
                    {optionsList.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {optionsList.map((opt, oIdx) => {
                          const isStudentPick = hasAnswer && String(studentAns).trim() === String(opt).trim();
                          const isPredefinedCorrect = q.correctAnswer && String(opt).trim() === String(q.correctAnswer).trim();

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 border-[2px] font-mono text-xs flex items-center justify-between gap-2 transition-all ${
                                isStudentPick && isPredefinedCorrect
                                  ? "bg-emerald-100 border-emerald-900 text-emerald-950 font-black shadow-[2px_2px_0px_#111111]"
                                  : isStudentPick && !isPredefinedCorrect
                                  ? "bg-rose-100 border-rose-900 text-rose-950 font-black shadow-[2px_2px_0px_#111111]"
                                  : isPredefinedCorrect
                                  ? "bg-emerald-50/80 border-emerald-700 text-emerald-900 font-bold border-dashed"
                                  : "bg-white border-[#111111]/30 text-slate-800 font-normal"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center border border-[#111111] text-[10px] font-black bg-white flex-shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                                {isStudentPick && (
                                  <span className={`px-1.5 py-0.5 border font-bold ${
                                    isPredefinedCorrect ? "bg-emerald-700 text-white border-emerald-900" : "bg-rose-700 text-white border-rose-900"
                                  }`}>
                                    Student Choice
                                  </span>
                                )}
                                {isPredefinedCorrect && (
                                  <span className="px-1.5 py-0.5 bg-emerald-800 text-white border border-emerald-950 font-black">
                                    ✓ Predefined Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Text / Code Question Display */
                      <div className="p-3 bg-white border border-[#111111] font-mono text-xs space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Student Response:</div>
                        <div className="p-2 bg-[#F4F3F3] border border-slate-300 whitespace-pre-wrap">
                          {studentAns || "(Not Answered)"}
                        </div>
                        {q.correctAnswer && (
                          <div className="text-[10px] text-emerald-800 font-bold pt-1">
                            Expected / Reference Answer: {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t-[2px] border-[#111111] pt-3 flex-shrink-0 flex-wrap gap-2">
              <div className="text-xs font-mono text-slate-600 font-bold">
                Status: <strong className="text-[#111111]">{inspectingResult.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGrading({
                      studentId: inspectingResult.studentId,
                      score: String(inspectingResult.score),
                      feedback: inspectingResult.feedback || "",
                    });
                  }}
                  className="px-3 py-1.5 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 inline mr-1" /> Adjust Grade / Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingResult(null)}
                  className="px-4 py-1.5 border-[2px] border-[#111111] bg-[#111111] hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









