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
  Shield,
  ShieldAlert,
  Maximize2,
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
  passingMarks?: number | null;
  durationMinutes?: number | null;
  instructions?: string | null;
  startsAt: string;
  endsAt: string;
  questions: Question[];
}

interface TestEngineProps {
  assessment: Assessment;
  quizAnswers: Record<string, string>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submittingQuiz: boolean;
  onSubmit: (e?: React.FormEvent, violationReason?: string, warningCount?: number) => void;
  onExit: () => void;
}

type QuestionStatus = "unanswered" | "answered" | "marked" | "answered-marked";

// Audio alert synthesizer using browser Web Audio API (zero external assets)
function playAudioAlert(type: "warning" | "fatal" = "warning") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "fatal") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    /* AudioContext blocked by autoplay policy or unavailable */
  }
}

const checkIsFullscreen = () => {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
  );
};

const requestFullscreenMode = async () => {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (
      (elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen
    ) {
      await (
        elem as unknown as { webkitRequestFullscreen: () => Promise<void> }
      ).webkitRequestFullscreen();
    } else if (
      (elem as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen
    ) {
      await (elem as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
    }
  } catch (err) {
    console.warn("Fullscreen request:", err);
  }
};

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

  // Timer state: prefer configured duration, else time remaining until endsAt (capped at 90 min)
  const calcInitialTime = () => {
    const end = new Date(assessment.endsAt).getTime();
    const now = Date.now();
    const untilEnd = Math.max(0, Math.floor((end - now) / 1000));
    if (assessment.durationMinutes && assessment.durationMinutes > 0) {
      return Math.min(untilEnd, assessment.durationMinutes * 60);
    }
    return Math.min(untilEnd, 90 * 60); // cap at 90 min
  };

  const [timeLeft, setTimeLeft] = useState(calcInitialTime);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // ── STRICT PROCTORING STATE ──
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(checkIsFullscreen);
  const [proctorModal, setProctorModal] = useState<{
    isOpen: boolean;
    reason: string;
    count: number;
  } | null>(null);
  const [proctorToast, setProctorToast] = useState<string | null>(null);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [showPreflight, setShowPreflight] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem(`skillup-test-preflight-${assessment.id}`);
  });

  const lastViolationTimeRef = useRef(0);
  const proctorActiveRef = useRef(false);
  const isTerminatingRef = useRef(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = `skillup-test-draft-${assessment.id}`;

  const currentQuestion = questions[currentIdx];

  // ── VIOLATION DISPATCHER (Debounced & Auto-submits on strike 3) ──
  const triggerViolation = useCallback(
    (reason: string) => {
      if (!proctorActiveRef.current || isTerminatingRef.current) return;
      const now = Date.now();
      // 2000ms debounce prevents dual blur & visibilitychange triggers from counting as 2 strikes
      if (now - lastViolationTimeRef.current < 2000) return;
      lastViolationTimeRef.current = now;

      setWarningCount((prev) => {
        const nextCount = prev + 1;
        if (nextCount >= 3) {
          isTerminatingRef.current = true;
          setIsDisqualified(true);
          playAudioAlert("fatal");
          setProctorModal({
            isOpen: true,
            reason,
            count: 3,
          });
          // Auto-submit test with violation reason after brief visual acknowledgement
          setTimeout(() => {
            onSubmit(undefined, `Exceeded 3 proctoring warnings: ${reason}`, 3);
          }, 2200);
          return 3;
        }

        playAudioAlert("warning");
        setProctorModal({
          isOpen: true,
          reason,
          count: nextCount,
        });
        return nextCount;
      });
    },
    [onSubmit]
  );

  const triggerToast = useCallback((msg: string) => {
    setProctorToast(msg);
    setTimeout(() => {
      setProctorToast((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // ── FULLSCREEN EVENT MONITOR ──
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = checkIsFullscreen();
      setIsFullscreen(active);
      if (!active && proctorActiveRef.current && !isTerminatingRef.current) {
        triggerViolation("Exited Full-Screen mode");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [triggerViolation]);

  // ── TAB SWITCH & WINDOW BLUR MONITOR ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && proctorActiveRef.current && !isTerminatingRef.current) {
        triggerViolation("Switched browser tab or minimized window");
      }
    };

    const handleWindowBlur = () => {
      if (proctorActiveRef.current && !isTerminatingRef.current) {
        triggerViolation("Switched application or window lost focus");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [triggerViolation]);

  // ── PROCTORING ACTIVATION AFTER PREFLIGHT ──
  useEffect(() => {
    if (!showPreflight) {
      const timer = setTimeout(() => {
        proctorActiveRef.current = true;
        setIsFullscreen(checkIsFullscreen());
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showPreflight]);

  // ── CLIPBOARD & SHORTCUT PREVENTION ──
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Copying is prohibited during proctored tests!");
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Cutting text is prohibited during proctored tests!");
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Pasting is prohibited during proctored tests!");
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerToast("🚫 Right-click context menu is disabled!");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl/Cmd + C, V, X, U, S, P
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "u", "s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        triggerToast(`🚫 Shortcut (Ctrl+${e.key.toUpperCase()}) is disabled!`);
        return;
      }
      // Intercept Developer tools: F12, Ctrl+Shift+I/J/C
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        triggerToast("🚫 Developer tools are disabled!");
        return;
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerToast]);

  // ── AUTO-SAVE: persist answers to sessionStorage ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && typeof draft === "object" && Object.keys(draft).length > 0) {
          setQuizAnswers((prev) => ({ ...draft, ...prev }));
          setSavedAt(new Date().toLocaleTimeString());
        }
      }
    } catch {
      /* ignore corrupt drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.id]);

  useEffect(() => {
    try {
      if (Object.keys(quizAnswers).length > 0) {
        sessionStorage.setItem(draftKey, JSON.stringify(quizAnswers));
        setSavedAt(new Date().toLocaleTimeString());
      }
    } catch {
      /* storage unavailable — answers live in state */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizAnswers]);

  // Countdown timer with auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      formRef.current?.requestSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-save heartbeat
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      setSavedAt(new Date().toLocaleTimeString());
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getStatus = useCallback(
    (q: Question): QuestionStatus => {
      const answered = !!quizAnswers[q.id];
      const marked = markedForReview.has(q.id);
      if (answered && marked) return "answered-marked";
      if (marked) return "marked";
      if (answered) return "answered";
      return "unanswered";
    },
    [quizAnswers, markedForReview]
  );

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
  const timerWarning = timeLeft < 900; // < 15 min

  const statusColor: Record<QuestionStatus, string> = {
    unanswered: "bg-slate-800 text-slate-400 border border-slate-700",
    answered: "bg-emerald-600 text-white border border-emerald-500",
    marked: "bg-amber-500/80 text-white border border-amber-400",
    "answered-marked": "bg-purple-600 text-white border border-purple-500",
  };

  return (
    <div className="space-y-4 relative">
      {/* ── TOAST NOTIFICATION ── */}
      {proctorToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-rose-600/95 backdrop-blur-md text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-rose-400 animate-bounce">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-200" />
          <span>{proctorToast}</span>
        </div>
      )}

      {/* ── PRE-FLIGHT PROCTORING MODAL ── */}
      {showPreflight && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-brand-orange/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-brand-orange tracking-wider">
                  Strict Online Proctoring
                </span>
                <h3 className="font-display font-bold text-white text-base">
                  {assessment.title}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-white">
                Please review the proctoring rules before beginning your assessment:
              </p>
              <ul className="space-y-2 font-mono text-[11px] text-slate-300">
                <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-brand-orange font-bold">1.</span>
                  <span>
                    <strong>Full-Screen Required:</strong> The test runs exclusively in full-screen mode. Do not exit full-screen.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-brand-orange font-bold">2.</span>
                  <span>
                    <strong>No Tab / Window Switching:</strong> Tab switches, window blurring, and application switches are actively logged.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-brand-orange font-bold">3.</span>
                  <span>
                    <strong>Clipboard Blocked:</strong> Copying questions, cutting text, and pasting code or answers are strictly disabled.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 text-rose-300">
                  <span className="text-rose-400 font-bold">4.</span>
                  <span>
                    <strong>3-Strike Disqualification:</strong> You receive a maximum of 2 warnings. On the 3rd violation, the test is automatically submitted with <strong>0 marks</strong> and an incident report is forwarded to mentors and admins.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowPreflight(false);
                  await requestFullscreenMode();
                  try {
                    sessionStorage.setItem(`skillup-test-preflight-${assessment.id}`, "true");
                  } catch {
                    /* ignore */
                  }
                  setTimeout(() => {
                    proctorActiveRef.current = true;
                  }, 1200);
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold hover:brightness-110 shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> Enter Full Screen & Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROCTORING VIOLATION MODAL ── */}
      {proctorModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ${
              proctorModal.count >= 3
                ? "bg-rose-950/95 border-rose-500 shadow-rose-900/50"
                : "bg-[#0F172A] border-amber-500/50 shadow-amber-900/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  proctorModal.count >= 3
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                }`}
              >
                {proctorModal.count >= 3 ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider block ${
                    proctorModal.count >= 3 ? "text-rose-400" : "text-amber-400"
                  }`}
                >
                  {proctorModal.count >= 3
                    ? "Test Terminated"
                    : `Proctoring Warning ${proctorModal.count} / 3`}
                </span>
                <h4 className="font-display font-bold text-white text-base">
                  {proctorModal.count >= 3
                    ? "Maximum Violations Exceeded"
                    : "Proctoring Violation Detected"}
                </h4>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-300">
                <strong>Violation:</strong>{" "}
                <span className="text-rose-400 font-bold">{proctorModal.reason}</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                {proctorModal.count >= 3
                  ? "You have accumulated 3 proctoring violations. Your test session has been terminated and automatically submitted with a score of 0. An incident notification has been dispatched to your lab mentors and administrators."
                  : `Warning ${proctorModal.count} of 3 recorded. Please stay focused on the test and maintain full-screen mode. After 3 warnings, your test will be terminated and submitted as disqualified.`}
              </div>
            </div>

            {proctorModal.count >= 3 ? (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-center space-y-2">
                <div className="inline-block w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono font-bold text-rose-300">
                  Submitting disqualified test and alerting mentors & admins...
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setProctorModal(null);
                  if (!checkIsFullscreen()) {
                    await requestFullscreenMode();
                  }
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> I Understand — Resume in Full Screen
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TEST HEADER BAR ── */}
      <div className="sticky top-[105px] z-20 rounded-2xl px-5 py-3 bg-[#0B1526]/95 backdrop-blur-xl border border-slate-800/80 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Test title */}
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-brand-orange uppercase font-bold tracking-wider block">
            Assessment in Progress
          </span>
          <h3 className="font-display font-bold text-white text-sm truncate">{assessment.title}</h3>
        </div>

        {/* Center: Progress chips + Proctoring badge */}
        <div className="hidden md:flex items-center gap-2.5 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> {answered} Answered
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-3 h-3" /> {marked} Marked
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
            {unanswered} Left
          </span>

          {/* Proctoring Status Pill */}
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
              warningCount === 0
                ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                : warningCount === 1
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
            }`}
          >
            <Shield className="w-3 h-3" />
            {warningCount === 0 ? "Proctored (0/3)" : `⚠️ ${warningCount}/3 Warnings`}
          </span>

          {/* Fullscreen Button if exited */}
          {!isFullscreen ? (
            <button
              type="button"
              onClick={requestFullscreenMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-orange/20 text-brand-orange border border-brand-orange/40 hover:bg-brand-orange hover:text-white transition-all text-[10px] font-mono font-bold animate-pulse"
              title="Click to enter full-screen mode"
            >
              <Maximize2 className="w-3 h-3" /> Full Screen
            </button>
          ) : (
            <span className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
              <Maximize2 className="w-2.5 h-2.5 text-emerald-400" /> Fullscreen
            </span>
          )}
        </div>

        {/* Right: Timer + autosave + submit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {savedAt && (
            <span
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 text-[10px] font-mono"
              title="Answers auto-save locally every change"
            >
              💾 saved {savedAt}
            </span>
          )}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono font-black text-base border ${
              timerCritical
                ? "bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse"
                : timerWarning
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-slate-900 text-white border-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDisqualified || submittingQuiz}
            className="px-4 py-2 rounded-xl bg-brand-orange text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
          {!isDisqualified && (
            <button
              type="button"
              onClick={onExit}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-mono"
              title="Exit test"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── INSTRUCTIONS (collapsible) ── */}
      {assessment.instructions && showInstructions && (
        <div className="rounded-2xl p-4 bg-sky-500/5 border border-sky-500/25 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block mb-1">
              Instructions
            </span>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{assessment.instructions}</p>
            {assessment.durationMinutes && (
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                ⏱ Duration: {assessment.durationMinutes} minutes · one attempt only
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-mono flex-shrink-0"
          >
            Hide
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── QUESTION PANEL ── */}
        <div className="lg:col-span-8">
          <form ref={formRef} onSubmit={onSubmit}>
            {currentQuestion && (
              <div className="rounded-2xl p-6 bg-[#0F172A]/90 border border-slate-800/80 shadow-xl space-y-5 select-none">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>
                        Question {currentIdx + 1} of {totalQuestions}
                      </span>
                      <span>•</span>
                      <span className="text-brand-orange font-bold">
                        {currentQuestion.marks} marks
                      </span>
                      {markedForReview.has(currentQuestion.id) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          📌 Marked for Review
                        </span>
                      )}
                    </div>
                    <p className="text-base font-sans font-semibold text-white leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  </div>
                </div>

                {/* Options (multiple choice) OR free-text/code answer box */}
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt: string, oi: number) => {
                      const isSelected = quizAnswers[currentQuestion.id] === opt;
                      const letter = ["A", "B", "C", "D", "E"][oi] || String(oi + 1);
                      return (
                        <label
                          key={opt}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))
                          }
                          className={`flex items-center gap-4 p-4 rounded-xl text-sm cursor-pointer transition-all border group ${
                            isSelected
                              ? "bg-brand-orange/12 border-brand-orange/50 shadow-[0_0_15px_rgba(240,124,39,0.1)]"
                              : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm flex-shrink-0 border transition-all ${
                              isSelected
                                ? "bg-brand-orange text-white border-brand-orange shadow-md"
                                : "bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-600"
                            }`}
                          >
                            {letter}
                          </div>
                          <span
                            className={`font-sans ${
                              isSelected ? "text-white font-semibold" : "text-slate-200"
                            }`}
                          >
                            {opt}
                          </span>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            checked={isSelected}
                            onChange={() => {}}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {assessment.type === "PROGRAMMING"
                        ? "Your C++ solution (graded manually by your mentor)"
                        : "Your answer (graded manually by your mentor)"}
                    </label>
                    <textarea
                      value={quizAnswers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setQuizAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      rows={assessment.type === "PROGRAMMING" ? 14 : 5}
                      placeholder={
                        assessment.type === "PROGRAMMING"
                          ? "#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}"
                          : "Type your answer…"
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-orange transition-all select-text ${
                        assessment.type === "PROGRAMMING"
                          ? "font-mono leading-relaxed resize-y"
                          : "font-sans"
                      }`}
                      spellCheck={false}
                    />
                    <p className="text-[10px] font-mono text-slate-600">
                      💾 Saved automatically — copy & paste is disabled.
                    </p>
                  </div>
                )}

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
                      disabled={isDisqualified}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-mono font-bold hover:brightness-110 shadow-md disabled:opacity-50"
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
                <span className="text-emerald-400 font-bold">
                  {answered}/{totalQuestions}
                </span>
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
              <div className="flex justify-between">
                <span className="text-slate-400">Answered</span>
                <span className="text-emerald-400 font-bold">{answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unanswered</span>
                <span className="text-rose-400 font-bold">{unanswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Marked for Review</span>
                <span className="text-amber-400 font-bold">{marked}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Time Remaining</span>
                <span className={timerCritical ? "text-rose-400 font-bold" : "text-white"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {unanswered > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  You have <strong>{unanswered}</strong> unanswered question
                  {unanswered !== 1 ? "s" : ""}. They will be marked as wrong.
                </span>
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
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  formRef.current?.requestSubmit();
                }}
                disabled={submittingQuiz}
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
