# E2E Test Infra: Skill Up C++ Platform

## 1. Test Philosophy
- Opaque-box, requirement-driven verification derived directly from `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- Zero internal dependencies; test endpoints via HTTP or direct controller integration adhering to standard contracts.
- Systematic 4-tier coverage methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workloads.

---

## 2. Feature Inventory & Coverage Mapping
All 51 core features are inventoried below with required coverage tiers:

| # | Feature Area | Requirement Reference | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Workload) |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Authentication & JWT Sessions | R1, R3 § Auth | 5 | 5 | ✓ | ✓ |
| 2 | Authorization & Role Gating | R1 § Access Control | 5 | 5 | ✓ | ✓ |
| 3 | IDOR & Ownership Protections | R1 § IDOR Defense | 5 | 5 | ✓ | ✓ |
| 4 | Assessment & Test Engine APIs | R1, R2 § Assessments | 5 | 5 | ✓ | ✓ |
| 5 | Question Bank Security & Access | R1 § Question Bank | 5 | 5 | ✓ | ✓ |
| 6 | Assignments & Grading Lifecycle | R2 § Assignments | 5 | 5 | ✓ | ✓ |
| 7 | Performance Calculations & Leaderboard | R2, R3 § Formulas | 5 | 5 | ✓ | ✓ |
| 8 | Doubts & Mentorship Collaboration | R1, R2 § Doubts | 5 | 5 | ✓ | ✓ |
| 9 | Attendance Roll Call & Scoping | R2 § Attendance | 5 | 5 | ✓ | ✓ |
| 10 | Workshop & Lab Administration | R2 § Multi-Tenancy | 5 | 5 | ✓ | ✓ |
| 11 | Anonymous Feedback & Privacy | R1 § Feedback PII | 5 | 5 | ✓ | ✓ |
| 12 | Candidate Selection Pipeline | R2 § Super 60 Intake | 5 | 5 | ✓ | ✓ |

---

## 3. Test Architecture
- **Framework**: Vitest (`vitest run`).
- **Test Runner Invocation**: `npm test`
- **TypeScript Typecheck**: `npx tsc --noEmit`
- **Build Verification**: `npm run build`
- **Directory Layout**:
  - `tests/auth.test.ts`: Base JWT token creation and validation.
  - `tests/api-response.test.ts`: Base API envelope format tests.
  - `tests/performance.test.ts`: Performance calculation tests.
  - `tests/auth-security.test.ts`: Authentication, role gating, password hashing, and token expiration.
  - `tests/idor-authorization.test.ts`: IDOR prevention on doubts, feedback anonymization, and assignment resubmission locks.
  - `tests/performance-calculation.test.ts`: Core formula verification (weights, attendance scoping, doubt point clamping).
  - `tests/api-security.test.ts`: Endpoint security audits (preventing answer leaks, unauthenticated roster leaks, error masking).

---

## 4. Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 test cases per core feature category (Happy-path isolation).
- **Tier 2 (Boundary & Corner Cases)**: Boundary tests (expired tokens, null sessions, extreme scores > maxScore, 0 sessions, 0 doubts, empty question bank).
- **Tier 3 (Cross-Feature Combinations)**: Interactions (e.g. mentor reviewing assignment affecting student overall score and leaderboard rank).
- **Tier 4 (Real-World Workloads)**: End-to-end multi-role simulation (Student registration → Lab allocation → Assessment submission → Mentor review → Leaderboard ranking → Admin Super 60 selection).
