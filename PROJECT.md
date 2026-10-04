# Project: Skill Up C++ Platform Architecture & Execution Plan

## 1. Architecture Overview
Skill Up is a C++ systems engineering education and recruitment platform developed by Super 60.
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Three.js / Canvas visualization.
- **Backend / API**: Next.js Route Handlers (`src/app/api/**`), Edge Middleware (`src/middleware.ts`), JWT authentication with httpOnly cookies.
- **Database**: PostgreSQL (Neon serverless) via Prisma ORM (23 models and enums).
- **Core Business Logic**: Weighted composite student scoring, dense workshop leaderboard rankings, quota intake management (Super 60 cutoff benchmark), interactive in-browser coding testbench and assessment engine.

---

## 2. Feature Inventory
Every one of the 51 platform features identified during the survey is catalogued below and assigned to a milestone:

| # | Feature Name | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Workshop Cohort Administration | Create, inspect, update, and manage workshop cohorts | M2 | Survey 2 |
| 2 | Multi-Year Workshop Isolation | Strict data separation across annual workshop editions | M2 | Survey 2 |
| 3 | Lab Management | Laboratory subdivisions within cohorts, capacity limits | M2 | Survey 2 |
| 4 | Lab Mentors & Students Allocation | Mentor assignment and student distribution across labs | M2 | Survey 2 |
| 5 | User Roles & Authentication | JWT in cookies, bcrypt password hashing, role enforcement | M1 | Survey 1, 2 |
| 6 | Student Profiles | Student identity, academic fields, bio, and avatar upload | M3 | Survey 2, 3 |
| 7 | Mentor Profiles | Mentor title, company, specialty, bio, and assigned lab | M2 | Survey 2 |
| 8 | Admin Management | Executive administrative oversight and role enforcement | M1 | Survey 1, 2 |
| 9 | Notes & Learning Materials | Course lecture notes, architecture guides, code attachments | M2 | Survey 2 |
| 10 | Note Organization & Access | Categorization (`NOTES`, `PDF`, `CODE`), tags search, lab scoping | M2 | Survey 2 |
| 11 | Assignment Creation & Management | Mentor authoring with max scores, due dates, instructions | M2 | Survey 2 |
| 12 | Assignment Submissions | Student code submission IDE portal with syntax highlighting | M1 | Survey 1, 2 |
| 13 | Submission Status Tracking | Status state machine (`SUBMITTED`, `REVIEWED`, `LATE`) | M2 | Survey 2 |
| 14 | Assignment Evaluation & Grading | Mentor review queue with score allocation and feedback | M1 | Survey 1, 2 |
| 15 | Assignment Deadlines & Late Flags | Deadline enforcement with automated `LATE` submission flagging | M2 | Survey 2 |
| 16 | Online Test / Assessment System | Formal assessment authoring with time limits, passing scores | M1 | Survey 1, 2 |
| 17 | Online Test Experience | Testing environment with question palette, answer tracking | M3 | Survey 2, 3 |
| 18 | Test Timer & Auto Submission | Countdown timer with automated submission on time expiry | M2 | Survey 2 |
| 19 | Test Result | Immediate score breakdown, marks earned, percentage review | M1 | Survey 1, 2 |
| 20 | Question Bank Repository | Centralized question repository by topic, difficulty, marks | M1 | Survey 1, 2 |
| 21 | Coding Assessments & Testbench | In-browser coding problem statements and testbench simulator | M2 | Survey 2 |
| 22 | Attendance Roll Call | Mentor roll call marking per session (`PRESENT`, `ABSENT`, `LATE`) | M2 | Survey 2 |
| 23 | Attendance Percentage Calculation | Real-time percentage calculated against student's assigned lab | M2 | Survey 2 |
| 24 | Attendance History | Tabular session attendance log with date, topic, and status | M2 | Survey 2 |
| 25 | Doubts & Discussion | Mentorship discussion threads between students and lab mentors | M1 | Survey 1, 2 |
| 26 | Doubt Resolution Workflow | Status progression (`OPEN` → `IN_PROGRESS` → `RESOLVED`) | M1 | Survey 1, 2 |
| 27 | Student Progress Trend | SVG progress curve, milestone velocity, Super 60 85% cutoff | M3 | Survey 2, 3 |
| 28 | Performance Reports | Multi-attribute filtering with 1-click CSV export | M2 | Survey 2 |
| 29 | Candidate Evaluation / Selection | Real-time weighted formula calculation, quota tracker | M2 | Survey 2 |
| 30 | Announcements Broadcasts | Workshop broadcasts, lab announcements, and pinning | M1 | Survey 1, 2 |
| 31 | Notifications Alert System | In-app notification alert system with unread tracking & bell | M3 | Survey 2, 3 |
| 32 | Deadlines & Reminders Widget | Aggregated upcoming deadlines for assignments and tests | M3 | Survey 2, 3 |
| 33 | Admin Dashboard Overview | Overview with stats strip, candidate quota, active workshops | M3 | Survey 2, 3 |
| 34 | User Management (CRUD) | Administrative CRUD for Students, Mentors, Admins | M1 | Survey 1, 2 |
| 35 | Role & Permission Management | Multi-tier authorization guards (`STUDENT`, `MENTOR`, `ADMIN`) | M1 | Survey 1, 2 |
| 36 | File Uploads | Base64 data-URL storage with size & type validation | M1 | Survey 1, 2 |
| 37 | Student-Mentor Assignment | Allocation linking mentors and students to specific labs | M2 | Survey 2 |
| 38 | Multi-Lab Management | Concurrent lab management with unique naming and scheduling | M2 | Survey 2 |
| 39 | Batch Actions | Batch attendance roll call, batch notification mark-as-read | M2 | Survey 2 |
| 40 | Leaderboard | Real-time workshop ranking sorted by overall weighted score | M2 | Survey 2 |
| 41 | Search & Filter Engines | Live searching and multi-attribute filtering | M2 | Survey 2 |
| 42 | Activity / Audit Log | Immutable log tracking administrative changes | M2 | Survey 2 |
| 43 | Workshop-Specific Notes | Learning materials strictly partitioned to workshops and labs | M1 | Survey 1, 2 |
| 44 | Feedback System | Student rating and review submission for mentorship and labs | M1 | Survey 1, 2 |
| 45 | Feedback Analytics | Aggregate rating metrics, category breakdown | M1 | Survey 1, 2 |
| 46 | Lab-Specific Feedback | Feedback scoped to specific laboratory environments & mentors | M1 | Survey 1, 2 |
| 47 | Multi-Attempt Tests | Configurable attempt ceilings per assessment (Schema reconciliation) | M2 | Survey 2 |
| 48 | Test Question Types | Multi-format questions (`choice` / MCQ, `text` / short-answer) | M2 | Survey 2 |
| 49 | Coding Test Evaluation | Auto-grading for MCQs; manual mentor grading for freeform code | M2 | Survey 2 |
| 50 | Late Submissions Handling | Automated late penalty flagging based on assignment deadline | M2 | Survey 2 |
| 51 | Export Reports | 1-click CSV report with student scores, rank, and status | M2 | Survey 2 |

---

## 3. Milestones

| # | Name | Scope & Objectives | Dependencies | Status |
|---|---|---|---|---|
| **M1** | Security & Authorization Hardening (R1) | Resolve SEC-01 through SEC-17 across API routes, middleware, and auth utils. Eliminate answer key leakage, unauthenticated PII harvesting, feedback deanonymization, IDOR in doubts/announcements/notes, hardcoded JWT fallback, and sensitive error exposures. | None | DONE |
| **M2** | End-to-End Bug Detection & Resolution (R2) | Resolve BUG-01 through BUG-17. Implement missing `/mentor/profile` route, fix evaluation formula default weights (sum to 100%), auto-enrollment on REGISTRATION_OPEN, workshop status update schema, assignment review maxScore boundary, resubmission state overwrites, and CSV export blob generation. | M1 | DONE |
| **M3** | UI/UX Modernization & Responsive Polish (R4) | Modernize theme with dark slate `#070B14`, `#0F172A` and Super 60 accents `#F07C27`, `#FFB703`. Implement interactive 60-cell square cohort matrix for quota tracking. Add touch support to `InteractiveTileGrid`. Build loading skeletons, upgraded empty states, responsive tables, and mobile nav. Fix CTA Band navigation. | M1, M2 | DONE |
| **M4** | Test Suite Expansion & E2E Infrastructure (R3) | Add `.eslintrc.json` and package scripts. Build comprehensive Vitest test suite expanding coverage across auth security, role elevation, calculation formulas, API security envelopes, and end-to-end user workflows. Publish `TEST_READY.md`. | M1, M2 | DONE |
| **M5** | Final Verification, Audit & Delivery | Verify `npx tsc --noEmit` (0 errors), `npm test` (100% pass), `npm run build` (0 fatal errors). Run forensic audit validation and deliver final report to Sentinel. | M1, M2, M3, M4 | DONE |

---

## 4. Interface Contracts

### 4.1 Authentication & Authorization (`src/lib/auth.ts`)
```typescript
export interface SessionUser {
  sub: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  name: string;
}

export async function getSessionUser(): Promise<SessionUser | null>;
export async function requireAuth(): Promise<SessionUser>;
export async function requireRole(allowedRoles: ("STUDENT" | "MENTOR" | "ADMIN")[]): Promise<SessionUser>;
```
*Contract Rules*:
- `requireAuth()` throws `ApiError("Unauthorized", 401, "UNAUTHORIZED")` if token is absent, malformed, or expired.
- `requireRole(roles)` calls `requireAuth()` and throws `ApiError("Forbidden", 403, "FORBIDDEN")` if `user.role` is not in `allowedRoles`.

### 4.2 API Response Envelope (`src/utils/apiResponse.ts`)
```typescript
export function successResponse<T>(data: T, status?: number, meta?: Record<string, unknown>): NextResponse;
export function errorResponse(message: string, code?: string, status?: number, details?: unknown): NextResponse;
```
*Contract Rules*:
- Success responses return `{ success: true, data: T, meta?: ... }`.
- Error responses return `{ success: false, error: { code: string, message: string, details?: ... } }`.
- In production (`process.env.NODE_ENV === "production"`), status 500 error messages MUST NOT leak database queries, table names, or stack traces.

### 4.3 Evaluation Calculation Contract (`src/lib/performance.ts`)
```typescript
export interface EvaluationWeights {
  assignments: number; // default: 30
  assessments: number; // default: 35
  attendance: number;  // default: 15
  exercises: number;   // default: 10
  doubts: number;      // default: 10 (updated to ensure sum = 100)
}

export function calculateOverallPerformance(studentId: string, workshopId: string, weights?: EvaluationWeights): Promise<OverallPerformance>;
```

---

## 5. Code Layout
- `src/app/api/**`: Next.js Route Handlers. Exclusively owned by M1 & M2 workers during backend tasks.
- `src/lib/auth.ts`, `src/lib/jwt.ts`: Authentication utilities. Owned by M1 worker.
- `src/lib/performance.ts`: Formula calculation engine. Owned by M2 worker.
- `src/app/(dashboard)/**`: Dashboard pages (Student, Mentor, Admin). Owned by M2 & M3 workers.
- `src/components/**`: Reusable UI components. Owned by M3 worker.
- `tests/**`: Vitest test suites. Owned by M4 worker / test writer.
- `tailwind.config.js`, `src/app/globals.css`: Theme tokens and styles. Owned by M3 worker.
