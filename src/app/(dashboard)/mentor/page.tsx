"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileCode,
  BookOpen,
  CalendarCheck,
  HelpCircle,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Award,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Code2,
  FileText,
  Flame,
  Search,
  CheckCircle,
  Megaphone,
  Bell,
  Pin,
  Dumbbell,
  ZapOff,
  Zap,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import TestManager from "@/components/TestManager";
import { SkeletonCard, SkeletonMetric, SkeletonProfile } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function MentorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "roster" | "review" | "assignments" | "exercises" | "notes" | "attendance" | "doubts" | "feedback" | "announcements" | "tests"
  >("roster");

  // Review & Grading state
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState<number>(95);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // New Assignment state
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("2026-10-15");
  const [assignMaxScore, setAssignMaxScore] = useState(100);
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  // Exercise state
  const [exTitle, setExTitle] = useState("");
  const [exDesc, setExDesc] = useState("");
  const [exProblem, setExProblem] = useState("");
  const [exTopic, setExTopic] = useState("C++ Basics");
  const [exDifficulty, setExDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [exSampleIn, setExSampleIn] = useState("");
  const [exSampleOut, setExSampleOut] = useState("");
  const [exMaxScore, setExMaxScore] = useState(100);
  const [exDueDate, setExDueDate] = useState("2026-10-15");
  const [creatingExercise, setCreatingExercise] = useState(false);

  // New Note state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<"NOTES" | "CODE" | "PDF" | "RESOURCE">("CODE");
  const [noteTags, setNoteTags] = useState("systems, cpp, concurrency");
  const [publishingNote, setPublishingNote] = useState(false);

  // Attendance marking state
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionTopic, setNewSessionTopic] = useState("");
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSessionStart, setNewSessionStart] = useState("");
  const [newSessionEnd, setNewSessionEnd] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Doubt Reply state
  const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [doubtFilter, setDoubtFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annPinned, setAnnPinned] = useState(false);
  const [postingAnn, setPostingAnn] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  const [activeWsId, setActiveWsId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [meRes, wsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/workshops"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.data.user);
        }

        if (wsRes.ok) {
          const wsData = await wsRes.json();
          const list = wsData.data.workshops || [];
          if (list.length > 0) {
            const wsId = list[0].id;
            setActiveWsId(wsId);
            await fetchAllWorkshopData(wsId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchAllWorkshopData = async (wsId: string) => {
    try {
      const results = await Promise.allSettled([
        fetch(`/api/labs?workshopId=${wsId}`),
        fetch(`/api/assignments?workshopId=${wsId}`),
        fetch(`/api/notes?workshopId=${wsId}`),
        fetch(`/api/attendance/sessions?workshopId=${wsId}`),
        fetch(`/api/doubts?workshopId=${wsId}`),
        fetch(`/api/feedback?workshopId=${wsId}`),
        fetch(`/api/exercises?workshopId=${wsId}`),
        fetch(`/api/announcements?workshopId=${wsId}`),
      ]);

      const setters = [
        (d: any) => { const list = d.data.labs || []; setLabs(list); if (list.length > 0) setSelectedLabId(list[0].id); },
        (d: any) => setAssignments(d.data.assignments || []),
        (d: any) => setNotes(d.data.notes || []),
        (d: any) => {
          const sessList = d.data.sessions || [];
          setSessions(sessList);
          if (sessList.length > 0) {
            setActiveSession(sessList[0]);
            const map: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
            sessList[0].attendanceRecords?.forEach((r: any) => { map[r.studentId] = r.status; });
            setAttendanceMap(map);
          }
        },
        (d: any) => { const list = d.data.doubts || []; setDoubts(list); if (list.length > 0) setSelectedDoubt(list[0]); },
        (d: any) => setFeedbacks(d.data.feedbacks || []),
        (d: any) => setExercises(d.data.exercises || []),
        (d: any) => setAnnouncements(d.data.announcements || []),
      ];

      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled" && r.value.ok) {
          const data = await r.value.json();
          setters[i](data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setReviewing(true);
    setReviewSuccess(false);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Number(reviewScore), feedback: reviewFeedback }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        if (activeWsId) {
          const aRes = await fetch(`/api/assignments?workshopId=${activeWsId}`);
          if (aRes.ok) { const aData = await aRes.json(); setAssignments(aData.data.assignments || []); }
        }
      }
    } finally { setReviewing(false); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWsId) return;
    setCreatingAssignment(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId: activeWsId, labId: selectedLabId || undefined, title: assignTitle, description: assignDesc, dueDate: new Date(assignDueDate).toISOString(), maxScore: Number(assignMaxScore) }),
      });
      if (res.ok) {
        setAssignTitle(""); setAssignDesc("");
        const aRes = await fetch(`/api/assignments?workshopId=${activeWsId}`);
        if (aRes.ok) { const aData = await aRes.json(); setAssignments(aData.data.assignments || []); }
      }
    } finally { setCreatingAssignment(false); }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWsId) return;
    setCreatingExercise(true);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: activeWsId, labId: selectedLabId || undefined,
          title: exTitle, description: exDesc, problemStatement: exProblem,
          topic: exTopic, difficulty: exDifficulty, sampleInput: exSampleIn, sampleOutput: exSampleOut,
          maxScore: Number(exMaxScore), dueDate: new Date(exDueDate).toISOString(),
        }),
      });
      if (res.ok) {
        setExTitle(""); setExDesc(""); setExProblem(""); setExSampleIn(""); setExSampleOut("");
        const exRes = await fetch(`/api/exercises?workshopId=${activeWsId}`);
        if (exRes.ok) { const exData = await exRes.json(); setExercises(exData.data.exercises || []); }
      }
    } finally { setCreatingExercise(false); }
  };

  const handlePublishNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWsId) return;
    setPublishingNote(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId: activeWsId, labId: selectedLabId || undefined, title: noteTitle, description: noteDesc, content: noteContent, category: noteCategory, tags: noteTags.split(",").map((t) => t.trim()) }),
      });
      if (res.ok) {
        setNoteTitle(""); setNoteDesc(""); setNoteContent("");
        const nRes = await fetch(`/api/notes?workshopId=${activeWsId}`);
        if (nRes.ok) { const nData = await nRes.json(); setNotes(nData.data.notes || []); }
      }
    } finally { setPublishingNote(false); }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWsId) return;
    setCreatingSession(true);
    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: activeWsId,
          labId: selectedLabId || undefined,
          title: newSessionTitle,
          topic: newSessionTopic,
          date: new Date(newSessionDate).toISOString(),
          startTime: newSessionStart || undefined,
          endTime: newSessionEnd || undefined,
        }),
      });
      if (res.ok) {
        setNewSessionTitle(""); setNewSessionTopic(""); setNewSessionStart(""); setNewSessionEnd("");
        const sRes = await fetch(`/api/attendance/sessions?workshopId=${activeWsId}`);
        if (sRes.ok) { const sData = await sRes.json(); setSessions(sData.data.sessions || []); }
      }
    } finally { setCreatingSession(false); }
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status }));
      await fetch(`/api/attendance/sessions/${activeSession.id}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
    } finally { setSavingAttendance(false); }
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT" | "LATE") => {
    const activeLab = labs.find((l) => l.id === selectedLabId) || labs[0];
    const map = { ...attendanceMap };
    activeLab?.students?.forEach((s: any) => { map[s.studentId] = status; });
    setAttendanceMap(map);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoubt || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/doubts/${selectedDoubt.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        if (activeWsId) {
          const dRes = await fetch(`/api/doubts?workshopId=${activeWsId}`);
          if (dRes.ok) {
            const dData = await dRes.json();
            const list = dData.data.doubts || [];
            setDoubts(list);
            const updated = list.find((d: any) => d.id === selectedDoubt.id);
            if (updated) setSelectedDoubt(updated);
          }
        }
      }
    } finally { setSendingReply(false); }
  };

  const handleToggleDoubtStatus = async (doubtId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    const res = await fetch(`/api/doubts/${doubtId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok && activeWsId) {
      const dRes = await fetch(`/api/doubts?workshopId=${activeWsId}`);
      if (dRes.ok) {
        const dData = await dRes.json();
        const list = dData.data.doubts || [];
        setDoubts(list);
        if (selectedDoubt?.id === doubtId) setSelectedDoubt(list.find((d: any) => d.id === doubtId));
      }
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWsId) return;
    setPostingAnn(true);
    setAnnSuccess(false);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: annTitle, body: annBody, workshopId: activeWsId, isPublic: false, pinned: annPinned }),
      });
      if (res.ok) {
        setAnnSuccess(true);
        setAnnTitle(""); setAnnBody("");
        const annRes = await fetch(`/api/announcements?workshopId=${activeWsId}`);
        if (annRes.ok) { const annData = await annRes.json(); setAnnouncements(annData.data.announcements || []); }
      }
    } finally { setPostingAnn(false); }
  };

  const allSubmissions: any[] = [];
  assignments.forEach((a) => {
    a.submissions?.forEach((s: any) => {
      allSubmissions.push({ ...s, assignmentTitle: a.title, maxScore: a.maxScore });
    });
  });
  const pendingSubmissions = allSubmissions.filter((s) => s.score === null || s.score === undefined);
  const activeLab = labs.find((l) => l.id === selectedLabId) || labs[0];
  const profile = user?.mentorProfile;

  const TABS = [
    { id: "roster", label: "Lab Roster", icon: Users, count: activeLab?.students?.length || 0 },
    { id: "review", label: "Grading Queue", icon: FileCode, count: pendingSubmissions.length },
    { id: "assignments", label: "Assignments", icon: FileText, count: assignments.length },
    { id: "exercises", label: "Exercises", icon: Dumbbell, count: exercises.length },
    { id: "notes", label: "Notes & Materials", icon: BookOpen, count: notes.length },
    { id: "attendance", label: "Attendance", icon: CalendarCheck, count: sessions.length },
    { id: "doubts", label: "Doubts Inbox", icon: HelpCircle, count: doubts.filter((d) => d.status === "OPEN").length },
    { id: "feedback", label: "Feedback", icon: MessageSquareHeart, count: feedbacks.length },
    { id: "announcements", label: "Announcements", icon: Megaphone, count: announcements.length },
    { id: "tests", label: "Tests & Quizzes", icon: ClipboardList, count: null },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <SkeletonProfile />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <div className="bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111]">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      {/* ── HERO BANNER: LEAD EVALUATOR DOSSIER ── */}
      <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-7 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#111111] text-white px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border-[2px] border-[#111111] flex items-center gap-1.5 shadow-[2px_2px_0px_#111111]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F07C27]" />
                [ IDENT: LEAD_EVALUATOR // PROTOCOL ]
              </span>
              <span className="bg-[#FFF0E5] text-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold border-[2px] border-[#111111]">
                {profile?.company || "Ex-Google · Super 60 Alumni"}
              </span>
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">{user?.name}</h1>
              <p className="text-xs sm:text-sm text-slate-700 font-mono font-bold mt-1">
                {profile?.title || "Senior Systems Architect"} · {profile?.specialty || "Low-Latency C++ & Kernel Bypass"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs text-slate-700 font-mono font-bold uppercase">Assigned Laboratory:</span>
              <select
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] px-3 py-1.5 text-xs font-mono font-bold shadow-[2px_2px_0px_#111111] focus:outline-none cursor-pointer"
              >
                {labs.map((l) => <option key={l.id} value={l.id} className="bg-white text-[#111111]">{l.name}</option>)}
              </select>
              <Link href="/mentor/profile" className="text-xs text-[#F07C27] hover:underline font-mono font-bold flex items-center gap-1">
                Edit Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { label: "STUDENTS IN LAB", val: activeLab?.students?.length || 0, color: "text-[#111111]", sub: `Cap: ${activeLab?.capacity || 30}` },
              { label: "GRADING QUEUE", val: pendingSubmissions.length, color: "text-[#F07C27]", sub: "Pending Review" },
              { label: "OPEN DOUBTS", val: doubts.filter((d) => d.status === "OPEN").length, color: "text-blue-700", sub: "Awaiting Action" },
              { label: "LAB SESSIONS", val: sessions.length, color: "text-emerald-700", sub: "Verified Attend." },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111]">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">{kpi.label}</span>
                <span className={`font-display font-black text-2xl ${kpi.color}`}>{kpi.val}</span>
                <span className="text-[11px] font-mono block mt-0.5 text-slate-600 font-bold">{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN WORKSPACE: VERTICAL SIDEBAR + ACTIVE TAB WORKSPACE ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT VERTICAL SIDEBAR ── */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-[125px] z-20 space-y-4">
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-3.5 space-y-3">
            {/* Sidebar Telemetry Header */}
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#F07C27] border border-[#111111] animate-pulse" />
                [ MENTOR // CONSOLE ]
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#FFF0E5] px-1.5 py-0.5 border border-[#111111] text-[#111111]">
                {TABS.length} MODULES
              </span>
            </div>

            {/* Mobile Horizontal Carousel (< lg) / Desktop Vertical Stack (lg+) */}
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2.5 border-[2px] border-[#111111] uppercase font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left ${
                      isActive
                        ? "bg-[#F07C27] text-white shadow-[4px_4px_0px_#111111] translate-x-1 font-black"
                        : "bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#FFF0E5] hover:translate-x-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-[#111111]"}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.count !== null && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono flex-shrink-0 border ${
                          isActive
                            ? "bg-[#111111] text-white border-white/40"
                            : "bg-[#FFF0E5] text-[#111111] border-[#111111]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Context Box at bottom of sidebar */}
            <div className="hidden lg:block pt-2 border-t-[2px] border-[#111111] text-[11px] font-mono space-y-1.5 bg-[#F9F9F9] -mx-3.5 -mb-3.5 p-3">
              <div className="flex justify-between text-slate-600 font-bold">
                <span>LABORATORY:</span>
                <span className="text-[#111111] font-black truncate max-w-[120px]">{activeLab?.name || "LAB 1"}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold">
                <span>TOTAL CANDIDATES:</span>
                <span className="text-[#111111] font-black">{activeLab?.students?.length || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold">
                <span>PENDING GRADES:</span>
                <span className="text-[#F07C27] font-black">{pendingSubmissions.length}</span>
              </div>
              <div className="pt-2 border-t border-[#111111]/20">
                <Link
                  href="/curriculum"
                  target="_blank"
                  className="flex items-center justify-between text-[10px] font-mono font-bold text-[#111111] hover:text-[#F07C27] uppercase bg-white border border-[#111111] px-2 py-1 shadow-[1px_1px_0px_#111111] transition-all hover:translate-x-0.5"
                >
                  <span>⚡ 6-DAY SYLLABUS</span>
                  <ExternalLink className="w-3 h-3 text-[#F07C27]" />
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT MAIN WORKSPACE CONTENT ── */}
        <main className="flex-1 min-w-0 w-full space-y-6">

      {/* ══ TAB: ROSTER ══ */}
      {/* ══ TESTS & QUIZZES (create, manage, grade online tests) ══ */}
      {activeTab === "tests" && activeWsId && (
        <TestManager workshopId={activeWsId} labs={labs} />
      )}

      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Enrolled Candidates — {activeLab?.name}
            </h3>
            <span className="text-xs font-mono font-bold text-[#111111] bg-[#FFF0E5] px-3 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
              Total: {activeLab?.students?.length || 0} Engineers
            </span>
          </div>
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] font-mono uppercase font-bold text-[10px] tracking-wider">
                    <th className="sticky left-0 bg-[#FFF0E5] z-10 py-3 px-4 border-r border-[#111111]">Candidate</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Email</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Institution</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Enrolled At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20 font-mono">
                  {(!activeLab?.students || activeLab.students.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8">
                        <EmptyState
                          icon={Users}
                          title="No Students Enrolled"
                          description="No students have been assigned to this lab yet. Allocated engineers will appear in this roster."
                        />
                      </td>
                    </tr>
                  )}
                  {activeLab?.students?.map((ls: any) => {
                    const st = ls.student;
                    const initials = st?.name ? st.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "S";
                    return (
                      <tr key={ls.id} className="hover:bg-[#FFF0E5]/40 transition-colors">
                        <td className="sticky left-0 bg-white z-10 py-3 px-4 border-r border-[#111111]/20">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 border-[2px] border-[#111111] bg-[#FFF0E5] shadow-[1px_1px_0px_#111111] flex items-center justify-center text-xs font-mono font-bold text-[#111111]">
                              {initials}
                            </div>
                            <span className="font-mono font-bold text-[#111111] text-sm whitespace-nowrap">
                              {st?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 border-r border-[#111111]/20">{st?.email}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono border-r border-[#111111]/20">{st?.college || "—"}</td>
                        <td className="py-3 px-4 text-slate-600 border-r border-[#111111]/20">{new Date(ls.enrolledAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setActiveTab("review")}
                            className="px-2.5 py-1 border-[2px] border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-[11px] font-bold shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all whitespace-nowrap cursor-pointer"
                          >
                            View Submissions →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: GRADING QUEUE ══ */}
      {activeTab === "review" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Submissions to Grade ({allSubmissions.length})
            </h3>
            <div className="space-y-2.5">
              {allSubmissions.length === 0 && (
                <EmptyState
                  icon={FileCode}
                  title="Grading Queue Empty"
                  description="No student submissions are waiting for code review. Submissions from your lab will appear here."
                />
              )}
              {allSubmissions.map((s) => {
                const isSelected = selectedSubmission?.id === s.id;
                const isGraded = s.score !== null && s.score !== undefined;
                return (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedSubmission(s); setReviewScore(s.score ?? 90); setReviewFeedback(s.feedback ?? ""); setReviewSuccess(false); }}
                    className={`p-4 border-[2px] border-[#111111] cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#FFF0E5] shadow-[4px_4px_0px_#111111] translate-x-0.5"
                        : "bg-white shadow-[2px_2px_0px_#111111] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-[#111111]">{s.student?.name || "Student"}</span>
                      {isGraded ? (
                        <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 shadow-[1px_1px_0px_#111111]">
                          {s.score}/{s.maxScore}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-amber-100 text-amber-900 shadow-[1px_1px_0px_#111111]">
                          Needs Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-mono font-medium">{s.assignmentTitle}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-2 font-bold">
                      <span>Submitted: {new Date(s.submittedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={s.status === "LATE" ? "text-rose-600 font-bold" : "text-slate-600"}>{s.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-7">
            {selectedSubmission ? (
              <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-4">
                <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#F07C27] uppercase font-black tracking-wider">
                      CODE REVIEW PROTOCOL
                    </span>
                    <h3 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight">
                      {selectedSubmission.student?.name}
                    </h3>
                    <span className="text-xs text-slate-600 font-mono font-bold">
                      Task: {selectedSubmission.assignmentTitle}
                    </span>
                  </div>
                  {selectedSubmission.score !== null && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">CURRENT GRADE</span>
                      <span className="font-display font-black text-2xl text-emerald-700">
                        {selectedSubmission.score}/{selectedSubmission.maxScore}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-700 uppercase mb-1 font-bold">
                    Candidate Implementation
                  </label>
                  <div className="border-[2px] border-[#111111] bg-[#111111] text-[#E0E0E0] p-4 font-mono text-xs overflow-x-auto max-h-60 shadow-inner">
                    <pre className="whitespace-pre-wrap">{selectedSubmission.content}</pre>
                  </div>
                </div>
                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-[#111111] font-bold uppercase">
                        Score (0–{selectedSubmission.maxScore})
                      </label>
                      <span className="font-mono text-lg font-black text-[#F07C27]">
                        {reviewScore} / {selectedSubmission.maxScore}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={selectedSubmission.maxScore}
                      value={reviewScore}
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="w-full accent-[#F07C27] cursor-pointer"
                    />
                    <div className="flex gap-2 font-mono text-xs">
                      {[100, 95, 90, 85, 75].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setReviewScore(p)}
                          className="px-2.5 py-1 border-[2px] border-[#111111] bg-[#F4F3F3] hover:bg-white text-[#111111] text-[11px] font-mono font-bold shadow-[1px_1px_0px_#111111] cursor-pointer"
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#111111] uppercase mb-1 font-bold">
                      Mentor Critique
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Comment on cache alignment, concurrency, correctness..."
                      className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
                    />
                  </div>
                  {reviewSuccess && (
                    <div className="p-3 border-[2px] border-[#111111] bg-emerald-100 text-emerald-900 font-mono text-xs flex items-center gap-2 shadow-[2px_2px_0px_#111111]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Review recorded! Candidate performance updated.</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={reviewing}
                    className="w-full py-2.5 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {reviewing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Submit Grade & Critique →"
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border-[3px] border-[#111111] p-12 shadow-[6px_6px_0px_#111111] text-center text-slate-600 font-mono text-xs font-bold uppercase">
                Select a submission from the queue to inspect code and grade.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: ASSIGNMENTS ══ */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Laboratory Assignments ({assignments.length})
            </h3>
            {assignments.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No Lab Assignments"
                description="No assignments published yet for this workshop. Use the deployment panel to assign problems to your lab."
              />
            )}
            {assignments.map((a) => (
              <div key={a.id} className="p-5 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-bold text-[#111111] text-sm uppercase">{a.title}</h4>
                  <span className="text-xs font-mono text-[#F07C27] font-black border-[2px] border-[#111111] bg-[#FFF0E5] px-2 py-0.5 shadow-[1px_1px_0px_#111111]">
                    MAX: {a.maxScore} PTS
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-mono line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1 border-t border-[#111111]/15 font-bold">
                  <span>DUE: {new Date(a.dueDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{a._count?.submissions || 0} SUBMISSIONS</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F07C27]" />
              Publish New Assignment
            </h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <input
                required
                placeholder="Assignment Title"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
              />
              <textarea
                required
                rows={4}
                placeholder="Architectural constraints, benchmark targets, submission requirements..."
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                />
                <input
                  type="number"
                  required
                  value={assignMaxScore}
                  onChange={(e) => setAssignMaxScore(Number(e.target.value))}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                  placeholder="Max Score"
                />
              </div>
              <button
                type="submit"
                disabled={creatingAssignment}
                className="w-full py-2.5 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {creatingAssignment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  "Deploy Assignment"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: EXERCISES ══ */}
      {activeTab === "exercises" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Programming Exercises ({exercises.length})
            </h3>
            {exercises.length === 0 && (
              <EmptyState
                icon={Dumbbell}
                title="No Practice Exercises"
                description="No coding problems published yet for this laboratory. Use the builder on the right to publish challenges."
              />
            )}
            {exercises.map((ex) => (
              <div key={ex.id} className="p-5 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono font-bold text-[#111111] text-sm uppercase">{ex.title}</h4>
                    <span className={`px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold shadow-[1px_1px_0px_#111111] ${
                      ex.difficulty === "EASY"
                        ? "bg-emerald-100 text-emerald-800"
                        : ex.difficulty === "HARD"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#F07C27] font-black border-[2px] border-[#111111] bg-[#FFF0E5] px-2 py-0.5 shadow-[1px_1px_0px_#111111]">
                    MAX: {ex.maxScore} PTS
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-mono line-clamp-2">{ex.description}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1 border-t border-[#111111]/15 font-bold">
                  <span>TOPIC: {ex.topic || "General"}</span>
                  {ex.dueDate && <><span>•</span><span>DUE: {new Date(ex.dueDate).toLocaleDateString()}</span></>}
                  <span>•</span><span>{ex._count?.submissions || 0} SUBMISSIONS</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              Create Exercise
            </h3>
            <form onSubmit={handleCreateExercise} className="space-y-3">
              <input
                required
                placeholder="Exercise Title"
                value={exTitle}
                onChange={(e) => setExTitle(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
              />
              <textarea
                required
                rows={2}
                placeholder="Brief description..."
                value={exDesc}
                onChange={(e) => setExDesc(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
              />
              <textarea
                required
                rows={3}
                placeholder="Problem statement..."
                value={exProblem}
                onChange={(e) => setExProblem(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={exTopic}
                  onChange={(e) => setExTopic(e.target.value)}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111]"
                >
                  {["C++ Basics","OOP","STL","Pointers","Concurrency","Algorithms","Systems"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={exDifficulty}
                  onChange={(e) => setExDifficulty(e.target.value as any)}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111]"
                >
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Sample Input"
                  value={exSampleIn}
                  onChange={(e) => setExSampleIn(e.target.value)}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                />
                <input
                  placeholder="Sample Output"
                  value={exSampleOut}
                  onChange={(e) => setExSampleOut(e.target.value)}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={exDueDate}
                  onChange={(e) => setExDueDate(e.target.value)}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                />
                <input
                  type="number"
                  value={exMaxScore}
                  onChange={(e) => setExMaxScore(Number(e.target.value))}
                  className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                  placeholder="Max Score"
                />
              </div>
              <button
                type="submit"
                disabled={creatingExercise}
                className="w-full py-2.5 border-[2px] border-[#111111] bg-emerald-600 hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {creatingExercise ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Publish Exercise"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: NOTES ══ */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Published Resources ({notes.length})
            </h3>
            {notes.map((n) => (
              <div key={n.id} className="p-5 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-bold text-[#111111] text-sm uppercase">{n.title}</h4>
                  <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-[#FFF0E5] text-[#111111] uppercase shadow-[1px_1px_0px_#111111]">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-mono line-clamp-2">{n.description}</p>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1 border-t border-[#111111]/15 font-bold">
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    {n.tags?.map((t: string) => (
                      <span key={t} className="text-[10px] border border-[#111111] bg-[#F4F3F3] text-[#111111] px-1.5 py-0.5">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              Publish Material
            </h3>
            <form onSubmit={handlePublishNote} className="space-y-3">
              <input
                required
                placeholder="Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
              />
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white shadow-[2px_2px_0px_#111111]"
              >
                <option value="NOTES">Architecture Notes</option>
                <option value="CODE">C++ Code Sample</option>
                <option value="PDF">PDF Slides</option>
                <option value="RESOURCE">External Resource</option>
              </select>
              <textarea
                rows={4}
                placeholder="// Code snippet or notes..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
              />
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="Tags: systems, cpp"
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
              />
              <button
                type="submit"
                disabled={publishingNote}
                className="w-full py-2.5 border-[2px] border-[#111111] bg-[#111111] hover:bg-[#F07C27] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishingNote ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  "Publish to Lab Roster"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: ATTENDANCE ══ */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[2px] border-[#111111] pb-3">
                <div>
                  <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
                    Mark Session Attendance
                  </h3>
                  <p className="text-xs text-slate-700 font-mono">
                    Active: <strong className="text-[#111111]">{activeSession?.title || "Select a session"}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={activeSession?.id || ""}
                    onChange={(e) => {
                      const s = sessions.find((x) => x.id === e.target.value);
                      setActiveSession(s);
                      if (s) {
                        const map: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
                        s.attendanceRecords?.forEach((r: any) => { map[r.studentId] = r.status; });
                        setAttendanceMap(map);
                      }
                    }}
                    className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none cursor-pointer"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}{s.startTime ? ` · ${s.startTime}${s.endTime ? `–${s.endTime}` : ""}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleMarkAll("PRESENT")}
                    className="px-2.5 py-1 border-[2px] border-[#111111] bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-900 font-mono text-[11px] font-bold shadow-[2px_2px_0px_#111111] transition-all cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="px-3.5 py-1 border-[2px] border-[#111111] bg-[#F07C27] text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingAttendance ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Records"
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {activeLab?.students?.map((ls: any) => {
                  const sid = ls.studentId;
                  const currentStatus = attendanceMap[sid] || "PRESENT";
                  return (
                    <div
                      key={sid}
                      className="p-3 border-[2px] border-[#111111] bg-[#F9F9F9] flex items-center justify-between gap-4 shadow-[2px_2px_0px_#111111]"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-[#111111] block">{ls.student?.name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{ls.student?.college || "IIIT"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {(["PRESENT", "LATE", "ABSENT"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [sid]: st }))}
                            className={`px-2.5 py-1 border-[2px] border-[#111111] transition-all font-bold cursor-pointer ${
                              currentStatus === st
                                ? st === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#111111]"
                                  : st === "LATE"
                                  ? "bg-amber-500 text-white shadow-[2px_2px_0px_#111111]"
                                  : "bg-rose-600 text-white shadow-[2px_2px_0px_#111111]"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-4 bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
              <h4 className="font-display font-black text-[#111111] text-sm uppercase tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Schedule Session
              </h4>
              <form onSubmit={handleCreateSession} className="space-y-2.5">
                <input
                  required
                  placeholder="Session title (e.g. Lab Day 4)"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
                />
                <input
                  placeholder="Topic (e.g. SIMD Vectorization)"
                  value={newSessionTopic}
                  onChange={(e) => setNewSessionTopic(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
                />
                <input
                  type="date"
                  required
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] font-mono text-slate-700 uppercase font-bold">
                    Start time
                    <input
                      type="time"
                      value={newSessionStart}
                      onChange={(e) => setNewSessionStart(e.target.value)}
                      className="mt-1 w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-1.5 text-xs text-[#111111] font-mono shadow-[1px_1px_0px_#111111]"
                    />
                  </label>
                  <label className="text-[10px] font-mono text-slate-700 uppercase font-bold">
                    End time
                    <input
                      type="time"
                      value={newSessionEnd}
                      onChange={(e) => setNewSessionEnd(e.target.value)}
                      className="mt-1 w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-1.5 text-xs text-[#111111] font-mono shadow-[1px_1px_0px_#111111]"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={creatingSession}
                  className="w-full py-2.5 border-[2px] border-[#111111] bg-emerald-600 hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creatingSession ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create Session"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: DOUBTS ══ */}
      {activeTab === "doubts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
                Student Queries
              </h3>
              <div className="flex gap-1.5 text-[10px] font-mono">
                {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDoubtFilter(f)}
                    className={`px-2 py-0.5 border-[2px] border-[#111111] font-bold uppercase transition-all cursor-pointer ${
                      doubtFilter === f
                        ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {doubts.filter((d) => doubtFilter === "ALL" || d.status === doubtFilter).length === 0 && (
                <EmptyState
                  icon={HelpCircle}
                  title="No Queries in Queue"
                  description="No student doubts match the current status filter."
                />
              )}
              {doubts.filter((d) => doubtFilter === "ALL" || d.status === doubtFilter).map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoubt(d)}
                  className={`p-3.5 border-[2px] border-[#111111] cursor-pointer transition-all ${
                    selectedDoubt?.id === d.id
                      ? "bg-[#FFF0E5] shadow-[4px_4px_0px_#111111] translate-x-0.5"
                      : "bg-white shadow-[2px_2px_0px_#111111] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-[#111111] truncate max-w-[180px]">{d.title}</span>
                    <span
                      className={`px-2 py-0.5 border-[2px] border-[#111111] text-[9px] font-mono font-bold shadow-[1px_1px_0px_#111111] ${
                        d.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 block font-bold">
                    From: {d.student?.name} • {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            {selectedDoubt ? (
              <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5 flex flex-col h-[540px]">
                <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-3">
                  <div>
                    <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">{selectedDoubt.title}</h3>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">Author: {selectedDoubt.student?.name}</span>
                  </div>
                  <button
                    onClick={() => handleToggleDoubtStatus(selectedDoubt.id, selectedDoubt.status)}
                    className={`px-3 py-1 border-[2px] border-[#111111] text-xs font-mono font-bold shadow-[2px_2px_0px_#111111] transition-all cursor-pointer ${
                      selectedDoubt.status === "RESOLVED"
                        ? "bg-[#F4F3F3] text-[#111111] hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {selectedDoubt.status === "RESOLVED" ? "Re-open Thread" : "Mark as Resolved ✓"}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {selectedDoubt.messages?.map((m: any) => {
                    const isMentor = m.sender?.role === "MENTOR";
                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 border-[2px] border-[#111111] text-xs space-y-1 ${
                          isMentor
                            ? "bg-[#FFF0E5] shadow-[2px_2px_0px_#111111] mr-4"
                            : "bg-[#F4F3F3] ml-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <strong className={isMentor ? "text-[#F07C27]" : "text-[#111111]"}>
                            {m.sender?.name || (isMentor ? "You" : "Candidate")}
                          </strong>
                          <span className="text-slate-500">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-slate-800 whitespace-pre-wrap font-mono">{m.body}</p>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendReply} className="pt-3 border-t-[2px] border-[#111111] flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Provide technical solution..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[2px_2px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    {sendingReply ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border-[3px] border-[#111111] p-12 shadow-[6px_6px_0px_#111111] text-center text-slate-600 font-mono text-xs font-bold uppercase">
                Select a doubt from the inbox to reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: FEEDBACK ══ */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
            Student Appraisals ({feedbacks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={MessageSquareHeart}
                  title="No Student Appraisals"
                  description="Feedback submitted by workshop participants will appear here."
                />
              </div>
            )}
            {feedbacks.map((f) => (
              <div key={f.id} className="p-5 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < f.rating ? "text-[#F07C27] fill-[#F07C27]" : "text-slate-300"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] uppercase shadow-[1px_1px_0px_#111111]">
                    {f.category}
                  </span>
                </div>
                <p className="text-sm text-slate-800 font-mono italic">&quot;{f.comment}&quot;</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-2 border-t border-[#111111]/15 font-bold">
                  <span>From: {f.isAnonymous ? "Anonymous Candidate" : f.student?.name}</span>
                  <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB: ANNOUNCEMENTS ══ */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Published Announcements ({announcements.length})
            </h3>
            {announcements.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No Announcements Posted"
                description="Broadcast lab announcements, milestone updates, and notices to your cohort."
              />
            )}
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-5 border-[3px] border-[#111111] space-y-2 ${
                  a.pinned
                    ? "bg-[#FFF0E5] shadow-[6px_6px_0px_#111111]"
                    : "bg-white shadow-[4px_4px_0px_#111111]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono font-bold text-[#111111] text-sm uppercase">{a.title}</h4>
                    {a.pinned && (
                      <span className="text-[10px] font-mono text-[#111111] bg-[#F07C27] text-white px-2 py-0.5 border border-[#111111] font-bold">
                        📌 PINNED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono flex-shrink-0 font-bold">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap font-mono">{a.body}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#F07C27]" />
              Post Announcement
            </h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <input
                required
                placeholder="Announcement title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#111111]"
              />
              <textarea
                required
                rows={4}
                placeholder="Announcement body (supports plain text)..."
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-xs text-[#111111] placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono resize-none shadow-[2px_2px_0px_#111111]"
              />
              <label className="flex items-center gap-2.5 cursor-pointer p-3 border-[2px] border-[#111111] bg-[#F9F9F9] shadow-[2px_2px_0px_#111111]">
                <input
                  type="checkbox"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#F07C27]"
                />
                <div>
                  <span className="text-xs font-bold text-[#111111] font-mono block">Pin to top of dashboard</span>
                  <span className="text-[10px] text-slate-600 font-mono">Students will see this first</span>
                </div>
              </label>
              {annSuccess && (
                <div className="p-3 border-[2px] border-[#111111] bg-emerald-100 text-emerald-900 font-mono text-xs flex items-center gap-2 shadow-[2px_2px_0px_#111111]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Announcement published to all students!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={postingAnn}
                className="w-full py-2.5 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {postingAnn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  "Publish Announcement"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
