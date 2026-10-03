# Skill Up Workshop Platform — Architecture & Plan Document

## 0. Decisions Confirmed

| Concern | Decision |
|---|---|
| Framework | **Next.js (App Router) full-stack** — frontend + API Route Handlers in one app |
| Language | **TypeScript** (strict mode) |
| Database | **PostgreSQL on Neon** (serverless) |
| ORM | **Prisma** (schema-first migrations) |
| Auth | **Custom JWT** — httpOnly cookies, auth/role middleware mirroring your spec's flow |
| Structure | **Feature-based modular monolith** (your §11 layout, adapted to Next.js) |
| Deliverable now | **Plan only** — no code written |

---

## 1. Repository Structure

```
skillup/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    # demo workshop, users, labs
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # login, register route groups
│   │   ├── (dashboard)/
│   │   │   ├── student/           # student-facing pages
│   │   │   ├── mentor/            # mentor-facing pages
│   │   │   └── admin/             # admin-facing pages
│   │   └── api/                   # Route Handlers = your §12 API surface
│   │       ├── auth/
│   │       ├── users/
│   │       ├── students/
│   │       ├── mentors/
│   │       ├── workshops/
│   │       ├── labs/
│   │       ├── assignments/
│   │       ├── notes/
│   │       ├── doubts/
│   │       ├── attendance/
│   │       ├── assessments/
│   │       ├── feedback/
│   │       └── admin/
│   ├── modules/                   # ← business logic lives HERE, not in route handlers
│   │   ├── auth/                  # auth.routes.ts | auth.controller.ts |
│   │   ├── users/                 #   auth.service.ts | auth.validation.ts |
│   │   ├── students/              #   auth.model.ts (Prisma queries live in services)
│   │   ├── mentors/
│   │   ├── workshops/
│   │   ├── labs/
│   │   ├── assignments/
│   │   ├── notes/
│   │   ├── doubts/
│   │   ├── attendance/
│   │   ├── assessments/
│   │   ├── feedback/
│   │   └── admin/
│   ├── middleware.ts              # JWT verification + role guards (edge)
│   ├── config/                    # env parsing (zod), constants, roles
│   ├── lib/                       # prisma client singleton, jwt helpers
│   ├── utils/                     # api-response, errors, pagination, calculate-performance
│   └── components/                # shared UI (tables, forms, badges, layout)
├── tests/                         # vitest: service-level unit + API integration tests
├── .env.example
├── CONTRIBUTING.md                # conventions all 3 devs agree on
└── README.md
```

**Key adaptation:** your spec's `routes → controller → service → model` flow maps to:

```
API Route Handler (thin)  →  controller function  →  service  →  Prisma
```

Route handlers in `src/app/api/**` are one-liners that call the module's controller. Controllers validate + parse the request (`zod`), services own all business logic and Prisma queries, "model" = typed query functions / Prisma types per module.

---

## 2. Database Schema (Prisma / Neon Postgres)

### Core entities

```
User (single table for all 3 roles)
 ├─ id, email (unique), passwordHash, name, role: STUDENT | MENTOR | ADMIN
 ├─ avatarUrl?, phone?, isActive, createdAt

Workshop                              # one row per yearly edition
 ├─ id, name ("Skill Up 2026"), year (unique), slug (unique)
 ├─ startDate, endDate, status: UPCOMING | ACTIVE | COMPLETED
 └─ ← EVERY feature table below carries workshopId → strict year isolation

Lab
 ├─ id, workshopId, name ("Lab A"), schedule?, capacity?
 └─ workshopId + name unique

MentorProfile      userId 1:1 → User(role=MENTOR)
LabMentor          labId, mentorId, isLead        # mentors can co-manage labs
LabStudent         labId, studentId, enrolledAt   # enrollment = lab assignment
WorkshopEnrollment studentId, workshopId, status: PENDING | ENROLLED | SELECTED | REJECTED

Session (workshop days used for attendance)
 ├─ id, workshopId, labId?, title, date, topic?

Assignment
 ├─ id, workshopId, labId? (null = all labs), createdBy
 ├─ title, description, dueDate, maxScore, attachmentUrl?
 └─ Submission: assignmentId, studentId, content/fileName, submittedAt,
                 status: SUBMITTED | REVIEWED | LATE, score, feedback, reviewedBy

Note (learning resource)
 └─ id, workshopId, labId?, title, description, fileUrl/markedDownBody,
     category: NOTES | PDF | CODE | RESOURCE, uploadedBy, tags

Assessment (test / quiz / programming)
 └─ id, workshopId, labId?, title, type: TEST | QUIZ | PROGRAMMING | ASSIGNMENT
     totalMarks, startsAt, endsAt, publishedAt?
     Question: assessmentId, prompt, options?, correctAnswer?, marks
     AssessmentResult: assessmentId, studentId, score, submittedAt, status

AttendanceRecord
 └─ sessionId, studentId, status: PRESENT | ABSENT | LATE, markedBy
    (unique sessionId+studentId → percentage derivable)

Doubt
 └─ id, workshopId, studentId, mentorId?, labId, title, description,
     status: OPEN | IN_PROGRESS | RESOLVED, createdAt
     DoubtMessage: doubtId, senderId, body, createdAt   # Socket.IO-ready

Feedback
 └─ id, workshopId, studentId, mentorId, labId, rating 1–5,
     comment, category, isAnonymous, createdAt
     (unique student+mentor+workshop → one feedback per mentor per year)

AuditLog (optional, admin actions) — recommended for selection decisions
```

### Multi-year isolation rule (critical)
`workshopId` is a **required FK on every feature table**. Services always scope queries by workshop (taken from the authenticated session context or an explicit `?workshopId=` validated against the user's access). Two editions can never mix rows in lists, reports, or aggregates.

### Performance / selection computation
A service `calculateOverallPerformance(studentId, workshopId)` produces a stored or on-the-fly record:

```
Assignments   30%  (avg score / max score)
Assessments   35%  (weighted by totalMarks)
Attendance    15%  (present / total sessions)
Exercises     10%
Doubts/Participation 5%  (resolved doubts, activity)
Feedback→ (not part of student score; used to evaluate mentors)
────────────────────────────
Overall 0–100  + per-component breakdown + rank within workshop
```

Weights are **configurable per workshop** (store a JSON `evaluationConfig` on Workshop) so organizers can adjust criteria each year. This feeds the admin "candidate selection" dashboard (filter by min attendance, min overall, rank → mark SELECTED/REJECTED).

---

## 3. Authentication & Authorization (custom JWT)

```
Login (POST /api/auth/login)
  → verify bcrypt hash
  → sign JWT: { sub: userId, role, name }  (HS256, secret from env, 7d expiry)
  → set httpOnly, SameSite=Lax, Secure cookie ("token")
  → (no JWT ever returned to JS / localStorage)

Every API request:
  middleware.ts (edge) ── cookie present? / route on protected list?
  ↓
requireAuth()        → attaches { userId, role } to request context
  ↓
requireRole("MENTOR" | "ADMIN" | ...)   ← role authorization
  ↓
controller → service
```

**Rules from your spec honored literally:** the backend derives identity from the token, *never* from IDs in the request body. E.g.:

- `POST /api/assignments/:id/submissions` → studentId comes from the JWT.
- Mentor actions verify the target students belong to a lab where `LabMentor.mentorId = jwt.sub` (or the user is ADMIN).
- Workshop access: students only see workshops they're enrolled in; mentors only labs they're assigned to.

Role → route matrix (enforced in middleware + re-checked in services):

| Area | STUDENT | MENTOR | ADMIN |
|---|---|---|---|
| assignments (read/submit own) | ✅ | ✅ manage | ✅ |
| attendance (mark) | ❌ (view own) | ✅ own labs | ✅ all |
| doubts | own threads | assigned threads | all |
| feedback | create (own mentor) | view feedback about self | all |
| workshops / users / labs config | ❌ | ❌ | ✅ |
| results | own | own labs' students | all |

---

## 4. API Conventions (agreed by all 3 devs up front)

- Base: `/api/<resource>`, REST verbs exactly as your §12 (`GET/POST/GET:id/PUT/DELETE`).
- **Envelope:** success `{ success: true, data, meta? }`; error `{ success: false, error: { code, message, details? } }`.
- **Error codes:** `UNAUTHORIZED 401`, `FORBIDDEN 403`, `NOT_FOUND 404`, `VALIDATION_ERROR 422`, `CONFLICT 409` — via a shared `ApiError` class + `handleError()` util.
- **Validation:** zod schemas in each module's `*.validation.ts`, run in controller before service.
- **Pagination:** `?page=&limit=` → `meta: { page, limit, total }`.
- **Workshop scoping:** `?workshopId=` required on list endpoints (except admin workshop CRUD).
- Sample surface:
  ```
  POST   /api/auth/register | login | logout | me
  GET/POST /api/workshops  ·  GET /api/workshops/:id/overview
  GET/POST /api/labs  ·  POST /api/labs/:id/students  ·  POST /api/labs/:id/mentors
  GET/POST /api/assignments  ·  GET/PUT/DELETE /api/assignments/:id
  POST   /api/assignments/:id/submissions  ·  PUT /api/submissions/:id/review
  GET/POST /api/notes
  GET/POST /api/doubts  ·  POST /api/doubts/:id/messages  ·  PATCH /api/doubts/:id/status
  GET/POST /api/attendance/sessions  ·  POST /api/attendance/sessions/:id/mark
  GET/POST /api/assessments  ·  POST /api/assessments/:id/submit
  GET    /api/assessments/:id/results  ·  GET /api/students/:id/performance
  POST   /api/feedback  ·  GET /api/feedback/my-feedback
         GET /api/feedback/mentor/:mentorId  ·  GET /api/feedback/lab/:labId
  GET    /api/admin/reports  ·  PATCH /api/admin/selection/:studentId
  ```

---

## 5. Frontend (Next.js App Router)

- **Route groups:** `(auth)` for login/register; `(dashboard)` with role-based sections.
- **Dashboards:**
  - **Student:** profile, my lab & mentor, notes/material, assignments (+ submit), exercises, marks/results, attendance %, doubts (thread UI), give feedback, overall performance card.
  - **Mentor:** lab roster, progress overview, assignment CRUD + submission review, notes upload, attendance marking grid, assessment CRUD + grading, doubts inbox (statuses), feedback received.
  - **Admin:** students/mentors CRUD, workshop create/switcher, lab create + assign mentors/students, cross-workshop reports, feedback dashboard, platform settings, **selection/evaluation pipeline** (ranked table → select/reject).
- **Workshop switcher** in the top bar (admin/mentor): sets active `workshopId` (cookie/context); all queries scoped to it.
- Shared UI in `src/components` (DataTable, PageHeader, StatusBadge, RatingStars, forms). Styling: Tailwind CSS (standard for Next.js) — noted as an assumption; swap for another if your team prefers.
- Server Components for reads, Client Components for forms/interactive tables; data fetched via route handlers (keeps API usable by the future mobile/other clients).

---

## 6. Three-Developer Split (feature branches per your §13)

Repo works fine as a **single Next.js codebase** with owners per `src/modules/*` + corresponding pages — no monorepo tooling needed.

| Dev | Owns (`src/modules/` + pages) | Branches |
|---|---|---|
| **1 — Student Learning** | `students`, `assignments`, `notes` | `feature/student`, `feature/assignments`, `feature/notes` |
| **2 — Mentoring & Evaluation** | `labs`, `attendance`, `assessments`, `doubts`, `feedback` | `feature/assessments`, `feature/feedback`, `feature/labs` |
| **3 — Platform & Admin** | `auth`, `users`, `workshops`, `admin`, `config/`, `lib/`, `middleware`, `utils/`, Prisma schema ownership | `feature/auth`, `feature/workshops`, `feature/admin` |

**Pre-development agreement (Dev 3 drafts, all approve before feature work starts):**
1. **Prisma schema** — Dev 3 owns `schema.prisma`; additions via PRs; migrations run in order.
2. **API conventions** — envelope, errors, pagination (this document §4).
3. **Auth contract** — `requireAuth` / `requireRole` helpers signature, JWT payload shape.
4. **Shared UI** — component props (DataTable etc.).
5. **Env config** — `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `SEED_ADMIN_EMAIL...`.
6. **Git flow:** `main` ← `develop` ← `feature/*` → PR → review (one other dev) → CI (lint + typecheck + tests) → merge to `develop`; `main` only for releases. Small, frequent PRs (< 400 lines).

---

## 7. Phased Roadmap (execution order once you start building)

**Phase 0 — Foundation (Dev 3, blocking)**
Repo scaffold, TS + Tailwind + Prisma + Neon, full schema + migration + seed, auth module (register/login/logout/me, JWT, middleware, roles), response/error/validation utils, layout shell + role-based routing, CI (lint/typecheck/test).

**Phase 1 — Core org structure (Dev 3 + Dev 2)**
Workshops CRUD + year isolation + switcher; users admin; labs CRUD; mentor↔lab and student↔lab assignment; enrollment flow.

**Phase 2 — Parallel feature build**
- Dev 1: notes → assignments (+submission) → student pages.
- Dev 2: sessions/attendance → assessments (+marks) → doubts → feedback.
- Dev 3: admin reports, performance calculation, selection pipeline.

**Phase 3 — Integration & polish**
Cross-module performance dashboard, seed demo data end-to-end, empty/error states, pagination everywhere, tests for services (auth guards, workshop isolation, mentor scoping, performance calc).

**Phase 4 — Later enhancements (explicitly out of scope now)**
- **Socket.IO** for real-time doubt messages (schema already message-thread ready).
- File storage (Neon stores URLs only — use S3/Cloudinary/UploadThing).
- Email notifications, code execution for programming assessments (judge runner), PDF exports.

---

## 8. Testing Strategy
- **Vitest**: unit tests for services (authorization scoping, performance calculation, attendance %).
- **Integration**: API route handlers against a Neon **branch database** (Neon supports DB branching per PR — great fit).
- Priority test cases: role guard denials, workshop isolation (2026 data invisible in 2027), mentor restricted to own labs, submission ownership from JWT.

---

## 9. Assumptions (flag if wrong)
1. Styling via **Tailwind CSS**; UI from scratch (no component library) unless you want shadcn/ui.
2. Passwords hashed with **bcrypt**; JWT in **httpOnly cookies** (spec says JWT — cookies are the secure delivery for browser apps).
3. **File uploads** deferred to Phase 4 (external storage); text/URL content works day one.
4. Seed script creates an **Admin, demo Mentors, Students, and two workshops (2026/2027)** to prove isolation.
5. Evaluation weights default to §2's values but are **stored per workshop**, editable by admin.
6. You may be solo or leading a team — the phases work either way (Dev 1/2/3 = workstreams, not headcount).

---

## 10. Open Questions (answer these when you're ready — no code impact yet)
1. **Registration:** self-registration for students, or admin-created accounts only? (Enrollment into a workshop — self-serve or admin-approved?)
2. **Assessment question types:** only MCQ + file/text answer, or do you need programming submissions scored manually by mentors initially?
3. **Attendance sessions:** created manually by mentors, or auto-generated from a workshop schedule?
4. **Feedback:** allow multiple feedback rounds per mentor per year (unique constraint choice), or one final feedback?
