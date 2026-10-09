"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  BookOpen,
  Hash,
  Code2,
  ArrowRight,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  college: string;
  branch: string;
  semester: string;
  rollNumber: string;
  programmingExperience: string;
};

const INPUT_CLS =
  "w-full pl-9 pr-3 py-2 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all";

const LABEL_CLS =
  "block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1";

const ICON_CLS = "w-4 h-4 text-slate-500 absolute left-2.5 top-2.5";

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    branch: "",
    semester: "",
    rollNumber: "",
    programmingExperience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Registration failed");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] text-[#111111] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#F07C27] selection:text-white">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 justify-center">
            <div className="bg-[#111111] text-white font-display font-black text-2xl px-3.5 py-1.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] uppercase tracking-wider">
              SUPER 60
            </div>
            <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2.5 py-2 border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111]">
              C++
            </div>
          </Link>

          <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-8 text-center">
            <div className="w-14 h-14 bg-[#F07C27] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center mx-auto mb-4 text-white">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider inline-block mb-2">
              [ STATUS: APPLICATION LOGGED ]
            </div>
            <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mb-2">
              APPLICATION SUBMITTED!
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4">
              Thank you for applying to Skill Up 2026. Your candidate dossier has been forwarded
              to the Super 60 evaluation engine for review.
            </p>
            <p className="text-[11px] text-slate-500 font-mono mb-6">
              Keep an eye on your email for screening assessment details.
            </p>
            <Link
              href="/login"
              className="neo-btn w-full bg-[#111111] text-white py-3 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2"
            >
              <span>PROCEED TO SIGN IN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div className="relative min-h-screen bg-[#F9F9F9] text-[#111111] flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-[#F07C27] selection:text-white">
      {/* Dot Grid Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60"
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-[#111111] text-white font-display font-black text-2xl px-3.5 py-1.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] uppercase tracking-wider">
              SUPER 60
            </div>
            <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2.5 py-2 border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111]">
              C++
            </div>
          </Link>
          <div className="bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider inline-block mt-2">
            [ CANDIDATE ENROLLMENT // 2026 CYCLE ]
          </div>
          <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1">
            STUDENT REGISTRATION
          </h2>
          <p className="font-mono text-xs text-slate-600 mt-1">
            Apply for Skill Up 2026 and compete for one of 60 incubator seats
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-8">
          {/* Review notice */}
          <div className="mb-5 p-3 bg-[#FFF0E5] border-[2px] border-[#111111] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#F07C27] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Applications are reviewed by the Super 60 selection engine before full lab pod
              allocation and incubator activation.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border-[2px] border-rose-900 text-rose-900 text-xs font-mono font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Personal Info ── */}
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111] pb-1 border-b-[2px] border-[#111111]">
              [ SECTION 01 // PERSONAL IDENTIFIERS ]
            </div>

            {/* Full Name */}
            <div>
              <label className={LABEL_CLS}>Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={formData.name}
                  onChange={set("name")}
                  className={INPUT_CLS}
                />
                <User className={ICON_CLS} />
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={set("phone")}
                    className={INPUT_CLS}
                  />
                  <Phone className={ICON_CLS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={set("email")}
                    className={INPUT_CLS}
                  />
                  <Mail className={ICON_CLS} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={LABEL_CLS}>Portal Password (min 6 chars)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={set("password")}
                  className={INPUT_CLS}
                />
                <Lock className={ICON_CLS} />
              </div>
            </div>

            {/* ── Academic Info ── */}
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111] pb-1 border-b-[2px] border-[#111111] pt-2">
              [ SECTION 02 // ACADEMIC PROFILE ]
            </div>

            {/* College */}
            <div>
              <label className={LABEL_CLS}>College / University</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT / IIIT / Engineering Institute"
                  value={formData.college}
                  onChange={set("college")}
                  className={INPUT_CLS}
                />
                <Building className={ICON_CLS} />
              </div>
            </div>

            {/* Branch + Semester */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Branch / Department</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE / ECE / IT"
                    value={formData.branch}
                    onChange={set("branch")}
                    className={INPUT_CLS}
                  />
                  <BookOpen className={ICON_CLS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Current Semester</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4th Sem"
                    value={formData.semester}
                    onChange={set("semester")}
                    className={INPUT_CLS}
                  />
                  <Hash className={ICON_CLS} />
                </div>
              </div>
            </div>

            {/* Roll Number + Experience */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Roll Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23CS042"
                    value={formData.rollNumber}
                    onChange={set("rollNumber")}
                    className={INPUT_CLS}
                  />
                  <Hash className={ICON_CLS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Coding Experience</label>
                <div className="relative">
                  <select
                    required
                    value={formData.programmingExperience}
                    onChange={set("programmingExperience")}
                    className={`${INPUT_CLS} pr-8 appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select level…
                    </option>
                    {["None", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                  <Code2 className={ICON_CLS} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="neo-btn w-full bg-[#F07C27] text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{loading ? "SUBMITTING DOSSIER..." : "SUBMIT APPLICATION"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs font-mono font-bold text-slate-700">
            Already have an account?{" "}
            <Link href="/login" className="text-[#F07C27] hover:underline underline-offset-4">
              Sign in to portal
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <strong className="text-[#111111]">Super 60</strong>
        </div>
      </div>
    </div>
  );
}
