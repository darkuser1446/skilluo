"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  Shield,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit3,
  ExternalLink,
} from "lucide-react";

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [activeSection, setActiveSection] = useState<"profile" | "security">("profile");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const u = d.data?.user;
        if (u) {
          setUser(u);
          setEditName(u.name || "");
          setEditPhone(u.phone || "");
          setEditCollege(u.college || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone, college: editCollege }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg({ text: "Profile updated successfully!", ok: true });
        setUser((prev: any) => ({ ...prev, name: editName, phone: editPhone, college: editCollege }));
      } else {
        setSaveMsg({ text: data?.error?.message || "Failed to update profile", ok: false });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload (stored as a data-URL, max 512 KB) ──
  const handleAvatarChange = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setSaveMsg({ text: "Please choose an image file.", ok: false });
      return;
    }
    if (file.size > 512 * 1024) {
      setSaveMsg({ text: "Image too large — max 512 KB.", ok: false });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      try {
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: dataUrl }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser((prev: any) => ({ ...prev, avatarUrl: data.data.user.avatarUrl }));
          setSaveMsg({ text: "Profile photo updated!", ok: true });
          setTimeout(() => setSaveMsg(null), 3000);
        } else {
          setSaveMsg({ text: data?.error?.message || "Upload failed", ok: false });
        }
      } catch {
        setSaveMsg({ text: "Upload failed — try a smaller image.", ok: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters.", ok: false });
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
        setPwMsg({ text: "Password changed successfully! Stay secure.", ok: true });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setPwMsg({ text: data?.error?.message || "Failed to change password", ok: false });
      }
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
    : "U";

  const myLab = user?.labStudents?.[0]?.lab;
  const enrollmentStatus = user?.enrollments?.[0]?.status;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Hero */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#111C35]/95 to-[#0D1527]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/8 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-orange/40 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-orange/30 to-brand-navy border-2 border-brand-orange/40 flex items-center justify-center text-2xl font-mono font-black text-white shadow-lg">
                {initials}
              </div>
            )}
            <label
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#070B14] border border-slate-800 flex items-center justify-center cursor-pointer hover:border-brand-orange/60 transition-colors"
              title="Upload profile photo (max 512 KB)"
            >
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* Identity */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                SUPER 60 STUDENT
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                  enrollmentStatus === "SELECTED"
                    ? "bg-brand-gold/20 text-brand-gold border-brand-gold/30"
                    : enrollmentStatus === "ENROLLED"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {enrollmentStatus || "ENROLLED"}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl text-white">{user?.name}</h1>
            <p className="text-sm font-mono text-slate-400">{user?.email}</p>

            <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-400 pt-1">
              {user?.college && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-brand-orange" />
                  {user.college}
                </span>
              )}
              {user?.branch && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                  {user.branch}
                  {user.semester ? ` · Sem ${user.semester}` : ""}
                </span>
              )}
              {user?.rollNumber && (
                <span className="flex items-center gap-1">
                  <span className="text-brand-orange">ID:</span>
                  {user.rollNumber}
                </span>
              )}
              {myLab && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  {myLab.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-2">
        {[
          { id: "profile", label: "Profile Information", icon: User },
          { id: "security", label: "Security & Password", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shadow-[0_0_15px_rgba(240,124,39,0.15)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Information Section */}
      {activeSection === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-7 rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Edit3 className="w-4 h-4 text-brand-orange" />
              <h3 className="font-display font-bold text-white text-base">Edit Profile</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
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
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  Email Address
                </label>
                <div className="relative opacity-50">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Contact an admin to change your email address.
                </p>
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
                    placeholder="+91 98765 12345"
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                  College / Institution
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="Indian Institute of Information Technology"
                    className="w-full bg-[#070B14] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                  />
                </div>
              </div>

              {saveMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
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
                  {saveMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeLight text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Workshop & Lab Info (Read-Only) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl p-5 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-4">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="w-4 h-4 text-brand-orange" />
                Workshop Enrollment
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Current Workshop</span>
                  <span className="text-white font-bold">
                    {user?.enrollments?.[0]?.workshop?.name || "Skill Up 2026"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Laboratory</span>
                  <span className="text-brand-orange font-bold">
                    {myLab?.name || "Not yet assigned"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Enrollment Status</span>
                  <span
                    className={`font-bold ${
                      enrollmentStatus === "SELECTED"
                        ? "text-brand-gold"
                        : enrollmentStatus === "ENROLLED"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {enrollmentStatus || "ENROLLED"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Account Created</span>
                  <span className="text-slate-300">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-slate-500">
                Lab and workshop assignments are managed by your admin. Contact{" "}
                <a href="mailto:admin@super60.org" className="text-brand-orange hover:underline">
                  admin@super60.org
                </a>{" "}
                for changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === "security" && (
        <div className="max-w-lg">
          <div className="rounded-2xl p-6 bg-[#0F172A]/70 border border-slate-800/80 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-brand-orange" />
              <h3 className="font-display font-bold text-white text-base">Change Password</h3>
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
                  placeholder="Your existing password"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
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
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
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
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-orange font-mono"
                />
              </div>

              {pwMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
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
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeLight text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
