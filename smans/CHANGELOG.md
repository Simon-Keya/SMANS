# SMANS Changelog

## Phase 0 — Security (2026-11-05)

### Verified findings (code-first, audit not attached)

1. **CORS / image host wildcards** — `next.config.ts` allowed `hostname: '**'` and set `Access-Control-Allow-Origin: *` on all `/api/*`.  
   **Fixed:** Removed wildcards; restricted images to localhost (add explicit production hosts as needed); CORS headers limited to webhook path only.

2. **Rate limiting fails open** — When `ENABLE_RATELIMIT=true` but Upstash Redis env vars missing, limiter always returned `success: true`.  
   **Fixed:** Fail closed (reject) when rate limiting is enabled but Redis is not configured. Disabled state still allows (dev/tests).

3. **File upload unauthenticated + no validation** — `/api/upload` accepted any file, any size, any name, no auth. `UploadService` used raw `file.name` (path traversal risk).  
   **Fixed:** Auth required (session + active check); rate limit by user; MIME allowlist; extension allowlist; size cap 5 MB; UUID filenames; folder name sanitization; path containment check. GET listing disabled.

4. **2FA secret handling** — `enable2FA` returned a client-side secret that was never stored; `verify2FA` trusted a client-supplied secret and wrote it. API routes were stubs (TODO comments, no DB writes).  
   **Fixed:** Enable stores secret server-side with `twoFactorEnabled=false`; verify reads the stored secret and ignores any client-supplied secret; enable/verify/disable API routes delegate to the hardened actions; rate limits on 2FA endpoints.  
   **Still open:** 2FA is not enforced during login (`authorize` / credentials flow does not challenge for TOTP). Secret stored in plaintext (prefer application-level encryption with env key). UI may still pass secret on verify (harmless now).

5. **Secrets in source** — No `.env` committed; no hardcoded API keys/passwords found in TS sources. `.gitignore` covers `.env*`.  
   **Status:** OK / verified.

6. **Auth guards existence** — `requireRole`, `requirePermission`, `authorize`, `getCurrentUser` exist and are used in many actions. Middleware protects `/dashboard`.  
   **Still open:** Not every server action was audited for ownership/IDOR (e.g. parent reading only their children). Some API routes remain public by design (`/api/classes`). Guards should be confirmed with tests (Phase 1).

7. **Audit log integrity** — `AuditService` appends rows; no hash chain / signature / immutability controls.  
   **Status:** NOT STARTED (basic logging exists; integrity controls deferred).

8. **Middleware matcher / public APIs** — Broad matcher; several API paths explicitly public. Upload now self-protects.  
   **Status:** PARTIAL — review remaining public routes for IDOR.

### What was not run
- No `npm install`, `tsc`, `jest`, or `next build` (environment constraints). Syntax of edited files was reviewed manually.
- Full IDOR pass across all actions not completed.
- Login-time 2FA challenge not implemented.

### Next
- Phase 1: stabilize dependencies, Decimal money, validation, regression tests, consolidate permissions helpers.

### Phase 0 continued (2026-11-05)

9. **2FA at login** — Credentials authorize now validates TOTP when `twoFactorEnabled`. Login UI uses `/api/auth/check-2fa` password gate then optional second step for TOTP; NextAuth receives `totpCode` when required.  
   **Status:** DONE (wired). Secret still plaintext at rest.

10. **Unauthenticated server actions** — Found and fixed:
    - `grades/createGrade`, `bulkCreateGrades`, `updateGrade` — no auth
    - `parents/createParent`, `deleteParent`, `linkStudent` — no auth
    - `fees/updateInvoiceStatus` — no auth
    - `students/assignClass` — no auth
    - `notifications/markAsRead` — no ownership check
    - `audit/logAction` — allowed spoofed userId  
    All now require session + permission (or owner check). Input validation added where missing. Audit log stores a content hash in metadata.

11. **Auth route for 2FA pre-check** — `POST /api/auth/check-2fa` (public under `/api/auth`, rate-limited).

### Phase 0 open / deferred
- Full ownership matrix (parent may only see linked children, teacher only assigned classes) — PARTIAL
- Encrypt 2FA secrets at rest — NOT STARTED (needs env key + migration helper)
- Audit log hash chain / append-only DB role — PARTIAL (content hash only)
- Regression tests for each fix — Phase 1

## Phase 1 — Stabilize (in progress, 2026-11-05)

1. **Money as Decimal** — Schema: `FeeItem.amount`, `Invoice.amount`, `Payment.amount` changed from Float to `Decimal @db.Decimal(12, 2)`. Migration `20261105120000_money_decimal`. Canonical helpers in `lib/money`. `recordPayment` uses Decimal math (no float sum).  
   **Status:** DONE for schema + payment path. Other fee UI/actions may still format with Number() — audit remaining call sites.

2. **Dependency correctness** — Moved `@prisma/client` and `@sentry/nextjs` from devDependencies to dependencies.

3. **Duplicated permissions** — `lib/permissions.ts` now re-exports canonical `lib/auth/permissions.ts` (no divergent maps).

4. **Input validation** — Added Zod on grades, parents, invoice status, assignClass (Phase 0 spillover).

5. **Regression tests** — `tests/unit/money.test.ts`, `tests/unit/permissions.test.ts` (no live DB).

### Phase 1 still open
- Full grep of amount arithmetic/toFixed across fees UI and services
- Audit logging on every sensitive mutation
- More regression tests per bug
- Runtime vs remaining dev dep review (stripe in deps unused?)

6. **Fee/payment services Decimal** — `fee.service.ts` and `payment.service.ts` now use `sumMoney` / `gteMoney` / `toDecimal` instead of float `+` / `>=`.

7. **Fee dashboard Decimal display** — Invoice detail and list/summary pages use `toNumber` / `sumMoney` instead of float arithmetic and raw `.toLocaleString()` on Decimal.

## Phase 2 — CBC modernization (in progress, 2026-11-05)

1. **Curriculum hierarchy schema** — Additive models: `CurriculumVersion`, `GradeLevel`, `CbcLearningArea`, `Strand`, `SubStrand`, `Outcome`. Migration `20261105130000_cbc_curriculum`.

2. **Competency scale (configurable)** — `CompetencyScale` + `CompetencyLevel` with optional min/max scores. Default KICD 4-level (EE/ME/AE/BE) seeded via `CbcService.ensureDefaultScale()`. Fallback constants documented; runtime levels always from DB.

3. **Core competencies / values / PCIs** — Models `CoreCompetency`, `CoreValue`, `Pci`.

4. **Rubric, observation, intervention, portfolio, outcome assessment** — Models + service methods + server actions with permission checks.

5. **Qualitative report** — `CbcService.getQualitativeReport` aggregates assessments, observations, interventions, portfolio.

6. **UI** — `/dashboard/curriculum` lists versions, shows active competency scale, form to create versions (admin/write).

7. **Permissions** — Added `curriculum:read|write`, `settings:read|write` to Permission union; TEACHER gets `curriculum:read`.

### Phase 2 still open
- Full admin UI to manage strands/sub-strands/outcomes/rubrics
- Teacher UI for recording outcome assessments & observations
- Parent/student qualitative report card page
- Seed script for sample CBC structure and core competencies/values/PCIs
- Wire navigation link into dashboard sidebar

8. **Navigation** — CBC Curriculum link under Academics in dashboard sidebar.

## Phase 2 continued
9. Teacher CBC assess UI — `/dashboard/cbc/assess` (outcome assessment + observation).
10. Qualitative report UI — `/dashboard/cbc/report` (role-scoped students).
11. Hierarchy create actions (learning area, strand, sub-strand, outcome).
12. `scripts/seed-cbc.ts` — KICD scale, core competencies/values/PCIs, sample G4 Math outcome.
13. Sidebar links for Assess and Qualitative Report.

## Phase 3 — UX (partial)
1. **Mobile navigation** — `MobileNav` drawer + top bar; wired in dashboard layout (sidebar was desktop-only).
2. **No fabricated notification count** — Navbar no longer shows hardcoded `3`.
3. **Role dashboards** — already present (admin/teacher/parent/student/accountant); left intact.
4. **WCAG contrast helpers** — `lib/a11y/contrast.ts` + unit tests (numeric ratios, not eyeballing).

### Phase 3 open
- Full contrast audit of theme tokens against AA
- Consistent empty states / loading patterns across all pages
- Accessibility pass on forms (labels already mostly present)

## Phase 4 — Enterprise (partial)
1. Docker/compose already present; Grafana password now from env.
2. `docs/OPERATIONS.md` — backups/DR, DPA notes, M-Pesa, Sentry.
3. M-Pesa Daraja STK callback scaffold — `lib/payments/mpesa.ts` + `POST /api/webhooks/mpesa` (idempotent, always 200 after parse).
4. Middleware allows `/api/webhooks/*`.
5. Backup/restore scripts already existed.

### Phase 4 open
- Full STK initiation API (OAuth + lipa na mpesa online)
- Dedicated `checkoutRequestId` column on Payment (currently matched via method string)
- Object storage abstraction
- CI pipeline file if missing
- Security testing / penetration checklist

## Completion pass (2026-11-05)

### Closed former PARTIAL / NOT STARTED items
- Ownership module (`lib/auth/ownership.ts`) for student, class, invoice, notification
- Audit hash chain (`contentHash`, `prevHash`) + verifyChain
- 2FA secrets encrypted at rest (AES-256-GCM)
- Object storage abstraction (local / S3)
- M-Pesa STK initiate + checkoutRequestId column + idempotent callback
- CI workflow GitHub Actions
- Full curriculum hierarchy admin forms
- Parent `fees:pay` + qualitative `reports:read`
- Security testing checklist
- Unit tests: crypto, ownership matrix
