# SATYA-EoA: PRODUCT CONTEXT AND HOW TO RUN IT
(Companion to docs/FRONTEND-REDESIGN-RULES.md. Read both. This file explains what the product is and how to clone, run and tour it. Do not invent commands, URLs, usernames or file paths: read them from the repo and confirm they exist before using them.)

## 1. WHAT THIS PRODUCT IS
- Smart India Hackathon 2026, Problem Statement SIH26261: "AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification". Organisation: AICTE (Regulation Bureau). Category: Software. Theme: Smart Automation.
- Our team: OneVision, one 6-member team. Our product name: SATYA-EoA.
- SATYA-EoA is a decision-support workbench for AICTE officials reviewing Extension of Approval (EoA) applications from institutions. It checks application data and uploaded documents, flags anomalies and possible forgery with evidence attached to each flag, checks documents against issuing-authority sources, and keeps a tamper-evident audit trail.
- Core idea: template-aware parsing. AICTE's fixed templates (for example the sworn Affidavit 2) are read against their known layout and compared with the data in the approval portal.
- AI ONLY ADVISES. AICTE officials decide. There is no approve/reject anywhere in the product. Every flag shows its evidence and an official chooses a disposition.
- Final-product framing: the UI should read as a finished professional product. Honesty is carried by data tags on each source answer ("Simulated source", "Test trust anchor"), not by banners or "prototype" wording.

## 2. WHAT IS REAL AND WHAT IS SIMULATED (never blur this in the UI or in text)
- Built and running against synthetic data: Affidavit-2 diff against portal data, digital-signature and stamp/notary/UDIN checks (using a test PKI), a simulated source hub (e-Stamp lookup, UDIN lookup, signature-chain check), risk bands (High/Medium/Low), five dispositions, hash-chained audit ledger, alerts, case queue, Overview page, PDF.js evidence viewer, decision bar.
- Simulated: all issuing sources (e-Stamp, UDIN, certificate chain) are demo adapters. The AICTE approval portal is a MOCK. There is no real integration with AICTE, CCA, SHCIL or ICAI, and the UI must never imply there is.
- Not built yet (do not draw fake screens or claim them): OCR for scanned documents, infrastructure/photo evidence review, TN Form D and TN fire-licence adapters, year-over-year reconciliation, identity graph, EVC video checks, editable rules. Some pages for these are specified but not in main.
- All data is synthetic. No real documents, people or institutions exist anywhere in the repo, and you must never add any.

## 3. ARCHITECTURE (so you know what you can and cannot touch)
- Monorepo. Frontend in apps/web (Next.js, PDF.js, CSS Modules + CSS variables, React Aria Components, next-intl). Backend is FastAPI (Python) with Postgres, Celery + Valkey, Keycloak for sign-in, Caddy for local HTTPS, all via Docker Compose. Verify exact folder names with `ls` and README.md.
- The frontend talks to the backend only through the documented HTTP API (for example /v1/cases with sort and dir params, /v1/overview). Treat the API as a fixed contract. You are redesigning the look of apps/web; you never change the API, data, rules or wording.
- Roles and sign-in come from Keycloak with synthetic demo users. Never hardcode users or bypass auth.

## 4. FILES TO READ FIRST (in this order, from the repo root; skip any that do not exist and tell your human)
1) docs/FRONTEND-REDESIGN-RULES.md  2) README.md  3) CLAUDE.md  4) docs/DEMO-NOTES.md  5) docs/DEMO-SCRIPT.md  6) the docs index and any docs/progress/DECISIONS-UI-POLISH.md  7) the UI design spec (SATYA-UI-design.md, check docs/ and VERSIONS.md; the latest is v0.9 and the repo copy may be older: ask Hrishi for the current copy before restyling shared components)  8) the Makefile.

## 5. CLONE AND RUN (follow the repo's README and Makefile; this is the expected shape)
a) Prerequisites: git, Docker with Compose v2 (Docker Desktop on Windows/macOS; on Windows use WSL2 and keep the repo inside the WSL2 filesystem), Node (version from .nvmrc or package.json "engines"), and `uv` for Python. Check versions with `docker --version`, `docker compose version`, `node --version`, `uv --version`.
b) You must be added as a collaborator on the private repo GM-Hrishi/satya-eoa and signed in to GitHub (`gh auth login` or an SSH key / token). Set your own git identity: `git config user.name "<your name>"` and `git config user.email "<your email>"`.
c) Clone: `git clone https://github.com/GM-Hrishi/satya-eoa.git`, then `cd satya-eoa`, then create your branch: `git checkout -b ui/<your-name>-<topic>`.
d) Environment: copy the example env file if one exists (look for .env.example) to .env. The demo user password is DEMO_USER_PASSWORD in .env. Ask Hrishi for it privately. NEVER write it in chat prompts, code, commits, screenshots or the PR. .env is git-ignored; keep it that way.
e) Python deps on a fresh clone: `uv sync --all-packages` before any `uv run`.
f) Start the stack with the Makefile (`make up`), then load the demo data with `make demo-reset` (it seeds 5 synthetic cases and a 24-row audit ledger and verifies the chain). Use `make help` or read the Makefile for the exact target names; do not guess others.
g) Open the web app at the HTTPS address given in README.md/DEMO-NOTES.md. Local HTTPS uses a Caddy internal certificate authority; for LOCAL DEVELOPMENT ONLY, trust that CA in your own browser as the README describes (Linux needs libnss3-tools/certutil). This is a dev-machine step; the site itself must never require visitors to change browser settings.
h) If Docker is slow: close other apps; the full stack needs roughly 8 to 10 GB of RAM headroom. If you cannot run the full stack, tell your human and rely on CI for the end-to-end check; do not fake results.
i) Frontend-only loop: you may run the Next.js dev server inside apps/web against the running API (see apps/web README/package.json scripts for the exact command and env vars). Use only scripts that exist in package.json.
j) Stop the stack with the Makefile's down target; `make demo-reset` returns the data to a clean known state.

## 6. GUIDED TOUR (do this once before changing anything; write your notes into docs/progress/FRONTEND-<your-name>.md)
Sign in as the demo users listed in README/DEMO-NOTES (never invent usernames). Then visit, in order:
1) Overview (default landing at /overview): counts per status, manual tasks, risk bands.
2) Case queue: sortable columns (two-arrow indicator), filters, "Reset sort", status labels, risk chips.
3) A case view (open several of the 5 synthetic cases): findings with evidence links, PDF.js document viewer with highlighted evidence, signature badges, source tags, decision bar with the five dispositions.
4) Alerts: severity-tinted cards (High/Medium/Low).
5) Audit: the hash-chained ledger; every official action appears here.
Also try: an unknown case URL (must show a real 404), keyboard-only navigation, sign-out and sign-in again, browser width from laptop down to tablet.
For each page record: purpose, main components, states (loading, empty, error, populated), and anything dense that must stay scannable. Take screenshots of the current look for before/after in the PR (synthetic data only, no password visible).

## 7. HOW TO WORK ON YOUR REDESIGN
- Redesign page by page, shared components first (tokens, typography, StatusLabel, SourceTag, SignatureBadge, table, header, footer), then the pages. Keep all four states for every component: loading (skeleton), empty, error, populated.
- After each page: run the checks in docs/FRONTEND-REDESIGN-RULES.md, update your progress file, commit, push your branch.
- When the redesign is ready: rebase on origin/main, run the checks, open a PR into main with before/after screenshots. Hrishi reviews and merges.
- Anything outside apps/web, any wording change, any new dependency: ask Hrishi first (write it in the progress file).

## 8. RESUME SAFETY
- Your progress file docs/progress/FRONTEND-<your-name>.md is your memory. At the start of every session read it, run `git status` and `git log --oneline -5`, and continue from the last unfinished step. Never start over. Update it after each completed step and commit it.
- If the stack or a command fails, record the exact error and command in the file, fix it or ask Hrishi; never delete files or reset the repo to work around it.

## 9. PRIVACY AND SAFETY
- Synthetic data only; no real PDFs, names, phone numbers, Aadhaar/PAN or institution names in code, fixtures, screenshots or PR text.
- No credentials in anything you write. No foreign LLM APIs. No analytics or third-party scripts.
