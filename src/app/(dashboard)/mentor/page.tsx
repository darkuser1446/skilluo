"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function MentorDashboardPage() {
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
    "roster" | "review" | "assignments" | "exercises" | "notes" | "attendance" | "doubts" | "feedback" | "announcements"
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
        body: JSON.stringify({ workshopId: activeWsId, labId: selectedLabId || undefined, title: newSessionTitle, topic: newSessionTopic, date: new Date(newSessionDate).toISOString() }),
      });
      if (res.ok) {
        setNewSessionTitle(""); setNewSessionTopic("");
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
  ];

  return (
    <div className="space-y-6">
      {/* ── HERO BANNER ── */}
      <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#111C35]/95 to-[#0D1527]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider flex items-center gap-1">
                SUPER 60 MENTOR & LEAD EVALUATOR
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">{profile?.company || "Ex-Google · Super 60 Alumni"}</span>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">{user?.name}</h1>
              <p className="text-xs sm:text-sm text-sky-300 font-mono mt-0.5">{profile?.title || "Senior Systems Architect"} · {profile?.specialty || "Low-Latency C++ & Kernel Bypass"}</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-400 font-mono">Assigned Lab:</span>
              <select value={selectedLabId} onChange={(e) => setSelectedLabId(e.target.value)} className="bg-[#070B14] border border-sky-500/30 text-white rounded-lg px-3 py-1 text-xs font-mono font-bold focus:outline-none focus:border-sky-400">
                {labs.map((l) => <option key={l.id} value={l.id} className="bg-[#0B1120]">{l.name}</option>)}
              </select>
              <Link href="/mentor/profile" className="text-xs text-brand-orange hover:underline font-mono flex items-center gap-1">
                Edit Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { label: "STUDENTS IN LAB", val: activeLab?.students?.length || 0, color: "text-white", sub: `Cap: ${activeLab?.capacity || 30}` },
              { label: "GRADING QUEUE", val: pendingSubmissions.length, color: "text-amber-400", sub: "Pending Code Review" },
              { label: "OPEN DOUBTS", val: doubts.filter((d) => d.status === "OPEN").length, color: "text-sky-400", sub: "Awaiting Response" },
              { label: "LAB SESSIONS", val: sessions.length, color: "text-emerald-400", sub: "Verified Attendance" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl p-4 bg-[#070B14]/80 border border-slate-800 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">{kpi.label}</span>
                <span className={`font-display font-black text-2xl ${kpi.color}`}>{kpi.val}</span>
                <span className={`text-[11px] font-mono block mt-0.5 ${kpi.color}/80`}>{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 overflow-x-auto text-xs font-semibold scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${isActive ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold shadow-[0_0_15px_rgba(56,189,248,0.15)]" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && <span className={`px-1.5 rounded-full text-[10px] font-mono ${isActive ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {/* ══ TAB: ROSTER ══ */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-base">Enrolled Candidates — {activeLab?.name}</h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">Total: {activeLab?.students?.length || 0} Engineers</span>
          </div>
          <div className="rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]"><th className="py-3 px-4">Candidate</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Institution</th><th className="py-3 px-4">Enrolled At</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(!activeLab?.students || activeLab.students.length === 0) && <tr><td colSpan={5} className="py-8 text-center text-slate-500 text-xs">No students enrolled in this lab yet.</td></tr>}
                  {activeLab?.students?.map((ls: any) => {
                    const st = ls.student;
                    const initials = st?.name ? st.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "S";
                    return (
                      <tr key={ls.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">{initials}</div><span className="font-sans font-bold text-white text-sm">{st?.name}</span></div></td>
                        <td className="py-3 px-4 text-slate-300">{st?.email}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{st?.college || "—"}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(ls.enrolledAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right"><button onClick={() => setActiveTab("review")} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-300 font-mono text-[11px] transition-all">View Submissions →</button></td>
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
            <h3 className="font-display font-bold text-white text-base">Submissions to Grade ({allSubmissions.length})</h3>
            <div className="space-y-2.5">
              {allSubmissions.length === 0 && <p className="text-slate-500 text-xs py-6 text-center font-mono">No submissions recorded yet.</p>}
              {allSubmissions.map((s) => {
                const isSelected = selectedSubmission?.id === s.id;
                const isGraded = s.score !== null && s.score !== undefined;
                return (
                  <div key={s.id} onClick={() => { setSelectedSubmission(s); setReviewScore(s.score ?? 90); setReviewFeedback(s.feedback ?? ""); setReviewSuccess(false); }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? "bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-500/5" : "bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans font-bold text-sm text-white">{s.student?.name || "Student"}</span>
                      {isGraded ? <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">{s.score}/{s.maxScore}</span> : <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">Needs Review</span>}
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{s.assignmentTitle}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-2"><span>Submitted: {new Date(s.submittedAt).toLocaleDateString()}</span><span>•</span><span className={s.status === "LATE" ? "text-rose-400 font-bold" : ""}>{s.status}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-7">
            {selectedSubmission ? (
              <div className="rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div><span className="text-[10px] font-mono text-sky-400 uppercase font-bold">CODE REVIEW</span><h3 className="font-display font-bold text-xl text-white">{selectedSubmission.student?.name}</h3><span className="text-xs text-slate-400 font-mono">Task: {selectedSubmission.assignmentTitle}</span></div>
                  {selectedSubmission.score !== null && <div className="text-right"><span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT GRADE</span><span className="font-display font-bold text-xl text-emerald-400">{selectedSubmission.score}/{selectedSubmission.maxScore}</span></div>}
                </div>
                <div><label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Candidate Implementation</label><div className="rounded-xl border border-slate-800 bg-[#070B14] p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-60 scrollbar-thin"><pre className="whitespace-pre-wrap">{selectedSubmission.content}</pre></div></div>
                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><label className="text-xs font-mono text-slate-300 font-bold uppercase">Score (0–{selectedSubmission.maxScore})</label><span className="font-mono text-lg font-black text-brand-orange">{reviewScore} / {selectedSubmission.maxScore}</span></div>
                    <input type="range" min={0} max={selectedSubmission.maxScore} value={reviewScore} onChange={(e) => setReviewScore(Number(e.target.value))} className="w-full accent-brand-orange cursor-pointer" />
                    <div className="flex gap-2 font-mono text-xs">{[100, 95, 90, 85, 75].map((p) => <button key={p} type="button" onClick={() => setReviewScore(p)} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]">{p}%</button>)}</div>
                  </div>
                  <div><label className="block text-xs font-mono text-slate-300 uppercase mb-1">Mentor Critique</label><textarea required rows={3} value={reviewFeedback} onChange={(e) => setReviewFeedback(e.target.value)} placeholder="Comment on cache alignment, concurrency, correctness..." className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono resize-none" /></div>
                  {reviewSuccess && <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Review recorded! Candidate performance updated.</span></div>}
                  <button type="submit" disabled={reviewing} className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md">{reviewing ? "Saving..." : "Submit Grade & Critique →"}</button>
                </form>
              </div>
            ) : <div className="rounded-2xl p-12 bg-[#0F172A]/70 border border-slate-800 text-center text-slate-500 font-mono text-xs">Select a submission from the queue to inspect code and grade.</div>}
          </div>
        </div>
      )}

      {/* ══ TAB: ASSIGNMENTS ══ */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-bold text-white text-base">Laboratory Assignments ({assignments.length})</h3>
            {assignments.map((a) => (
              <div key={a.id} className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between"><h4 className="font-bold text-white text-sm">{a.title}</h4><span className="text-xs font-mono text-brand-orange font-bold">Max: {a.maxScore} pts</span></div>
                <p className="text-xs text-slate-400 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1"><span>Due: {new Date(a.dueDate).toLocaleDateString()}</span><span>•</span><span>{a._count?.submissions || 0} Submissions</span></div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2"><FileText className="w-4 h-4 text-brand-orange" />Publish New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <input required placeholder="Assignment Title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono" />
              <textarea required rows={4} placeholder="Architectural constraints, benchmark targets, submission requirements..." value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" required value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                <input type="number" required value={assignMaxScore} onChange={(e) => setAssignMaxScore(Number(e.target.value))} className="w-full bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" placeholder="Max Score" />
              </div>
              <button type="submit" disabled={creatingAssignment} className="w-full py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50">{creatingAssignment ? "Deploying..." : "Deploy Assignment"}</button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: EXERCISES ══ */}
      {activeTab === "exercises" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-bold text-white text-base">Programming Exercises ({exercises.length})</h3>
            {exercises.length === 0 && <p className="text-slate-500 text-xs py-6 text-center font-mono">No exercises published yet for this lab.</p>}
            {exercises.map((ex) => (
              <div key={ex.id} className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{ex.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${ex.difficulty === "EASY" ? "bg-emerald-500/20 text-emerald-400" : ex.difficulty === "HARD" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>{ex.difficulty}</span>
                  </div>
                  <span className="text-xs font-mono text-brand-orange font-bold">Max: {ex.maxScore} pts</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{ex.description}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                  <span>Topic: {ex.topic || "General"}</span>
                  {ex.dueDate && <><span>•</span><span>Due: {new Date(ex.dueDate).toLocaleDateString()}</span></>}
                  <span>•</span><span>{ex._count?.submissions || 0} Submissions</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2"><Dumbbell className="w-4 h-4 text-emerald-400" />Create Exercise</h3>
            <form onSubmit={handleCreateExercise} className="space-y-3">
              <input required placeholder="Exercise Title" value={exTitle} onChange={(e) => setExTitle(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono" />
              <textarea required rows={2} placeholder="Brief description..." value={exDesc} onChange={(e) => setExDesc(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono resize-none" />
              <textarea required rows={3} placeholder="Problem statement..." value={exProblem} onChange={(e) => setExProblem(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={exTopic} onChange={(e) => setExTopic(e.target.value)} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white">
                  {["C++ Basics","OOP","STL","Pointers","Concurrency","Algorithms","Systems"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={exDifficulty} onChange={(e) => setExDifficulty(e.target.value as any)} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white">
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Sample Input" value={exSampleIn} onChange={(e) => setExSampleIn(e.target.value)} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                <input placeholder="Sample Output" value={exSampleOut} onChange={(e) => setExSampleOut(e.target.value)} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={exDueDate} onChange={(e) => setExDueDate(e.target.value)} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                <input type="number" value={exMaxScore} onChange={(e) => setExMaxScore(Number(e.target.value))} className="bg-[#070B14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" placeholder="Max Score" />
              </div>
              <button type="submit" disabled={creatingExercise} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50">{creatingExercise ? "Creating..." : "Publish Exercise"}</button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: NOTES ══ */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-bold text-white text-base">Published Resources ({notes.length})</h3>
            {notes.map((n) => (
              <div key={n.id} className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between"><h4 className="font-bold text-white text-sm">{n.title}</h4><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 uppercase">{n.category}</span></div>
                <p className="text-xs text-slate-400 line-clamp-2">{n.description}</p>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1"><span>{new Date(n.createdAt).toLocaleDateString()}</span><div className="flex gap-1">{n.tags?.map((t: string) => <span key={t} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">#{t}</span>)}</div></div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-sky-400" />Publish Material</h3>
            <form onSubmit={handlePublishNote} className="space-y-3">
              <input required placeholder="Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono" />
              <select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value as any)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400">
                <option value="NOTES">Architecture Notes</option><option value="CODE">C++ Code Sample</option><option value="PDF">PDF Slides</option><option value="RESOURCE">External Resource</option>
              </select>
              <textarea rows={4} placeholder="// Code snippet or notes..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono resize-none" />
              <input type="text" value={noteTags} onChange={(e) => setNoteTags(e.target.value)} placeholder="Tags: systems, cpp" className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
              <button type="submit" disabled={publishingNote} className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50">{publishingNote ? "Publishing..." : "Publish to Lab Roster"}</button>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB: ATTENDANCE ══ */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div><h3 className="font-display font-bold text-white text-base">Mark Session Attendance</h3><p className="text-xs text-slate-400">Active: <strong className="text-white">{activeSession?.title || "Select a session"}</strong></p></div>
                <div className="flex items-center gap-2">
                  <select value={activeSession?.id || ""} onChange={(e) => { const s = sessions.find((x) => x.id === e.target.value); setActiveSession(s); if (s) { const map: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {}; s.attendanceRecords?.forEach((r: any) => { map[r.studentId] = r.status; }); setAttendanceMap(map); }}} className="bg-[#070B14] border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white">
                    {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                  <button onClick={() => handleMarkAll("PRESENT")} className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-mono text-[11px] font-bold transition-all">Mark All Present</button>
                  <button onClick={handleSaveAttendance} disabled={savingAttendance} className="px-3.5 py-1 rounded bg-brand-orange text-white font-mono text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-sm">{savingAttendance ? "Saving..." : "Save Records"}</button>
                </div>
              </div>
              <div className="space-y-2">
                {activeLab?.students?.map((ls: any) => {
                  const sid = ls.studentId;
                  const currentStatus = attendanceMap[sid] || "PRESENT";
                  return (
                    <div key={sid} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                      <div><span className="font-bold text-xs text-white block">{ls.student?.name}</span><span className="text-[10px] text-slate-400 font-mono">{ls.student?.college || "IIIT"}</span></div>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {(["PRESENT", "LATE", "ABSENT"] as const).map((st) => (
                          <button key={st} type="button" onClick={() => setAttendanceMap((prev) => ({ ...prev, [sid]: st }))} className={`px-2.5 py-1 rounded transition-all font-bold ${currentStatus === st ? (st === "PRESENT" ? "bg-emerald-500 text-white" : st === "LATE" ? "bg-amber-500 text-white" : "bg-rose-500 text-white") : "bg-slate-800 text-slate-400 hover:text-white"}`}>{st}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-4 rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-3">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-emerald-400" />Schedule Session</h4>
              <form onSubmit={handleCreateSession} className="space-y-2.5">
                <input required placeholder="Session title (e.g. Lab Day 4)" value={newSessionTitle} onChange={(e) => setNewSessionTitle(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono" />
                <input placeholder="Topic (e.g. SIMD Vectorization)" value={newSessionTopic} onChange={(e) => setNewSessionTopic(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono" />
                <input type="date" required value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
                <button type="submit" disabled={creatingSession} className="w-full py-2 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50">{creatingSession ? "Creating..." : "Create Session"}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: DOUBTS ══ */}
      {activeTab === "doubts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-display font-bold text-white text-base">Student Queries</h3><div className="flex gap-1 text-[10px] font-mono">{(["ALL", "OPEN", "RESOLVED"] as const).map((f) => <button key={f} onClick={() => setDoubtFilter(f)} className={`px-2 py-0.5 rounded transition-all ${doubtFilter === f ? "bg-sky-500 text-white font-bold" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{f}</button>)}</div></div>
            <div className="space-y-2">
              {doubts.filter((d) => doubtFilter === "ALL" || d.status === doubtFilter).map((d) => (
                <div key={d.id} onClick={() => setSelectedDoubt(d)} className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedDoubt?.id === d.id ? "bg-sky-500/10 border-sky-500/40" : "bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700"}`}>
                  <div className="flex items-center justify-between mb-1"><span className="font-bold text-xs text-white truncate max-w-[180px]">{d.title}</span><span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${d.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{d.status}</span></div>
                  <span className="text-[10px] font-mono text-slate-500">From: {d.student?.name} • {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            {selectedDoubt ? (
              <div className="rounded-2xl p-5 bg-[#0F172A]/80 border border-slate-800/80 shadow-xl flex flex-col h-[520px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div><h3 className="font-display font-bold text-white text-base">{selectedDoubt.title}</h3><span className="text-[10px] font-mono text-slate-400">Author: {selectedDoubt.student?.name}</span></div>
                  <button onClick={() => handleToggleDoubtStatus(selectedDoubt.id, selectedDoubt.status)} className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${selectedDoubt.status === "RESOLVED" ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"}`}>{selectedDoubt.status === "RESOLVED" ? "Re-open Thread" : "Mark as Resolved ✓"}</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {selectedDoubt.messages?.map((m: any) => {
                    const isMentor = m.sender?.role === "MENTOR";
                    return (
                      <div key={m.id} className={`p-3.5 rounded-xl text-xs space-y-1 ${isMentor ? "bg-sky-950/30 border border-sky-500/30 mr-4" : "bg-slate-900 border border-slate-800 ml-4"}`}>
                        <div className="flex items-center justify-between text-[10px] font-mono"><strong className={isMentor ? "text-sky-400" : "text-brand-orange"}>{m.sender?.name || (isMentor ? "You" : "Candidate")}</strong><span className="text-slate-500">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                        <p className="text-slate-200 whitespace-pre-wrap font-sans">{m.body}</p>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input type="text" required placeholder="Provide technical solution..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="flex-1 bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 font-mono" />
                  <button type="submit" disabled={sendingReply} className="px-4 py-2 rounded-xl bg-sky-500 text-white font-mono text-xs font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /><span>Send</span></button>
                </form>
              </div>
            ) : <div className="rounded-2xl p-12 bg-[#0F172A]/70 border border-slate-800 text-center text-slate-500 font-mono text-xs">Select a doubt from the inbox to reply.</div>}
          </div>
        </div>
      )}

      {/* ══ TAB: FEEDBACK ══ */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-base">Student Appraisals ({feedbacks.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">No feedback received yet.</div>}
            {feedbacks.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <svg key={i} className={`w-3.5 h-3.5 ${i < f.rating ? "text-brand-gold fill-brand-gold" : "text-slate-700"}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase">{f.category}</span>
                </div>
                <p className="text-sm text-slate-200 font-sans italic">&quot;{f.comment}&quot;</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800"><span>From: {f.isAnonymous ? "Anonymous Candidate" : f.student?.name}</span><span>{new Date(f.createdAt).toLocaleDateString()}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB: ANNOUNCEMENTS ══ */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display font-bold text-white text-base">Published Announcements ({announcements.length})</h3>
            {announcements.length === 0 && <p className="text-slate-500 text-xs py-6 text-center font-mono">No announcements yet. Post one to notify your students.</p>}
            {announcements.map((a) => (
              <div key={a.id} className={`p-5 rounded-2xl bg-[#0F172A]/70 border space-y-2 ${a.pinned ? "border-brand-orange/40 shadow-[0_0_15px_rgba(240,124,39,0.1)]" : "border-slate-800/80"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2"><h4 className="font-bold text-white text-sm">{a.title}</h4>{a.pinned && <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/15 px-1.5 py-0.5 rounded border border-brand-orange/30">📌 Pinned</span>}</div>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{a.body}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F172A]/80 border border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-brand-orange" />Post Announcement</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <input required placeholder="Announcement title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono" />
              <textarea required rows={4} placeholder="Announcement body (supports plain text)..." value={annBody} onChange={(e) => setAnnBody(e.target.value)} className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono resize-none" />
              <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <input type="checkbox" checked={annPinned} onChange={(e) => setAnnPinned(e.target.checked)} className="w-4 h-4 accent-brand-orange rounded" />
                <div><span className="text-xs font-bold text-white block">Pin to top of dashboard</span><span className="text-[10px] text-slate-500 font-mono">Students will see this first</span></div>
              </label>
              {annSuccess && <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Announcement published to all students!</div>}
              <button type="submit" disabled={postingAnn} className="w-full py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50">{postingAnn ? "Publishing..." : "Publish Announcement"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
