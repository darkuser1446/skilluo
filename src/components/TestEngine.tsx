"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Send,
} from "lucide-react";

interface Question {
  id: string;
  prompt: string;
  options: string[];
  marks: number;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  totalMarks: number;
  startsAt: string;
  endsAt: string;
  questions: Question[];
}

interface TestEngineProps {
  assessment: Assessment;
  quizAnswers: Record<string, string>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submittingQuiz: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onExit: () => void;
}

type QuestionStatus = "unanswered" | "answered" | "marked" | "answered-marked";

export default function TestEngine({
  assessment,
  quizAnswers,
  setQuizAnswers,
  submittingQuiz,
  onSubmit,
  onExit,
}: TestEngineProps) {
  const questions = assessment.questions || [];
  const totalQuestions = questions.length;

  // Timer state: duration derived from endsAt - now (capped at 90 min)
  const calcInitialTime = () => {
    const end = new Date(assessment.endsAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((end - now) / 1000));
    return Math.min(remaining, 90 * 60); // cap at 90 min
  };

  const [timeLeft, setTimeLeft] = useState(calcInitialTime);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const currentQuestion = questions[currentIdx];

  // Countdown timer with auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      formRef.current?.requestSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-save answers every 30s (just saves to state, already reactive)
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      // answers are already in state; this is a hook point for future server-side draft saving
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getStatus = useCallback((q: Question): QuestionStatus => {
    const answered = !!quizAnswers[q.id];
    const marked = markedForReview.has(q.id);
    if (answered && marked) return "answered-marked";
    if (marked) return "marked";
    if (answered) return "answered";
    return "unanswered";
  }, [quizAnswers, markedForReview]);

  const toggleMark = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const answered = Object.keys(quizAnswers).length;
  const marked = markedForReview.size;
  const unanswered = totalQuestions - answered;
  const isLastQuestion = currentIdx === totalQuestions - 1;
  const timerCritical = timeLeft < 300; // < 5 min
  const timerWarning = timeLeft < 900;  // < 15 min

  const statusColor: Record<QuestionStatus, string> = {
    unanswered: "bg-slate-800 text-slate-400 border border-slate-700",
    answered: "bg-emerald-600 text-white border border-emerald-500",
    marked: "bg-amber-500/80 text-white border border-amber-400",
    "answered-marked": "bg-purple-600 text-white border border-purple-500",
  };

  return (
    <div className="space-y-4">
      {/* ── TEST HEADER BAR ── */}
      <div className="sticky top-[105px] z-20 rounded-2xl px-5 py-3 bg-[#0B1526]/95 backdrop-blur-xl border border-slate-800/80 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Test title */}
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-brand-orange uppercase font-bold tracking-wider block">Assessment in Progress</span>
          <h3 className="font-display font-bold text-white text-sm truncate">{assessment.title}</h3>
        </div>

        {/* Center: Progress chips */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> {answered} Answered
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-3 h-3" /> {marked} Marked
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
            {unanswered} Left
          </span>
        </div>

        {/* Right: Timer + submit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono font-black text-base border ${
            timerCritical
              ? "bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse"
              : timerWarning
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-slate-900 text-white border-slate-800"
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
          <button
            type="button"
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-mono"
            title="Exit test (answers not saved)"
          >✕</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── QUESTION PANEL ── */}
        <div className="lg:col-span-8">
          <form ref={formRef} onSubmit={onSubmit}>
            {currentQuestion && (
              <div className="rounded-2xl p-6 bg-[#0F172A]/90 border border-slate-800/80 shadow-xl space-y-5">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>Question {currentIdx + 1} of {totalQuestions}</span>
                      <span>•</span>
                      <span className="text-brand-orange font-bold">{currentQuestion.marks} marks</span>
                      {markedForReview.has(currentQuestion.id) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">📌 Marked for Review</span>
                      )}
                    </div>
                    <p className="text-base font-sans font-semibold text-white leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt: string, oi: number) => {
                    const isSelected = quizAnswers[currentQuestion.id] === opt;
                    const letter = ["A", "B", "C", "D", "E"][oi] || String(oi + 1);
                    return (
                      <label
                        key={opt}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))}
                        className={`flex items-center gap-4 p-4 rounded-xl text-sm cursor-pointer transition-all border group ${
                          isSelected
                            ? "bg-brand-orange/12 border-brand-orange/50 shadow-[0_0_15px_rgba(240,124,39,0.1)]"
                            : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm flex-shrink-0 border transition-all ${
                          isSelected
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-600"
                        }`}>
                          {letter}
                        </div>
                        <span className={`font-sans ${isSelected ? "text-white font-semibold" : "text-slate-200"}`}>{opt}</span>
                        <input type="radio" name={currentQuestion.id} checked={isSelected} onChange={() => {}} className="sr-only" />
                      </label>
                    );
                  })}
                </div>

                {/* Navigation row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold disabled:opacity-30 transition-all border border-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    type="button"
                    onClick={toggleMark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      markedForReview.has(currentQuestion.id)
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400 hover:border-amber-500/40"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"}
                  </button>

                  {isLastQuestion ? (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-mono font-bold hover:brightness-110 shadow-md"
                    >
                      Submit Test <Send className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all border border-slate-700"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── QUESTION NAVIGATOR ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl p-5 bg-[#0F172A]/90 border border-slate-800/80 shadow-md sticky top-[170px]">
            <h4 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-brand-orange" /> Question Navigator
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 mb-4 text-[10px] font-mono">
              {[
                { label: "Answered", cls: "bg-emerald-600 text-white" },
                { label: "Unanswered", cls: "bg-slate-800 text-slate-400" },
                { label: "Marked", cls: "bg-amber-500 text-white" },
                { label: "Ans+Marked", cls: "bg-purple-600 text-white" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded flex-shrink-0 ${l.cls}`} />
                  <span className="text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Question grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const status = getStatus(q);
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-full aspect-square rounded-lg text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? "ring-2 ring-brand-orange ring-offset-1 ring-offset-[#0F172A] scale-110 z-10 relative"
                        : ""
                    } ${statusColor[status]}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Answered</span>
                <span className="text-emerald-400 font-bold">{answered}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Not Answered</span>
                <span className="text-rose-400 font-bold">{unanswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Marked for Review</span>
                <span className="text-amber-400 font-bold">{marked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRM SUBMIT DIALOG ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white">Submit Test?</h4>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Answered</span><span className="text-emerald-400 font-bold">{answered}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Unanswered</span><span className="text-rose-400 font-bold">{unanswered}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Marked for Review</span><span className="text-amber-400 font-bold">{marked}</span></div>
              <div className="flex justify-between pt-1 border-t border-slate-800"><span className="text-slate-400">Time Remaining</span><span className={timerCritical ? "text-rose-400 font-bold" : "text-white"}>{formatTime(timeLeft)}</span></div>
            </div>

            {unanswered > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>You have <strong>{unanswered}</strong> unanswered question{unanswered !== 1 ? "s" : ""}. They will be marked as wrong.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700 hover:bg-slate-700"
              >
                Go Back
              </button>
              <button
                type="submit"
                form="test-form"
                disabled={submittingQuiz}
                onClick={(e) => { setShowConfirm(false); formRef.current?.requestSubmit(); }}
                className="flex-1 py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold hover:brightness-110 shadow-md disabled:opacity-50"
              >
                {submittingQuiz ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
