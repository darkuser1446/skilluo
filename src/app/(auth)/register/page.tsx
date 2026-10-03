"use client";

import { useState } from "react";
import Image from "next/image";
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
  CheckCircle,
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
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors";

const LABEL_CLS =
  "block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-medium";

const ICON_CLS = "w-4 h-4 text-slate-400 absolute left-3.5 top-3";

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
      <div className="min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group justify-center">
            <div className="relative h-14 w-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image src="/emblem.png" alt="Super 60" fill className="object-contain" priority />
            </div>
            <div className="text-left">
              <span className="font-display font-extrabold text-3xl tracking-tight text-brand-orange block">
                Super 60
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
                SKILL UP WORKSHOP PLATFORM
              </span>
            </div>
          </Link>

          <div className="rounded-2xl p-8 bg-[#131E3A] border border-emerald-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-3">
              Application Submitted!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Thank you for applying to Skill Up 2026. You will receive access once your
              application has been reviewed and approved by the admin team.
            </p>
            <p className="text-xs text-slate-500 font-mono mb-7">
              Keep an eye on your email for updates on your application status.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-md hover:brightness-110 transition-all"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div className="min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="relative h-14 w-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image src="/emblem.png" alt="Super 60" fill className="object-contain" priority />
            </div>
            <div className="text-left">
              <span className="font-display font-extrabold text-3xl tracking-tight text-brand-orange block">
                Super 60
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
                SKILL UP WORKSHOP PLATFORM
              </span>
            </div>
          </Link>
          <h2 className="font-display font-bold text-xl text-white mt-4">
            Student Registration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Apply for Skill Up 2026 and compete for one of 60 seats
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 sm:p-8 bg-[#131E3A] border border-white/10 shadow-2xl">
          {/* Review notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-[#F07C27]/8 border border-[#F07C27]/25 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Your application will be reviewed by the admin team before your account
              is activated.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Personal Info ── */}
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 pb-1 border-b border-white/6">
              Personal Info
            </p>

            {/* Full Name */}
            <div>
              <label className={LABEL_CLS}>Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditya Sharma"
                  value={formData.name}
                  onChange={set("name")}
                  className={INPUT_CLS}
                />
                <User className={ICON_CLS} />
              </div>
            </div>

            {/* Phone + Email — 2 col */}
            <div className="grid sm:grid-cols-2 gap-4">
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
                    placeholder="you@college.edu"
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
              <label className={LABEL_CLS}>Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={set("password")}
                  className={INPUT_CLS}
                />
                <Lock className={ICON_CLS} />
              </div>
            </div>

            {/* ── Academic Info ── */}
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 pb-1 border-b border-white/6 pt-2">
              Academic Info
            </p>

            {/* College */}
            <div>
              <label className={LABEL_CLS}>College / University</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. IIIT Hyderabad / NIT Warangal"
                  value={formData.college}
                  onChange={set("college")}
                  className={INPUT_CLS}
                />
                <Building className={ICON_CLS} />
              </div>
            </div>

            {/* Branch + Semester — 2 col */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Branch / Department</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, ECE, IT"
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

            {/* Roll Number */}
            <div>
              <label className={LABEL_CLS}>Roll Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 21CS60R01"
                  value={formData.rollNumber}
                  onChange={set("rollNumber")}
                  className={INPUT_CLS}
                />
                <Hash className={ICON_CLS} />
              </div>
            </div>

            {/* Programming Experience */}
            <div>
              <label className={LABEL_CLS}>Programming Experience</label>
              <div className="relative">
                <select
                  required
                  value={formData.programmingExperience}
                  onChange={set("programmingExperience")}
                  className={`${INPUT_CLS} pr-10 appearance-none cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#131E3A]">
                    Select your level…
                  </option>
                  {["None", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-[#131E3A]">
                      {lvl}
                    </option>
                  ))}
                </select>
                <Code2 className={ICON_CLS} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Submitting Application…" : "Submit Application"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <span className="text-brand-orange">Super 60</span>
        </div>
      </div>
    </div>
  );
}
