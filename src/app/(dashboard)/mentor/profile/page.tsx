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
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Mentor Workspace</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500">
          Last refreshed: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#111C35]/95 to-[#0D1527]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-orange/5 blur-[90px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar with Upload Badge */}
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-[#070B14] border-2 border-sky-500/40 flex items-center justify-center text-3xl font-mono font-black text-white shadow-xl">
                {initials}
              </div>
            )}
            <label
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#070B14] border border-slate-700 flex items-center justify-center cursor-pointer hover:border-sky-400 hover:scale-105 transition-all shadow-md"
              title="Upload profile photo (max 512 KB)"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-sky-400" />
                SUPER 60 MENTOR & LEAD EVALUATOR
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {editCompany || user?.mentorProfile?.company || "Super 60 Systems Faculty"}
              </span>
            </div>

            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-sky-300 font-mono mt-0.5">
                {editTitle || user?.mentorProfile?.title || "Systems Engineering Mentor"} ·{" "}
                {editSpecialty || user?.mentorProfile?.specialty || "C++ Low-Latency & Systems Architecture"}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {user.phone}
                </span>
              )}
              {labMentors.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-orange" />
                  {labMentors.length} Assigned Lab{labMentors.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto scrollbar-none">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-sky-400/20 text-sky-300" : "bg-slate-800 text-slate-400"
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
          <div className="lg:col-span-8 rounded-2xl p-6 sm:p-7 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <h3 className="font-display font-bold text-white text-base">
                  Mentor Professional Information
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Role: Evaluator & Guide
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Mentor full name"
                      className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  Account Email Address
                </label>
                <div className="relative opacity-60">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Mentor email is your primary login credential and workshop ID. Contact executive admin to rebind.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                    Professional Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Senior Systems Architect"
                      className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="e.g. Google · Super 60 Alumni"
                      className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  Core Technical Specialty
                </label>
                <div className="relative">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    placeholder="e.g. Low-Latency C++, Memory Allocators & SIMD"
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Displayed on student grading notes, doubt discussions, and workshop rosters.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-slate-400 uppercase">
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
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                  />
                </div>
              </div>

              {saveMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2.5 ${
                    saveMsg.ok
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {saveMsg.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{saveMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Profile Changes..." : "Save Mentor Profile"}</span>
              </button>
            </form>
          </div>

          {/* Sidebar Info Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl p-5 sm:p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-4">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="w-4 h-4 text-sky-400" />
                Mentorship Credentials
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#070B14]/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block mb-0.5">
                    Platform Role
                  </span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    SUPER 60 MENTOR
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070B14]/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block mb-0.5">
                    Account Status
                  </span>
                  <span className="text-emerald-400 font-bold">ACTIVE & VERIFIED</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070B14]/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block mb-0.5">
                    Joined Super 60
                  </span>
                  <span className="text-slate-300">
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

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] font-mono text-sky-300 leading-relaxed">
                Mentor bio and specialty details are visible to students when viewing assignment reviews and laboratory roll calls.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ASSIGNED LABS ── */}
      {activeTab === "labs" && (
        <div className="rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="font-display font-bold text-white text-base">
                Assigned Laboratories & Cohorts
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Labs: {labMentors.length}
            </span>
          </div>

          {labMentors.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-display font-bold text-slate-300 text-sm">
                No Laboratories Assigned Yet
              </p>
              <p className="font-mono text-xs text-slate-500 max-w-md mx-auto">
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
                    className="rounded-xl p-5 bg-[#070B14] border border-slate-800 space-y-3.5 hover:border-sky-500/40 transition-colors shadow-inner"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-white">
                            {lab?.name || "Lab"}
                          </h4>
                          {lm.isLead && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-gold/15 text-brand-gold border border-brand-gold/30 uppercase">
                              Lead Evaluator
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-sky-300 mt-0.5">
                          {workshop?.name || "Skill Up Cohort"}
                          {workshop?.year ? ` (${workshop.year})` : ""}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {workshop?.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> Schedule
                        </span>
                        <span className="text-slate-300 font-semibold block mt-0.5 truncate">
                          {lab?.schedule || "Mon-Fri Standard"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" /> Capacity
                        </span>
                        <span className="text-slate-300 font-semibold block mt-0.5">
                          {lab?.capacity || 30} Students Max
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                      <span>Allocation: Relational</span>
                      <Link
                        href={`/mentor`}
                        className="text-sky-400 hover:text-sky-300 font-bold hover:underline"
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
          <div className="rounded-2xl p-6 sm:p-7 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-sky-400" />
              <h3 className="font-display font-bold text-white text-base">
                Change Account Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              {pwMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2.5 ${
                    pwMsg.ok
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {pwMsg.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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
