"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, ArrowRight, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import Super60Logo from "./Super60Logo";


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
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#F07C27", "#FFA048", "#FFB703", "#2D325E", "#ffffff"],
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl p-7 sm:p-8 bg-[#131E3A] border border-brand-orange/40 shadow-[0_20px_50px_rgba(240,124,39,0.25)] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <Super60Logo size="sm" subtitleText={modalMode === "register" ? "REGISTER" : "LOGIN"} />
          </div>


          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-xl text-white">
                Application Received!
              </h4>
              <p className="text-sm text-slate-300 mt-2">
                Thank you for applying to Skill Up 2026. The{" "}
                <span className="text-brand-orange font-bold">Super 60</span> evaluation team will
                email your screening lab schedule shortly.
              </p>
              <button
                onClick={close}
                className="mt-6 px-6 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science & Eng."
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {modalMode === "login" && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(240,124,39,0.5)] hover:shadow-[0_0_30px_rgba(240,124,39,0.8)] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  {modalMode === "register" ? "Confirm Registration" : "Log In to Portal"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setModalMode((m) => (m === "register" ? "login" : "register"))
                  }
                  className="text-xs text-slate-400 hover:text-brand-orange transition-colors font-medium"
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
