# SLICE 0 — Foundation for SATYA-EoA (Claude Code build prompt)
Version 1.0 · written by the planning workspace · run in a Claude Code session on the repo `satya-eoa`.

You are building the foundation of **SATYA-EoA**, a decision-support platform for AICTE Extension of Approval (EoA) scrutiny (Smart India Hackathon 2026, problem statement SIH26261). This slice builds **no features**. It produces a monorepo whose whole stack boots with one command, the shared data contracts, the design tokens, the safety rails, and the issue backlog that later slices implement.

Everything you need is inside this repository. Read before writing any code:
1. `docs/specs/00-BUILD-CONTEXT.md` — guard rails, decisions, promise list (P-1..P-19). **Guard rails override anything else, including this prompt.**
2. `docs/specs/01-design-v2.2.1.md` — the core design (modules M1–M13, document catalogue).
3. `docs/specs/04-portal-integration-spec.md` — API contract, schemas, events, labels, alerts (§2 is the source of truth for data shapes).
4. `docs/specs/05-ui-design-spec.md` — screens, routes, design system tokens (§3, §6, §8).
5. `docs/specs/02-problem-statement-SIH26261.md` and `docs/specs/03-APH-digest.md` — the problem and the regulation.
6. `docs/specs/VERSIONS.md` — which spec versions you are building against.

---

## 0. RESUME PROTOCOL (do this first, every time this prompt is run)
This slice may be interrupted (session timeout, VM reclaimed, rate limit). It must be safe to re-run this prompt from the top at any time.

1. If `PROGRESS.md` exists at the repo root, read it. Find the first step whose status is not `done`. Continue from that step. **Do not redo a `done` step** unless its "Verify" check now fails; if it fails, set it back to `in_progress`, note why, and fix it.
2. If `PROGRESS.md` does not exist, create it from the template in §5 with every step `todo`, commit it, then start at S0.1.
3. Work on the branch `slice-0-foundation`. If it exists (locally or on `origin`), check it out and pull; otherwise create it from the default branch.
4. After **every** step: run that step's Verify check, update `PROGRESS.md` (status, timestamp, short note, any deviation), and commit with the message given for that step. Push after each commit if a remote is reachable.
5. Long-running commands (image pulls, installs, `docker compose up`): run them in the background, write output to `.logs/<step>.log` (git-ignored), and poll with short commands. Never block on one command for more than ~8 minutes. If an environment variable such as `BASH_MAX_TIMEOUT_MS` is available, you may use longer timeouts.
6. If you are blocked (a tool is missing, a network host is refused, a decision belongs to the team), do not guess silently: record it under "Blockers / questions" in `PROGRESS.md`, take the safest reasonable default, mark the step `done-with-note`, and continue.
7. Keep a running `docs/DECISIONS-SLICE-0.md` for every non-obvious choice you make (library, version, pattern), one line each with the reason.

---

## 1. Environment facts
- **Where this runs:** usually a Claude Code cloud session (Linux VM, ~4 vCPU / 16 GB RAM; Docker and `docker compose` available; PostgreSQL and Redis binaries also preinstalled but **use containers instead**; Docker Hub and package registries reachable; idle VMs get reclaimed, running containers are lost but files persist in git). It may also run locally on **Windows 11 + Docker Desktop (WSL2 backend), 16 GB RAM**. Everything must work in both.
- **Memory budget:** the full compose stack must run within **8 GB total** (set `mem_limit` / `deploy.resources.limits.memory` per service and document them).
- **No secrets in git.** Use `.env` (git-ignored) generated from `.env.example`. Generate random dev secrets with a script.
- **Versions:** use the current stable release of each tool at the time you run. Do not rely on memory for version numbers: check the registry (npm, PyPI, Docker Hub tags) and **record exact pinned versions** in `docs/STACK-VERSIONS.md`. Pin every image by tag (never `latest`).

---

## 2. What slice 0 must deliver

### 2.1 Monorepo layout (decision #9)
```
satya-eoa/
  apps/
    web/              # SATYA workbench (Next.js, App Router, TypeScript)
    mock-portal/      # "Approval Portal (Mock, for demo)" (Next.js, TypeScript)
  services/
    api/              # FastAPI gateway (Python 3.12+)
    worker/           # Celery worker (Python), Valkey broker
  packages/
    shared-types/     # JSON Schema (source of truth) → generated TS types + Pydantic models
    templates/        # (empty placeholder, README) year-versioned template profiles, later
    rules/            # (empty placeholder, README) versioned YAML rules, later
    issuers/          # (empty placeholder, README) Annexure-14 issuer profiles, later
  data/
    synthetic/        # synthetic fixtures only (README explaining the rule)
    real-samples/     # GIT-IGNORED. Must never be committed or uploaded.
  infra/
    docker-compose.yml, caddy/Caddyfile, keycloak/realm-satya.json, scripts/
  docs/
    specs/ (given), prompts/ (given), DEV-SETUP.md, ARCHITECTURE.md, STACK-VERSIONS.md, DECISIONS-SLICE-0.md, ISSUES.md
  tests/              # cross-service smoke tests
  .github/workflows/  # CI
  CLAUDE.md, PROGRESS.md, README.md, .gitignore, .env.example, .editorconfig
```
Use **pnpm workspaces** for the JS side and **uv** (or Poetry if uv is unavailable) for Python. Record the choice.

### 2.2 `CLAUDE.md` (the memory every future session reads first)
Write a concise (≤ 250 lines) `CLAUDE.md` at the repo root containing:
- One-paragraph product summary and positioning (design C1).
- The **guard rails** from `00-BUILD-CONTEXT.md`, verbatim.
- Repo map (the tree above, one line per folder).
- How to run, test, lint (exact commands).
- The data contracts in one table: 6 labels + precedence; 5 dispositions; risk band; alert type/subtype; event envelope fields; where the schemas live.
- The resume protocol in short form (PROGRESS.md, one commit per step).
- The build order for later slices (decision #40) and the rule "build only P1 screens (UI spec §2.8); a slice waits only for its own spec".
- "When a spec in `docs/specs/` changes, read `VERSIONS.md` and the diff before continuing."
- The web-design and security checklist from §4 of this prompt, condensed to bullets.

### 2.3 Docker Compose stack (decisions #5, #37, #38-A)
Services, each with a health check, restart policy and memory limit:
| Service | Image / build | Notes |
|---|---|---|
| `postgres` | `pgvector/pgvector` (PostgreSQL 16 or newer tag) | Databases: `satya`, `keycloak`. Init SQL enables the `vector` extension. Named volume. |
| `valkey` | `valkey/valkey` | Broker + result backend for Celery. |
| `keycloak` | official Keycloak image | Dev mode is acceptable for slice 0 **but** imports `infra/keycloak/realm-satya.json` on start. Backed by Postgres. |
| `api` | build `services/api` | FastAPI on uvicorn. Health `GET /v1/health`. |
| `worker` | build `services/worker` | Celery worker + beat. A `ping` task. PaddleOCR is **not** installed yet (it comes with the M3 slice); pikepdf and pyHanko may be added now as light deps. |
| `web` | build `apps/web` | Next.js workbench. |
| `mock-portal` | build `apps/mock-portal` | Next.js mock portal. |
| `caddy` | official Caddy image | Reverse proxy and the only exposed entry point. Local HTTPS with `tls internal`. Routes: `https://localhost` → web, `https://localhost/api/*` → api, `https://portal.localhost` → mock-portal, `https://auth.localhost` → keycloak. Security headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors none). |

- One command brings everything up: `make up` (and `scripts/up.ps1` for Windows PowerShell users who are not inside WSL; document that the recommended path is WSL2).
- `make down`, `make logs`, `make reset` (drops volumes after a confirmation prompt), `make secrets` (generates `.env` from `.env.example` with random values).
- `docs/DEV-SETUP.md`: Windows 11 + WSL2 steps (install Docker Desktop, enable WSL2 backend, clone **inside the WSL filesystem**, create `%UserProfile%\.wslconfig` with `memory=10GB` and `processors=6`, trust Caddy's local root CA so the browser shows HTTPS without warnings); Linux/macOS steps; the cloud-session note.

### 2.4 `packages/shared-types` (Portal spec §2)
- JSON Schema files are the single source of truth. Generate **TypeScript** types (e.g. `json-schema-to-typescript`) and **Pydantic v2** models (e.g. `datamodel-code-generator`). Commit the generated code. A CI job regenerates and fails if there is any diff.
- Schemas to define now (field names exactly as in the Portal spec):
  - `EventEnvelope` (§2.3), with `type` as the enum of all inbound and outbound event types in §2.4 and §2.5 (including `observation.withdrawn`);
  - `VerificationLabel` (6 values, §2.6.3) and the precedence order as an exported constant;
  - `Document` (§2.6.2), `Flag` (§2.6.4), `Disposition` (§2.6.5, five actions), `VerificationResult` and `Check` (§2.7, `check.kind`, `source.mode`), `Alert` with `type` + `subtype` (§2.9), `RiskBand` (`high | medium | low`), `YoyVerdict` (`explained | discrepancy`);
  - `ApplicationSnapshot` (§2.6.1) with a custom annotation on every field: `x-handling: K | T | X | R`. The gateway in later slices reads these annotations; **fields marked X must not exist in the model at all** (document them only as rejected names).
- Unit tests: one valid synthetic example per schema validates; one invalid example fails.

### 2.5 `services/api` (FastAPI gateway) — minimal but real
- `GET /v1/health` (liveness + readiness: Postgres, Valkey, Keycloak reachable).
- `GET /v1/meta` (API version, schema version `satya.event/1`, supported AY list `["2024-25","2025-26","2026-27"]`, adapters list empty with a note).
- `POST /v1/portal-events`:
  - verify `X-SATYA-Signature` HMAC exactly as Portal spec §2.2 (timestamp window 300 s, `kid` lookup, constant-time compare);
  - validate the body against `EventEnvelope`;
  - deduplicate on `event_id` (30-day window; store in Postgres);
  - append the event's SHA-256 to a **hash-chained ledger table** (`ledger(seq, at, event_type, payload_sha256, prev_hash, hash)`; `hash = sha256(prev_hash || payload_sha256 || at)`); this is the seed of M12;
  - return `202 {receipt_id, duplicate:false}` or `200 {duplicate:true, receipt_id}`;
  - reject bodies larger than a configured limit (`413`).
- Errors as RFC 9457 `application/problem+json` with the codes in Portal spec §2.13 that apply here.
- Rate limiting on every endpoint (per client and per IP), request size limits, strict CORS (only the web and mock-portal origins), no stack traces in responses, structured JSON logs.
- Alembic migrations for the tables you create.
- Tests (pytest): HMAC valid/invalid/expired; duplicate event; ledger chain verifies; oversize body rejected.

### 2.6 `services/worker`
- Celery app wired to Valkey; a `ping` task; beat schedule placeholder for the daily sweep (no logic yet).
- A test that enqueues `ping` against the running stack (marked as an integration test).

### 2.7 Keycloak realm (`infra/keycloak/realm-satya.json`)
- Realm `satya`. Realm roles: `RB`, `SC`, `EV`, `HC`, `RA`, `AU`, `INS` (UI spec §1).
- Clients: `satya-web` (OIDC authorization code + PKCE, redirect to `https://localhost/*`), `satya-mock-portal` (OIDC, redirect to `https://portal.localhost/*`), `portal-integration` (confidential, client-credentials).
- Demo users with **obviously synthetic** usernames (`rb.southern.demo`, `auditor.demo`, `institution.demo03`, …), no real names, no emails that could belong to real people (use `@example.invalid`). Passwords come from `.env`, never from the committed JSON (use a post-start script to set them).
- Brute-force detection on, password policy on, no default admin credentials committed.

### 2.8 `apps/web` (workbench shell only)
- Next.js (App Router, TypeScript, server-side rendering by default).
- Styling exactly per decision #25: **CSS Modules + CSS custom properties** (`tokens.css` generated from UI spec §8 token summary: chrome, saffron rule, page, surface, text, muted, accent, rule, field, mismatch ink/tint, added tint/ink, viewer, prototype strip, the 6 label colours, the 3 risk colours) + **React Aria Components** + **next-intl** (English + Hindi message files; no hard-coded UI strings; Hindi strings marked `[VERIFY]` where unsure).
- Fonts per UI spec §8 (Public Sans, Noto Sans Mono, Noto Sans Devanagari for Hindi), self-hosted (no runtime calls to font CDNs).
- Sign-in through Keycloak (OIDC code + PKCE, server-side session, HttpOnly + Secure + SameSite cookies). Use a trusted auth library (e.g. Auth.js with the Keycloak provider); record the choice.
- `AppShell` per UI spec §3.1: left rail per role (RB rail items for now; Phase 2 items hidden), saffron current-page bar, prototype strip "Prototype · connected to a mock approval portal · synthetic data only", breadcrumb + top strip, GIGW footer links (About, Policies, Help, Accessibility statement, Sitemap, last updated).
- Pages: `/` (role home redirect), `/rb-queue` with a **real empty state** ("No applications yet. Submit one from the mock portal."), `/accessibility`, `/help`, custom `not-found` and `error` pages, a 403 page "Not assigned to you".
- Accessibility: skip link, visible focus, keyboard navigation, `prefers-reduced-motion`, text resize to 200%, every status as text (never colour alone).
- `robots.txt` with `Disallow: /` (internal tool), unique page titles and meta descriptions, favicon, no console errors, no production source maps.

### 2.9 `apps/mock-portal` (demo stand-in only)
- Deliberately plain grey style, visibly different from the workbench, titled **"Approval Portal (Mock, for demo)"**, with a banner "Demo stand-in. Not an AICTE system. Synthetic data only." **No AICTE logo, State Emblem, AICTE branding or AICTE URL anywhere** (UI spec §0 principle 9).
- One working page for slice 0: "Send test event" → builds a synthetic `application.precheck_requested` envelope (synthetic IDs like `1-90000004217`), signs it with HMAC server-side, posts to the API, shows the receipt JSON. This proves the signed-webhook path end to end.

### 2.10 Synthetic data rule
- `data/synthetic/README.md`: what counts as synthetic, the naming patterns, and the ban on real data.
- One example synthetic institution profile (`demo-institute-03.json`) consistent with the UI mockups (Demo Institute of Technology 03, AY 2026-27, Southern), clearly fake values.

### 2.11 Safety rails in CI (GitHub Actions)
Jobs that run on every push and PR:
- lint + typecheck + unit tests (JS and Python);
- shared-types regeneration diff check;
- `docker compose config` validation;
- **secret scan** (gitleaks or equivalent);
- **real-data guard:** fail if any file under `data/real-samples/` is tracked, or if any committed file matches personal-data patterns (Indian mobile `\b[6-9]\d{9}\b` outside obvious test fixtures, PAN `\b[A-Z]{5}\d{4}[A-Z]\b`, Aadhaar-like `\b\d{4}\s?\d{4}\s?\d{4}\b`), with an allow-list file for documented synthetic fixtures;
- a smoke job that boots the compose stack (or the subset that fits CI) and checks `/v1/health`.

### 2.12 Issue backlog (P-1..P-19)
- Create one GitHub issue per promise P-1..P-19 from `00-BUILD-CONTEXT.md`, titled `[P-n][Mx] <claim>`, labelled `phase-1` or `phase-2` and with a priority label following decision #40 (`prio-1` = M5 … down to M1/M9). Body: claim, module, phase, APH clauses involved, spec sections to read, acceptance criteria (draft), "synthetic data only" note.
- Use the `gh` CLI if it is available and authenticated. **If it is not**, write all issues to `docs/ISSUES.md` and a script `infra/scripts/create-issues.sh` that creates them with `gh` when the team runs it on a laptop. Record which path you took in `PROGRESS.md`.

### 2.13 README.md (judge-friendly)
- What SATYA-EoA is (2–3 sentences, plain language), what this prototype is and is not ("advisory decision support; officials decide; runs against a mock portal; synthetic data only; not affiliated with or connected to AICTE"), architecture diagram (render the Mermaid from Portal spec §8.1), quick start (3 commands), current status table (slice 0 done; feature slices listed as planned), team name OneVision. No personal names, no emails, no phone numbers.
- Do **not** add a LICENSE file yet; add the question to "Blockers / questions" in `PROGRESS.md`.

---

## 3. Acceptance criteria (all must pass before marking the slice done)
1. `make secrets && make up` on a clean machine brings all 8 services to healthy within 10 minutes (first run, including pulls) and within 2 minutes on later runs.
2. `curl -k https://localhost/api/v1/health` returns 200 with all dependencies `ok`.
3. In a browser on default settings, `https://localhost` loads the workbench over HTTPS (after trusting the local CA once, documented), redirects to Keycloak, and after signing in as `rb.southern.demo` shows the RB shell with the empty queue state. `https://portal.localhost` shows the mock portal banner.
4. "Send test event" in the mock portal returns `202` with a receipt; a second click with the same event returns `200 duplicate:true`; the ledger shows a valid chain (`make ledger-verify`).
5. A tampered signature returns `401 SIGNATURE_INVALID`; an old timestamp returns `401 SIGNATURE_EXPIRED`.
6. CI is green on the PR, including the secret scan and the real-data guard.
7. `CLAUDE.md`, `README.md`, `docs/DEV-SETUP.md`, `docs/STACK-VERSIONS.md`, `docs/DECISIONS-SLICE-0.md`, `docs/ISSUES.md` (or real issues) exist and match what was built.
8. No file in the repo contains a real person's or institution's name, a real ID, or anything from `data/real-samples/`.
9. Memory limits are set on every service and sum to ≤ 8 GB.

When all pass: open a PR from `slice-0-foundation` to the default branch titled `Slice 0: foundation (monorepo, stack, contracts, CI)`, with a body listing the acceptance results and the open questions. Do not merge it yourself.

---

## 4. Web-design, production and security checklist (apply from line one; assess applicability for an internal government tool and note N/A items in DECISIONS-SLICE-0.md)
**Visual anti-patterns to avoid:** purple-to-blue gradients; gradient hero text; emojis in headings; Inter everywhere; coloured-border cards as the default pattern; glassmorphism; low-contrast dark mode; three icon boxes in a row; badges above headlines; decorative icons without purpose; untouched component-library defaults; fade-in-on-scroll; cursor-following effects; buttons that fade on hover; inconsistent spacing; em dashes everywhere in UI copy; buzzword copy; serif italic accents; grain textures; bento grids; radial orbs / dot-grid backgrounds; sparkle icons; neon colours; "it's not X, it's Y" copy; checkmark-bullet lists as default; decorative terminal mockups. Follow the UI spec's own design system instead (dense, document-first, ledger-like).

**Production fundamentals:** meaningful internal link structure; meta description and unique title on every page; custom 404; breadcrumbs; alt text on all images; unique descriptive headings (one H1 per page); fix all console errors; no placeholder text; favicon; code-split and lazy-load large JS; no production source maps; robots.txt (internal tool: disallow); no horizontal scroll; every page checked at mobile width; visible success/error feedback on every action; no dead navigation items; footer links work; current year; skeleton loaders instead of spinners for async content; images compressed (WebP). SEO items (sitemap, structured data, llms.txt, OG images, Search Console) apply only to the public README/landing material, not the authenticated workbench; note them as N/A with reason.

**API and backend security (mandatory):** rate limiting on every endpoint; request throttling and size limits; per-client quotas; server-side authorisation on every request (never trust the client); ownership / case-scope checks before any resource access; RBAC enforced server-side with the Keycloak roles; least-privilege database users (separate migration and runtime roles); row-level restrictions where cases are scoped by region.

**Authentication:** trusted provider only (Keycloak); no passwords stored by our code; generic login errors; session reset on password change; account lockout / brute-force detection; secure cookie flags (HttpOnly, Secure, SameSite); CSRF protection on state-changing forms; no default admin routes or credentials.

**Input and transport:** validate and sanitise all input server-side; reject malformed payloads; limit upload and body sizes; whitelist file types by extension **and** content (for later PDF uploads); HSTS; locked-down CORS; generic error messages to users with detailed logs server-side only; log all security events (failed logins, signature failures, permission denials).

**Cost and abuse controls:** cap expensive operations per client; no external paid APIs; no foreign LLM APIs in the product.

---

## 5. PROGRESS.md template (create exactly this on first run)
```markdown
# PROGRESS — Slice 0 (foundation)
Prompt: docs/prompts/SLICE-0-PROMPT.md v1.0 · Branch: slice-0-foundation
Resume rule: continue from the first step whose status is not `done`/`done-with-note`.

| Step | Status | Updated (UTC) | Verify | Note |
|---|---|---|---|---|
| S0.1 Read specs; write CLAUDE.md, .gitignore, .editorconfig, .env.example | todo | | CLAUDE.md exists; data/real-samples/ ignored | |
| S0.2 Monorepo skeleton (pnpm + uv workspaces, placeholders, READMEs) | todo | | `pnpm -r build` no-op passes; `uv sync` passes | |
| S0.3 shared-types: JSON Schemas + generated TS/Pydantic + tests | todo | | schema tests pass; regen diff empty | |
| S0.4 services/api: health, meta, portal-events (HMAC, dedupe, ledger), migrations, tests | todo | | pytest green | |
| S0.5 services/worker: Celery + Valkey + ping | todo | | ping task returns pong | |
| S0.6 infra: compose (8 services, health checks, memory limits), Caddy TLS + headers, make targets, secrets script | todo | | `make up` all healthy | |
| S0.7 Keycloak realm import + demo users (passwords from .env) | todo | | login as rb.southern.demo works | |
| S0.8 apps/web: tokens.css, AppShell, i18n, auth, pages, a11y | todo | | acceptance 3 passes | |
| S0.9 apps/mock-portal: banner + signed test event | todo | | acceptance 4 and 5 pass | |
| S0.10 CI: lint, types, tests, regen check, secret scan, real-data guard, smoke | todo | | CI green | |
| S0.11 Issues P-1..P-19 (gh) or docs/ISSUES.md + script | todo | | 19 issues or file+script exist | |
| S0.12 README, DEV-SETUP, ARCHITECTURE, STACK-VERSIONS, DECISIONS; acceptance run; PR | todo | | all 9 acceptance criteria pass | |

## Blockers / questions
- (none yet)

## Deviations from the prompt
- (none yet)
```

## 6. Commit messages (use exactly these, one per step; add a body line with anything notable)
- S0.1 `chore(slice-0): S0.1 repo rules, CLAUDE.md and env template`
- S0.2 `chore(slice-0): S0.2 monorepo skeleton with pnpm and uv workspaces`
- S0.3 `feat(shared-types): S0.3 JSON Schema contracts with generated TS and Pydantic models`
- S0.4 `feat(api): S0.4 health, meta and signed portal-events with hash-chained ledger`
- S0.5 `feat(worker): S0.5 Celery worker on Valkey with ping task`
- S0.6 `chore(infra): S0.6 docker compose stack with Caddy TLS and memory limits`
- S0.7 `chore(auth): S0.7 Keycloak realm with roles, clients and synthetic demo users`
- S0.8 `feat(web): S0.8 workbench shell with tokens, i18n, SSO and accessibility base`
- S0.9 `feat(mock-portal): S0.9 mock approval portal with signed test event`
- S0.10 `ci: S0.10 lint, tests, schema check, secret scan and real-data guard`
- S0.11 `docs(backlog): S0.11 issues for promises P-1 to P-19`
- S0.12 `docs: S0.12 README, setup, architecture and slice 0 acceptance results`
- Progress-only updates: `chore(progress): update PROGRESS.md for <step>`

## 7. Things you must not do
- Do not implement M2–M13 feature logic (that is later slices). Stubs and TODOs only, each pointing to its P-n issue.
- Do not download, fetch or embed any real institution document, website content or personal data.
- Do not add any AICTE logo, emblem or branding, and do not imply official endorsement anywhere.
- Do not call any external LLM or paid API from the product.
- Do not weaken a guard rail to make a test pass; record a blocker instead.
