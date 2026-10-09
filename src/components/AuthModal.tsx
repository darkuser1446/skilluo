"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, ArrowRight, Check, User, Building } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("register");
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#login") {
        setModalMode("login");
        setIsOpen(true);
        setSubmitted(false);
      } else if (hash === "#register") {
        setModalMode("register");
        setIsOpen(true);
        setSubmitted(false);
      }
    };

    window.addEventListener("hashchange", handleHash);
    handleHash();

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#F07C27", "#111111", "#FFF0E5", "#ffffff"],
    });
  };

  const close = () => {
    setIsOpen(false);
    if (window.location.hash === "#login" || window.location.hash === "#register") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md bg-white border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] p-6 sm:p-8 overflow-hidden text-[#111111]"
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F07C27] hover:text-white flex items-center justify-center text-[#111111] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Header */}
          <div className="mb-6 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#111111] text-white font-display font-black text-sm px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] uppercase tracking-wider">
                SUPER 60
              </div>
              <div className="bg-[#F07C27] text-white font-mono text-[11px] font-black px-2 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                C++
              </div>
            </div>

            <div className="bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider mt-1">
              [ ACCESS PROTOCOL // {modalMode === "register" ? "CANDIDATE APPLICATION" : "PORTAL SIGN IN"} ]
            </div>

            <h3 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1">
              {modalMode === "register" ? "JOIN SKILL UP 2026" : "SIGN IN TO PORTAL"}
            </h3>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6 bg-[#F9F9F9] border-[3px] border-[#111111] p-6"
            >
              <div className="w-12 h-12 bg-[#F07C27] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-white mx-auto flex items-center justify-center mb-4">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-display font-black text-lg text-[#111111] uppercase">
                APPLICATION RECEIVED!
              </h4>
              <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                Thank you for applying to Skill Up 2026. The{" "}
                <span className="font-bold text-[#111111]">Super 60</span> evaluation team will
                email your screening lab schedule shortly.
              </p>
              <button
                onClick={close}
                className="neo-btn mt-6 px-6 py-2 bg-[#111111] text-white text-xs font-black uppercase tracking-wider"
              >
                DISMISS
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === "register" && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arjun Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                      College / Institution
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. NIT / IIIT / Engineering College"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                      />
                      <Building className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              {modalMode === "login" && (
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="neo-btn w-full bg-[#F07C27] text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  {modalMode === "register" ? "CONFIRM APPLICATION" : "SIGN IN TO PORTAL"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setModalMode((m) => (m === "register" ? "login" : "register"))
                  }
                  className="font-mono text-xs text-slate-600 hover:text-[#111111] underline underline-offset-4 font-bold"
                >
                  {modalMode === "register"
                    ? "Already registered? Sign in here"
                    : "Need to join Skill Up 2026? Register now"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
