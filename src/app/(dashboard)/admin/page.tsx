"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ClipboardList,
  Megaphone,
  History,
  Download,
  Shuffle,
  Edit2,
  ArrowRightLeft,
  UserMinus,
  RotateCcw,
  X,
} from "lucide-react";
import TestManager from "@/components/TestManager";
import CohortQuotaMatrix from "@/components/CohortQuotaMatrix";
import { SkeletonMetric, SkeletonTableRow } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { exportToExcel } from "@/utils/export";

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
  email?: string;
  phone?: string;
  rollNumber?: string;
  branch?: string;
  semester?: string;
  college: string;
  labId?: string | null;
  labName?: string;
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
  phone?: string;
  rollNumber?: string;
  branch?: string;
  semester?: string;
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
    "selection" | "workshops" | "labs" | "users" | "weights" | "feedback" | "tests" | "announcements" | "activity"
  >("selection");
  const [loading, setLoading] = useState(true);

  // Announcements management
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annPinned, setAnnPinned] = useState(false);
  const [annPublic, setAnnPublic] = useState(false);
  const [postingAnn, setPostingAnn] = useState(false);
  const [annMsg, setAnnMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Audit / activity log
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Candidate filters
  const [candidateSearch, setCandidateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [selectedLabFilter, setSelectedLabFilter] = useState("ALL");
  const [selectionActionLoading, setSelectionActionLoading] = useState<string | null>(null);

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

  // Automated Random Lab Allocation state
  const [autoStudentsPerLab, setAutoStudentsPerLab] = useState<number>(15);
  const [autoTargetGroup, setAutoTargetGroup] = useState<"SELECTED" | "ALL">("SELECTED");
  const [autoLabPrefix, setAutoLabPrefix] = useState<string>("Lab");
  const [autoClearExisting, setAutoClearExisting] = useState<boolean>(true);
  const [autoAllocating, setAutoAllocating] = useState<boolean>(false);
  const [autoAllocateMessage, setAutoAllocateMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Lab inline editor state
  const [editingLabId, setEditingLabId] = useState<string | null>(null);
  const [editLabName, setEditLabName] = useState<string>("");
  const [editLabSchedule, setEditLabSchedule] = useState<string>("");
  const [editLabCapacity, setEditLabCapacity] = useState<number>(30);
  const [savingLab, setSavingLab] = useState<boolean>(false);
  const [quickAddStudentByLab, setQuickAddStudentByLab] = useState<Record<string, string>>({});

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
    doubts: 10,
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
              doubts: cfg.doubts ?? 10,
            });
          }
          await Promise.all([
            loadReports(firstId),
            loadLabs(firstId),
            loadUsers(""),
            loadMentors(firstId),
            loadAnnouncements(firstId),
            loadAudit(),
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

  const loadAnnouncements = async (wId: string) => {
    if (!wId) return;
    const res = await fetch(`/api/announcements?workshopId=${wId}`);
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data.data.announcements || []);
    }
  };

  const loadAudit = async () => {
    const res = await fetch("/api/admin/audit?limit=50");
    if (res.ok) {
      const data = await res.json();
      setAuditLogs(data.data.logs || []);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId) return;
    setPostingAnn(true);
    setAnnMsg(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: annTitle,
          body: annBody,
          workshopId: selectedWorkshopId,
          isPublic: annPublic,
          pinned: annPinned,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || "Failed to post");
      }
      setAnnTitle("");
      setAnnBody("");
      setAnnPinned(false);
      setAnnPublic(false);
      setAnnMsg({ text: "Announcement posted — students notified", ok: true });
      await loadAnnouncements(selectedWorkshopId);
    } catch (err: any) {
      setAnnMsg({ text: err.message || "Failed to post announcement", ok: false });
    } finally {
      setPostingAnn(false);
      setTimeout(() => setAnnMsg(null), 4000);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
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
        doubts: cfg.doubts ?? 10,
      });
    }
    await Promise.all([loadReports(id), loadLabs(id), loadMentors(id), loadAnnouncements(id)]);
  };

  const handleSelectionAction = async (
    studentId: string,
    status: "SELECTED" | "REJECTED" | "ENROLLED"
  ) => {
    setSelectionActionLoading(`${studentId}-${status}`);
    try {
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
    } finally {
      setSelectionActionLoading(null);
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
    if (res.ok) {
      await loadLabs(selectedWorkshopId);
      await loadReports(selectedWorkshopId);
    }
  };

  const handleAutoAllocate = async () => {
    const eligibleCount =
      autoTargetGroup === "SELECTED"
        ? candidates.filter((c) => c.status === "SELECTED").length
        : candidates.length;

    if (eligibleCount === 0) {
      alert(
        autoTargetGroup === "SELECTED"
          ? "No candidates currently have 'SELECTED' status in this workshop. Please select candidates in the Selection tab or Test Manager first, or choose 'All Enrolled Students'."
          : "No students are enrolled in this workshop."
      );
      return;
    }

    const expectedLabs = Math.max(1, Math.ceil(eligibleCount / autoStudentsPerLab));
    const confirmed = confirm(
      `🎲 Run Automatic Random Lab Placement?\n\n` +
        `• Target Students: ${eligibleCount} (${autoTargetGroup === "SELECTED" ? "Selected Candidates" : "All Enrolled"})\n` +
        `• Capacity per Lab: ${autoStudentsPerLab} students\n` +
        `• Labs to Create: ${expectedLabs} (${autoLabPrefix} A, ${autoLabPrefix} B...)\n` +
        `• Clear prior assignments: ${autoClearExisting ? "Yes" : "No"}\n\n` +
        `Students will be randomized and distributed evenly across tracks. You can freely edit or move them afterwards.`
    );
    if (!confirmed) return;

    setAutoAllocating(true);
    setAutoAllocateMessage(null);
    try {
      const res = await fetch("/api/labs/auto-allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: selectedWorkshopId,
          studentsPerLab: autoStudentsPerLab,
          targetGroup: autoTargetGroup,
          mode: "CREATE_AND_ALLOCATE",
          labPrefix: autoLabPrefix,
          clearExisting: autoClearExisting,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Auto-allocation failed");

      setAutoAllocateMessage({ text: data.data.message || "Random placement complete!", ok: true });
      await Promise.all([loadLabs(selectedWorkshopId), loadReports(selectedWorkshopId)]);
    } catch (err: any) {
      setAutoAllocateMessage({ text: err.message || "Failed to auto-allocate", ok: false });
    } finally {
      setAutoAllocating(false);
    }
  };

  const handleStartEditLab = (lab: Lab) => {
    setEditingLabId(lab.id);
    setEditLabName(lab.name);
    setEditLabSchedule(lab.schedule || "");
    setEditLabCapacity(lab.capacity || 30);
  };

  const handleSaveEditLab = async (labId: string) => {
    setSavingLab(true);
    try {
      const res = await fetch(`/api/labs/${labId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editLabName,
          schedule: editLabSchedule,
          capacity: editLabCapacity,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error?.message || "Failed to update lab");
      }
      setEditingLabId(null);
      await loadLabs(selectedWorkshopId);
    } catch (err: any) {
      alert(err.message || "Failed to save lab");
    } finally {
      setSavingLab(false);
    }
  };

  const handleMoveStudentLab = async (
    sourceLabId: string,
    studentId: string,
    targetLabId: string
  ) => {
    if (!targetLabId || targetLabId === sourceLabId) return;
    try {
      const res = await fetch(`/api/labs/${sourceLabId}/students`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, targetLabId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error?.message || "Failed to move student");
      }
      await Promise.all([loadLabs(selectedWorkshopId), loadReports(selectedWorkshopId)]);
    } catch (err: any) {
      alert(err.message || "Failed to move student");
    }
  };

  const handleRemoveStudentFromLab = async (
    labId: string,
    studentId: string,
    studentName: string
  ) => {
    if (!confirm(`Remove ${studentName} from this lab track?`)) return;
    try {
      const res = await fetch(`/api/labs/${labId}/students?studentId=${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error?.message || "Failed to remove student");
      }
      await Promise.all([loadLabs(selectedWorkshopId), loadReports(selectedWorkshopId)]);
    } catch (err: any) {
      alert(err.message || "Failed to remove student");
    }
  };

  const handleQuickAddStudentToLab = async (labId: string) => {
    const studentId = quickAddStudentByLab[labId];
    if (!studentId) return;
    try {
      const res = await fetch(`/api/labs/${labId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, workshopId: selectedWorkshopId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error?.message || "Failed to add student to lab");
      }
      setQuickAddStudentByLab((prev) => ({ ...prev, [labId]: "" }));
      await Promise.all([loadLabs(selectedWorkshopId), loadReports(selectedWorkshopId)]);
    } catch (err: any) {
      alert(err.message || "Failed to add student");
    }
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
      await Promise.all([loadLabs(selectedWorkshopId), loadReports(selectedWorkshopId)]);
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
      c.college?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(candidateSearch.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchScore = c.overallScore >= minScoreFilter;
    const matchLab = selectedLabFilter === "ALL" || c.labId === selectedLabFilter;
    return matchSearch && matchStatus && matchScore && matchLab;
  });

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Registration Number",
      "Candidate Name",
      "Email",
      "Phone",
      "Branch",
      "Semester",
      "College / Dept",
      "Lab",
      "Assignments (30%)",
      "Assessments (35%)",
      "Attendance (15%)",
      "Doubts / Community",
      "Overall Score (%)",
      "Status",
    ];
    const rows = filteredCandidates.map((c) => [
      c.rank,
      c.rollNumber || "N/A",
      c.studentName || "N/A",
      c.email || "N/A",
      c.phone || "N/A",
      c.branch || "N/A",
      c.semester || "N/A",
      c.college || "N/A",
      c.labName || "Unassigned",
      c.assignmentsScore,
      c.assessmentsScore,
      c.attendancePercentage,
      c.doubtsResolved,
      c.overallScore,
      c.status,
    ]);

    exportToExcel(
      `skillup_candidates_report_${selectedWorkshopId || "workshop"}.csv`,
      headers,
      rows
    );
  };

  const handleExportUsersExcel = () => {
    const headers = [
      "User Name",
      "Role",
      "Registration Number",
      "Email",
      "Phone",
      "Branch",
      "Semester",
      "College",
      "Account Status",
      "Registered Date",
    ];
    const rows = users.map((u) => [
      u.name || "N/A",
      u.role,
      u.rollNumber || "N/A",
      u.email,
      u.phone || "N/A",
      u.branch || "N/A",
      u.semester || "N/A",
      u.college || "N/A",
      u.isActive ? "ACTIVE" : "INACTIVE",
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    exportToExcel(`skillup_users_roster.csv`, headers, rows);
  };

  const weightTotal = Object.values(weights).reduce((s, v) => s + v, 0);

  const TABS = [
    { id: "selection", label: "Candidate Selection Pipeline", icon: Trophy, count: counts.totalStudents },
    { id: "workshops", label: "Workshops Management", icon: Calendar, count: workshops.length },
    { id: "labs", label: "Labs & Allocation", icon: Layers, count: labs.length },
    { id: "users", label: "Platform Users", icon: Users, count: users.length },
    { id: "tests", label: "Tests & Quizzes", icon: ClipboardList, count: null },
    { id: "announcements", label: "Announcements", icon: Megaphone, count: announcements.length },
    { id: "weights", label: "Evaluation Formula Weights", icon: Sliders, count: null },
    { id: "feedback", label: "Feedback Explorer", icon: MessageSquare, count: feedbacks.length },
    { id: "activity", label: "Activity Log", icon: History, count: auditLogs.length },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero banner skeleton */}
        <div className="p-6 sm:p-7 bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-md w-full">
            <div className="h-4 w-36 bg-[#F4F3F3] border border-[#111111]" />
            <div className="h-8 w-64 bg-[#F4F3F3] border border-[#111111]" />
            <div className="h-4 w-full bg-[#F4F3F3] border border-[#111111]" />
          </div>
          <div className="h-24 w-60 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[4px_4px_0px_#111111]" />
        </div>

        {/* Metrics strip skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>

        {/* Tab content skeleton */}
        <div className="space-y-4">
          <div className="h-12 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]" />
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-4 space-y-3">
            <SkeletonTableRow />
            <SkeletonTableRow />
            <SkeletonTableRow />
            <SkeletonTableRow />
            <SkeletonTableRow />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      {/* ── TOP HERO BANNER: Super 60 Selection Engine ── */}
      <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-7 relative">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          {/* Left: Administrative Context */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#111111] text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border-[2px] border-[#111111] flex items-center gap-1 shadow-[2px_2px_0px_#111111]">
                <ShieldCheck className="w-3 h-3 text-[#F07C27]" />
                [ HEADQUARTERS // EXECUTIVE CONTROL ]
              </span>
              <span className="bg-[#FFF0E5] text-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold border-[2px] border-[#111111]">
                DECISION AUTHORITY
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              CANDIDATE SELECTION ENGINE
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Evaluator authority for Super 60 induction. Automated real-time formula computation and multi-year audit logs.
            </p>

            {/* Target Workshop Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-mono font-bold text-slate-700">SCOPING WORKSHOP:</span>
              <select
                value={selectedWorkshopId}
                onChange={(e) => handleWorkshopChange(e.target.value)}
                className="bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] font-mono font-bold text-xs px-3 py-1.5 focus:outline-none shadow-[2px_2px_0px_#111111] cursor-pointer"
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id} className="bg-white text-[#111111]">
                    {w.name} ({w.year}) — {w.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Super 60 Quota Progress Box */}
          <div className="bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-5 w-full xl:w-80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider block font-bold">
                  SUPER 60 INTAKE QUOTA
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-3xl text-[#111111]">
                    {counts.selected || 0}
                  </span>
                  <span className="text-slate-600 font-display font-bold text-base">/ 60 Qualified</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-[#F07C27] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white">
                <Trophy className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono font-bold text-[#111111]">
                <span>Cohort Completion:</span>
                <strong className="text-[#F07C27]">
                  {(((counts.selected || 0) / 60) * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="w-full bg-white h-3 border-[2px] border-[#111111] overflow-hidden">
                <div
                  className="bg-[#F07C27] h-full transition-all duration-700"
                  style={{ width: `${Math.min(100, ((counts.selected || 0) / 60) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
            TOTAL CANDIDATES
          </span>
          <span className="font-display font-black text-2xl text-[#111111]">
            {counts.totalStudents || 0}
          </span>
          <span className="text-[11px] font-mono text-slate-600 block mt-1">Enrolled in edition</span>
        </div>

        <div className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
            SELECTED FOR SUPER 60
          </span>
          <span className="font-display font-black text-2xl text-emerald-700">
            {counts.selected || 0}
          </span>
          <span className="text-[11px] font-mono text-emerald-700 block mt-1 font-bold">
            Induction Approved
          </span>
        </div>

        <div className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
            AVERAGE CANDIDATE SCORE
          </span>
          <span className="font-display font-black text-2xl text-[#F07C27]">
            {counts.averageScore || 0}%
          </span>
          <span className="text-[11px] font-mono text-slate-600 block mt-1">
            Aggregate formula
          </span>
        </div>

        <div className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
            PENDING EVALUATION
          </span>
          <span className="font-display font-black text-2xl text-amber-700">
            {counts.pending || 0}
          </span>
          <span className="text-[11px] font-mono text-amber-700 block mt-1 font-bold">
            Awaiting final decision
          </span>
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
                [ ADMIN // CONTROL ]
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
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                    {tab.count !== null && (
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

            {/* Quick Context Box at bottom of admin sidebar */}
            <div className="hidden lg:block pt-2 border-t-[2px] border-[#111111] text-[11px] font-mono space-y-1.5 bg-[#F9F9F9] -mx-3.5 -mb-3.5 p-3">
              <div className="flex justify-between text-slate-600 font-bold">
                <span>QUOTA FILL:</span>
                <span className="text-[#F07C27] font-black">{counts.selected || 0} / 60</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold">
                <span>TOTAL CANDIDATES:</span>
                <span className="text-[#111111] font-black">{counts.totalStudents || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold">
                <span>AVG SCORE:</span>
                <span className="text-[#111111] font-black">{counts.averageScore || 0}%</span>
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

      {/* ══════════════════════════════════════════════════════════
          TAB 1: CANDIDATE SELECTION PIPELINE
      ══════════════════════════════════════════════════════════ */}
      {/* ══ TESTS & QUIZZES ══ */}
      {activeTab === "tests" && selectedWorkshopId && (
        <TestManager workshopId={selectedWorkshopId} labs={labs} />
      )}

      {/* ══ ANNOUNCEMENTS MANAGEMENT ══ */}
      {activeTab === "announcements" && (
        <div className="space-y-5">
          <div>
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Announcements Management
            </h3>
            <p className="text-xs text-slate-700 font-mono mt-0.5">
              Post workshop-wide updates — registered cohort candidates receive live in-app notifications
            </p>
          </div>

          <form
            onSubmit={handlePostAnnouncement}
            className="border-[3px] border-[#111111] p-6 bg-white shadow-[6px_6px_0px_#111111] space-y-4"
          >
            <input
              className="w-full px-3 py-2 bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] text-xs font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              placeholder="Title (e.g. Lab moved to Room 204)"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              required
              minLength={3}
            />
            <textarea
              className="w-full px-3 py-2 bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] text-xs font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white resize-none"
              rows={3}
              placeholder="Message body…"
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              required
              minLength={5}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] cursor-pointer">
                <input
                  type="checkbox"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#F07C27]"
                />
                📌 Pinned
              </label>
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] cursor-pointer">
                <input
                  type="checkbox"
                  checked={annPublic}
                  onChange={(e) => setAnnPublic(e.target.checked)}
                  className="w-4 h-4 accent-[#F07C27]"
                />
                Show on public site
              </label>
              <button
                type="submit"
                disabled={postingAnn}
                className="ml-auto px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {postingAnn ? "Posting…" : "Post Announcement"}
              </button>
            </div>
            {annMsg && (
              <p className={`text-xs font-mono font-bold ${annMsg.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {annMsg.text}
              </p>
            )}
          </form>

          <div className="space-y-3">
            {announcements.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No announcements posted"
                description="Keep students informed by broadcasting schedule updates, assignment releases, or milestone deadlines."
              />
            )}
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-5 border-[3px] border-[#111111] flex items-start justify-between gap-3 ${
                  a.pinned
                    ? "bg-[#FFF0E5] shadow-[6px_6px_0px_#111111]"
                    : "bg-white shadow-[4px_4px_0px_#111111]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.pinned && (
                      <span className="text-[10px] font-mono text-[#111111] bg-[#F07C27] text-white px-2 py-0.5 border border-[#111111] font-bold">
                        📌 PINNED
                      </span>
                    )}
                    <span className="font-mono font-bold text-[#111111] text-sm uppercase">{a.title}</span>
                    {a.isPublic && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-[#111111]">
                        PUBLIC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2 font-mono">{a.body}</p>
                  <span className="text-[10px] font-mono text-slate-600 block mt-2 font-bold">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-1.5 border-[2px] border-[#111111] bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 shadow-[2px_2px_0px_#111111] transition-all flex-shrink-0 cursor-pointer"
                  title="Delete announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ACTIVITY / AUDIT LOG ══ */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight">
              Activity & Audit Log
            </h3>
            <p className="text-xs text-slate-700 font-mono mt-0.5">
              Administrative actions recording selection overrides and structural changes
            </p>
          </div>
          <div className="border-[3px] border-[#111111] bg-white shadow-[6px_6px_0px_#111111] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[#FFF0E5] border-b-[2px] border-[#111111] text-[#111111] text-[10px] uppercase font-bold">
                    <th className="text-left py-2.5 px-4 border-r border-[#111111]">When</th>
                    <th className="text-left py-2.5 px-4 border-r border-[#111111]">Action</th>
                    <th className="text-left py-2.5 px-4 border-r border-[#111111]">Performed By</th>
                    <th className="text-left py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20">
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8">
                        <EmptyState
                          icon={History}
                          title="No activity recorded"
                          description="Administrative audit logs and decisions will appear here as actions are executed."
                        />
                      </td>
                    </tr>
                  )}
                  {auditLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FFF0E5]/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap border-r border-[#111111]/20">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 border-r border-[#111111]/20">
                        <span className="px-2 py-0.5 border border-[#111111] bg-[#FFF0E5] text-[#111111] text-[10px] font-bold shadow-[1px_1px_0px_#111111]">
                          {l.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#111111] font-bold border-r border-[#111111]/20">
                        {l.performer?.name || "System"}
                        <span className="block text-[10px] text-slate-600 font-normal">
                          {l.performer?.email}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 max-w-[320px] truncate font-mono">
                        {l.details ? JSON.stringify(l.details) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "selection" && (
        <div className="space-y-5">
          {/* Interactive 60-Cell Cohort Quota Matrix */}
          <CohortQuotaMatrix
            candidates={candidates.map((c) => ({
              ...c,
              selectionStatus: c.status,
            }))}
            totalSeats={60}
            onSelectCandidate={(cand) => {
              if (cand?.studentName) {
                setCandidateSearch(cand.studentName);
              }
            }}
          />

          {/* Search & Filter Toolbar */}
          <div className="bg-white border-[3px] border-[#111111] p-4 shadow-[4px_4px_0px_#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate by name, institution..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Lab Filter */}
              <select
                value={selectedLabFilter}
                onChange={(e) => setSelectedLabFilter(e.target.value)}
                className="bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] font-mono font-bold text-xs px-3 py-2 shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              >
                <option value="ALL">All Labs</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#F4F3F3] p-1 border-[2px] border-[#111111] text-xs font-mono shadow-[2px_2px_0px_#111111]">
                {["ALL", "SELECTED", "PENDING", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 border font-mono font-bold text-xs uppercase transition-all ${
                      statusFilter === st
                        ? "bg-[#F07C27] text-white border-[#111111] shadow-[2px_2px_0px_#111111]"
                        : "border-transparent text-slate-600 hover:text-[#111111]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Min Score Cutoff Filter */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#111111] font-bold bg-[#F4F3F3] px-3 py-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                <span>Cutoff: ≥ {minScoreFilter}%</span>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="w-20 accent-[#F07C27] cursor-pointer"
                />
              </div>

              {/* Excel / CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF0E5] text-[#111111] font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Download complete candidates roster as Excel-compatible CSV file"
              >
                <Download className="w-3.5 h-3.5 text-[#F07C27]" />
                <span>Export to Excel</span>
              </button>
            </div>
          </div>

          {/* Candidate Table */}
          <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] font-mono uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-3 sticky left-0 z-10 bg-[#FFF0E5] border-r border-[#111111]/20">Rank</th>
                    <th className="py-3 px-3 sticky left-14 z-10 bg-[#FFF0E5] border-r border-[#111111]/20">Candidate</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Reg. Number</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Branch / Sem</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Lab</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Assign. (30%)</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Assess. (35%)</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Attend. (15%)</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Overall Score</th>
                    <th className="py-3 px-3 border-r border-[#111111]/20">Status</th>
                    <th className="py-3 px-3 text-right">Selection Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/15 font-mono">
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-8 bg-white">
                        <EmptyState
                          icon={Users}
                          title="No candidates match filters"
                          description={
                            candidateSearch || selectedLabFilter !== "ALL" || statusFilter !== "ALL" || minScoreFilter > 0
                              ? "No candidates match the specified filter criteria. Try clearing your search query or adjusting cutoff score."
                              : "No candidates enrolled in this workshop edition yet."
                          }
                          actionLabel={
                            candidateSearch || selectedLabFilter !== "ALL" || statusFilter !== "ALL" || minScoreFilter > 0
                              ? "Reset Filters"
                              : undefined
                          }
                          onAction={() => {
                            setCandidateSearch("");
                            setSelectedLabFilter("ALL");
                            setStatusFilter("ALL");
                            setMinScoreFilter(0);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                  {filteredCandidates.map((c) => (
                    <tr key={c.studentId} className="hover:bg-[#FFF0E5]/30 transition-colors">
                      <td className="py-3 px-3 sticky left-0 z-10 bg-white border-r border-[#111111]/20">
                        <span
                          className={`font-mono font-black ${
                            c.rank === 1
                              ? "text-[#F07C27] text-sm"
                              : c.rank === 2
                              ? "text-[#111111]"
                              : c.rank === 3
                              ? "text-amber-700"
                              : "text-slate-500"
                          }`}
                        >
                          #{c.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 sticky left-14 z-10 bg-white border-r border-[#111111]/20 whitespace-nowrap">
                        <div className="font-mono font-black text-[#111111] text-xs">
                          {c.studentName}
                        </div>
                        {c.email && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap border-r border-[#111111]/20">
                        <span className="px-2 py-0.5 bg-[#FFF0E5] border border-[#111111] text-[#111111] font-bold text-[11px] shadow-[1px_1px_0px_#111111]">
                          {c.rollNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono text-[11px] whitespace-nowrap border-r border-[#111111]/20">
                        {c.branch || c.college || "CSE"} {c.semester ? `(${c.semester})` : ""}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap border-r border-[#111111]/20">
                        <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[10px] shadow-[1px_1px_0px_#111111]">
                          {c.labName || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#111111] font-bold border-r border-[#111111]/20">{c.assignmentsScore}%</td>
                      <td className="py-3 px-3 text-[#111111] font-bold border-r border-[#111111]/20">{c.assessmentsScore}%</td>
                      <td className="py-3 px-3 text-[#111111] font-bold border-r border-[#111111]/20">{c.attendancePercentage}%</td>
                      <td className="py-3 px-3 border-r border-[#111111]/20">
                        <span className="font-mono font-black text-[#F07C27] text-sm bg-[#FFF0E5] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                          {c.overallScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3 border-r border-[#111111]/20">
                        <span
                          className={`px-2 py-0.5 border border-[#111111] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] ${
                            c.status === "SELECTED"
                              ? "bg-emerald-100 text-emerald-950"
                              : c.status === "REJECTED"
                              ? "bg-rose-100 text-rose-950"
                              : "bg-amber-100 text-amber-950"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectionAction(c.studentId, "SELECTED")}
                          disabled={selectionActionLoading === `${c.studentId}-SELECTED` || c.status === "SELECTED"}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-black text-[10px] uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 inline-flex items-center gap-1"
                        >
                          {selectionActionLoading === `${c.studentId}-SELECTED` && (
                            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent animate-spin" />
                          )}
                          <span>Select</span>
                        </button>
                        <button
                          onClick={() => handleSelectionAction(c.studentId, "REJECTED")}
                          disabled={selectionActionLoading === `${c.studentId}-REJECTED` || c.status === "REJECTED"}
                          className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-mono font-black text-[10px] uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 inline-flex items-center gap-1"
                        >
                          {selectionActionLoading === `${c.studentId}-REJECTED` && (
                            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent animate-spin" />
                          )}
                          <span>Reject</span>
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
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-mono font-black text-[#111111] uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]"></span>
              Deployed Workshop Editions ({workshops.length})
            </h3>
            {workshops.length === 0 && (
              <EmptyState
                icon={Calendar}
                title="No workshop editions deployed"
                description="Deploy a new workshop edition using the form to organize cohort candidates, tests, and labs."
              />
            )}
            {workshops.map((w) => (
              <div
                key={w.id}
                className="p-5 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-black text-[#111111] text-base">{w.name}</h4>
                  <span
                    className={`px-2.5 py-0.5 border border-[#111111] text-xs font-mono font-black uppercase shadow-[1px_1px_0px_#111111] ${
                      w.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-950"
                        : "bg-[#F4F3F3] text-slate-700"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono pt-2 border-t border-[#111111]/15">
                  <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[11px]">
                    Year: {w.year}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[11px]">
                    Slug: {w.slug}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[11px]">
                    Labs: {w._count?.labs || 0}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[11px]">
                    Enrolled: {w._count?.enrollments || 0}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F4F3F3] border border-[#111111] text-[#111111] font-bold text-[11px]">
                    Assignments: {w._count?.assignments || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="font-mono font-black text-[#111111] text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#F07C27]" />
              Deploy Workshop Edition
            </h3>

            <form onSubmit={handleCreateWorkshop} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1">
                  Edition Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skill Up 2027"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1">
                  Edition Year
                </label>
                <input
                  type="number"
                  required
                  value={wsYear}
                  onChange={(e) => setWsYear(Number(e.target.value))}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={wsStart}
                    onChange={(e) => setWsStart(e.target.value)}
                    className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={wsEnd}
                    onChange={(e) => setWsEnd(e.target.value)}
                    className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-2.5 py-1.5 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingWs}
                className="w-full py-2.5 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
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
        <div className="space-y-6">
          {/* ══════════════════════════════════════════════════════════
              AUTOMATED RANDOM LAB PLACEMENT COMMAND CENTER
          ══════════════════════════════════════════════════════════ */}
          <div className="bg-white border-[3px] border-[#111111] p-6 shadow-[8px_8px_0px_#111111] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-[2px] border-[#111111] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#F07C27] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white">
                    <Shuffle className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <h3 className="font-display font-black text-xl uppercase text-[#111111] tracking-tight">
                    Automated Random Lab Allocation
                  </h3>
                </div>
                <p className="text-slate-600 font-mono text-xs mt-1">
                  Automatically create laboratory tracks and distribute selected candidates randomly according to max capacity per lab.
                </p>
              </div>

              {/* Stats Badges */}
              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 border-[2px] border-[#111111] font-bold shadow-[2px_2px_0px_#111111]">
                  ★ {candidates.filter((c) => c.status === "SELECTED").length} Selected Candidates
                </span>
                <span className="px-2.5 py-1 bg-[#F4F3F3] text-slate-800 border-[2px] border-[#111111] font-bold shadow-[2px_2px_0px_#111111]">
                  👥 {candidates.length} Total Enrolled
                </span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-950 border-[2px] border-[#111111] font-bold shadow-[2px_2px_0px_#111111]">
                  🏛️ {labs.length} Configured Tracks
                </span>
              </div>
            </div>

            {/* Allocation Notification Banner */}
            {autoAllocateMessage && (
              <div
                className={`p-3.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] font-mono text-xs flex items-center justify-between ${
                  autoAllocateMessage.ok
                    ? "bg-emerald-50 text-emerald-900 border-emerald-900"
                    : "bg-rose-50 text-rose-900 border-rose-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {autoAllocateMessage.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                  )}
                  <span>{autoAllocateMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoAllocateMessage(null)}
                  className="text-[10px] font-black uppercase underline hover:opacity-75 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Configuration Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Target Candidate Group */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase">
                  1. Target Candidate Pool
                </label>
                <select
                  value={autoTargetGroup}
                  onChange={(e) => setAutoTargetGroup(e.target.value as "SELECTED" | "ALL")}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                >
                  <option value="SELECTED">
                    Selected Candidates Only ({candidates.filter((c) => c.status === "SELECTED").length}) [Recommended]
                  </option>
                  <option value="ALL">
                    All Enrolled Students ({candidates.length})
                  </option>
                </select>
                <span className="block text-[10px] text-slate-500 font-mono">
                  Pool of students to randomize & place into labs
                </span>
              </div>

              {/* Max Students (Child) Per Lab */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase">
                  2. Students Per Lab (Capacity)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={autoStudentsPerLab}
                    onChange={(e) => setAutoStudentsPerLab(Math.max(1, Number(e.target.value)))}
                    className="w-24 bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-black text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                  />
                  <div className="flex items-center gap-1">
                    {[10, 15, 20, 30].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setAutoStudentsPerLab(sz)}
                        className={`px-2 py-1.5 border border-[#111111] font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] transition-all cursor-pointer ${
                          autoStudentsPerLab === sz
                            ? "bg-[#F07C27] text-white"
                            : "bg-white text-slate-700 hover:bg-[#FFF0E5]"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="block text-[10px] text-slate-500 font-mono">
                  Maximum students assigned to each laboratory
                </span>
              </div>

              {/* Lab Name Prefix */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase">
                  3. Lab Track Naming
                </label>
                <input
                  type="text"
                  value={autoLabPrefix}
                  onChange={(e) => setAutoLabPrefix(e.target.value)}
                  placeholder="e.g. Lab, Track, Cohort"
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
                <span className="block text-[10px] text-slate-500 font-mono">
                  Generates: {autoLabPrefix} A, {autoLabPrefix} B, {autoLabPrefix} C...
                </span>
              </div>

              {/* Clear Existing Checkbox */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-[#F9F9F9] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoClearExisting}
                    onChange={(e) => setAutoClearExisting(e.target.checked)}
                    className="accent-[#F07C27] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono font-bold text-[#111111]">
                    Clear existing lab assignments before random shuffle
                  </span>
                </label>
              </div>
            </div>

            {/* Live Calculation Preview Banner & Submit Button */}
            {(() => {
              const eligibleCount =
                autoTargetGroup === "SELECTED"
                  ? candidates.filter((c) => c.status === "SELECTED").length
                  : candidates.length;
              const expectedLabs = Math.max(1, Math.ceil(eligibleCount / Math.max(1, autoStudentsPerLab)));
              return (
                <div className="p-4 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 font-mono text-xs">
                    <span className="font-black text-[#111111] uppercase flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#F07C27]" />
                      Allocation Formula Preview:
                    </span>
                    <p className="text-slate-800">
                      <strong>{eligibleCount}</strong> eligible students ÷{" "}
                      <strong>{autoStudentsPerLab}</strong> students/lab ={" "}
                      <span className="bg-amber-300 text-amber-950 px-1.5 py-0.5 border border-[#111111] font-black">
                        {expectedLabs} Laboratory Tracks
                      </span>{" "}
                      will be created with ~{Math.floor(eligibleCount / expectedLabs)}–{Math.ceil(eligibleCount / expectedLabs)} students each.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={autoAllocating || eligibleCount === 0}
                    onClick={handleAutoAllocate}
                    className="px-6 py-3 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>{autoAllocating ? "Placing Students..." : "🎲 Run Random Lab Placement"}</span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* ══════════════════════════════════════════════════════════
              UNASSIGNED SELECTED CANDIDATES ALERT TRAY
          ══════════════════════════════════════════════════════════ */}
          {(() => {
            const unassigned = candidates.filter(
              (c) => c.status === "SELECTED" && (!c.labId || c.labName === "Unassigned")
            );
            if (unassigned.length === 0) return null;
            return (
              <div className="p-4 bg-amber-50 border-[3px] border-amber-600 shadow-[4px_4px_0px_#111111] space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono font-black text-amber-950 text-xs uppercase flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    ⚠️ {unassigned.length} Selected Candidates are currently Unassigned to any Lab Track:
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 font-bold">
                    Click any student below or run Random Placement to distribute them automatically.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unassigned.slice(0, 15).map((u) => (
                    <span
                      key={u.studentId}
                      className="px-2 py-1 bg-white border border-[#111111] font-mono text-[10px] font-bold text-[#111111] shadow-[1px_1px_0px_#111111] flex items-center gap-1"
                    >
                      <span>{u.studentName}</span>
                      {u.rollNumber && <span className="text-[#F07C27]">[{u.rollNumber}]</span>}
                    </span>
                  ))}
                  {unassigned.length > 15 && (
                    <span className="px-2 py-1 bg-amber-200 border border-[#111111] font-mono text-[10px] font-black text-amber-950">
                      +{unassigned.length - 15} more unassigned
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              LABORATORY TRACKS & EDITABLE ROSTERS
          ══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lab Cards */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-mono font-black text-[#111111] uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]"></span>
                Laboratory Tracks ({labs.length})
              </h3>
              {labs.length === 0 && (
                <EmptyState
                  icon={Layers}
                  title="No laboratory tracks configured"
                  description="Configure lab tracks to organize students and assign dedicated lead mentors."
                />
              )}
            {labs.map((lab) => {
              const enrolledCount = lab.students?.length || 0;
              const capacity = lab.capacity || 30;
              const isOverCap = enrolledCount > capacity;
              const isFull = enrolledCount === capacity;
              const isEditingThisLab = editingLabId === lab.id;

              return (
                <div
                  key={lab.id}
                  className="p-5 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] space-y-4 transition-all"
                >
                  {/* Header: Lab Name, Status & Action Toolbar */}
                  <div className="flex items-start justify-between flex-wrap gap-2 border-b-[2px] border-[#111111]/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-black text-[#111111] text-lg uppercase tracking-tight">
                          {lab.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 border border-[#111111] font-mono text-[10px] font-black shadow-[1px_1px_0px_#111111] uppercase ${
                            isOverCap
                              ? "bg-rose-500 text-white"
                              : isFull
                              ? "bg-emerald-500 text-white"
                              : enrolledCount > 0
                              ? "bg-amber-200 text-amber-950"
                              : "bg-[#F4F3F3] text-slate-700"
                          }`}
                        >
                          {enrolledCount} / {capacity} Students {isOverCap ? "(OVER CAPACITY)" : isFull ? "(FILLED)" : ""}
                        </span>
                      </div>
                      <span className="block text-[11px] font-mono text-slate-600 mt-0.5">
                        🕒 Schedule: {lab.schedule || "Schedule TBA"}
                      </span>
                    </div>

                    {/* Header Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Edit Lab Details Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingThisLab) {
                            setEditingLabId(null);
                          } else {
                            handleStartEditLab(lab);
                          }
                        }}
                        className={`px-2.5 py-1 border border-[#111111] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] flex items-center gap-1 cursor-pointer transition-colors ${
                          isEditingThisLab
                            ? "bg-[#111111] text-white"
                            : "bg-white hover:bg-[#FFF0E5] text-[#111111]"
                        }`}
                        title="Edit Lab Name, Schedule, or Capacity"
                      >
                        <Edit2 className="w-3 h-3 text-[#F07C27]" />
                        <span>{isEditingThisLab ? "Close Editor" : "Edit Lab"}</span>
                      </button>

                      {/* Export Roster Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const headers = [
                            "Registration Number",
                            "Candidate Name",
                            "Email",
                            "Phone",
                            "Branch",
                            "Semester",
                            "Lab Name",
                          ];
                          const rows = (lab.students || []).map((s: any) => [
                            s.student?.rollNumber || "N/A",
                            s.student?.name || "N/A",
                            s.student?.email || "N/A",
                            s.student?.phone || "N/A",
                            s.student?.branch || "N/A",
                            s.student?.semester || "N/A",
                            lab.name,
                          ]);
                          exportToExcel(
                            `skillup_lab_${lab.name.replace(/\s+/g, "_")}_roster.csv`,
                            headers,
                            rows
                          );
                        }}
                        className="px-2.5 py-1 border border-[#111111] bg-white hover:bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Export Lab Roster to Excel"
                      >
                        <Download className="w-3 h-3 text-[#F07C27]" />
                        <span>Export CSV</span>
                      </button>

                      {/* Delete Lab Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLab(lab.id)}
                        className="p-1 border border-[#111111] bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-[1px_1px_0px_#111111] transition-colors cursor-pointer"
                        title="Delete Laboratory Track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Lab Editor Form (when active) */}
                  {isEditingThisLab && (
                    <div className="p-4 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2">
                        <span className="text-[11px] font-mono font-black uppercase text-[#111111]">
                          ✏️ Edit Laboratory Track Settings
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingLabId(null)}
                          className="text-[10px] font-mono font-bold text-slate-700 hover:text-black cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#111111] uppercase mb-0.5">
                            Lab Name
                          </label>
                          <input
                            type="text"
                            value={editLabName}
                            onChange={(e) => setEditLabName(e.target.value)}
                            className="w-full bg-white border border-[#111111] px-2.5 py-1.5 text-xs font-mono text-[#111111] shadow-[1px_1px_0px_#111111] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#111111] uppercase mb-0.5">
                            Schedule
                          </label>
                          <input
                            type="text"
                            value={editLabSchedule}
                            onChange={(e) => setEditLabSchedule(e.target.value)}
                            className="w-full bg-white border border-[#111111] px-2.5 py-1.5 text-xs font-mono text-[#111111] shadow-[1px_1px_0px_#111111] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#111111] uppercase mb-0.5">
                            Capacity (Seats)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={editLabCapacity}
                            onChange={(e) => setEditLabCapacity(Number(e.target.value))}
                            className="w-full bg-white border border-[#111111] px-2.5 py-1.5 text-xs font-mono font-bold text-[#111111] shadow-[1px_1px_0px_#111111] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingLabId(null)}
                          className="px-3 py-1 border border-[#111111] bg-white text-[#111111] font-mono text-[10px] font-bold shadow-[1px_1px_0px_#111111] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingLab}
                          onClick={() => handleSaveEditLab(lab.id)}
                          className="px-4 py-1 border-[2px] border-[#111111] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-black shadow-[2px_2px_0px_#111111] cursor-pointer"
                        >
                          {savingLab ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mentors Bar */}
                  {lab.mentors?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-[#111111] uppercase block">
                        Lead Mentors ({lab.mentors.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {lab.mentors.map((m: any) => (
                          <span
                            key={m.mentor?.id}
                            className="px-2 py-0.5 text-[10px] bg-sky-100 text-sky-950 border border-[#111111] font-mono font-bold shadow-[1px_1px_0px_#111111]"
                          >
                            👨‍🏫 {m.mentor?.name} {m.isLead ? "(Lead)" : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ══ EDITABLE ROSTER OF ENROLLED STUDENTS ══ */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-[#111111] uppercase">
                        Enrolled Students ({enrolledCount}):
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Use the dropdown to re-assign a student to another lab
                      </span>
                    </div>

                    {enrolledCount === 0 ? (
                      <div className="p-3 bg-[#F9F9F9] border border-dashed border-[#111111]/30 text-center font-mono text-[11px] text-slate-500">
                        No students currently assigned to this track. Use the Quick Add tool below or run Random Placement.
                      </div>
                    ) : (
                      <div className="border border-[#111111] divide-y divide-[#111111]/15 max-h-72 overflow-y-auto scrollbar-thin">
                        {lab.students.map((ls: any, idx: number) => {
                          const student = ls.student;
                          return (
                            <div
                              key={student?.id || idx}
                              className="p-2 bg-white hover:bg-[#FFF0E5]/40 transition-colors flex items-center justify-between gap-3 text-xs font-mono"
                            >
                              {/* Student Info */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 text-center text-[10px] font-bold text-slate-400">
                                  {idx + 1}.
                                </span>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <strong className="text-[#111111]">{student?.name || "Candidate"}</strong>
                                    {student?.rollNumber && (
                                      <span className="px-1.5 py-0.2 bg-[#F4F3F3] border border-[#111111] text-[9px] font-black text-slate-800 shadow-[1px_1px_0px_#111111]">
                                        REG: {student.rollNumber}
                                      </span>
                                    )}
                                  </div>
                                  <span className="block text-[10px] text-slate-500 truncate">
                                    {student?.email} {student?.branch ? `· ${student.branch}` : ""}
                                  </span>
                                </div>
                              </div>

                              {/* Student Actions: Move to Another Lab & Remove */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {/* Move to another lab selector */}
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleMoveStudentLab(
                                        lab.id,
                                        student.id,
                                        e.target.value
                                      );
                                    }
                                  }}
                                  className="px-1.5 py-0.5 bg-[#F4F3F3] border border-[#111111] font-mono text-[10px] font-bold text-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer"
                                  title="Move student to another laboratory track"
                                >
                                  <option value="" disabled>
                                    Move to...
                                  </option>
                                  {labs
                                    .filter((otherLab) => otherLab.id !== lab.id)
                                    .map((otherLab) => (
                                      <option key={otherLab.id} value={otherLab.id}>
                                        → {otherLab.name}
                                      </option>
                                    ))}
                                </select>

                                {/* Remove student from lab */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveStudentFromLab(
                                      lab.id,
                                      student.id,
                                      student.name || "Student"
                                    )
                                  }
                                  className="p-1 border border-[#111111] bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-[1px_1px_0px_#111111] transition-colors cursor-pointer"
                                  title="Remove student from this lab"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Add Student to This Lab */}
                  <div className="pt-2 border-t border-[#111111]/20 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-700 flex-shrink-0">
                      ➕ Add Candidate to {lab.name}:
                    </span>
                    <select
                      value={quickAddStudentByLab[lab.id] || ""}
                      onChange={(e) =>
                        setQuickAddStudentByLab((prev) => ({
                          ...prev,
                          [lab.id]: e.target.value,
                        }))
                      }
                      className="flex-1 min-w-[200px] bg-[#F4F3F3] border border-[#111111] px-2 py-1 text-[11px] font-mono text-[#111111] shadow-[1px_1px_0px_#111111]"
                    >
                      <option value="">Select candidate to add...</option>
                      {candidates
                        .filter((c) => c.labId !== lab.id)
                        .map((c) => (
                          <option key={c.studentId} value={c.studentId}>
                            {c.studentName} {c.rollNumber ? `[${c.rollNumber}]` : ""} ({c.status}) — Currently: {c.labName || "Unassigned"}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!quickAddStudentByLab[lab.id]}
                      onClick={() => handleQuickAddStudentToLab(lab.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-black uppercase border border-[#111111] shadow-[1px_1px_0px_#111111] disabled:opacity-40 cursor-pointer"
                    >
                      Add to Track
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allocation Actions Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Create Lab */}
            <div className="bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
              <h4 className="font-mono font-black text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F07C27]" />
                Create Laboratory Track
              </h4>
              <form onSubmit={handleCreateLab} className="space-y-2.5">
                <input
                  required
                  placeholder="Lab name (e.g. Lab C — Distributed Systems)"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
                <input
                  placeholder="Schedule (e.g. Tue/Thu 18:00 - 20:30)"
                  value={labSchedule}
                  onChange={(e) => setLabSchedule(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={labCapacity}
                  onChange={(e) => setLabCapacity(Number(e.target.value))}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={creatingLab}
                  className="w-full py-2 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                >
                  {creatingLab ? "Creating..." : "Create Lab"}
                </button>
              </form>
            </div>

            {/* Assign Student to Lab */}
            <div className="bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
              <h4 className="font-mono font-black text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Assign Student to Lab
              </h4>
              <form onSubmit={handleAssignStudent} className="space-y-2.5">
                <select
                  value={assignLabId}
                  onChange={(e) => setAssignLabId(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                >
                  <option value="">Select Target Lab...</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                >
                  <option value="">Select Candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.studentId} value={c.studentId}>
                      {c.studentName} {c.rollNumber ? `[${c.rollNumber}]` : ""} ({c.status}) — Currently: {c.labName || "Unassigned"}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Assign Candidate
                </button>
              </form>
            </div>

            {/* Assign Mentor to Lab */}
            <div className="bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
              <h4 className="font-mono font-black text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Assign Mentor to Lab
              </h4>
              <form onSubmit={handleAssignMentor} className="space-y-2.5">
                <select
                  value={assignMentorLabId}
                  onChange={(e) => setAssignMentorLabId(e.target.value)}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
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
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
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
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Assign Mentor
                </button>
              </form>
            </div>
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
              <h3 className="font-mono font-black text-[#111111] uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]"></span>
                User Directory ({users.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5 text-xs font-mono">
                  {["", "STUDENT", "MENTOR", "ADMIN"].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setUserRoleFilter(r);
                        loadUsers(r);
                      }}
                      className={`px-3 py-1 text-xs font-mono font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer ${
                        userRoleFilter === r
                          ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                          : "bg-white text-slate-600 hover:text-[#111111] shadow-[1px_1px_0px_#111111]"
                      }`}
                    >
                      {r || "ALL"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExportUsersExcel}
                  className="px-3 py-1 bg-white hover:bg-[#FFF0E5] text-[#111111] font-mono text-xs font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Export Users Directory to Excel"
                >
                  <Download className="w-3.5 h-3.5 text-[#F07C27]" />
                  <span>Export Users</span>
                </button>
              </div>
            </div>

            <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden">
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] font-mono uppercase tracking-wider text-[10px] font-black">
                      <th className="py-3 px-3 border-r border-[#111111]/20">Name</th>
                      <th className="py-3 px-3 border-r border-[#111111]/20">Reg. Number</th>
                      <th className="py-3 px-3 border-r border-[#111111]/20">Email / Phone</th>
                      <th className="py-3 px-3 border-r border-[#111111]/20">Role</th>
                      <th className="py-3 px-3 border-r border-[#111111]/20">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/15 font-mono">
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 bg-white">
                          <EmptyState
                            icon={Users}
                            title="No accounts found"
                            description="No platform accounts registered matching the selected role filter."
                          />
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FFF0E5]/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-black text-[#111111] text-xs border-r border-[#111111]/20">
                          {u.name}
                        </td>
                        <td className="py-3 px-3 border-r border-[#111111]/20 whitespace-nowrap">
                          {u.rollNumber ? (
                            <span className="px-2 py-0.5 bg-[#FFF0E5] border border-[#111111] text-[#111111] font-bold text-[11px] shadow-[1px_1px_0px_#111111]">
                              {u.rollNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-mono text-xs border-r border-[#111111]/20">
                          <div>{u.email}</div>
                          {u.phone && (
                            <div className="text-[10px] text-slate-500 font-bold">{u.phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 border-r border-[#111111]/20">
                          <span
                            className={`px-2 py-0.5 border border-[#111111] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#111111] ${
                              u.role === "ADMIN"
                                ? "bg-[#FFF0E5] text-[#F07C27]"
                                : u.role === "MENTOR"
                                ? "bg-sky-100 text-sky-950"
                                : "bg-emerald-100 text-emerald-950"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-r border-[#111111]/20">
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              u.isActive ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {u.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {u.isActive && u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleDeactivateUser(u.id)}
                              className="p-1.5 border border-[#111111] bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-[1px_1px_0px_#111111] transition-colors cursor-pointer"
                              title="Deactivate User Account"
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
          <div className="lg:col-span-4 bg-white border-[3px] border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-3">
            <h4 className="font-mono font-black text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#F07C27]" />
              Provision Account
            </h4>
            <form onSubmit={handleCreateUser} className="space-y-2.5">
              <input
                required
                placeholder="Full Name"
                value={uName}
                onChange={(e) => setUName(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={uEmail}
                onChange={(e) => setUEmail(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              />
              <input
                required
                type="password"
                placeholder="Password (min 6 chars)"
                value={uPassword}
                onChange={(e) => setUPassword(e.target.value)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
              />
              <select
                value={uRole}
                onChange={(e) => setURole(e.target.value as any)}
                className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
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
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              )}
              <button
                type="submit"
                disabled={creatingUser}
                className="w-full py-2.5 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
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
        <div className="max-w-xl bg-white border-[3px] border-[#111111] p-6 sm:p-7 shadow-[8px_8px_0px_#111111] space-y-6">
          <div>
            <div className="inline-block px-2.5 py-0.5 border border-[#111111] bg-[#FFF0E5] text-[#F07C27] text-[10px] font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_#111111] mb-2">
              [ IDENT: EVALUATION_ENGINE // FORMULA ]
            </div>
            <h3 className="font-mono font-black text-2xl text-[#111111]">
              Configurable Component Weights
            </h3>
            <p className="text-xs font-mono text-slate-700 mt-1">
              Adjust how the candidate performance formula computes the overall score for this workshop edition. Persisted directly into the database.
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="capitalize text-[#111111] font-black">{key} Component:</span>
                  <span className="font-mono font-black text-[#F07C27] text-sm bg-[#FFF0E5] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                    {weights[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full accent-[#F07C27] cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Sum Check */}
          <div
            className={`p-4 border-[2px] border-[#111111] font-mono text-xs font-black flex items-center justify-between shadow-[3px_3px_0px_#111111] ${
              weightTotal === 100
                ? "bg-emerald-100 text-emerald-950"
                : "bg-rose-100 text-rose-950"
            }`}
          >
            <span>Total Sum: {weightTotal}%</span>
            <span>{weightTotal === 100 ? "✓ 100% Perfectly Balanced" : `Unbalanced (${weightTotal}%)`}</span>
          </div>

          <button
            onClick={handleSaveWeights}
            disabled={savingWeights || weightTotal !== 100}
            className="w-full py-3 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
            <h3 className="font-mono font-black text-[#111111] uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]"></span>
              Faculty Feedback Explorer
            </h3>
            <select
              value={feedbackLabId}
              onChange={(e) => {
                setFeedbackLabId(e.target.value);
                loadFeedbacks(e.target.value);
              }}
              className="bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-1.5 text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
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
            <EmptyState
              icon={MessageSquare}
              title={feedbackLabId ? "No feedback submitted yet" : "Select a Laboratory Track"}
              description={
                feedbackLabId
                  ? "Candidates enrolled in this lab track haven't submitted any feedback evaluations yet."
                  : "Select a laboratory track above to inspect mentor ratings and candidate evaluations."
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-5 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < f.rating
                              ? "text-[#F07C27] fill-[#F07C27]"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 border border-[#111111] uppercase bg-[#FFF0E5] text-[#F07C27] shadow-[1px_1px_0px_#111111]">
                      {f.category}
                    </span>
                  </div>

                  <p className="text-sm text-[#111111] font-mono italic">&quot;{f.comment}&quot;</p>

                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 pt-2 border-t border-[#111111]/15">
                    <span>From: {f.isAnonymous ? "Anonymous Candidate" : f.student?.name}</span>
                    <span>Mentor: {f.mentor?.name || "Lead"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
