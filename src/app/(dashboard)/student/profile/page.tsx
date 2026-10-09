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
  Check,
  AlertCircle,
  Camera,
  Edit3,
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
          setUser((prev: any) => ({ ...prev, avatarUrl: dataUrl }));
          setSaveMsg({ text: "Profile avatar updated!", ok: true });
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPw !== confirmPw) {
      setPwMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: "Password updated successfully!", ok: true });
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
      <div className="flex items-center justify-center py-20 font-mono text-xs">
        <div className="w-8 h-8 bg-[#F07C27] border-[2px] border-[#111111] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#111111]">
      {/* Profile Clip Badge Hero */}
      <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-8 relative">
        <div className="absolute -top-3.5 right-6 bg-[#111111] text-white font-mono text-[10px] font-bold px-2.5 py-0.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] uppercase tracking-wider">
          [ DOSSIER // VERIFIED CANDIDATE ]
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 object-cover border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111]"
              />
            ) : (
              <div className="w-20 h-20 bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center text-2xl font-mono font-black text-[#111111]">
                {initials}
              </div>
            )}
            <label
              className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center cursor-pointer hover:bg-[#F07C27] hover:text-white transition-colors"
              title="Upload profile photo (max 512 KB)"
            >
              <Camera className="w-3.5 h-3.5" />
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
              <span className="bg-[#111111] text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border-[2px] border-[#111111]">
                SUPER 60 STUDENT
              </span>
              <span className="bg-[#F07C27] text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border-[2px] border-[#111111]">
                {enrollmentStatus || "ENROLLED"}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#111111]">
              {user?.name}
            </h1>
            <p className="text-xs font-mono font-bold text-slate-600">{user?.email}</p>

            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-700 pt-1">
              {user?.college && (
                <span className="bg-[#F4F3F3] px-2 py-0.5 border-[1.5px] border-[#111111] flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#F07C27]" />
                  {user.college}
                </span>
              )}
              {user?.branch && (
                <span className="bg-[#F4F3F3] px-2 py-0.5 border-[1.5px] border-[#111111] flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-[#111111]" />
                  {user.branch} {user.semester ? `· SEM ${user.semester}` : ""}
                </span>
              )}
              {user?.rollNumber && (
                <span className="bg-[#F4F3F3] px-2 py-0.5 border-[1.5px] border-[#111111]">
                  REG NO: {user.rollNumber}
                </span>
              )}
              {myLab && (
                <span className="bg-[#FFF0E5] px-2 py-0.5 border-[1.5px] border-[#111111] text-[#111111]">
                  LAB: {myLab.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b-[2px] border-[#111111] pb-2 font-mono text-xs">
        {[
          { id: "profile", label: "PROFILE TELEMETRY", icon: User },
          { id: "security", label: "SECURITY & PASSKEY", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-bold uppercase border-[2px] border-[#111111] transition-all cursor-pointer ${
                isActive
                  ? "bg-[#F07C27] text-white shadow-[3px_3px_0px_#111111] translate-x-0.5"
                  : "bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Information Section */}
      {activeSection === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-7 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-[2px] border-[#111111] pb-2">
              <Edit3 className="w-4 h-4 text-[#F07C27]" />
              <h3 className="font-display font-black text-sm uppercase text-[#111111]">
                EDIT PROFILE PARTICULARS
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-[#F4F3F3] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Contact an administrator to change your email identifier.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 12345"
                  className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  placeholder="Indian Institute of Information Technology"
                  className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
                />
              </div>

              {saveMsg && (
                <div
                  className={`p-2.5 text-xs font-mono font-bold flex items-center gap-2 border-[2px] ${
                    saveMsg.ok
                      ? "bg-emerald-50 text-emerald-900 border-emerald-900"
                      : "bg-rose-50 text-rose-900 border-rose-900"
                  }`}
                >
                  {saveMsg.ok ? (
                    <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-800" />
                  )}
                  {saveMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="neo-btn w-full bg-[#F07C27] text-white py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "SAVING..." : "SAVE PROFILE CHANGES"}</span>
              </button>
            </form>
          </div>

          {/* Workshop & Lab Info (Read-Only) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-3">
              <h3 className="font-display font-black text-sm uppercase text-[#111111] flex items-center gap-2 border-b-[2px] border-[#111111] pb-2">
                <Shield className="w-4 h-4 text-[#F07C27]" />
                ENROLLMENT SPECIFICATIONS
              </h3>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-[#F4F3F3] border-[2px] border-[#111111]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Workshop</span>
                  <span className="text-[#111111] font-black">
                    {user?.enrollments?.[0]?.workshop?.name || "Skill Up 2026"}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F4F3F3] border-[2px] border-[#111111]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Lab</span>
                  <span className="text-[#F07C27] font-black">
                    {myLab?.name || "Not yet allocated"}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F4F3F3] border-[2px] border-[#111111]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Status Stamp</span>
                  <span className="text-[#111111] font-black">
                    {enrollmentStatus || "ENROLLED"}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F4F3F3] border-[2px] border-[#111111]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Enrolled Date</span>
                  <span className="text-slate-700 font-bold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === "security" && (
        <div className="max-w-lg bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b-[2px] border-[#111111] pb-2">
            <Lock className="w-4 h-4 text-[#F07C27]" />
            <h3 className="font-display font-black text-sm uppercase text-[#111111]">
              UPDATE PORTAL PASSWORD
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current portal password"
                className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F9F9F9] border-[2px] border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none"
              />
            </div>

            {pwMsg && (
              <div
                className={`p-2.5 text-xs font-mono font-bold flex items-center gap-2 border-[2px] ${
                  pwMsg.ok
                    ? "bg-emerald-50 text-emerald-900 border-emerald-900"
                    : "bg-rose-50 text-rose-900 border-rose-900"
                }`}
              >
                {pwMsg.ok ? (
                  <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-800" />
                )}
                {pwMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className="neo-btn w-full bg-[#F07C27] text-white py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{pwSaving ? "UPDATING CIPHER..." : "UPDATE PASSWORD"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
