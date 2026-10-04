# Original User Request

## 2026-10-04T16:17:02Z

Requested team: Full multi-agent team — coordinate separate specialist agents for security audit, UI polish, bug fixes, and test suites

Comprehensive full-scope audit, security hardening, bug elimination, test suite expansion, and UI/UX modernization for the Skill Up C++ platform.

Working directory: c:\Users\uttim\Downloads\skillup
Integrity mode: development

## Requirements

### R1. Security & Authorization Hardening
- Audit and harden all API routes (`src/app/api/**`), middleware (`src/middleware.ts`), and auth utilities (`src/lib/auth.ts`, `src/lib/jwt.ts`).
- Ensure robust protection against unauthorized role elevation, IDOR vulnerabilities, missing ownership checks on student/mentor resources, and unvalidated user inputs.
- Enforce strict HTTP response security (prevent sensitive credential/hash exposure).

### R2. End-to-End Bug Detection & Resolution
- Audit all platform workflows across Student, Mentor, and Admin roles for logic errors, broken state handling, uncaught Promise rejections, and edge-case exceptions.
- Ensure all 51 core features run cleanly without console warnings or runtime failures.

### R3. Test Suite & Verification Expansion
- Run the Vitest test suite (`tests/`) and expand test coverage to validate critical security boundaries, authentication lifecycles, and calculation formulas.
- Verify `npm test` and `npx tsc --noEmit` pass with zero failures.

### R4. UI/UX Modernization & Responsive Polish
- Enhance the visual layout and user experience across all dashboards (Student, Mentor, Admin) and public pages while adhering to the dark slate theme (`#070B14`, `#0F172A`), Super 60 accents (`#F07C27`, `#FFB703`), and 60-cell square interactive tiles.
- Improve interactive micro-states: loading skeletons, empty states, error notices, button states, and seamless responsiveness across desktop, tablet, and mobile displays.

## Acceptance Criteria

### Security & Access Control
- [ ] All protected API endpoints verify role and resource ownership; unauthorized requests return 401 or 403.
- [ ] No database passwords, bcrypt hashes, or sensitive tokens are leaked in any API response payloads.

### Quality & Test Suite
- [ ] `npx tsc --noEmit` passes with 0 TypeScript compiler errors.
- [ ] `npm test` executes and passes all test suites with 100% success.
- [ ] `npm run build` completes successfully with zero fatal errors.

### User Interface & Responsiveness
- [ ] Unified, professional dark-slate visual presentation across all views.
- [ ] Layouts render cleanly without horizontal scroll regressions on mobile and tablet viewport widths.
