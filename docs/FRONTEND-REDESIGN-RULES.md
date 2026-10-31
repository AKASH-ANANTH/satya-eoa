# SATYA-EoA FRONTEND REDESIGN: RULES FOR THE AI ASSISTANT
(Read fully before touching any file. Re-read at the start of every session.)

## CONTEXT
- Repo: GM-Hrishi/satya-eoa (private monorepo). Product: decision-support workbench for AICTE officials reviewing Extension of Approval applications. Team OneVision.
- Your human's job: a professional visual redesign of apps/web ONLY. The pages and routes that exist on main at clone time stay exactly as they are (same routes, same content, same behaviour). Only the look changes: layout polish, typography, spacing, colour, components' styling.
- Do not add, remove, rename or merge pages/routes. Do not add new features.
- The backend, data and wording are fixed. Everything below exists to keep the frontend honest to them.

## GIT RULES
1. Work only on your own branch: git checkout -b ui/<your-name>-<topic>. Never commit to main. Never force-push. Never touch other people's branches.
2. Small commits, clear messages (e.g. "ui: restyle queue table header"). Open a PR into main when ready; Hrishi reviews and merges. Do not merge your own PR.
3. Before every PR: git fetch origin && git rebase origin/main (or merge main in), then run the checks below.

## SCOPE: WHAT YOU MAY AND MAY NOT CHANGE
- MAY change: files under apps/web only: CSS Modules, tokens.css / CSS variables, component markup for layout, fonts (see below), icons, spacing, motion (subtle only).
- MAY NOT change: apps/api, packages/*, infra, docker-compose, CI workflows, Keycloak config, seed data, scripts, e2e test files, anything under data/. If you think one of these needs a change, STOP and write the request in docs/progress/FRONTEND-<name>.md for Hrishi.
- MAY NOT change API calls: endpoints, request/response shapes, query params (sort, dir, filters), auth handling, route guards, role checks. Never hardcode data. Never mock around the API.
- KEEP all data-testid attributes, element ids, aria-labels, form field names and heading levels that exist. The e2e scripts and axe checks in CI depend on them. If you restructure a component, carry them over unchanged.
- KEEP the stack: Next.js, CSS Modules + CSS variables, React Aria Components, next-intl. Do not add Tailwind, shadcn, MUI, Bootstrap, CSS-in-JS or any other UI framework. Adding any new npm dependency needs Hrishi's approval first (ask via the progress file). Allowed without asking: nothing new.
- Strings: keep all user-visible text in the next-intl message files; do not hardcode copy in components. Do not reword product text (see wording rules).

## PRODUCT RULES THE UI MUST NEVER BREAK
1. AI only advises; officials decide. There is NO "Approve" or "Reject" control anywhere. The decision bar keeps its five dispositions exactly as built. Never add, rename or restyle them so they read as an approval/rejection of an application.
2. Status labels: the six PS labels are verified / mismatch detected / expired / verification pending / source unavailable / manual review required. Keep one StatusLabel component (icon + sentence-case text + count). Do not invent new statuses or rename these. Never show "verified" styling for anything not verified. Risk chips (High / Medium / Low) stay text-only caps.
3. Honesty wording stays: source answers carry the tags "Simulated source" and "Test trust anchor". Do not remove, hide, shrink or reword them. Do not use the words "prototype", "concept", "incomplete", "coming soon" or "beta" anywhere in the UI. Do not add claims such as "connected to AICTE", "live", "official" or any government emblem/logo. The mock portal keeps the word "mock".
4. Synthetic data only. Never paste real names, phone numbers, Aadhaar/PAN, emails, institution names or documents into the code, screenshots, fixtures or PR text. Never add real PDFs to the repo.
5. Never print, commit or screenshot credentials. The demo password lives in .env as DEMO_USER_PASSWORD; do not copy it anywhere.
6. No foreign LLM/API calls, no analytics, no third-party trackers, no external CDN for fonts, scripts or images. Everything is self-hosted/bundled.
7. Accessibility is a hard requirement: keyboard operable, visible focus, WCAG AA contrast at minimum (status tints in the current build are at least 8:1; do not lower them), semantic landmarks, one H1 per page, no colour-only meaning, respects prefers-reduced-motion. CI runs axe: zero violations must remain.

## DESIGN DIRECTION
- Audience: government officials working long sessions on dense data. Aim: calm, professional, high-legibility, restrained. Data tables, queues, evidence viewer and audit trail must stay dense and scannable.
- Responsive: usable from laptop widths down to tablet; no horizontal page scroll; no layout overflow.
- Anti-patterns, do NOT use: purple-to-blue gradients, gradient text, emojis in headings, glassmorphism, bento grids, radial orbs or dot-grid backgrounds, sparkle icons, neon colours, badges above headlines, 3-icon-box rows, fade-in-on-scroll, cursor-following effects, buttons that fade on hover, grain textures, serif-italic accents, decorative terminal mockups, untouched component-library defaults, generic buzzword copy, em dashes in copy.
- Do: consistent spacing scale, a clear type scale with real hierarchy, purposeful icons only, skeleton loaders for async content (not spinners or blank screens), visible success/error feedback on every action, a custom 404 page that already exists must keep working (unknown/malformed case IDs return a real 404).
- Fonts: bundle via @fontsource (no CDN). Current plan: Noto Sans, Noto Sans Devanagari, Noto Sans Mono, Public Sans 800 for headings. Do not use Inter as the single font everywhere.
- Colours: use only CSS variables from tokens.css; extend the tokens file rather than hardcoding hex values in components. Keep the six status tints and the three severity tints distinguishable.

## WEB FUNDAMENTALS (apply to the frontend)
- This is an internal officials' tool: keep noindex (meta robots + robots.txt disallow). Do NOT add SEO growth features (sitemap, backlinks, FAQ schema, OG share images).
- Still required: unique, descriptive <title> and H1 per page; meta description; favicon; alt text on every meaningful image (empty alt for decorative); no console errors or warnings; no production source maps; no placeholder text; no broken links or dead nav items; footer links must work; current copyright year.
- Performance: no large images; code-split heavy components (the PDF viewer especially); avoid layout shift; keep pages fast.
- Security in the frontend: no secrets or tokens in client code or in localStorage; never use dangerouslySetInnerHTML; never render unsanitised API strings as HTML; no inline event handlers that weaken CSP; no new third-party scripts; generic error messages in the UI (no stack traces, no internal details); forms never disclose which field was wrong at login.
- The site must work on default browser settings over HTTPS with zero flags or workarounds.

## CHECKS BEFORE EVERY PR (all must pass; do not weaken or skip tests to get green)
- From the repo root run the project's own commands (see README.md and Makefile; do not invent commands): install, lint, typecheck, unit tests, build. Then bring the stack up with the Makefile targets documented there and click through EVERY existing page, with the demo users, at laptop and tablet width.
- Confirm: no new console errors, keyboard-only navigation works, axe shows no violations, data-testids unchanged, no API/contract changes in the diff (git diff --stat must show changes only under apps/web).
- If the Docker stack cannot run on your machine, say so in the PR; CI is then the check. Do not claim a check passed that you did not run.
- PR description must contain: what changed visually, pages touched, screenshots (synthetic data only), and the checklist above ticked honestly.

## RESUME SAFETY (mandatory)
- Keep a progress file at docs/progress/FRONTEND-<your-name>.md. Update it after every completed step: current branch, pages done, pages remaining, decisions made, open questions for Hrishi, last command run.
- At the start of every session, and after any interruption, read that file first and continue from the last unfinished step. Never restart from scratch and never redo finished pages.
- Commit the progress file with your work so it survives a crashed session.

## WHEN UNSURE
- If a change would touch anything outside apps/web, alter wording, remove a tag, or add a dependency: do not do it. Write the question into the progress file and ask your human to message Hrishi.
- Never invent product facts, statistics, APH clauses, or document formats in the UI.
