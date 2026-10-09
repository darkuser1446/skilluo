"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Sparkles,
  FileText,
  Lock,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit3,
  Layers,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Check,
} from "lucide-react";

export default function MentorProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Change Password State
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Active Tab: "profile" | "labs" | "security"
  const [activeTab, setActiveTab] = useState<"profile" | "labs" | "security">("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      // First try our dedicated mentor profile endpoint; fallback to /api/auth/me
      const res = await fetch("/mentor/profile/api");
      if (res.ok) {
        const data = await res.json();
        const u = data.data?.user;
        if (u) {
          populateUserData(u);
          return;
        }
      }

      // Fallback to /api/auth/me
      const fallbackRes = await fetch("/api/auth/me");
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const u = fallbackData.data?.user;
        if (u) {
          populateUserData(u);
        }
      }
    } catch (err) {
      console.error("Failed to load mentor profile:", err);
    } finally {
      setLoading(false);
    }
  }

  function populateUserData(u: any) {
    setUser(u);
    setEditName(u.name || "");
    setEditPhone(u.phone || "");
    const mp = u.mentorProfile;
    setEditTitle(mp?.title || "");
    setEditCompany(mp?.company || "");
    setEditSpecialty(mp?.specialty || "");
    setEditBio(mp?.bio || "");
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      const res = await fetch("/mentor/profile/api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          title: editTitle,
          company: editCompany,
          specialty: editSpecialty,
          bio: editBio,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const updated = data.data?.user;
        setUser((prev: any) => ({
          ...prev,
          name: updated?.name || editName,
          phone: updated?.phone || editPhone,
          mentorProfile: updated?.mentorProfile || {
            ...(prev?.mentorProfile || {}),
            title: editTitle,
            company: editCompany,
            specialty: editSpecialty,
            bio: editBio,
          },
        }));
        setSaveMsg({ text: "Mentor profile successfully updated!", ok: true });
        setTimeout(() => setSaveMsg(null), 4000);
      } else {
        setSaveMsg({
          text: data?.error?.message || "Failed to update profile",
          ok: false,
        });
      }
    } catch {
      setSaveMsg({ text: "Network error occurred while saving profile", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setSaveMsg({ text: "Please upload an image file (PNG, JPG, WebP)", ok: false });
      return;
    }
    if (file.size > 512 * 1024) {
      setSaveMsg({ text: "Image too large — maximum avatar size is 512 KB", ok: false });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      try {
        const res = await fetch("/mentor/profile/api", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: dataUrl }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser((prev: any) => ({ ...prev, avatarUrl: dataUrl }));
          setSaveMsg({ text: "Profile photo updated successfully!", ok: true });
          setTimeout(() => setSaveMsg(null), 3000);
        } else {
          setSaveMsg({
            text: data?.error?.message || "Failed to upload avatar",
            ok: false,
          });
        }
      } catch {
        setSaveMsg({ text: "Upload failed — please try a smaller image", ok: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ text: "New password and confirmation do not match.", ok: false });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ text: "New password must be at least 6 characters.", ok: false });
      return;
    }

    setPwSaving(true);
    setPwMsg(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: "Password changed successfully! Keep your account secure.", ok: true });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setTimeout(() => setPwMsg(null), 4000);
      } else {
        setPwMsg({
          text: data?.error?.message || "Failed to change password. Please check your current password.",
          ok: false,
        });
      }
    } catch {
      setPwMsg({ text: "Network error occurred while changing password", ok: false });
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "M";

  const labMentors = user?.labMentors || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-400">Loading mentor profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── BREADCRUMB / BACK LINK ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/mentor"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#111111] hover:text-[#F07C27] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#F07C27] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Mentor Workspace</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-600">
          Last refreshed: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bg-white border-[3px] border-[#111111] p-6 sm:p-8 shadow-[8px_8px_0px_#111111] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar with Upload Badge */}
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 object-cover border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111]"
              />
            ) : (
              <div className="w-24 h-24 bg-[#FFF0E5] border-[3px] border-[#111111] flex items-center justify-center text-3xl font-mono font-black text-[#F07C27] shadow-[4px_4px_0px_#111111]">
                {initials}
              </div>
            )}
            <label
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center cursor-pointer hover:bg-[#FFF0E5] transition-all"
              title="Upload profile photo (max 512 KB)"
            >
              <Camera className="w-4 h-4 text-[#111111]" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* Identity & Badges */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black bg-[#FFF0E5] text-[#F07C27] border border-[#111111] uppercase tracking-wider shadow-[2px_2px_0px_#111111] flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-[#F07C27]" />
                [ IDENT: SUPER_60_MENTOR // EVALUATOR ]
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {editCompany || user?.mentorProfile?.company || "Super 60 Systems Faculty"}
              </span>
            </div>

            <div>
              <h1 className="font-mono font-black text-2xl sm:text-3xl text-[#111111] tracking-tight">
                {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#F07C27] font-mono font-bold mt-0.5">
                {editTitle || user?.mentorProfile?.title || "Systems Engineering Mentor"} ·{" "}
                {editSpecialty || user?.mentorProfile?.specialty || "C++ Low-Latency & Systems Architecture"}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-700 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#111111]" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {user.phone}
                </span>
              )}
              {labMentors.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#F07C27]" />
                  {labMentors.length} Assigned Lab{labMentors.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex gap-2 border-b-[2px] border-[#111111] pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "profile", label: "Profile & Specialty", icon: Edit3 },
          { id: "labs", label: "Assigned Laboratories", icon: Layers, count: labMentors.length },
          { id: "security", label: "Security & Password", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase transition-all whitespace-nowrap border-[2px] ${
                isActive
                  ? "bg-[#F07C27] text-white border-[#111111] shadow-[3px_3px_0px_#111111]"
                  : "bg-white text-slate-700 hover:text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 border ${
                    isActive
                      ? "bg-white text-[#111111] border-[#111111]"
                      : "bg-[#F4F3F3] text-slate-700 border-[#111111]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: PROFILE EDIT ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-8 bg-white border-[3px] border-[#111111] p-6 sm:p-7 shadow-[8px_8px_0px_#111111] space-y-5">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#F07C27]" />
                <h3 className="font-mono font-black text-[#111111] text-base uppercase">
                  Mentor Professional Information
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                Role: Evaluator & Guide
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Mentor full name"
                      className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                  Account Email Address
                </label>
                <div className="relative opacity-70">
                  <Mail className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-[#E5E5E5] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-slate-700 font-mono cursor-not-allowed shadow-[2px_2px_0px_#111111]"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-600 mt-1">
                  Mentor email is your primary login credential and workshop ID. Contact executive admin to rebind.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                    Professional Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Senior Systems Architect"
                      className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="e.g. Google · Super 60 Alumni"
                      className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                  Core Technical Specialty
                </label>
                <div className="relative">
                  <Sparkles className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    placeholder="e.g. Low-Latency C++, Memory Allocators & SIMD"
                    className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] pl-9 pr-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-600 mt-1">
                  Displayed on student grading notes, doubt discussions, and workshop rosters.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono font-black text-[#111111] uppercase">
                    Mentor Biography & Background
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {editBio.length} / 500 chars
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Brief summary of your systems engineering background, industry experience, and mentorship focus area..."
                    className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] p-3 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {saveMsg && (
                <div
                  className={`p-3.5 border-[2px] border-[#111111] text-xs font-mono font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_#111111] ${
                    saveMsg.ok
                      ? "bg-emerald-100 text-emerald-950"
                      : "bg-rose-100 text-rose-950"
                  }`}
                >
                  {saveMsg.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                  )}
                  <span>{saveMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Profile Changes..." : "Save Mentor Profile"}</span>
              </button>
            </form>
          </div>

          {/* Sidebar Info Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border-[3px] border-[#111111] p-5 sm:p-6 shadow-[6px_6px_0px_#111111] space-y-4">
              <h3 className="font-mono font-black text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2 border-b-[2px] border-[#111111] pb-2">
                <Shield className="w-4 h-4 text-[#F07C27]" />
                Mentorship Credentials
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-slate-600 text-[10px] font-bold uppercase block mb-0.5">
                    Platform Role
                  </span>
                  <span className="text-[#111111] font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 border border-[#111111]" />
                    SUPER 60 MENTOR
                  </span>
                </div>

                <div className="p-3 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-slate-600 text-[10px] font-bold uppercase block mb-0.5">
                    Account Status
                  </span>
                  <span className="text-emerald-700 font-black">ACTIVE & VERIFIED</span>
                </div>

                <div className="p-3 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-slate-600 text-[10px] font-bold uppercase block mb-0.5">
                    Joined Super 60
                  </span>
                  <span className="text-slate-800 font-bold">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FFF0E5] border-[2px] border-[#111111] text-[11px] font-mono text-[#111111] leading-relaxed shadow-[2px_2px_0px_#111111]">
                Mentor bio and specialty details are visible to students when viewing assignment reviews and laboratory roll calls.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ASSIGNED LABS ── */}
      {activeTab === "labs" && (
        <div className="bg-white border-[3px] border-[#111111] p-6 shadow-[8px_8px_0px_#111111] space-y-5">
          <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F07C27]" />
              <h3 className="font-mono font-black text-[#111111] text-base uppercase">
                Assigned Laboratories & Cohorts
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              Total Labs: {labMentors.length}
            </span>
          </div>

          {labMentors.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-mono font-black text-[#111111] text-sm">
                No Laboratories Assigned Yet
              </p>
              <p className="font-mono text-xs text-slate-600 max-w-md mx-auto">
                Laboratory allocations are managed by platform administrators. Once assigned, your lab roster, grading queue, and roll call will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labMentors.map((lm: any) => {
                const lab = lm.lab;
                const workshop = lab?.workshop;
                return (
                  <div
                    key={lm.id}
                    className="p-5 bg-white border-[2px] border-[#111111] space-y-3.5 shadow-[4px_4px_0px_#111111]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-black text-base text-[#111111]">
                            {lab?.name || "Lab"}
                          </h4>
                          {lm.isLead && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#FFF0E5] text-[#F07C27] border border-[#111111] uppercase shadow-[1px_1px_0px_#111111]">
                              Lead Evaluator
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono font-bold text-[#F07C27] mt-0.5">
                          {workshop?.name || "Skill Up Cohort"}
                          {workshop?.year ? ` (${workshop.year})` : ""}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-[#F4F3F3] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111]">
                        {workshop?.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2.5 bg-[#F4F3F3] border border-[#111111] shadow-[1px_1px_0px_#111111]">
                        <span className="text-[10px] text-slate-600 font-bold uppercase block flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#111111]" /> Schedule
                        </span>
                        <span className="text-[#111111] font-bold block mt-0.5 truncate">
                          {lab?.schedule || "Mon-Fri Standard"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F4F3F3] border border-[#111111] shadow-[1px_1px_0px_#111111]">
                        <span className="text-[10px] text-slate-600 font-bold uppercase block flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#111111]" /> Capacity
                        </span>
                        <span className="text-[#111111] font-bold block mt-0.5">
                          {lab?.capacity || 30} Students Max
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#111111]/15 text-[11px] font-mono text-slate-700">
                      <span>Allocation: Relational</span>
                      <Link
                        href={`/mentor`}
                        className="text-[#F07C27] font-black hover:underline"
                      >
                        Open Lab Queue →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SECURITY & PASSWORD ── */}
      {activeTab === "security" && (
        <div className="max-w-lg">
          <div className="bg-white border-[3px] border-[#111111] p-6 sm:p-7 shadow-[8px_8px_0px_#111111] space-y-5">
            <div className="flex items-center gap-2 border-b-[2px] border-[#111111] pb-3">
              <Lock className="w-4 h-4 text-[#F07C27]" />
              <h3 className="font-mono font-black text-[#111111] text-base uppercase">
                Change Account Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-[#111111] uppercase mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2.5 text-sm text-[#111111] placeholder:text-slate-500 font-mono shadow-[2px_2px_0px_#111111] focus:outline-none focus:bg-white"
                />
              </div>

              {pwMsg && (
                <div
                  className={`p-3.5 border-[2px] border-[#111111] text-xs font-mono font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_#111111] ${
                    pwMsg.ok
                      ? "bg-emerald-100 text-emerald-950"
                      : "bg-rose-100 text-rose-950"
                  }`}
                >
                  {pwMsg.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                  )}
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-3 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{pwSaving ? "Verifying & Updating..." : "Update Password"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
