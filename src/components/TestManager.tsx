"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Clock,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  BookMarked,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ───────────────────────── types ───────────────────────── */

interface Question {
  prompt: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  kind: "choice" | "text";
}

interface BankQuestion {
  id: string;
  topic?: string | null;
  difficulty: string;
  prompt: string;
  options?: string[] | null;
  correctAnswer?: string | null;
  marks: number;
}

interface Result {
  id: string;
  studentId: string;
  student?: { id: string; name: string; email?: string; college?: string };
  score: number;
  status: string;
  answers?: Record<string, string> | null;
  correctCount?: number | null;
  incorrectCount?: number | null;
  unansweredCount?: number | null;
  durationSec?: number | null;
  feedback?: string | null;
  submittedAt: string;
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
  lab?: { id: string; name: string } | null;
  questions: { id: string; prompt: string; options?: unknown; marks: number }[];
  results?: Result[];
}

interface TestManagerProps {
  workshopId: string;
  labs: { id: string; name: string }[];
}

const inputCls =
  "w-full px-3 py-2 bg-[#F4F3F3] border-[2px] border-[#111111] text-[#111111] text-xs font-mono focus:outline-none focus:bg-white shadow-[2px_2px_0px_#111111] transition-all";
const labelCls = "block text-[11px] font-mono text-[#111111] uppercase tracking-wider mb-1.5 font-bold";
const btnPrimary =
  "px-4 py-2 border-[2px] border-[#111111] bg-[#F07C27] hover:bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[3px_3px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 flex items-center gap-1.5 justify-center cursor-pointer";
const btnGhost =
  "px-3 py-1.5 border-[2px] border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer";

const emptyQuestion = (): Question => ({
  prompt: "",
  options: ["", ""],
  correctAnswer: "",
  marks: 5,
  kind: "choice",
});

/* ───────────────────────── component ───────────────────────── */

export default function TestManager({
  workshopId,
  labs,
}: {
  workshopId: string;
  labs: { id: string; name: string }[];
}) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [resultsFor, setResultsFor] = useState<Assessment | null>(null);
  const [grading, setGrading] = useState<{ studentId: string; score: string; feedback: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [showBank, setShowBank] = useState(false);

  // create-form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"TEST" | "QUIZ" | "PROGRAMMING">("QUIZ");
  const [labId, setLabId] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [instructions, setInstructions] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [bankTopic, setBankTopic] = useState("C++ Basics");

  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);

  const load = async () => {
    try {
      const [aRes, bRes] = await Promise.all([
        fetch(`/api/assessments?workshopId=${workshopId}`),
        fetch(`/api/question-bank?workshopId=${workshopId}`),
      ]);
      if (aRes.ok) {
        const d = await aRes.json();
        setAssessments(d.data?.assessments || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        setBank(d.data?.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) {
      setLoading(true);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const resetForm = () => {
    setTitle("");
    setLabId("");
    setPassingMarks("");
    setInstructions("");
    setStartsAt("");
    setEndsAt("");
    setQuestions([emptyQuestion()]);
  };

  /* ── create test ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) return flash("Add at least one question", false);
    setBusy(true);
    try {
      const payload = {
        workshopId,
        labId: labId || undefined,
        title,
        type,
        totalMarks,
        passingMarks: passingMarks ? Number(passingMarks) : Math.round(totalMarks * 0.6),
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        instructions: instructions || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        questions: questions.map((q) => ({
          prompt: q.prompt,
          options: q.kind === "choice" ? q.options.filter((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer || undefined,
          marks: Number(q.marks) || 1,
        })),
      };
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create test");

      flash(`Test "${title}" created and students notified`);
      setShowCreate(false);
      resetForm();
      await load();
    } catch (err: any) {
      flash(err.message || "Failed to create test", false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete test "${name}"? This removes all its results too.`)) return;
    try {
      const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      flash("Test deleted");
      setExpandedId(null);
      await load();
    } catch {
      flash("Failed to delete test", false);
    }
  };

  /* ── results & grading ── */
  const openResults = async (a: Assessment) => {
    if (expandedId === a.id) {
      setExpandedId(null);
      setResults(null);
      setResultsFor(null);
      return;
    }
    setResultsFor(a);
    setExpandedId(a.id);
    setGrading(null);
    setResults(null);
    try {
      const res = await fetch(`/api/assessments/${a.id}/results`);
      if (res.ok) {
        const d = await res.json();
        setResults(d.data?.results || []);
      }
    } catch {
      setResults([]);
    }
  };

  const submitGrade = async () => {
    if (!grading || !resultsFor) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assessments/${resultsFor.id}/results`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: grading.studentId,
          score: Number(grading.score),
          feedback: grading.feedback || undefined,
          status: "COMPLETED",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || "Grading failed");
      }
      flash("Score recorded — student notified");
      setGrading(null);
      await openResults(resultsFor);
      await load();
    } catch (err: any) {
      flash(err.message || "Grading failed", false);
    } finally {
      setBusy(false);
    }
  };

  /* ── question bank ── */
  const saveToBank = async (q: Question) => {
    if (!q.prompt.trim()) return flash("Write the question first", false);
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          topic: bankTopic,
          prompt: q.prompt,
          options: q.kind === "choice" ? q.options.filter((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer || undefined,
          marks: Number(q.marks) || 5,
        }),
      });
      if (!res.ok) throw new Error();
      flash("Saved to question bank");
      const bRes = await fetch(`/api/question-bank?workshopId=${workshopId}`);
      if (bRes.ok) setBank((await bRes.json()).data?.questions || []);
    } catch {
      flash("Could not save to bank", false);
    }
  };

  const useBankQuestion = (b: BankQuestion) => {
    const opts = Array.isArray(b.options) ? (b.options as string[]) : [];
    setQuestions((prev) => [
      ...prev,
      {
        prompt: b.prompt,
        options: opts.length >= 2 ? [...opts] : ["", ""],
        correctAnswer: b.correctAnswer || "",
        marks: b.marks,
        kind: opts.length >= 2 ? "choice" : "text",
      },
    ]);
    flash("Question added to the test draft");
  };

  const deleteBankQuestion = async (id: string) => {
    try {
      await fetch(`/api/question-bank/${id}`, { method: "DELETE" });
      setBank((prev) => prev.filter((b) => b.id !== id));
    } catch {
      /* ignore */
    }
  };

  const updateQ = (idx: number, patch: Partial<Question>) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  /* ───────────────────────── render ───────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#111111]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#F07C27]" /> Tests & Quizzes Management
          </h3>
          <p className="text-xs text-slate-700 font-mono mt-0.5">
            Create online tests, monitor live submissions and grade student answers
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => setShowBank((v) => !v)}>
            <BookMarked className="w-3.5 h-3.5" /> Question Bank ({bank.length})
          </button>
          <button className={btnPrimary} onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate ? "Cancel" : "New Test"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold flex items-center gap-2 ${
            msg.ok
              ? "bg-emerald-100 text-emerald-900"
              : "bg-rose-100 text-rose-900"
          }`}
        >
          {msg.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
          {msg.text}
        </div>
      )}

      {/* ── question bank drawer ── */}
      {showBank && (
        <div className="border-[3px] border-[#111111] p-5 bg-white shadow-[6px_6px_0px_#111111] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-display font-black text-[#111111] text-sm uppercase tracking-tight flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#F07C27]" /> Shared Question Bank
            </h4>
            <div className="flex items-center gap-2">
              <input
                value={bankTopic}
                onChange={(e) => setBankTopic(e.target.value)}
                className="px-2 py-1 bg-[#F4F3F3] border-[2px] border-[#111111] text-[11px] font-mono text-[#111111] w-36 shadow-[1px_1px_0px_#111111]"
                placeholder="Topic"
              />
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">topic tag</span>
            </div>
          </div>
          {bank.length === 0 && (
            <p className="text-xs text-slate-600 font-mono">
              Bank is empty — click “Save to bank” next to any question while building a test.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {bank.map((b) => (
              <div
                key={b.id}
                className="p-3 border-[2px] border-[#111111] bg-[#F9F9F9] shadow-[2px_2px_0px_#111111] flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#111111] font-mono font-bold truncate">{b.prompt}</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    {b.topic || "General"} · {b.difficulty} · {b.marks} pts
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => useBankQuestion(b)}
                    className="px-2 py-1 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] text-[10px] font-mono font-bold hover:bg-[#F07C27] hover:text-white shadow-[1px_1px_0px_#111111] cursor-pointer"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteBankQuestion(b.id)}
                    className="px-2 py-1 border-[2px] border-[#111111] bg-rose-100 text-rose-800 text-[10px] font-mono font-bold hover:bg-rose-600 hover:text-white shadow-[1px_1px_0px_#111111] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── create form ── */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="border-[3px] border-[#111111] p-6 bg-white shadow-[6px_6px_0px_#111111] space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Test Title *</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unit Test 3 — Pointers & References"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                className={inputCls}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="QUIZ">Quiz</option>
                <option value="TEST">Test</option>
                <option value="PROGRAMMING">Programming (code answers, manual review)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Assign to Lab</label>
              <select className={inputCls} value={labId} onChange={(e) => setLabId(e.target.value)}>
                <option value="">All labs</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={300}
                className={inputCls}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Passing Marks</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                placeholder={`default ${Math.round(totalMarks * 0.6)}`}
              />
            </div>
            <div>
              <label className={labelCls}>Starts At *</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Ends At *</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Instructions (optional)</label>
              <textarea
                className={inputCls}
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Read every question carefully. One attempt only — the timer auto-submits."
              />
            </div>
          </div>

          {/* questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2">
              <h4 className="font-mono font-black text-[#111111] text-sm uppercase">
                Questions ({questions.length}) — total {totalMarks} marks
              </h4>
              <button
                type="button"
                className={btnGhost}
                onClick={() => setQuestions((p) => [...p, emptyQuestion()])}
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#F4F3F3] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] space-y-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black text-[#F07C27] bg-[#FFF0E5] px-2 py-0.5 border border-[#111111] shadow-[1px_1px_0px_#111111]">
                    Q{idx + 1}
                  </span>
                  <select
                    className="px-2 py-1 bg-white border-[2px] border-[#111111] text-[11px] font-mono font-bold text-[#111111] shadow-[1px_1px_0px_#111111]"
                    value={q.kind}
                    onChange={(e) => updateQ(idx, { kind: e.target.value as any })}
                  >
                    <option value="choice">Multiple choice</option>
                    <option value="text">Text / Code (manual review)</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={q.marks}
                    onChange={(e) => updateQ(idx, { marks: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border-[2px] border-[#111111] text-[11px] font-mono font-bold text-[#111111] shadow-[1px_1px_0px_#111111]"
                    title="Marks"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-600">pts</span>
                  <button
                    type="button"
                    onClick={() => saveToBank(q)}
                    className="ml-auto px-2 py-1 bg-white text-purple-900 border border-[#111111] text-[10px] font-mono font-bold hover:bg-[#FFF0E5] flex items-center gap-1 shadow-[1px_1px_0px_#111111]"
                  >
                    <BookMarked className="w-3 h-3" /> Save to bank
                  </button>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestions((p) => p.filter((_, i) => i !== idx))}
                      className="px-2 py-1 bg-rose-100 text-rose-900 border border-[#111111] text-[10px] font-mono font-bold hover:bg-rose-200 shadow-[1px_1px_0px_#111111]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <textarea
                  className={inputCls}
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => updateQ(idx, { prompt: e.target.value })}
                  placeholder="Question prompt…"
                  required
                />

                {q.kind === "choice" ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctAnswer === opt && opt.trim() !== ""}
                          onChange={() => updateQ(idx, { correctAnswer: opt })}
                          disabled={!opt.trim()}
                          title="Mark as correct answer"
                          className="accent-emerald-500"
                        />
                        <input
                          className={inputCls}
                          value={opt}
                          onChange={(e) => {
                            const old = q.options[oi];
                            const next = [...q.options];
                            next[oi] = e.target.value;
                            const patch: Partial<Question> = { options: next };
                            if (q.correctAnswer === old) patch.correctAnswer = e.target.value;
                            updateQ(idx, patch);
                          }}
                          placeholder={`Option ${oi + 1}${oi < 2 ? " *" : ""}`}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateQ(idx, {
                                options: q.options.filter((_, i) => i !== oi),
                                correctAnswer:
                                  q.correctAnswer === q.options[oi] ? "" : q.correctAnswer,
                              })
                            }
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-[11px] font-mono text-brand-orange hover:underline"
                      onClick={() => updateQ(idx, { options: [...q.options, ""] })}
                    >
                      + add option
                    </button>
                    {!q.correctAnswer && (
                      <p className="text-[10px] font-mono text-amber-400">
                        Select the radio next to the correct option.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-slate-500">
                    Students answer with text/code here — you grade it manually from the results
                    panel.
                  </p>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className={`${btnPrimary} w-full sm:w-auto`} disabled={busy}>
            {busy ? "Creating…" : `Publish Test (${totalMarks} marks)`}
          </button>
        </form>
      )}

      {/* ── tests list ── */}
      {assessments.length === 0 ? (
        <div className="py-16 border-[3px] border-[#111111] bg-white shadow-[6px_6px_0px_#111111] text-center">
          <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-[#111111] text-sm font-mono font-bold uppercase">No tests created yet</p>
          <p className="text-slate-600 text-xs font-mono mt-1">
            Use “New Test” to schedule a quiz, test or programming task
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => {
            const now = Date.now();
            const isLive =
              now >= new Date(a.startsAt).getTime() && now <= new Date(a.endsAt).getTime();
            const submitted = a.results?.length || 0;
            const avg =
              submitted > 0
                ? ((a.results || []).reduce((s, r) => s + r.score, 0) / submitted).toFixed(1)
                : "—";
            const open = expandedId === a.id;

            return (
              <div
                key={a.id}
                className="border-[3px] border-[#111111] bg-white shadow-[4px_4px_0px_#111111] overflow-hidden"
              >
                <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-[#FFF0E5] text-[#111111] uppercase shadow-[1px_1px_0px_#111111]">
                        {a.type}
                      </span>
                      {isLive && (
                        <span className="px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 shadow-[1px_1px_0px_#111111] animate-pulse">
                          ● LIVE
                        </span>
                      )}
                      {a.lab && (
                        <span className="px-2 py-0.5 border border-[#111111] text-[10px] font-mono font-bold text-[#111111] bg-[#F4F3F3]">
                          {a.lab.name}
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono font-bold text-[#111111] text-sm mt-1 truncate uppercase">
                      {a.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 mt-1 flex-wrap font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F07C27]" />
                        {new Date(a.startsAt).toLocaleString()} →{" "}
                        {new Date(a.endsAt).toLocaleString()}
                      </span>
                      {a.durationMinutes && <span>· {a.durationMinutes} min</span>}
                      <span>
                        · {a.questions?.length || 0} Q · {a.totalMarks} marks · pass{" "}
                        {a.passingMarks ?? Math.round(a.totalMarks * 0.6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right px-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                        Submissions
                      </span>
                      <span className="text-sm font-mono font-black text-[#111111] flex items-center gap-1 justify-end">
                        <Users className="w-3.5 h-3.5 text-slate-600" /> {submitted} · avg {avg}
                      </span>
                    </div>
                    <button className={btnGhost} onClick={() => openResults(a)}>
                      {open ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      Results
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      className="p-1.5 border-[2px] border-[#111111] bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 shadow-[2px_2px_0px_#111111] transition-all cursor-pointer"
                      title="Delete test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* results drawer */}
                {open && (
                  <div className="border-t-[2px] border-[#111111] p-4 bg-[#FFF0E5]/20">
                    {!results || resultsFor?.id !== a.id ? (
                      <p className="text-xs font-mono text-slate-600 py-4 text-center font-bold">
                        Loading results…
                      </p>
                    ) : results.length === 0 ? (
                      <p className="text-xs font-mono text-slate-600 py-4 text-center font-bold">
                        No submissions yet
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="text-[#111111] text-[10px] uppercase font-bold border-b-[2px] border-[#111111] bg-[#FFF0E5]">
                              <th className="text-left py-2 px-3">Student</th>
                              <th className="text-right py-2 px-3">Score</th>
                              <th className="text-right py-2 px-3">%</th>
                              <th className="text-center py-2 px-3">C / I / U</th>
                              <th className="text-right py-2 px-3">Time</th>
                              <th className="text-center py-2 px-3">Status</th>
                              <th className="text-right py-2 px-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#111111]/20">
                            {results.map((r) => {
                              const pct = Math.round((r.score / a.totalMarks) * 100);
                              const pass = r.score >= (a.passingMarks ?? a.totalMarks * 0.6);
                              return (
                                <tr key={r.id} className="hover:bg-[#FFF0E5]/40 transition-colors">
                                  <td className="py-2.5 px-3 text-[#111111] font-bold">
                                    {r.student?.name || "Student"}
                                    <span className="block text-[10px] text-slate-600 font-normal">
                                      {r.student?.email}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-[#111111] font-black">
                                    {r.score}/{a.totalMarks}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 text-right font-bold ${
                                      pass ? "text-emerald-700" : "text-rose-700"
                                    }`}
                                  >
                                    {pct}%
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-slate-600">
                                    {r.correctCount ?? "–"} / {r.incorrectCount ?? "–"} /{" "}
                                    {r.unansweredCount ?? "–"}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-600">
                                    {r.durationSec
                                      ? `${Math.floor(r.durationSec / 60)}m ${r.durationSec % 60}s`
                                      : "–"}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span
                                      className={`px-2 py-0.5 border-[2px] border-[#111111] text-[10px] font-bold shadow-[1px_1px_0px_#111111] ${
                                        r.status === "PENDING_REVIEW"
                                          ? "bg-amber-100 text-amber-900"
                                          : pass
                                          ? "bg-emerald-100 text-emerald-900"
                                          : "bg-rose-100 text-rose-900"
                                      }`}
                                    >
                                      {r.status === "PENDING_REVIEW"
                                        ? "NEEDS REVIEW"
                                        : pass
                                        ? "PASS"
                                        : "FAIL"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      className="px-2.5 py-1 border-[2px] border-[#111111] bg-white hover:bg-[#F07C27] hover:text-white text-[#111111] font-mono text-[11px] font-bold shadow-[2px_2px_0px_#111111] hover:shadow-none transition-all cursor-pointer"
                                      onClick={() =>
                                        setGrading({
                                          studentId: r.studentId,
                                          score: String(r.score),
                                          feedback: r.feedback || "",
                                        })
                                      }
                                    >
                                      <Award className="w-3 h-3 inline mr-1" />
                                      Grade
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* grading inspector for the row being graded */}
                        {grading &&
                          results
                            ?.filter((r) => r.studentId === grading.studentId)
                            .map((r) => (
                              <div
                                key={r.id}
                                className="mt-4 p-4 border-[2px] border-[#111111] bg-white shadow-[4px_4px_0px_#111111] space-y-3"
                              >
                                <h5 className="text-xs font-mono font-bold text-[#111111] uppercase">
                                  Answers — {r.student?.name}
                                  {r.status === "PENDING_REVIEW" && (
                                    <span className="ml-2 px-2 py-0.5 border border-[#111111] bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                                      NEEDS REVIEW
                                    </span>
                                  )}
                                </h5>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {a.questions?.map((q, qi) => {
                                    const ans = r.answers?.[q.id];
                                    return (
                                      <div
                                        key={q.id}
                                        className="p-3 border-[2px] border-[#111111] bg-[#F9F9F9]"
                                      >
                                        <p className="text-[11px] text-[#111111] font-mono font-bold">
                                          <span className="text-[#F07C27]">
                                            Q{qi + 1}.
                                          </span>{" "}
                                          {q.prompt}
                                        </p>
                                        <p className="text-[11px] text-emerald-800 mt-1 font-mono whitespace-pre-wrap bg-white p-2 border border-[#111111]/30">
                                          Answer: {ans || "(not answered)"}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex flex-wrap items-end gap-3 pt-2">
                                  <div>
                                    <label className={labelCls}>Score (0–{a.totalMarks})</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={a.totalMarks}
                                      className={`${inputCls} w-28`}
                                      value={grading.score}
                                      onChange={(e) =>
                                        setGrading({ ...grading, score: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[200px]">
                                    <label className={labelCls}>Feedback</label>
                                    <input
                                      className={inputCls}
                                      value={grading.feedback}
                                      onChange={(e) =>
                                        setGrading({ ...grading, feedback: e.target.value })
                                      }
                                      placeholder="Nice pointer arithmetic — watch the dangling refs."
                                    />
                                  </div>
                                  <button className={btnPrimary} disabled={busy} onClick={submitGrade}>
                                    {busy ? "Saving…" : "Save Grade"}
                                  </button>
                                  <button className={btnGhost} onClick={() => setGrading(null)}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}









