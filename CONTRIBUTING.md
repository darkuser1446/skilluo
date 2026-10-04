# 🤝 Contributing to Skill Up

Thank you for contributing to the **Skill Up** platform. To ensure high code quality, consistency, and zero architectural regressions across the Super 60 ecosystem, please adhere to the engineering guidelines outlined below.

---

## 👥 Three-Developer Workstream Division

Development ownership is divided into three parallel workstreams to prevent merge collisions:

| Workstream | Modules & Areas | Primary Branch Prefix |
|---|---|---|
| **Dev 1 — Student Learning** | `students`, `assignments`, `notes`, `exercises`, student UI | `feature/student-*`, `feature/assignments-*` |
| **Dev 2 — Mentoring & Evaluation** | `labs`, `attendance`, `assessments`, `doubts`, `feedback`, mentor UI | `feature/assessments-*`, `feature/labs-*` |
| **Dev 3 — Platform & Admin** | `auth`, `users`, `workshops`, `admin`, `lib/`, `middleware`, `schema.prisma` | `feature/admin-*`, `feature/auth-*` |

---

## 🌿 Git Branching Strategy & Workflow

1. **Branch Naming:**
   - Feature branches: `feature/<workstream>-<description>` (e.g., `feature/assessments-timer-autosubmit`)
   - Bug fix branches: `fix/<issue-description>` (e.g., `fix/notification-bell-method`)
   - Refactor branches: `refactor/<target>`

2. **Pull Request Protocol:**
   - Small, focused PRs (< 400 lines of changes).
   - Before opening a PR, ensure all checks pass locally:
     ```bash
     npx tsc --noEmit
     npm test
     npm run lint
     ```
   - Every PR requires at least one peer review approval.

---

## 📝 Coding Standards & Architecture Rules

### 1. Unified Response Envelope
All API route handlers must return the standard envelope from `@/utils/api-response`:
```typescript
import { successResponse, errorResponse } from "@/utils/api-response";

// Success:
return successResponse({ item }, meta, 200);

// Error:
return errorResponse("Entity not found", "NOT_FOUND", 404);
```

### 2. Error Handling & Role Verification
Use `@/lib/auth` helpers for session and role verification:
```typescript
import { requireAuth, requireRole } from "@/lib/auth";

// Requiring specific roles:
const session = await requireRole(["ADMIN", "MENTOR"]);
```

### 3. Database Schema Integrity
- `prisma/schema.prisma` is owned by Platform Lead (Dev 3).
- **Prisma is locked at `6.4.1`** (do not upgrade to 8.x).
- After any schema change, run:
  ```bash
  npx prisma db push
  npx prisma generate
  ```

### 4. UI Design System Guidelines
- **Theme:** Dark Slate `#070B14`, Surface `#0F172A`, Border `slate-800`.
- **Accent Palette:** Super 60 Brand Orange `#F07C27`, Brand Gold `#FFB703`, Emerald `#10B981`, Sky `#38BDF8`.
- **Typography:** Display `font-display` (Sora), Body `font-body` (Inter), Code `font-mono` (JetBrains Mono).
- **Interactive Tiles:** Use 60-cell square grid styling consistent with the landing page design.

---

## 🧪 Testing Guidelines

Unit and integration tests reside in `tests/`:
- Add tests for any new calculation formula, auth guard, or response formatting.
- Ensure `npm test` executes and passes with 100% success before submitting your PR.
