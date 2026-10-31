# SATYA-EoA Frontend Redesign Progress: Akash Ananth

- **Branch**: `ui/akash-redesign`
- **Contributor**: Akash Ananth (@AKASH-ANANTH)
- **Role / Scope**: Visual redesign of `apps/web` strictly following `docs/FRONTEND-REDESIGN-RULES.md` and `docs/FRONTEND-CONTEXT.md`.
- **Target Audience**: AICTE (Regulation Bureau) officials reviewing dense Extension of Approval (EoA) applications.
- **Tone & Design Philosophy**: Calm, restrained, institutional, high legibility, dense and scannable. Strict WCAG AA contrast (status tints >= 8:1 contrast).

---

## Redesign Phases & Checklist

- [ ] **Phase 1: Design Tokens & Typography Base**
  - Refine `apps/web/src/styles/tokens.css` and underlying token mappings.
  - Institutional neutral surfaces, crisp 1px borders, subtle elevations without blur-heavy shadows.
  - Verify Noto Sans / Public Sans typography scales and high-contrast color palette.
- [ ] **Phase 2: Shared Core Components**
  - `StatusLabel`: 6 PS status labels (verified, mismatch detected, expired, verification pending, source unavailable, manual review required).
  - `SourceTag`: Simulated source & Test trust anchor badges.
  - `SignatureBadge`: Cryptographic signature validity indicators.
  - `RiskChip`: High / Medium / Low text-only caps.
  - `DecisionBar`: 5 disposition states (No approve/reject buttons).
- [ ] **Phase 3: AppShell & Navigation Frame**
  - Rail navigation with saffron active marker and accessible tooltips.
  - Header context, application quick search, UserMenu (language, accessibility, sign out).
  - Clean one-line institutional footer.
- [ ] **Phase 4: Overview Dashboard (`/overview`)**
  - 7 panels: cycle metrics, queue status breakdown, manual action items, risk band distribution.
  - Clean KPI cards, crisp borders, responsive grid layout.
- [ ] **Phase 5: Validation Queue (`/rb-queue`)**
  - Dense tabular view with sortable headers and bidirectional sort arrows.
  - Filter bar (risk band, label, status, search query) and Reset sort action.
  - Row hover states, keyboard navigation, and zero horizontal overflow.
- [ ] **Phase 6: Case Review & Clause Diff (`/case/[id]` & `/case/[id]/affidavit`)**
  - 24-point sworn Affidavit-2 diff vs AICTE portal data.
  - Side-by-side clause comparison with clear mismatch highlights.
  - Evidence viewer with PDF highlights and source tags.
- [ ] **Phase 7: Alerts & Tamper-Evident Audit Ledger (`/alerts` & `/audit`)**
  - Severity-tinted alert cards (High / Medium / Low).
  - Hash-chained audit log with cryptographic seal indicators and verification status.
- [ ] **Phase 8: Polish, Accessibility & CI Verification**
  - Full keyboard operability and visible focus rings.
  - Automated `axe` accessibility test suite pass (0 violations).
  - Next.js typecheck (`tsc --noEmit`), unit tests (`vitest run`), and build check (`next build`).
  - PR preparation and review checklist.

---

## Decisions Log
- **2026-10-31**: Established branch `ui/akash-redesign` from `main`.
- **2026-10-31**: Retained all existing route definitions, API contracts, `data-testid` attributes, and i18n message keys.

## Open Questions for Hrishi
- None currently. All work adheres strictly to existing API endpoints and contracts.
