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
  allowedViolations?: number | null;
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
    console.warn("Fullscreen request error:", err);
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
  const maxAllowedViolations =
    assessment.allowedViolations && assessment.allowedViolations > 0
      ? assessment.allowedViolations
      : 3;

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

  // ── VIOLATION DISPATCHER (Debounced & Auto-submits on strike limit) ──
  const triggerViolation = useCallback(
    (reason: string) => {
      if (!proctorActiveRef.current || isTerminatingRef.current) return;
      const now = Date.now();
      // 1200ms debounce prevents dual blur & visibilitychange or keydown & clipboard triggers from counting as 2 strikes
      if (now - lastViolationTimeRef.current < 1200) return;
      lastViolationTimeRef.current = now;

      setWarningCount((prev) => {
        const nextCount = prev + 1;
        if (nextCount >= maxAllowedViolations) {
          isTerminatingRef.current = true;
          setIsDisqualified(true);
          playAudioAlert("fatal");
          setProctorModal({
            isOpen: true,
            reason,
            count: maxAllowedViolations,
          });
          // Auto-submit test with violation reason after brief visual acknowledgement
          setTimeout(() => {
            onSubmit(
              undefined,
              `Exceeded proctoring violation limit (${maxAllowedViolations} strikes): ${reason}`,
              maxAllowedViolations
            );
          }, 2200);
          return maxAllowedViolations;
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
    [onSubmit, maxAllowedViolations]
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

  // ── CLIPBOARD & SHORTCUT PREVENTION (Triggers Proctoring Violations) ──
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Copying (Ctrl+C) is prohibited! Violation logged.");
      if (proctorActiveRef.current) {
        triggerViolation("Clipboard Violation: Attempted Copy (Ctrl+C)");
      }
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Cutting (Ctrl+X) is prohibited! Violation logged.");
      if (proctorActiveRef.current) {
        triggerViolation("Clipboard Violation: Attempted Cut (Ctrl+X)");
      }
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("🚫 Pasting (Ctrl+V) is prohibited! Violation logged.");
      if (proctorActiveRef.current) {
        triggerViolation("Clipboard Violation: Attempted Paste (Ctrl+V)");
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerToast("🚫 Right-click context menu is prohibited! Violation logged.");
      if (proctorActiveRef.current) {
        triggerViolation("Proctoring Violation: Attempted Right-Click Context Menu");
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Intercept Ctrl/Cmd + C, V, X
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(key)) {
        e.preventDefault();
        const action =
          key === "c"
            ? "Copy (Ctrl+C)"
            : key === "v"
            ? "Paste (Ctrl+V)"
            : "Cut (Ctrl+X)";
        triggerToast(`🚫 Prohibited Shortcut: ${action}! Strike recorded.`);
        if (proctorActiveRef.current) {
          triggerViolation(`Keyboard Violation: Pressed ${action}`);
        }
        return;
      }
      // Intercept Developer tools: F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+P
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        ((e.ctrlKey || e.metaKey) && ["u", "s", "p"].includes(key))
      ) {
        e.preventDefault();
        triggerToast("🚫 Inspection shortcut / DevTools prohibited! Strike recorded.");
        if (proctorActiveRef.current) {
          triggerViolation(`Keyboard Violation: Attempted Inspection Shortcut (${e.key.toUpperCase()})`);
        }
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
  }, [triggerToast, triggerViolation]);

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
    unanswered: "bg-[#F4F3F3] text-[#111111] border-[2px] border-[#111111]",
    answered: "bg-emerald-600 text-white border-[2px] border-[#111111]",
    marked: "bg-amber-400 text-[#111111] border-[2px] border-[#111111]",
    "answered-marked": "bg-purple-600 text-white border-[2px] border-[#111111]",
  };

  return (
    <div className="space-y-4 relative">
      {/* ── TOAST NOTIFICATION ── */}
      {proctorToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-rose-600 text-white font-mono text-xs font-black shadow-[4px_4px_0px_#111111] flex items-center gap-2 border-[2px] border-[#111111] animate-bounce">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-200" />
          <span>{proctorToast}</span>
        </div>
      )}

      {/* ── PRE-FLIGHT PROCTORING MODAL ── */}
      {showPreflight && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] p-6 sm:p-7 max-w-lg w-full space-y-5 text-left">
            <div className="flex items-center gap-3 border-b-[2px] border-[#111111] pb-4">
              <div className="w-12 h-12 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#F07C27]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-[#F07C27] tracking-wider block">
                  [ STRICT ONLINE PROCTORING PROTOCOL ]
                </span>
                <h3 className="font-display font-black text-[#111111] text-lg uppercase">
                  {assessment.title}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-mono font-bold text-[#111111]">
                Review the following proctoring rules before beginning your assessment:
              </p>
              <ul className="space-y-2 font-mono text-[11px]">
                <li className="flex items-start gap-2 bg-[#F9F9F9] p-2.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-[#F07C27] font-black">1.</span>
                  <span>
                    <strong>Full-Screen Required:</strong> The examination runs strictly in full-screen mode. Do not exit full-screen.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-[#F9F9F9] p-2.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-[#F07C27] font-black">2.</span>
                  <span>
                    <strong>No Tab / Window Switching:</strong> Tab switches, window blurring, and application switches are actively logged.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-[#F9F9F9] p-2.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                  <span className="text-[#F07C27] font-black">3.</span>
                  <span>
                    <strong>Clipboard Blocked:</strong> Copying questions, cutting text, and pasting code or answers are strictly disabled.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-[#fde8e8] p-2.5 border-[2px] border-[#111111] text-rose-950 font-bold shadow-[2px_2px_0px_#111111]">
                  <span className="text-rose-700 font-black">4.</span>
                  <span>
                    <strong>{maxAllowedViolations}-Strike Lockout:</strong> You receive a maximum of {maxAllowedViolations > 1 ? `${maxAllowedViolations - 1} warning${maxAllowedViolations > 2 ? "s" : ""}` : "0 warnings (zero-tolerance)"}. On violation #{maxAllowedViolations}, the test is automatically terminated, locked out, and submitted with <strong>0 marks</strong>.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2.5 bg-white text-[#111111] font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F4F3F3]"
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
                className="neo-btn flex-1 py-2.5 bg-[#F07C27] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> Enter Full Screen & Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROCTORING VIOLATION MODAL ── */}
      {proctorModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] p-6 sm:p-7 max-w-md w-full space-y-4 ${
              proctorModal.count >= maxAllowedViolations
                ? "bg-[#fde8e8] text-rose-950"
                : "bg-white text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] ${
                  proctorModal.count >= maxAllowedViolations
                    ? "bg-rose-600 text-white"
                    : "bg-amber-400 text-[#111111]"
                }`}
              >
                {proctorModal.count >= maxAllowedViolations ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <span
                  className={`text-[10px] font-mono uppercase font-black tracking-wider block ${
                    proctorModal.count >= maxAllowedViolations ? "text-rose-700" : "text-amber-800"
                  }`}
                >
                  {proctorModal.count >= maxAllowedViolations
                    ? "[ TERMINATION: LOCKED OUT ]"
                    : `[ PROCTORING WARNING ${proctorModal.count} / ${maxAllowedViolations} ]`}
                </span>
                <h4 className="font-display font-black text-lg uppercase text-[#111111]">
                  {proctorModal.count >= maxAllowedViolations
                    ? "Maximum Violations Exceeded"
                    : "Proctoring Violation Detected"}
                </h4>
              </div>
            </div>

            <div className="p-3.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-xs font-mono space-y-2 shadow-[2px_2px_0px_#111111]">
              <div className="text-[#111111]">
                <strong>Violation:</strong>{" "}
                <span className="text-rose-600 font-black">{proctorModal.reason}</span>
              </div>
              <div className="text-slate-700 text-[11px] leading-relaxed font-bold">
                {proctorModal.count >= maxAllowedViolations
                  ? `You have accumulated ${maxAllowedViolations} proctoring violations. Your test session has been terminated and locked out. An incident report has been dispatched to your lab mentors and administrators.`
                  : `Warning ${proctorModal.count} of ${maxAllowedViolations} recorded. Please avoid copying, pasting, switching tabs, or exiting full-screen. After ${maxAllowedViolations} warnings, your test session will be locked out.`}
              </div>
            </div>

            {proctorModal.count >= maxAllowedViolations ? (
              <div className="p-3.5 bg-rose-200 border-[2px] border-[#111111] text-center space-y-2">
                <div className="inline-block w-5 h-5 border-[3px] border-rose-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono font-black text-rose-950 uppercase">
                  Locking test session and alerting mentors & admins...
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
                className="neo-btn w-full py-3 bg-amber-400 hover:bg-amber-300 text-[#111111] font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> I Understand — Resume in Full Screen
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TEST HEADER BAR ── */}
      <div className="sticky top-[105px] z-20 px-5 py-3 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Test title */}
        <div className="min-w-0">
          <span className="inline-block px-2 py-0.5 border border-[#111111] bg-[#FFF0E5] text-[#F07C27] font-mono text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#111111] mb-0.5">
            [ RUNTIME: ASSESSMENT_ACTIVE ]
          </span>
          <h3 className="font-mono font-black text-[#111111] text-sm truncate">{assessment.title}</h3>
        </div>

        {/* Center: Progress chips + Proctoring badge */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> {answered} Answered
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-950 border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
            <Bookmark className="w-3 h-3 text-amber-700" /> {marked} Marked
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F3F3] text-[#111111] border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
            {unanswered} Left
          </span>

          {/* Proctoring Status Pill */}
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-[#111111] font-black shadow-[1px_1px_0px_#111111] ${
              warningCount === 0
                ? "bg-sky-100 text-sky-950"
                : warningCount === 1
                ? "bg-amber-100 text-amber-950"
                : "bg-rose-100 text-rose-950 animate-pulse"
            }`}
          >
            <Shield className="w-3 h-3" />
            {warningCount === 0
              ? `PROCTOR (0/${maxAllowedViolations})`
              : `⚠️ ${warningCount}/${maxAllowedViolations} WARNINGS`}
          </span>

          {/* Fullscreen Button if exited */}
          {!isFullscreen ? (
            <button
              type="button"
              onClick={requestFullscreenMode}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] font-black text-[10px] animate-pulse"
              title="Click to enter full-screen mode"
            >
              <Maximize2 className="w-3 h-3" /> FULL SCREEN
            </button>
          ) : (
            <span className="hidden xl:flex items-center gap-1 px-2 py-1 bg-[#F4F3F3] text-slate-700 border border-[#111111] text-[10px] font-bold">
              <Maximize2 className="w-2.5 h-2.5 text-emerald-700" /> Fullscreen
            </span>
          )}
        </div>

        {/* Right: Timer + autosave + submit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {savedAt && (
            <span
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F4F3F3] text-slate-700 border border-[#111111] text-[10px] font-mono font-bold shadow-[1px_1px_0px_#111111]"
              title="Answers auto-save locally every change"
            >
              💾 saved {savedAt}
            </span>
          )}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 font-mono font-black text-base border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] ${
              timerCritical
                ? "bg-rose-100 text-rose-950 animate-pulse"
                : timerWarning
                ? "bg-amber-100 text-amber-950"
                : "bg-white text-[#111111]"
            }`}
          >
            <Clock className="w-4 h-4 text-[#111111]" />
            {formatTime(timeLeft)}
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDisqualified || submittingQuiz}
            className="px-4 py-2 bg-[#F07C27] hover:bg-[#d96716] text-white font-mono text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
          {!isDisqualified && (
            <button
              type="button"
              onClick={onExit}
              className="p-2 bg-white text-[#111111] hover:bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-black transition-all"
              title="Exit test"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── INSTRUCTIONS (collapsible) ── */}
      {assessment.instructions && showInstructions && (
        <div className="p-4 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[4px_4px_0px_#111111] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-black text-[#F07C27] uppercase tracking-wider block mb-1">
              Instructions
            </span>
            <p className="text-xs text-slate-800 whitespace-pre-wrap font-sans font-medium">{assessment.instructions}</p>
            {assessment.durationMinutes && (
              <p className="text-[11px] font-mono text-slate-600 mt-1 font-bold">
                ⏱ Duration: {assessment.durationMinutes} minutes · one attempt only
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="px-2.5 py-1 bg-white hover:bg-[#F4F3F3] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111] text-[11px] font-mono font-bold flex-shrink-0"
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
              <div className="p-6 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] space-y-5 select-none">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 border-b-[2px] border-[#111111] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-700 font-bold">
                      <span>
                        Question {currentIdx + 1} of {totalQuestions}
                      </span>
                      <span>•</span>
                      <span className="text-[#F07C27] font-black">
                        {currentQuestion.marks} MARKS
                      </span>
                      {markedForReview.has(currentQuestion.id) && (
                        <span className="px-2 py-0.5 border border-[#111111] bg-amber-100 text-amber-900 text-[10px] font-bold shadow-[1px_1px_0px_#111111]">
                          📌 Marked for Review
                        </span>
                      )}
                    </div>
                    <p className="text-base font-sans font-bold text-[#111111] leading-relaxed">
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
                          className={`flex items-center gap-4 p-4 text-sm cursor-pointer transition-all border-[2px] border-[#111111] group ${
                            isSelected
                              ? "bg-[#FFF0E5] shadow-[4px_4px_0px_#F07C27]"
                              : "bg-[#F9F9F9] shadow-[3px_3px_0px_#111111] hover:bg-white hover:shadow-[4px_4px_0px_#111111]"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 flex items-center justify-center font-mono font-black text-sm flex-shrink-0 border-[2px] border-[#111111] transition-all ${
                              isSelected
                                ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                                : "bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
                            }`}
                          >
                            {letter}
                          </div>
                          <span
                            className={`font-sans ${
                              isSelected ? "text-[#111111] font-bold" : "text-slate-800 font-medium"
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
                    <label className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider">
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
                      className={`w-full px-4 py-3 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#111111] transition-all select-text ${
                        assessment.type === "PROGRAMMING"
                          ? "font-mono leading-relaxed resize-y"
                          : "font-sans"
                      }`}
                      spellCheck={false}
                    />
                    <p className="text-[10px] font-mono text-slate-600 font-bold">
                      💾 Saved automatically — copy & paste is disabled.
                    </p>
                  </div>
                )}

                {/* Navigation row */}
                <div className="flex items-center justify-between pt-2 border-t-[2px] border-[#111111]">
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#111111] text-xs font-mono font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F4F3F3] disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    type="button"
                    onClick={toggleMark}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-all border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] ${
                      markedForReview.has(currentQuestion.id)
                        ? "bg-amber-400 text-[#111111]"
                        : "bg-white text-slate-700 hover:bg-amber-100"
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
                      className="flex items-center gap-2 px-5 py-2 bg-[#F07C27] hover:bg-[#d96716] text-white text-xs font-mono font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] disabled:opacity-50"
                    >
                      Submit Test <Send className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#111111] text-xs font-mono font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F4F3F3] transition-all"
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
          <div className="p-5 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] sticky top-[170px]">
            <h4 className="font-mono font-black text-[#111111] text-sm mb-3 flex items-center gap-2 uppercase">
              <Flag className="w-4 h-4 text-[#F07C27]" /> Question Navigator
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 mb-4 text-[10px] font-mono font-bold">
              {[
                { label: "Answered", cls: "bg-emerald-600 text-white" },
                { label: "Unanswered", cls: "bg-[#F4F3F3] text-[#111111]" },
                { label: "Marked", cls: "bg-amber-400 text-[#111111]" },
                { label: "Ans+Marked", cls: "bg-purple-600 text-white" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 border border-[#111111] flex-shrink-0 ${l.cls}`} />
                  <span className="text-slate-700">{l.label}</span>
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
                    className={`w-full aspect-square text-xs font-mono font-black transition-all shadow-[1px_1px_0px_#111111] ${
                      isCurrent
                        ? "ring-2 ring-[#F07C27] ring-offset-2 scale-105 z-10 relative"
                        : ""
                    } ${statusColor[status]}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="mt-4 pt-3 border-t-[2px] border-[#111111] space-y-1.5 font-mono text-[11px] font-bold">
              <div className="flex justify-between">
                <span className="text-slate-600">Answered</span>
                <span className="text-emerald-700">
                  {answered}/{totalQuestions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Not Answered</span>
                <span className="text-rose-700">{unanswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Marked for Review</span>
                <span className="text-amber-800">{marked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRM SUBMIT DIALOG ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-display font-black text-[#111111] text-base uppercase">Submit Test?</h4>
                <p className="text-xs text-slate-600 font-mono mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-[#F9F9F9] border-[2px] border-[#111111] font-mono text-xs space-y-1.5 shadow-[2px_2px_0px_#111111]">
              <div className="flex justify-between">
                <span className="text-slate-600">Answered</span>
                <span className="text-emerald-700 font-bold">{answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Unanswered</span>
                <span className="text-rose-700 font-bold">{unanswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Marked for Review</span>
                <span className="text-amber-800 font-bold">{marked}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#111111]">
                <span className="text-slate-600">Time Remaining</span>
                <span className={timerCritical ? "text-rose-700 font-bold" : "text-[#111111] font-bold"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {unanswered > 0 && (
              <div className="p-3 bg-amber-50 border-[2px] border-[#111111] text-xs font-mono text-amber-950 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-700" />
                <span>
                  You have <strong>{unanswered}</strong> unanswered question
                  {unanswered !== 1 ? "s" : ""}.
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-white text-[#111111] font-mono text-xs font-bold border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F4F3F3]"
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
                className="neo-btn flex-1 py-2.5 bg-[#F07C27] text-white font-mono text-xs font-black uppercase tracking-wider disabled:opacity-50"
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
