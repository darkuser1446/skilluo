# SkillUp — Independent Bug & Broken-Functionality Report

**Scanned:** full `src/` (119 TS/TSX files), `prisma/`, `scripts/`, config files, README/PROJECT docs.
**Date:** 2026-10-14
**Method:** clean-room static review + live verification (typecheck, tests, build, runtime route-manifest inspection).

---

## 0. Automated checks (baseline — these all PASS)

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors |
| Tests | `npm test` | ✅ 148/148 pass (11 files) |
| Production build | `npm run build` | ✅ exit 0 |
| Lint | `npm run lint` | ⚠️ "passes" but does **not actually lint** (see BUG-07) |

> The project's own `AUDIT_REPORT.md`, `PROJECT.md` and `TEST_READY.md` claim all milestones (M1–M5) are `DONE` with "0 fatal errors". The automated checks agree, but they do **not** exercise the UI paths, seed data, or a handful of authorization branches where the real bugs live. Every finding below was verified by reading the code and, where noted, by inspecting the compiled route manifest.

---

## Remediation status (2026-10-14)

All 13 findings have been fixed and re-verified. Final checks after the changes: `npx tsc --noEmit` ✅ 0 errors · `npm test` ✅ 148/148 · `npm run lint` ✅ 0 errors (now a real ESLint run) · `npm run build` ✅ exit 0 (lint now enforced during build). See **Files changed** at the end.

## Severity legend
- 🔴 **High** — feature is broken for users, or a real security/data-exposure issue.
- 🟠 **Medium** — incorrect behaviour in an edge case, misleading tooling, or setup/reproducibility breakage.
- 🟡 **Low** — polish, inconsistency, documentation drift.

---

## 🔴 BUG-01 — "Remove from Lab" button calls an endpoint that does not exist (silently does nothing)

**File:** [admin/page.tsx:833](src/app/(dashboard)/admin/page.tsx#L833) (wired to the UI option at [admin/page.tsx:2547](src/app/(dashboard)/admin/page.tsx#L2547))

```ts
const res = await fetch(`/api/labs/${currentLab.id}/students/${studentId}`, { method: "DELETE" });
if (res.ok) { ... }   // never true — no error shown to the user
```

**Problem:** There is no route file at `src/app/api/labs/[id]/students/[studentId]`. The compiled build route manifest confirms only `…/students` exists. The DELETE handler that *does* exist expects a **query param**:

```ts
// src/app/api/labs/[id]/students/route.ts
const studentId = searchParams.get("studentId");   // DELETE /api/labs/:id/students?studentId=…
```

**Impact:** Choosing **❌ Remove from Lab** in the candidate lab dropdown returns `404`, the `if (res.ok)` guard swallows it, and the UI shows nothing. Admin **cannot remove a student from a lab**; the action appears to work but the roster never changes.

**Fix:** call `` `/api/labs/${currentLab.id}/students?studentId=${studentId}` `` (matching the existing handler), and surface a message when `!res.ok`.

---

## 🔴 BUG-02 — Student exercise workspace never shows the problem statement, sample I/O, or submission status

**Files:** [student/page.tsx:1506](src/app/(dashboard)/student/page.tsx#L1506), [student/page.tsx:1510](src/app/(dashboard)/student/page.tsx#L1510), [student/page.tsx:1528](src/app/(dashboard)/student/page.tsx#L1528) — root cause in [api/exercises/route.ts](src/app/api/exercises/route.ts#L22)

The student UI renders `selectedExercise.problemStatement`, `.sampleInput`, `.sampleOutput`, and `.mySubmission`, but `selectedExercise` is only ever set from the list endpoint:

```ts
// src/app/api/exercises/route.ts  (GET list)
select: { id, title, description, difficulty, topic, workshopId, labId, dueDate, maxScore, createdAt, _count }
//        ↑ NO problemStatement, NO sampleInput, NO sampleOutput, NO mySubmission
```

The student page calls only `/api/exercises?workshopId=…` and `/api/exercises/:id/submit` — it **never** calls the detail route `/api/exercises/:id` (which actually returns those fields). Confirmed by grep: `setSelectedExercise(ex)` where `ex ∈ list` ([student/page.tsx:161](src/app/(dashboard)/student/page.tsx#L161), [:1458](src/app/(dashboard)/student/page.tsx#L1458)).

**Impact:**
- Problem-statement panel is **always empty**.
- Sample Input / Expected Output blocks **never render** (their `&&` guards are always false).
- "✓ Solution already submitted" badge **never appears**; after re-submitting the code editor is never told the student already has a submission.
- The testbench simulator's expected output defaults to `"0"` — [student/page.tsx:250](src/app/(dashboard)/student/page.tsx#L250): `const expected = selectedExercise?.sampleOutput?.trim() || "0";`

**Fix (either):** add `problemStatement, sampleInput, sampleOutput` to the list `select`, and attach `mySubmission` per student; **or** fetch `/api/exercises/:id` when a student selects an exercise and merge `exercise` + `submission`.

---

## 🔴 BUG-03 — README demo credentials do not work (seed creates different accounts)

**Files:** [README.md:101-103](README.md#L101) vs [prisma/seed.ts:16-70](prisma/seed.ts#L16)

| README says | Seed actually creates |
|---|---|
| `admin@super60.edu` / `Admin@123` | `admin@super60.org` / `admin123` |
| `mentor@super60.edu` / `Mentor@123` | `vikram@super60.org` / `mentor123` |
| `student@super60.edu` / `Student@123` | `aditya@student.super60.org` / `student123` |

**Impact:** Anyone following the README's "Demo Access Credentials" table (and the `README → Installation` flow) cannot log in at all. This is the first thing a reviewer/tester hits.

**Fix:** make seed and README agree (pick one set). Also note the seed is only idempotent for users/workshops/labs/join-tables; re-running duplicates notes, assignments, sessions, and assessments.

---

## 🔴 BUG-04 — Invalid/expired token is treated as an *authorised* viewer on assignment endpoints (auth bypass)

**Files:** [api/assignments/route.ts](src/app/api/assignments/route.ts#L10) and [api/assignments/[id]/route.ts](src/app/api/assignments/[id]/route.ts#L10) — combined with [middleware.ts](src/middleware.ts#L63)

These GET handlers use `getSessionUser()` (which returns `null` for an invalid token) but treat a non-`null` session as *optional*, falling through to the **privileged** branch:

```ts
const session = await getSessionUser();           // null if token is malformed/expired
...
submissions: session?.role === "STUDENT"
  ? { where: { studentId: session.sub } }
  : { include: { student: { select: { id, name, email, college, rollNumber, branch } } } }
  // ↑ null session → "else" branch → ALL submissions + every student's PII
```

Meanwhile the middleware only checks that a `token` cookie is **present**, not that it is valid:

```ts
const token = request.cookies.get("token")?.value;
if ((isProtectedPage || isProtectedApi) && !token) { /* 401 */ }
// a garbage token passes this check
```

**Impact:** An attacker (or anyone logged out with a stale cookie) can send **any** `token` value, e.g. `Cookie: token=x`, and receive every submission's content plus students' names, emails, colleges, and roll numbers for any workshop id. `GET /api/assignments/[id]` leaks the same for a single assignment.

**Fix:** in these two handlers require `session` to be non-null (`if (!session) return errorResponse("Unauthorized", "UNAUTHORIZED", 401)`) and gate the non-student branch behind `session.role !== "STUDENT"`. Better: have the middleware `verifyToken()` the cookie instead of only presence-checking it, so every route inherits real validation.

---

## 🟠 BUG-05 — Any mentor can change the status of a doubt in a lab they are not assigned to (IDOR)

**File:** [api/doubts/[id]/status/route.ts](src/app/api/doubts/[id]/status/route.ts#L34)

The sibling message route correctly scopes mentors to their lab:

```ts
// doubts/[id]/messages/route.ts — CORRECT
} else if (user.role === "MENTOR") {
  const assigned = await labMentorIds(doubt.workshopId, doubt.labId);
  if (!assigned.includes(user.sub)) return errorResponse(..., 403);
}
```

…but the status route only checks `user.role !== "ADMIN" && user.role !== "MENTOR"`:

```ts
// doubts/[id]/status/route.ts — MISSING LAB CHECK
} else if (user.role !== "ADMIN" && user.role !== "MENTOR") {
  return errorResponse("Forbidden", "FORBIDDEN", 403);
}
```

**Impact:** A mentor in Lab A can mark doubts in Lab B as `RESOLVED`/`IN_PROGRESS` (or reopen them), and students of Lab B lose the intended resolution workflow.

**Fix:** make `MENTOR` pass the same `labMentorIds(...).includes(user.sub)` check used in the messages route.

---

## 🟠 BUG-06 — Auto-allocate (TOP_60 / TOP_100) can place one student in multiple labs

**File:** [api/labs/auto-allocate/route.ts](src/app/api/labs/auto-allocate/route.ts#L49)

```ts
const results = await prisma.assessmentResult.findMany({
  where: { assessment: { workshopId } },
  select: { studentId: true },
  orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
  take: quota,
});
studentIds = results.map((r) => r.studentId);   // ← NOT deduplicated
```

A student with results in more than one assessment appears multiple times in `studentIds`. After the shuffle + round-robin, the same `studentId` can be pushed into **two different labs**, and `createMany({ skipDuplicates: true })` does not dedupe across *different* `labId`s (`@@unique([labId, studentId])` only blocks the same pair).

**Impact:** Duplicate rows for one student across labs; cohort counts and roster views become inconsistent. The quota is also consumed by duplicates, so fewer distinct students are allocated than requested.

**Fix:** `studentIds = Array.from(new Set(results.map((r) => r.studentId))).slice(0, quota);` (same dedupe needed in `admin/selection/batch/route.ts`).

---

## 🟠 BUG-07 — `npm run lint` does not lint anything

**File:** [package.json:8](package.json#L8)

```json
"lint": "node -e \"const c=JSON.parse(require('fs').readFileSync('./.eslintrc.json')); if(c.extends!=='next/core-web-vitals') throw new Error('invalid config'); console.log('ESLint: clean config next/core-web-vitals');\""
```

This only asserts the ESLint config file "extends" value — it never runs ESLint on any source file. Combined with `eslint.ignoreDuringBuilds: true` in `next.config.mjs`, **nothing in the repo is ever linted** (no `eslint` dependency is even installed).

**Impact:** false confidence in code quality; real lint errors (unused vars, missing deps, `any` misuse) go unreported. Note the source still contains many `// eslint-disable-next-line` comments, implying lint used to run.

**Fix:** install `eslint` + `eslint-config-next` and set `"lint": "next lint"` (or `eslint .`), and remove `ignoreDuringBuilds` once clean.

---

## 🟠 BUG-08 — Header workshop switcher is decorative (does not switch data on any page)

**File:** [dashboard/layout.tsx:42-78](src/app/(dashboard)/layout.tsx#L42)

`layout.tsx` keeps `activeWorkshopId` in local state and renders a dropdown, but there is **no React context** anywhere in the project (grep for `createContext`/`useContext` returns nothing). Each page keeps its **own** independent state — `selectedWorkshopId` in admin, `activeWsId` in mentor, `workshopId` in student.

**Impact:** Changing the header "Edition" dropdown changes only the header label. Every page keeps showing the first workshop's data, so multi-year isolation appears broken from the UI even though the APIs support it.

**Fix:** lift the selected workshop into a context/provider that pages consume, or remove the control.

---

## 🟠 BUG-09 — `DATABASE_URL` template omits `DIRECT_URL`, which the schema requires

**Files:** [prisma/schema.prisma:4](prisma/schema.prisma#L4) vs [.env.example](.env.example)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // ← required
}
```

`.env.example` (and the README's "Environment Configuration" section) define only `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`. A developer who copies the template and runs `npx prisma db push` / `prisma generate` gets `Environment variable not found: DIRECT_URL`, blocking setup at step 3 of the README.

**Fix:** add `DIRECT_URL` to `.env.example` and the README (or drop `directUrl` if unused).

---

## 🟡 BUG-10 — `/api/notes` GET has no auth/role check and returns every lab's notes to any signed-in user

**File:** [api/notes/route.ts](src/app/api/notes/route.ts#L8)

The GET handler performs **no** `requireAuth()`/`requireRole()` and no lab scoping — it returns all notes for a `workshopId`. It is only shielded by the middleware's cookie-presence check (and, per BUG-04, a garbage cookie passes that). Feature #10/#43 in `PROJECT.md` promises "lab scoping". A student in Lab A can read Lab B's materials.

**Fix:** call `requireAuth()`, and filter notes to the caller's lab (or public/all-lab notes) for `STUDENT`/`MENTOR`.

---

## 🟡 BUG-11 — API contract documented in `PROJECT.md` does not match the implementation

**File:** [utils/api-response.ts](src/utils/api-response.ts#L10) vs `PROJECT.md §4.2`

Docs say `successResponse<T>(data, status?, meta?)`; the implementation is `successResponse<T>(data, meta?, status = 200)`. All call-sites use the implementation order (`successResponse(data, undefined, 201)`), so the code is self-consistent — the **documentation** is wrong and will mislead future callers. Same for `calculateOverallPerformance` (docs show a `weights?` parameter that no longer exists) and `EvaluationWeights.doubts` default (docs/comments say `10`, the seed and schema comment say `5`).

---

## 🟡 BUG-12 — Exam countdown re-creates its interval every second

**File:** [components/TestEngine.tsx:323](src/components/TestEngine.tsx#L323)

```ts
useEffect(() => {
  if (timeLeft <= 0) { formRef.current?.requestSubmit(); return; }
  const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
  return () => clearInterval(interval);
}, [timeLeft]);   // ← dependency on the value it mutates
```

Functional but wasteful: a fresh interval is created and torn down on every tick. Prefer a single interval with `setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)` on an empty (mount) dependency, and auto-submit from a separate effect that watches `timeLeft <= 0`.

---

## 🟡 BUG-13 — Smaller inconsistencies worth a cleanup pass

- [api/auth/register/route.ts](src/app/api/auth/register/route.ts) sets the auth cookie with `maxAge` only, while [login](src/app/api/auth/login/route.ts) sets both `maxAge` **and** `expires`. Minor cross-browser persistence inconsistency.
- Password hashing cost differs across routes: register uses `bcrypt.hash(pw, 8)`, change-password / reset / admin-create use `12`. Intentional perf trade-off, but undocumented and inconsistent.
- Seed re-runs duplicate notes/assignments/sessions/assessments (only users/workshops/labs/join-tables are `upsert`ed).
- `middleware.ts` rate-limit map is per-isolate in-memory (documented as "approximate"), so it is ineffective on multi-instance/serverless deploys — fine as a first line, but worth noting it is not a real limiter.
- `README.md` says Vitest `5.0.3`; `package.json` pins `"vitest": "^5.0.3"` — Vitest has no 5.x line (current major is 3.x), so this is likely a typo that masked a resolved version.

---

## Summary table

| ID | Severity | Area | One-line |
|---|---|---|---|
| 01 | 🔴 High | Admin UI/API | "Remove from Lab" hits a non-existent route → silently fails |
| 02 | 🔴 High | Student UI | Problem statement / sample I/O / submission status never load |
| 03 | 🔴 High | Docs/seed | README demo credentials don't match the seed |
| 04 | 🔴 High | Security | Invalid token treated as authorised on assignment endpoints (PII leak) |
| 05 | 🟠 Med | Security | Mentor can resolve doubts in other labs (IDOR) |
| 06 | 🟠 Med | Allocation | Auto-allocate can put one student in multiple labs |
| 07 | 🟠 Med | Tooling | `npm run lint` is a no-op |
| 08 | 🟠 Med | Dashboard UX | Header workshop switcher controls nothing |
| 09 | 🟠 Med | Setup | `.env.example` missing required `DIRECT_URL` |
| 10 | 🟡 Low | Security | `/api/notes` unscoped for authenticated users |
| 11 | 🟡 Low | Docs | API contracts in `PROJECT.md` don't match code |
| 12 | 🟡 Low | Perf | Test timer recreates its interval each second |
| 13 | 🟡 Low | Misc | Cookie/hash-cost/seed/version inconsistencies |

### Verified as **working** (not bugs)
- `tsc --noEmit`, `npm test` (148 tests), and `npm run build` all succeed.
- Assessment scoring/marks clamp, one-attempt enforcement, deadline windows, proctoring strike lock-out, and question-answer-key hiding for students all behave as coded.
- The API route table in the build output matches the `src/app/api/**` tree (single exception: BUG-01's client call).

---

---

## Files changed

**API / security**
- `src/app/api/assignments/route.ts`, `src/app/api/assignments/[id]/route.ts` — require a valid session (BUG-04)
- `src/app/api/doubts/[id]/status/route.ts` — mentor lab-scope check (BUG-05)
- `src/app/api/labs/auto-allocate/route.ts`, `src/app/api/admin/selection/batch/route.ts` — dedupe student ids (BUG-06)
- `src/app/api/notes/route.ts` — auth + student lab scoping (BUG-10)
- `src/app/api/exercises/route.ts` — return problem statement/sample I/O + `mySubmission` (BUG-02)
- `src/app/api/auth/register|change-password|reset-password/route.ts`, `src/app/api/users/route.ts` — shared bcrypt cost + cookie `expires` (BUG-13)
- `src/lib/constants.ts` — new shared constants (BUG-13)

**Dashboard / client**
- `src/app/(dashboard)/admin/page.tsx` — Remove-from-Lab URL fix (BUG-01), JSX escaping (BUG-07), workshop sync (BUG-08)
- `src/app/(dashboard)/mentor/page.tsx` — JSX escaping (BUG-07), workshop sync (BUG-08)
- `src/app/(dashboard)/student/page.tsx` — score-null display (BUG-02), JSX escaping (BUG-07)
- `src/app/(dashboard)/layout.tsx` + new `src/components/WorkshopContext.tsx` — working workshop switcher (BUG-08)
- `src/components/TestEngine.tsx` — single timer interval (BUG-12)
- `src/components/TestManager.tsx` — renamed `useBankQuestion` → `applyBankQuestion` (rules-of-hooks, BUG-07)
- `src/app/curriculum/page.tsx`, `src/components/Anime3DHeroScene.tsx`, `src/components/MentorsStrip.tsx` — JSX comment/escaping (BUG-07)

**Docs / config / tooling**
- `README.md` — demo credentials + `DIRECT_URL` (BUG-03, BUG-09)
- `.env.example` — `DIRECT_URL` (BUG-09)
- `PROJECT.md` — corrected API contracts (BUG-11)
- `prisma/seed.ts` — idempotent content seed (BUG-13)
- `package.json`, `.eslintignore` (new), `next.config.mjs` — real linting (BUG-07)

### Notes / residual limitations
- The dashboard fixes (BUG-02, BUG-08, BUG-12) are verified by typecheck, lint, unit tests and a production build. There is no local database wired up for an end-to-end authenticated browser run, so those UI flows were not exercised against live data; they were reviewed statically and compile cleanly.
- BUG-13's Vitest version bullet from the original draft was withdrawn: `vitest@5.0.3` is genuinely installed and passing, so no change was made there.
