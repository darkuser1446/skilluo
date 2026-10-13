"use client";

import { useEffect, useState, useMemo } from "react";
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
  Download,
} from "lucide-react";
import TestManager from "@/components/TestManager";
import { SkeletonCard, SkeletonMetric, SkeletonProfile } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { exportToExcel } from "@/utils/export";

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
  const [rosterSearch, setRosterSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceViewMode, setAttendanceViewMode] = useState<"register" | "mark">("register");
  const [attendanceRegisterFilter, setAttendanceRegisterFilter] = useState<string>("ALL");
  const [markingQuick, setMarkingQuick] = useState<string | null>(null);
  const [attendanceFeedbackMsg, setAttendanceFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");

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
        (d: any) => setSessions(d.data.sessions || []),
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

  const handleQuickMarkStudent = async (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" = "PRESENT") => {
    const currentLab = labs.find((l) => l.id === selectedLabId) || labs[0];
    if (!activeWsId || !currentLab?.id) return;
    setMarkingQuick(studentId);
    setAttendanceFeedbackMsg(null);
    try {
      const res = await fetch("/api/attendance/quick-mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: activeWsId,
          labId: currentLab.id,
          sessionId: activeSession?.id,
          studentId,
          status,
          markAll: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
        if (data.data?.session) {
          setActiveSession(data.data.session);
          setSessions((prev) => {
            const exists = prev.some((s) => s.id === data.data.session.id);
            if (exists) {
              return prev.map((s) => (s.id === data.data.session.id ? data.data.session : s));
            }
            return [data.data.session, ...prev];
          });
        }
        setAttendanceFeedbackMsg({ text: `✓ Marked candidate as ${status}!`, type: "success" });
        setTimeout(() => setAttendanceFeedbackMsg(null), 3000);
      } else {
        setAttendanceFeedbackMsg({ text: data.error?.message || "Failed to mark attendance", type: "error" });
      }
    } catch (err) {
      setAttendanceFeedbackMsg({ text: "Network error while marking attendance", type: "error" });
    } finally {
      setMarkingQuick(null);
    }
  };

  const handleQuickMarkAll = async (status: "PRESENT" | "ABSENT" | "LATE" = "PRESENT") => {
    const currentLab = labs.find((l) => l.id === selectedLabId) || labs[0];
    if (!activeWsId || !currentLab?.id) return;
    setMarkingQuick("ALL");
    setAttendanceFeedbackMsg(null);
    try {
      const res = await fetch("/api/attendance/quick-mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: activeWsId,
          labId: currentLab.id,
          sessionId: activeSession?.id,
          markAll: true,
          status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMap = { ...attendanceMap };
        currentLab?.students?.forEach((s: any) => {
          newMap[s.studentId] = status;
        });
        setAttendanceMap(newMap);
        if (data.data?.session) {
          setActiveSession(data.data.session);
          setSessions((prev) => {
            const exists = prev.some((s) => s.id === data.data.session.id);
            if (exists) {
              return prev.map((s) => (s.id === data.data.session.id ? data.data.session : s));
            }
            return [data.data.session, ...prev];
          });
        }
        setAttendanceFeedbackMsg({
          text: `✓ Successfully marked all ${data.data?.count || currentLab?.students?.length || 0} candidates as ${status}!`,
          type: "success",
        });
        setTimeout(() => setAttendanceFeedbackMsg(null), 4000);
      } else {
        setAttendanceFeedbackMsg({ text: data.error?.message || "Failed to mark all candidates", type: "error" });
      }
    } catch (err) {
      setAttendanceFeedbackMsg({ text: "Network error while marking attendance", type: "error" });
    } finally {
      setMarkingQuick(null);
    }
  };

  const handleSaveAttendance = async () => {
    const currentLab = labs.find((l) => l.id === selectedLabId) || labs[0];
    if (!activeWsId || !currentLab?.id) return;
    setSavingAttendance(true);
    setAttendanceFeedbackMsg(null);
    try {
      if (activeSession) {
        const records = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status }));
        const res = await fetch(`/api/attendance/sessions/${activeSession.id}/mark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        });
        if (res.ok) {
          setAttendanceFeedbackMsg({ text: "✓ Attendance records successfully saved!", type: "success" });
          setTimeout(() => setAttendanceFeedbackMsg(null), 3000);
        } else {
          setAttendanceFeedbackMsg({ text: "Failed to save attendance records", type: "error" });
        }
      } else {
        await handleQuickMarkAll("PRESENT");
      }
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT" | "LATE") => {
    handleQuickMarkAll(status);
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

  // Active lab's sessions sorted descending (Day 2 first, Day 1 second)
  const activeLabSessions = useMemo(() => {
    return sessions
      .filter((s) => !s.labId || s.labId === (selectedLabId || activeLab?.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, selectedLabId, activeLab?.id]);

  // Keep activeSession and attendanceMap synced to the currently selected lab
  useEffect(() => {
    if (activeLabSessions.length > 0) {
      const match = activeLabSessions.find((s) => s.id === activeSession?.id) || activeLabSessions[0];
      setActiveSession(match);
      const map: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
      match.attendanceRecords?.forEach((r: any) => {
        map[r.studentId] = r.status;
      });
      setAttendanceMap(map);
    } else {
      setActiveSession(null);
      setAttendanceMap({});
    }
  }, [selectedLabId, activeLabSessions]);

  const filteredRosterStudents = (activeLab?.students || []).filter((ls: any) => {
    if (!rosterSearch.trim()) return true;
    const q = rosterSearch.toLowerCase();
    const st = ls.student;
    return (
      st?.name?.toLowerCase().includes(q) ||
      st?.rollNumber?.toLowerCase().includes(q) ||
      st?.email?.toLowerCase().includes(q) ||
      st?.phone?.toLowerCase().includes(q) ||
      st?.branch?.toLowerCase().includes(q) ||
      st?.college?.toLowerCase().includes(q)
    );
  });

  // Calculate attendance summary for all students in active lab
  const labAttendanceSummary = useMemo(() => {
    const summary: Record<
      string,
      {
        totalSessions: number;
        attendedCount: number;
        lateCount: number;
        absentCount: number;
        recordsByDate: { sessionDate: string; sessionTitle: string; status: string }[];
        percentage: number | null;
      }
    > = {};

    const labStudents = activeLab?.students || [];
    const labSessions = sessions.filter((s) => s.labId === activeLab?.id);

    labStudents.forEach((ls: any) => {
      summary[ls.studentId] = {
        totalSessions: 0,
        attendedCount: 0,
        lateCount: 0,
        absentCount: 0,
        recordsByDate: [],
        percentage: null,
      };
    });

    const sorted = [...labSessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((sess) => {
      const records = sess.attendanceRecords || [];
      const sessDateStr = new Date(sess.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      records.forEach((rec: any) => {
        if (!summary[rec.studentId]) {
          summary[rec.studentId] = {
            totalSessions: 0,
            attendedCount: 0,
            lateCount: 0,
            absentCount: 0,
            recordsByDate: [],
            percentage: null,
          };
        }
        const s = summary[rec.studentId];
        s.totalSessions += 1;
        if (rec.status === "PRESENT") {
          s.attendedCount += 1;
        } else if (rec.status === "LATE") {
          s.lateCount += 1;
          s.attendedCount += 1;
        } else if (rec.status === "ABSENT") {
          s.absentCount += 1;
        }

        s.recordsByDate.push({
          sessionDate: sessDateStr,
          sessionTitle: sess.title,
          status: rec.status,
        });
      });
    });

    Object.keys(summary).forEach((sid) => {
      const s = summary[sid];
      s.percentage = s.totalSessions > 0 ? Math.round((s.attendedCount / s.totalSessions) * 100) : null;
    });

    return summary;
  }, [activeLab, sessions]);

  const labDistinctDates = useMemo(() => {
    const labSessions = sessions.filter((s) => s.labId === activeLab?.id);
    const dateMap = new Map<string, { date: Date; title: string }>();
    labSessions.forEach((sess) => {
      const dStr = new Date(sess.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      if (!dateMap.has(dStr)) {
        dateMap.set(dStr, { date: new Date(sess.date), title: sess.title });
      }
    });
    return Array.from(dateMap.entries()).sort(
      (a, b) => a[1].date.getTime() - b[1].date.getTime()
    );
  }, [activeLab, sessions]);

  const activeLabAttendanceTotals = useMemo(() => {
    const labStudents = activeLab?.students || [];
    const totalStudents = labStudents.length;
    let present = 0;
    let absent = 0;
    let pending = 0;

    if (selectedDayFilter === "ALL") {
      const days = labDistinctDates.length > 0 ? labDistinctDates : [["12 Oct"]];
      days.forEach(([dStr]) => {
        labStudents.forEach((ls: any) => {
          const sum = labAttendanceSummary[ls.studentId];
          const rec = sum?.recordsByDate.find((r) => r.sessionDate === dStr);
          if (rec?.status === "PRESENT") present += 1;
          else if (rec?.status === "ABSENT") absent += 1;
          else pending += 1;
        });
      });
    } else {
      labStudents.forEach((ls: any) => {
        const sum = labAttendanceSummary[ls.studentId];
        const rec = sum?.recordsByDate.find((r) => r.sessionDate === selectedDayFilter);
        if (rec?.status === "PRESENT") present += 1;
        else if (rec?.status === "ABSENT") absent += 1;
        else pending += 1;
      });
    }

    const totalMarked = present + absent;
    const percentage = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : null;

    return { totalStudents, present, absent, pending, percentage };
  }, [activeLab, labDistinctDates, labAttendanceSummary, selectedDayFilter]);

  const filteredAttendanceStudents = (activeLab?.students || []).filter((ls: any) => {
    const sum = labAttendanceSummary[ls.studentId];
    if (attendanceRegisterFilter === "PRESENT") {
      if (!sum || sum.attendedCount === 0) return false;
    } else if (attendanceRegisterFilter === "ABSENT") {
      if (!sum || sum.absentCount === 0) return false;
    } else if (attendanceRegisterFilter === "LATE") {
      if (!sum || sum.lateCount === 0) return false;
    }

    if (!attendanceSearch.trim()) return true;
    const q = attendanceSearch.toLowerCase();
    const st = ls.student;
    return (
      st?.name?.toLowerCase().includes(q) ||
      st?.rollNumber?.toLowerCase().includes(q) ||
      st?.email?.toLowerCase().includes(q) ||
      st?.phone?.toLowerCase().includes(q) ||
      st?.branch?.toLowerCase().includes(q) ||
      st?.college?.toLowerCase().includes(q)
    );
  });

  const handleExportRoster = () => {
    const headers = [
      "Registration Number",
      "Candidate Name",
      "Email",
      "Phone",
      "Branch",
      "Semester",
      "Lab Track",
      "Enrolled Date",
    ];
    const rows = (activeLab?.students || []).map((ls: any) => [
      ls.student?.rollNumber || "N/A",
      ls.student?.name || "N/A",
      ls.student?.email || "N/A",
      ls.student?.phone || "N/A",
      ls.student?.branch || "N/A",
      ls.student?.semester || "N/A",
      activeLab?.name || "Lab",
      new Date(ls.enrolledAt).toLocaleDateString(),
    ]);

    exportToExcel(
      `skillup_roster_${(activeLab?.name || "lab").replace(/\s+/g, "_")}.csv`,
      headers,
      rows
    );
  };

  const handleExportLabAttendance = () => {
    const headers = [
      "Registration Number",
      "Candidate Name",
      "Email Address",
      "Phone",
      "Branch",
      "Semester",
      "Lab Track",
      "Total Sessions Held",
      "Sessions Attended",
      "Attendance Percentage",
      ...labDistinctDates.map(([d]) => `Session (${d})`),
    ];

    const rows = filteredAttendanceStudents.map((ls: any) => {
      const st = ls.student;
      const sum = labAttendanceSummary[ls.studentId];
      const dateStatuses = labDistinctDates.map(([d]) => {
        const found = sum?.recordsByDate.find((r) => r.sessionDate === d);
        return found ? found.status : "PENDING";
      });

      return [
        st?.rollNumber || "N/A",
        st?.name || "N/A",
        st?.email || "N/A",
        st?.phone || "N/A",
        st?.branch || "N/A",
        st?.semester || "N/A",
        activeLab?.name || "Lab",
        sum ? sum.totalSessions : 0,
        sum ? sum.attendedCount : 0,
        sum ? `${sum.percentage}%` : "0%",
        ...dateStatuses,
      ];
    });

    exportToExcel(
      `skillup_attendance_${(activeLab?.name || "lab").replace(/\s+/g, "_")}.csv`,
      headers,
      rows
    );
  };

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
        <TestManager
          workshopId={activeWsId}
          labs={labs}
          isMentorView={true}
          mentorLabId={selectedLabId}
          defaultType="TEST"
        />
      )}

      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
                Enrolled Candidates — {activeLab?.name}
              </h3>
              <p className="text-xs text-slate-600 font-mono">
                Inspect candidate credentials, search cohort, and mark real-time laboratory attendance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#111111] bg-[#FFF0E5] px-3 py-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                Total: {activeLab?.students?.length || 0} Engineers
              </span>
              <button
                onClick={() => handleQuickMarkAll("PRESENT")}
                disabled={markingQuick === "ALL"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-950 font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                title="Mark all candidates in this lab present for today's session"
              >
                {markingQuick === "ALL" ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
                    <span>Marking All...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✓ Present All</span>
                  </>
                )}
              </button>
              <button
                onClick={handleExportRoster}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFF0E5] text-[#111111] font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Download Lab Roster as Excel spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-[#F07C27]" />
                <span>Export to Excel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("attendance");
                  setAttendanceViewMode("register");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-[#F07C27] text-white font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Open comprehensive lab attendance presence register"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#F07C27]" />
                <span>📋 Attendance Register</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {attendanceFeedbackMsg && (
            <div className={`p-3 border-[2px] border-[#111111] font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_#111111] animate-in fade-in ${
              attendanceFeedbackMsg.type === "success" ? "bg-[#e6f4ea] text-emerald-900" : "bg-rose-100 text-rose-900"
            }`}>
              <span className="font-bold">{attendanceFeedbackMsg.text}</span>
              <button onClick={() => setAttendanceFeedbackMsg(null)} className="font-bold hover:underline">✕</button>
            </div>
          )}

          {/* Student Search Area */}
          <div className="bg-white border-[2px] border-[#111111] p-3 shadow-[3px_3px_0px_#111111] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates by name, roll number, email, or branch..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full bg-[#F9F9F9] border border-[#111111] pl-9 pr-8 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:bg-[#FFF0E5] shadow-[1px_1px_0px_#111111]"
              />
              {rosterSearch && (
                <button
                  onClick={() => setRosterSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#111111] font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-600 font-bold self-end sm:self-center">
              Showing {filteredRosterStudents.length} of {activeLab?.students?.length || 0} candidates
            </div>
          </div>

          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] font-mono uppercase font-bold text-[10px] tracking-wider">
                    <th className="sticky left-0 bg-[#FFF0E5] z-10 py-3 px-4 border-r border-[#111111]">Candidate</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Reg. Number</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Email / Phone</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Branch & Sem</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Attendance</th>
                    <th className="py-3 px-4 border-r border-[#111111]">Enrolled At</th>
                    <th className="py-3 px-4 text-right">Attendance & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20 font-mono">
                  {(!activeLab?.students || activeLab.students.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-8">
                        <EmptyState
                          icon={Users}
                          title="No Students Enrolled"
                          description="No students have been assigned to this lab yet. Allocated engineers will appear in this roster."
                        />
                      </td>
                    </tr>
                  )}
                  {activeLab?.students?.length > 0 && filteredRosterStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No candidates match query: "{rosterSearch}"
                      </td>
                    </tr>
                  )}
                  {filteredRosterStudents.map((ls: any) => {
                    const st = ls.student;
                    const initials = st?.name ? st.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "S";
                    const isPresent = attendanceMap[ls.studentId] === "PRESENT";
                    const sum = labAttendanceSummary[ls.studentId];
                    const pct = sum?.percentage ?? 100;
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
                        <td className="py-3 px-4 whitespace-nowrap border-r border-[#111111]/20">
                          <span className="px-2 py-0.5 bg-[#FFF0E5] border border-[#111111] text-[#111111] font-bold text-[11px] shadow-[1px_1px_0px_#111111]">
                            {st?.rollNumber || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 border-r border-[#111111]/20">
                          <div className="font-mono text-xs">{st?.email}</div>
                          {st?.phone && (
                            <div className="text-[10px] text-slate-500 font-bold font-mono">{st.phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono border-r border-[#111111]/20 whitespace-nowrap">
                          {st?.branch || st?.college || "CSE"} {st?.semester ? `(${st.semester})` : ""}
                        </td>
                        <td className="py-3 px-4 border-r border-[#111111]/20 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className={`px-2 py-0.5 border border-[#111111] font-bold text-[10px] shadow-[1px_1px_0px_#111111] ${
                              pct >= 85 ? "bg-emerald-100 text-emerald-950 border-emerald-900" : pct >= 75 ? "bg-amber-100 text-amber-950 border-amber-900" : "bg-rose-100 text-rose-950 border-rose-900"
                            }`}>
                              {pct}%
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold">
                              ({sum ? sum.attendedCount : 1}/{sum ? sum.totalSessions || 1 : 1})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 border-r border-[#111111]/20 whitespace-nowrap">{new Date(ls.enrolledAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Present Button beside each student */}
                            {isPresent ? (
                              <button
                                onClick={() => handleQuickMarkStudent(ls.studentId, "ABSENT")}
                                disabled={markingQuick === ls.studentId}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-rose-600 text-white font-mono text-[10px] font-black uppercase border border-[#111111] shadow-[1px_1px_0px_#111111] transition-all flex items-center gap-1 cursor-pointer"
                                title="Marked Present — Click to toggle Absent"
                              >
                                <span>✓ PRESENT</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickMarkStudent(ls.studentId, "PRESENT")}
                                disabled={markingQuick === ls.studentId}
                                className="px-2.5 py-1 bg-[#FFF0E5] hover:bg-emerald-600 hover:text-white text-[#111111] font-mono text-[10px] font-black uppercase border border-[#111111] shadow-[1px_1px_0px_#111111] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Click to mark this student PRESENT"
                              >
                                {markingQuick === ls.studentId ? (
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <span>+ Present</span>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => setActiveTab("review")}
                              className="px-2 py-1 border border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] hover:shadow-none transition-all whitespace-nowrap cursor-pointer"
                            >
                              Review →
                            </button>
                          </div>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#111111]">{s.student?.name || "Student"}</span>
                        {s.student?.rollNumber && (
                          <span className="px-1.5 py-0.5 bg-[#FFF0E5] border border-[#111111] font-mono font-bold text-[10px] text-[#111111]">
                            {s.student.rollNumber}
                          </span>
                        )}
                      </div>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight">
                        {selectedSubmission.student?.name}
                      </h3>
                      {selectedSubmission.student?.rollNumber && (
                        <span className="px-2 py-0.5 bg-[#FFF0E5] border border-[#111111] font-mono font-bold text-xs text-[#111111]">
                          REG: {selectedSubmission.student.rollNumber}
                        </span>
                      )}
                    </div>
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
      {activeTab === "assignments" && activeWsId && (
        <>
          <TestManager
            workshopId={activeWsId}
            labs={labs}
            isMentorView={true}
            mentorLabId={selectedLabId}
            defaultType="ASSIGNMENT"
          />
          <button className="hidden" disabled={creatingAssignment}>Deploy Assignment</button>
        </>
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
          {/* Top Header & View Switcher */}
          <div className="bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-600 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white">
                  <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
                </span>
                <h3 className="font-display font-black text-xl uppercase text-[#111111] tracking-tight">
                  {activeLab?.name || "Laboratory"} · Attendance Presence Portal
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-1">
                Inspect complete student attendance presence history, track day-by-day check-ins, and enforce one attendance session per day.
              </p>
            </div>

            {/* Segmented Control */}
            <div className="flex items-center gap-1.5 bg-[#F4F3F3] p-1 border-[2px] border-[#111111]">
              <button
                type="button"
                onClick={() => setAttendanceViewMode("register")}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  attendanceViewMode === "register"
                    ? "bg-[#111111] text-white shadow-[2px_2px_0px_#111111]"
                    : "bg-transparent text-slate-700 hover:text-[#111111]"
                }`}
              >
                <span>📋 All Students Presence Register</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendanceViewMode("mark")}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  attendanceViewMode === "mark"
                    ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                    : "bg-transparent text-slate-700 hover:text-[#111111]"
                }`}
              >
                <span>⚡ Daily Check-In & Schedule</span>
              </button>
            </div>
          </div>

          {/* Feedback Message Banner */}
          {attendanceFeedbackMsg && (
            <div className={`p-3 border-[2px] border-[#111111] font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_#111111] animate-in fade-in ${
              attendanceFeedbackMsg.type === "success" ? "bg-[#e6f4ea] text-emerald-900" : "bg-rose-100 text-rose-900"
            }`}>
              <span className="font-bold">{attendanceFeedbackMsg.text}</span>
              <button onClick={() => setAttendanceFeedbackMsg(null)} className="font-bold hover:underline">✕</button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 1: LAB ATTENDANCE REGISTER & PRESENCE TABLE
          ══════════════════════════════════════════════════════════ */}
          {attendanceViewMode === "register" && (
            <div className="space-y-5">
              {/* Lab Attendance KPI Ribbon */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#FFF0E5] border-[2px] border-[#111111] p-3.5 shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
                    Lab Cohort Size
                  </div>
                  <div className="font-display font-black text-2xl text-[#111111] mt-0.5">
                    {activeLabAttendanceTotals.totalStudents}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 font-bold">
                    {activeLab?.name || "Laboratory"}
                  </div>
                </div>

                <div className="bg-[#e6f4ea] border-[2px] border-[#111111] p-3.5 shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                    {selectedDayFilter === "ALL" ? "Days Scheduled" : "Active Day View"}
                  </div>
                  <div className="font-display font-black text-2xl text-emerald-950 mt-0.5">
                    {selectedDayFilter === "ALL" ? (labDistinctDates.length > 0 ? labDistinctDates.length : 2) : selectedDayFilter}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 mt-0.5 font-bold">
                    {selectedDayFilter === "ALL"
                      ? "Day 1 (12 Oct) & Day 2 (13 Oct)"
                      : selectedDayFilter === "12 Oct"
                      ? "Day 1 Inaugural Lab"
                      : "Day 2 Lab Session"}
                  </div>
                </div>

                <div className="bg-emerald-50 border-[2px] border-[#111111] p-3.5 shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                    {selectedDayFilter === "ALL" ? "Lab Presence Rate" : `${selectedDayFilter} Presence`}
                  </div>
                  <div className="font-display font-black text-2xl text-emerald-950 mt-0.5">
                    {activeLabAttendanceTotals.percentage !== null ? `${activeLabAttendanceTotals.percentage}%` : "Pending"}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 mt-0.5 font-bold">
                    {activeLabAttendanceTotals.percentage !== null
                      ? `${activeLabAttendanceTotals.present} Present / ${activeLabAttendanceTotals.totalStudents}`
                      : "Session Not Yet Recorded"}
                  </div>
                </div>

                <div className="bg-[#FFF9E6] border-[2px] border-[#111111] p-3.5 shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                    {selectedDayFilter === "ALL" ? "Pending / Quota" : `${selectedDayFilter} Pending`}
                  </div>
                  <div className="font-display font-black text-2xl text-[#111111] mt-0.5">
                    {activeLabAttendanceTotals.pending}
                  </div>
                  <div className="text-[10px] font-mono text-amber-700 mt-0.5 font-bold">
                    {activeLabAttendanceTotals.absent} Absences Recorded · 1 Sess/Day
                  </div>
                </div>
              </div>

              {/* ── DAY FILTER BUTTONS ── */}
              <div className="bg-white border-[3px] border-[#111111] p-3.5 shadow-[4px_4px_0px_#111111] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase text-slate-800">
                    Filter By Day:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter("ALL")}
                    className={`px-3 py-1.5 font-mono text-xs font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer shadow-[2px_2px_0px_#111111] ${
                      selectedDayFilter === "ALL"
                        ? "bg-[#111111] text-white"
                        : "bg-[#F4F3F3] text-[#111111] hover:bg-white"
                    }`}
                  >
                    📊 All Days Overview
                  </button>
                  {labDistinctDates.map(([dStr], idx) => (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => setSelectedDayFilter(dStr)}
                      className={`px-3 py-1.5 font-mono text-xs font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer shadow-[2px_2px_0px_#111111] ${
                        selectedDayFilter === dStr
                          ? "bg-[#F07C27] text-white"
                          : "bg-[#F4F3F3] text-[#111111] hover:bg-white"
                      }`}
                    >
                      📅 Day {idx + 1} ({dStr})
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono font-bold text-slate-600">
                  Active Filter: <span className="text-[#111111] uppercase font-black">{selectedDayFilter === "ALL" ? "All Days Overview" : selectedDayFilter}</span>
                </div>
              </div>

              {/* ── LAB ATTENDANCE SUMMARY TABLE ── */}
              <div className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden">
                <div className="p-3.5 bg-[#F4F3F3] border-b-[2px] border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-display font-black text-sm uppercase text-[#111111] tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]" />
                      <span>{activeLab?.name || "Laboratory"} · Attendance Summary</span>
                      <span className="px-2 py-0.5 bg-white border border-[#111111] text-[10px] font-mono font-bold">
                        {selectedDayFilter === "ALL" ? "All Days Combined" : `Day: ${selectedDayFilter}`}
                      </span>
                    </h4>
                    <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                      Verified lab track attendance audit. Pending students are not counted as Present or Absent.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#111111] text-white uppercase text-[10px] tracking-wider border-b border-[#111111]">
                        <th className="py-2.5 px-4 min-w-[200px]">Lab Track</th>
                        <th className="py-2.5 px-3 text-center min-w-[110px]">Total Students</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-emerald-400">Present</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-rose-400">Absent</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-amber-300">Pending</th>
                        <th className="py-2.5 px-4 text-right min-w-[120px]">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/20 bg-white">
                      <tr className="hover:bg-[#FFF0E5]/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-[#111111] border-r border-[#111111]/20">
                          <div className="flex items-center gap-2">
                            <span>🏛️</span>
                            <span>{activeLab?.name || "Laboratory"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#111111] border-r border-[#111111]/20">
                          {activeLabAttendanceTotals.totalStudents}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-[#111111]/20">
                          {activeLabAttendanceTotals.present}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/50 border-r border-[#111111]/20">
                          {activeLabAttendanceTotals.absent}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50 border-r border-[#111111]/20">
                          {activeLabAttendanceTotals.pending}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold">
                          {activeLabAttendanceTotals.percentage !== null ? (
                            <span className={`px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111] text-[11px] font-black ${
                              activeLabAttendanceTotals.percentage >= 85
                                ? "bg-emerald-600 text-white"
                                : activeLabAttendanceTotals.percentage >= 75
                                ? "bg-amber-500 text-white"
                                : "bg-rose-600 text-white"
                            }`}>
                              {activeLabAttendanceTotals.percentage}%
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Search & Actions Strip */}
              <div className="bg-white border-[3px] border-[#111111] p-4 shadow-[5px_5px_0px_#111111] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, roll number, email, phone, or branch..."
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-8 py-2 text-xs font-mono text-[#111111] placeholder:text-slate-500 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#111111]"
                  />
                  {attendanceSearch && (
                    <button
                      onClick={() => setAttendanceSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#111111] font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={attendanceRegisterFilter}
                    onChange={(e) => setAttendanceRegisterFilter(e.target.value)}
                    className="bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">Filter: All Students</option>
                    <option value="PRESENT">✓ Present in Sessions</option>
                    <option value="LATE">⏱️ Late in Sessions</option>
                    <option value="ABSENT">❌ Absent in Sessions</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportLabAttendance}
                    className="px-3 py-2 bg-[#F07C27] hover:bg-[#d96614] text-white border-[2px] border-[#111111] font-mono text-xs font-bold shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title="Export Lab Attendance to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickMarkAll("PRESENT")}
                    disabled={markingQuick === "ALL"}
                    className="px-3 py-2 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-950 border-[2px] border-[#111111] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#111111] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    title="Mark all candidates in this lab present"
                  >
                    {markingQuick === "ALL" ? (
                      <>
                        <span className="w-3 h-3 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
                        <span>Marking...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>✓ Present All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Lab Attendance Presence Register Table */}
              <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#111111] text-white uppercase text-[10px] tracking-wider border-b border-[#111111]">
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-4 min-w-[200px]">Candidate Name & Roll</th>
                        <th className="py-3 px-3 min-w-[180px]">Contact & Branch</th>
                        <th className="py-3 px-3 text-center min-w-[90px]">Sessions</th>
                        <th className="py-3 px-3 text-center min-w-[100px]">Attendance %</th>
                        {selectedDayFilter === "ALL" ? (
                          labDistinctDates.map(([dateStr]) => (
                            <th key={dateStr} className="py-3 px-3 text-center min-w-[120px] bg-slate-900 border-l border-slate-700">
                              {dateStr}
                            </th>
                          ))
                        ) : (
                          <th className="py-3 px-3 text-center min-w-[130px] bg-[#F07C27] text-white border-l border-slate-700">
                            Attendance ({selectedDayFilter})
                          </th>
                        )}
                        <th className="py-3 px-4 text-right min-w-[140px]">Toggle Presence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/20 bg-white">
                      {filteredAttendanceStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6 + (selectedDayFilter === "ALL" ? labDistinctDates.length : 1)} className="p-8 text-center text-slate-500 font-mono text-xs">
                            No students match the search criteria in this laboratory.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendanceStudents.map((ls: any, idx: number) => {
                          const sid = ls.studentId;
                          const st = ls.student;
                          const initials = st?.name ? st.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "S";
                          const sum = labAttendanceSummary[sid];
                          const isAllDays = selectedDayFilter === "ALL";
                          const dayRecord = !isAllDays ? sum?.recordsByDate.find((r) => r.sessionDate === selectedDayFilter) : null;
                          const dayStatus = dayRecord ? dayRecord.status : null;
                          const displayPct = isAllDays ? sum?.percentage : dayStatus === "PRESENT" ? 100 : dayStatus === "ABSENT" ? 0 : null;
                          const currentStatus = attendanceMap[sid] || null;
                          const isMarkingThis = markingQuick === sid;

                          return (
                            <tr key={sid} className="hover:bg-[#FFF0E5]/40 transition-colors">
                              {/* Index */}
                              <td className="py-3 px-3 text-center text-slate-500 font-bold border-r border-[#111111]/20">
                                {idx + 1}
                              </td>

                              {/* Candidate Name & Roll */}
                              <td className="py-3 px-4 border-r border-[#111111]/20">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 bg-[#FFF0E5] border border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center font-bold text-[11px] text-[#111111] shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#111111] block whitespace-nowrap">
                                      {st?.name}
                                    </span>
                                    {st?.rollNumber ? (
                                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-[#FFF0E5] border border-[#111111] text-[10px] font-bold text-[#111111]">
                                        {st.rollNumber}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-bold">No Roll No</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Contact & Branch */}
                              <td className="py-3 px-3 border-r border-[#111111]/20 text-[11px]">
                                <div className="font-bold text-slate-800">
                                  {st?.branch || "CSE"} {st?.semester ? `(Sem ${st.semester})` : ""}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                                  {st?.email || st?.phone || "—"}
                                </div>
                              </td>

                              {/* Sessions Attended / Total */}
                              <td className="py-3 px-3 text-center border-r border-[#111111]/20 font-bold">
                                <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] shadow-[1px_1px_0px_#111111]">
                                  {isAllDays
                                    ? sum ? `${sum.attendedCount}/${sum.totalSessions || 1}` : "0/1"
                                    : dayStatus === "PRESENT" ? "1/1" : dayStatus === "ABSENT" ? "0/1" : "0/0"}
                                </span>
                              </td>

                              {/* Attendance % */}
                              <td className="py-3 px-3 text-center border-r border-[#111111]/20">
                                <div className="flex flex-col items-center gap-1">
                                  {displayPct !== null && displayPct !== undefined ? (
                                    <span className={`px-2 py-0.5 text-[11px] font-black border border-[#111111] shadow-[1px_1px_0px_#111111] ${
                                      displayPct >= 85
                                        ? "bg-emerald-600 text-white"
                                        : displayPct >= 75
                                        ? "bg-amber-500 text-white"
                                        : "bg-rose-600 text-white"
                                    }`}>
                                      {displayPct}%
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-bold border border-slate-300 bg-slate-100 text-slate-700">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Date Columns */}
                              {isAllDays ? (
                                labDistinctDates.map(([dateStr]) => {
                                  const foundRecord = sum?.recordsByDate.find((r) => r.sessionDate === dateStr);
                                  const status = foundRecord ? foundRecord.status : null;

                                  return (
                                    <td key={dateStr} className="py-3 px-3 text-center border-r border-[#111111]/20 bg-slate-50/50">
                                      {status === "PRESENT" ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-900 font-black text-[10px] shadow-[1px_1px_0px_#111111]">
                                          <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                          <span>PRESENT</span>
                                        </span>
                                      ) : status === "LATE" ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-900 font-black text-[10px]">
                                          <span>LATE</span>
                                        </span>
                                      ) : status === "ABSENT" ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-950 border border-rose-900 font-black text-[10px]">
                                          <span>ABSENT</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px]">
                                          <span>⏳ PENDING</span>
                                        </span>
                                      )}
                                    </td>
                                  );
                                })
                              ) : (
                                <td className="py-3 px-3 text-center border-r border-[#111111]/20 bg-slate-50/50">
                                  {dayStatus === "PRESENT" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-900 font-black text-[10px] shadow-[1px_1px_0px_#111111]">
                                      <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                      <span>PRESENT</span>
                                    </span>
                                  ) : dayStatus === "LATE" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-900 font-black text-[10px]">
                                      <span>LATE</span>
                                    </span>
                                  ) : dayStatus === "ABSENT" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-950 border border-rose-900 font-black text-[10px]">
                                      <span>ABSENT</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px]">
                                      <span>⏳ PENDING</span>
                                    </span>
                                  )}
                                </td>
                              )}

                              {/* Quick Presence Toggle Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1 font-mono text-[10px]">
                                  <button
                                    type="button"
                                    disabled={isMarkingThis}
                                    onClick={() => handleQuickMarkStudent(sid, currentStatus === "PRESENT" ? "ABSENT" : "PRESENT")}
                                    className={`px-2.5 py-1 border border-[#111111] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      currentStatus === "PRESENT"
                                        ? "bg-emerald-600 text-white shadow-[1px_1px_0px_#111111]"
                                        : "bg-white text-emerald-900 hover:bg-emerald-100"
                                    }`}
                                    title="Toggle student presence status"
                                  >
                                    {isMarkingThis ? (
                                      <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <span>{currentStatus === "PRESENT" ? "✓ Present" : "+ Mark"}</span>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isMarkingThis}
                                    onClick={() => handleQuickMarkStudent(sid, "ABSENT")}
                                    className={`px-1.5 py-1 border border-[#111111] font-bold transition-all cursor-pointer ${
                                      currentStatus === "ABSENT"
                                        ? "bg-rose-600 text-white shadow-[1px_1px_0px_#111111]"
                                        : "bg-white text-slate-600 hover:bg-rose-50"
                                    }`}
                                    title="Mark Absent"
                                  >
                                    Abs
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-3 bg-[#F4F3F3] border-t-[2px] border-[#111111] flex items-center justify-between text-xs font-mono text-slate-700 font-bold">
                  <span>
                    Showing {filteredAttendanceStudents.length} of {activeLab?.students?.length || 0} candidates in {activeLab?.name} register
                  </span>
                  <button
                    type="button"
                    onClick={handleExportLabAttendance}
                    className="text-[#F07C27] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Lab Register (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 2: DAILY ATTENDANCE CHECK-IN & SESSION SCHEDULER
          ══════════════════════════════════════════════════════════ */}
          {attendanceViewMode === "mark" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[2px] border-[#111111] pb-3">
                  <div>
                    <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
                      Mark Session Attendance
                    </h3>
                    <p className="text-xs text-slate-700 font-mono">
                      Active: <strong className="text-[#111111]">{activeSession?.title || "Today's Lab Session (Auto-Managed)"}</strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={activeSession?.id || ""}
                      onChange={(e) => {
                        const s = activeLabSessions.find((x) => x.id === e.target.value);
                        setActiveSession(s || null);
                        if (s) {
                          const map: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
                          s.attendanceRecords?.forEach((r: any) => { map[r.studentId] = r.status; });
                          setAttendanceMap(map);
                        } else {
                          setAttendanceMap({});
                        }
                      }}
                      className="bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none cursor-pointer max-w-[200px] truncate"
                    >
                      {activeLabSessions.length === 0 && (
                        <option value="">No Sessions Scheduled</option>
                      )}
                      {activeLabSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}{s.startTime ? ` · ${s.startTime}${s.endTime ? `–${s.endTime}` : ""}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleQuickMarkAll("PRESENT")}
                      disabled={markingQuick === "ALL"}
                      className="px-3 py-1 border-[2px] border-[#111111] bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-950 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#111111] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      title="Mark all enrolled students in this lab PRESENT immediately"
                    >
                      {markingQuick === "ALL" ? (
                        <>
                          <span className="w-3 h-3 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
                          <span>Marking All...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>✓ Present All</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                      className="px-3 py-1 border-[2px] border-[#111111] bg-[#F07C27] text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
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

                {/* Attendance Search Bar */}
                <div className="bg-[#F9F9F9] border-[2px] border-[#111111] p-2.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#111111]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search candidate by name, roll number, email, or branch..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="w-full bg-white border border-[#111111] pl-9 pr-8 py-1.5 text-xs font-mono text-[#111111] focus:outline-none focus:bg-[#FFF0E5]"
                    />
                    {attendanceSearch && (
                      <button
                        onClick={() => setAttendanceSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#111111] font-bold text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 font-bold whitespace-nowrap">
                    {filteredAttendanceStudents.length} of {activeLab?.students?.length || 0} Students
                  </span>
                </div>
                <div className="space-y-2">
                  {(!activeLab?.students || activeLab.students.length === 0) && (
                    <div className="py-8 text-center text-slate-500 font-mono text-xs">
                      No students currently allocated to this laboratory track.
                    </div>
                  )}
                  {activeLab?.students?.length > 0 && filteredAttendanceStudents.length === 0 && (
                    <div className="py-6 text-center text-slate-500 font-mono text-xs">
                      No candidates match query: "{attendanceSearch}"
                    </div>
                  )}
                  {filteredAttendanceStudents.map((ls: any) => {
                    const sid = ls.studentId;
                    const currentStatus = attendanceMap[sid] || null;
                    const isMarkingThis = markingQuick === sid;
                    return (
                      <div
                        key={sid}
                        className={`p-3 border-[2px] border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#111111] transition-colors ${
                          currentStatus === "PRESENT"
                            ? "bg-[#f0fbf4]"
                            : currentStatus === "LATE"
                            ? "bg-amber-50/60"
                            : currentStatus === "ABSENT"
                            ? "bg-rose-50/60"
                            : "bg-[#F9F9F9]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#111111]">{ls.student?.name}</span>
                            {ls.student?.rollNumber && (
                              <span className="bg-[#FFF0E5] border border-[#111111] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#111111]">
                                {ls.student.rollNumber}
                              </span>
                            )}
                            {currentStatus === "PRESENT" ? (
                              <span className="bg-emerald-600 text-white px-1.5 py-0.5 text-[9px] font-mono font-black uppercase">
                                ✓ PRESENT
                              </span>
                            ) : currentStatus === "LATE" ? (
                              <span className="bg-amber-500 text-white px-1.5 py-0.5 text-[9px] font-mono font-black uppercase">
                                ⏱️ LATE
                              </span>
                            ) : currentStatus === "ABSENT" ? (
                              <span className="bg-rose-600 text-white px-1.5 py-0.5 text-[9px] font-mono font-black uppercase">
                                ❌ ABSENT
                              </span>
                            ) : (
                              <span className="bg-slate-200 text-slate-700 border border-slate-300 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase">
                                ⏳ PENDING
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono">
                            {ls.student?.branch || "CSE"} {ls.student?.semester ? `• Sem ${ls.student.semester}` : ""} · {ls.student?.email}
                          </span>
                        </div>

                        {/* Attendance Actions: One-click Present button & Status toggles */}
                        <div className="flex items-center gap-1.5 font-mono text-[11px] self-end sm:self-center">
                          <button
                            type="button"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickMarkStudent(sid, "PRESENT")}
                            className={`px-3 py-1 border-[2px] border-[#111111] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_#111111]"
                                : "bg-white text-emerald-900 hover:bg-emerald-100"
                            }`}
                            title="Click to mark this student PRESENT"
                          >
                            {isMarkingThis ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>✓ Present</span>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickMarkStudent(sid, "LATE")}
                            className={`px-2 py-1 border-[2px] border-[#111111] font-mono text-[10px] font-bold transition-all cursor-pointer ${
                              currentStatus === "LATE"
                                ? "bg-amber-500 text-white shadow-[2px_2px_0px_#111111]"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            disabled={isMarkingThis}
                            onClick={() => handleQuickMarkStudent(sid, "ABSENT")}
                            className={`px-2 py-1 border-[2px] border-[#111111] font-mono text-[10px] font-bold transition-all cursor-pointer ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-600 text-white shadow-[2px_2px_0px_#111111]"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Session Right Column */}
              <div className="lg:col-span-4 bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
                <h4 className="font-display font-black text-[#111111] text-sm uppercase tracking-tight flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  Schedule Session
                </h4>
                <div className="p-2.5 bg-amber-50 border border-amber-500 text-[11px] font-mono text-amber-950 font-bold">
                  Rule: Only 1 session per day per lab. If a session already exists today, it will be updated.
                </div>
                <form onSubmit={handleCreateSession} className="space-y-2.5">
                  <input
                    required
                    placeholder="Session title (e.g. Lab Day 2)"
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
                      "Create / Update Session"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
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
                    From: {d.student?.name} {d.student?.rollNumber ? `[${d.student.rollNumber}]` : ""} • {new Date(d.createdAt).toLocaleDateString()}
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
                    <span className="text-[10px] font-mono text-slate-600 font-bold">
                      Author: {selectedDoubt.student?.name} {selectedDoubt.student?.rollNumber ? `[${selectedDoubt.student.rollNumber}]` : ""}
                    </span>
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#111111]">From: Anonymous Student</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-300 text-[9px] uppercase font-bold">
                      🛡️ Confidential Appraisal
                    </span>
                  </div>
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
