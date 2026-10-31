# Public-ready report

Prepared on branch `chore/public-ready` (from `origin/main` at `dfb2000`). No file was deleted in `main`: every removal below happens only in the cleaned snapshot copy. Values of credentials or personal data are never printed here, only path, revision and kind.

Classes: KEEP, REMOVE-FROM-PUBLIC (removed from the snapshot only), REWRITE (changed in this PR), FLAG-FOR-HRISHI (needs a decision).

## A. Inventory

### A1. Top-level files

| Path | Class | Reason |
|---|---|---|
| `README.md` | REWRITE | Replaced by a public-facing README (PR3). The old one is full of internal slice and module codes. |
| `CLAUDE.md` | FLAG-FOR-HRISHI | Developer instructions for the coding assistant. No personal data or credentials, but it uses internal codes and names a team and a hackathon. Kept in the snapshot by default; remove it with one line in `paths-remove.txt` if preferred. |
| `Makefile` | KEEP | Real run, test and lint targets. Mentions `docs/eval/` only in a help string for `eval-blind`. |
| `.env.example` | KEEP | Names of variables only; every value is a placeholder that `make secrets` replaces with random values. No credential values. |
| `.gitignore`, `.dockerignore`, `.editorconfig`, `.npmrc`, `.python-version` | KEEP | Tooling config. `.gitignore` keeps `data/real-samples/`, `.env*`, keys and logs out of git. |
| `.gitleaks.toml`, `.real-data-allowlist` | KEEP | Secret scan config and real-data guard allow-list (0 entries). Not weakened. |
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `pyproject.toml`, `uv.lock` | KEEP | Manifests and lockfiles. Not edited. |
| `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CONTRIBUTING.md` | KEEP (new) | Added in this PR. |

### A2. `.github/`

| Path | Class | Reason |
|---|---|---|
| `.github/workflows/ci.yml` | KEEP | Seven jobs: JS, Python, contracts, compose, secret scan, real-data guard, stack smoke. Uses no repository secrets, no self-hosted runners, no private resources, `permissions: contents: read`. It pulls public images (gitleaks, caddy, pgvector) and public actions. Runs on `push` and `pull_request`; on a public repo, fork PRs get a read-only token. Not changed. |
| `.github/PULL_REQUEST_TEMPLATE.md` | KEEP (new) | Added in this PR. |
| CODEOWNERS | none | The repo has no CODEOWNERS file. |

### A3. `docs/`

| Path | Class | Reason |
|---|---|---|
| `docs/README.md` | REWRITE | Index rewritten to list only what stays public. |
| `docs/ARCHITECTURE.md` | KEEP | Runtime and data-flow description. |
| `docs/DEV-SETUP.md` | REWRITE | One line: the clone URL named the private repository; replaced with a neutral placeholder. |
| `docs/STACK-VERSIONS.md` | KEEP | Pinned versions. |
| `docs/SYNTHETIC-TESTSET-PLAN.md` | KEEP | How rules are measured on synthetic sets. Contains no blind-run results. |
| `docs/DEMO-NOTES.md`, `docs/DEMO-SCRIPT.md`, `docs/DEMO-CHECKLIST.md` | FLAG-FOR-HRISHI | Click path, script and recording checklist for the demo. No personal data; kept because other docs link to them. They are recording-preparation material, so Hrishi may prefer to drop them (optional line in `paths-remove.txt`). |
| `docs/ISSUES.md`, `docs/backlog/promises.json` | KEEP | Backlog of planned work (generated from the JSON, read by `infra/scripts/issues.py`). Uses internal promise codes. Kept because code reads the JSON and the file shows what is planned. |
| `docs/specs/00-BUILD-CONTEXT.md` .. `05-ui-design-spec.md`, `VERSIONS.md` | KEEP | Design, API, UI and portal specs, Approval Process Handbook digest, problem-statement copy. No personal data. |
| `docs/prompts/SLICE-0-PROMPT.md` | REMOVE-FROM-PUBLIC | A build prompt handed to a coding assistant: chat handoff. |
| `docs/screens/ui-polish/*.png` (3 files) | KEEP | Synthetic workbench screenshots (synthetic institution names and IDs, no AICTE emblem or branding). One is used in the README. |
| `docs/eval/BLIND-REPORT.md`, `docs/eval/blind-results.json` | REMOVE-FROM-PUBLIC | Blind-run results. Nothing reads them (checked: the guard test only compares file names in a diff). |
| `docs/progress/BLIND-REPLAY-PROGRESS.md` | REMOVE-FROM-PUBLIC | Quotes the blind-run headline numbers. |
| `docs/progress/PRE-PUBLIC-CHECK.md` | REMOVE-FROM-PUBLIC | Pre-public check; quotes a real name and a college email in text. |
| `docs/progress/BRANCH-CLEANUP.md`, `docs/progress/PROGRESS-HOUSEKEEPING.md` | REMOVE-FROM-PUBLIC | Internal housekeeping notes. |
| `docs/progress/PUBLIC-READY-REPORT.md`, `PUBLIC-READY-PROGRESS.md`, `DECISIONS-PUBLIC-READY.md` | REMOVE-FROM-PUBLIC | This preparation work. |
| `docs/progress/DECISIONS-BLIND-REPLAY.md` | KEEP | Decision log; checked, no blind-run numbers. |
| `docs/progress/DECISIONS-SLICE-0/1/2/D.md`, `DECISIONS-OCR-SLICE.md`, `DECISIONS-UI-POLISH.md` | KEEP | Decision logs. No personal data. |
| `docs/progress/PROGRESS.md`, `PROGRESS-SLICE-1.md`, `PROGRESS-SLICE-2.md`, `DEMO-SLICE-PROGRESS.md`, `OCR-SLICE-PROGRESS.md`, `UI-POLISH-PROGRESS.md`, `DEFERRED.md` | KEEP | Step tables and deferred ideas. No personal data. They contain private-repo PR links (cosmetic) and mention "team lead" and "teammate" without names. |

### A4. `data/`

| Path | Class | Reason |
|---|---|---|
| `data/synthetic/README.md` | KEEP | Naming rules for synthetic data. |
| `data/synthetic/cases/*/` (8 cases x 6 files: two PDFs, `case.json`, `snapshot.json`, `truth.json`, `truth-m6.json`) | KEEP | Generated by `make synth`; `make synth-check` passes. Synthetic institution names, IDs `1-9...`. |
| `data/synthetic/demo-institute-03.json`, `data/synthetic/registry/prior-filings.json` | KEEP | Synthetic. |
| `data/synthetic/pki/satya-test-root.pem`, `satya-test-sub-ca-1.pem`, `satya-test-sub-ca-1.crl` | KEEP | Public half of the test PKI only; no private keys in any revision. |
| `data/real-samples/` | absent | Git-ignored; not tracked in any revision. |

### A5. `scripts/`
No `scripts/` folder exists on `main`. `scripts/public-snapshot/` is added by this PR and is REMOVE-FROM-PUBLIC (snapshot only).

### A6. Other tracked folders (not inventoried per file)
`apps/` (139 files: 119 web, 20 mock portal), `services/` (46), `packages/` (144), `infra/` (17), `tests/` (11): KEEP, not edited. `infra/certs/no-extra-ca.pem` is an empty placeholder file (compose default for an optional extra CA). `infra/scripts/create-issues.sh` contains the private repository path `GM-Hrishi/satya-eoa` as a fallback default (FLAG, cosmetic; `infra/` is out of scope for this PR).

## A7. Scan results (working tree and all history: 22 revisions over 14 commits on `main` plus the two other branches and 7 tags; all commit messages)

| Scan | Result |
|---|---|
| a. Email addresses (excluding allowed domains) | One real-looking college address: in the author metadata of all 14 `main` commits, and as text in `docs/progress/PRE-PUBLIC-CHECK.md` (every revision from `5f4f46f` on). Everything else is `@example.invalid` (synthetic demo accounts, expected). |
| a. Phone-number pattern | 0 real hits. Word-bounded pattern gives 0 hits; an unbounded pattern matches only digits inside PDF streams and hashes. |
| a. Aadhaar-like | 0 hits (all application IDs are `1-9...` and are separated by a hyphen). |
| a. PAN-like | 2 false positives: a PDF stream byte sequence (`data/synthetic/cases/dce07-2026-27/affidavit-sworn.pdf`) and a registry hash in `pnpm-lock.yaml`. |
| a. `rmkec` | Only in `docs/progress/PRE-PUBLIC-CHECK.md` text, plus the author email and name in commit metadata (the author name also contains it). |
| b. Credential-like strings | No private keys, no tokens, no committed `.env`. Compose, scripts and `.env.example` only name variables; values are generated per machine by `make secrets` (path and kind only; no value was read into this report). |
| b. Keycloak realm demo users | FLAG: `infra/keycloak/realm-satya.json` commits 8 synthetic usernames with `@example.invalid` emails (`rb.southern.demo`, `auditor.demo`, ...). No password or secret is in the file: passwords come from `DEMO_USER_PASSWORD`, generated randomly per machine. The usernames become public; nothing to rotate. |
| c. Other teams or repositories | The listed names: 0 hits (case-insensitive). The only `github.com/<owner>/<repo>` is this repository (`GM-Hrishi/satya-eoa`), in `docs/DEV-SETUP.md`, `docs/progress/PROGRESS-SLICE-2.md` and `infra/scripts/create-issues.sh`. The word "MARK" appears only in UI strings and docs about "printed mark" (false positive). |
| d. Blind-run numbers and wording | Present in: `docs/eval/BLIND-REPORT.md`, `docs/eval/blind-results.json`, `docs/progress/BLIND-REPLAY-PROGRESS.md` (headline line), and one commit message (`de2838e`: "First run: ... wrongly flagged ..."). The generator and evaluator source (`packages/blindgen`) print format strings only, no results. |
| e. Real-looking institution names or document IDs | 0. Only "Demo Institute of Technology NN", "Demo College of Engineering NN", "Existing Institute" and "Blind Institute of Technology" (synthetic). |
| f. Binary files over 1 MB, LFS, submodules | None (largest blob under 1 MB; no `.gitattributes`, no `.gitmodules`). |
| Workflows | Use no secrets and no self-hosted runners (see A2). |
| `data/real-samples/`, `.env`, `*.key` in history | Never tracked. Only the public test certificates. |

Commit-message internal codes (for example "(B-28)", "P-3") and squash-merge `(#N)` suffixes exist in main's history. They are cosmetic: the `#N` numbers will point at nothing in the new repository.

## A8. Licence review (dependencies)

- `LICENSE` is the unmodified Apache License 2.0 text (checked against the text served by apache.org). `NOTICE` carries "SATYA-EoA, Copyright 2026 Team OneVision".
- [VERIFY: college approval of the licence]. The college has not confirmed that it approves Apache-2.0. This is deliberately not written in `LICENSE`.
- `THIRD_PARTY_NOTICES.md` lists 109 Python packages and 443 npm package versions (runtime and development marked).
- No AGPL, GPL, SSPL or non-commercial licence. PyMuPDF and Ultralytics are absent from the lockfile and the environment.
- Weak copyleft present (listed prominently in `THIRD_PARTY_NOTICES.md`): LGPL-3.0 (`psycopg`, `psycopg-binary`; npm `@img/sharp-libvips-*`), MPL-2.0 (`pikepdf`, `certifi`, `pathspec`; development-only `axe-core`, `lightningcss*`). All are used unmodified as libraries.
- UNKNOWN: only this repository's own seven workspace packages (no licence field). Optional follow-up: add `license = "Apache-2.0"` to each `pyproject.toml` (manifests were not edited here).
- Not in the lockfile: PaddleOCR, PaddlePaddle, PaddleX (installed at image build with `WITH_OCR=1`) and their model weights. Their licences are `[VERIFY]` in the notices file (the repo records Apache-2.0 for the engine packages; the weights were not checked).

## B. Dry run of the snapshot tooling (cloud session, nothing pushed)

Run: `scripts/public-snapshot/run.sh --ref refs/heads/chore/public-ready` against `chore/public-ready` at `0e86bb1`, staging copy in `../satya-eoa-public-staging`. `verify.sh` exit code 0 ("all checks passed").

| Item | Result |
|---|---|
| Commits on the published `main` | 20 before, 16 after (4 commits became empty once their only changes were removed paths, and were pruned) |
| Distinct identity names (authors, committers) | Before: `HRISHI RMKEC`, `GitHub`, `Claude`, plus the tagger name `GM-Hrishi` on 5 annotated tags. After: `GM-Hrishi`, `GitHub`, `Claude`. The old college address is gone from commits and from the 5 annotated-tag taggers. |
| Identity mapping | Most frequent author -> `GM-Hrishi <GM-Hrishi@users.noreply.github.com>`. No other human identity exists in the history, so nothing was mapped to `OneVision team member`. `noreply@github.com` and `noreply@anthropic.com` unchanged. |
| Paths removed (17 files in the final tree, plus the same paths in every older revision) | `docs/eval/` (2 files), `docs/progress/BLIND-REPLAY-PROGRESS.md`, `PRE-PUBLIC-CHECK.md`, `BRANCH-CLEANUP.md`, `PROGRESS-HOUSEKEEPING.md`, `docs/prompts/` (1 file, and the older bundle copy `satya-eoa-slice0-bundle/docs/prompts/`), the three `PUBLIC-READY-*` files, `scripts/public-snapshot/` (7 files) |
| Files stubbed | None. No test, CI step or code reads a removed file (checked: the guard test in `packages/blindgen/tests` only compares file names in a git diff; nothing reads `docs/eval/`). `git-filter-repo` cannot key a blob callback on a path anyway. |
| Text scrubbed | Commit messages: one blind-run results sentence and the blind-set composition; `Claude-Session:` trailers removed from all messages (`Co-Authored-By` kept). Blob text: nothing left to replace after the path removals (the only address in file contents was in a removed file). |
| Scan results | 0 hits in all seven scans (phone, Aadhaar-like, PAN-like, college name, other teams or repositories, blind-run results, session trailers), over every revision's text blobs and all commit messages and identities. 0 emails outside the allow-list. |
| Refs | Only `refs/heads/main` and 7 tags; every tag target exists. The branches `fix/ui-wording-consistency` and `claude/*` are dropped. `git fsck --full --strict` passes. |
| Tree check | The cleaned `main` tree (465 files) equals the `chore/public-ready` tree (482 files) minus exactly the 17 removed files. No stubs. |
| Tests in a checkout of the cleaned `main` | real-data guard, `pnpm install --frozen-lockfile`, `uv sync --all-packages --frozen`, `make synth-check`, `make lint`, `make typecheck`, `make test` (vitest, and pytest for shared-types, api, worker, affidavit, forensics, blindgen, ocr): all passed |
| Secret scan of the cleaned history | gitleaks 8.30.1 (the same version as CI, from the project's GitHub release binary), full history, repository config: no leaks |
| Negative test | `verify.sh` run against an uncleaned mirror fails on every check it should (extra refs, emails, college name, removed paths, session trailers, blind wording). |
| `--push` mode | Tested against local bare repositories only: a wrong typed name aborts; an empty target receives `main` and 7 tags; the same history again is accepted as an up-to-date fast-forward; an unrelated non-empty target is refused. |
| shellcheck | `run.sh` and `verify.sh` clean (shellcheck 0.11.0) |

Cosmetic leftovers in the snapshot (by design): squash-merge subjects keep `(#N)` PR numbers that point at nothing in the new repository; commit messages keep internal codes (for example "B-28", "P-3"); some kept progress notes link to removed documents or to private-repository pull requests.

## B2. Nothing functional changed (PR7)

Baseline checks rerun on `chore/public-ready`:

| Check | origin/main baseline | This branch |
|---|---|---|
| lint, typecheck, synth-check, tokens check | pass | pass |
| real-data guard | pass (447 files) | pass (461 files: the new docs and scripts, 0 allow-list entries) |
| vitest shared-types / mock-portal / web | 31 / 2 / 23 | 31 / 2 / 23 |
| pytest shared-types python / worker / affidavit / forensics / blindgen | 38 / 4 / 63 / 114 / 4 | 38 / 4 / 63 / 114 / 4 |
| pytest ocr | 34 passed, 1 skipped | 34 passed, 1 skipped |
| pytest services/api | 117 passed, 3 skipped, 2 timing failures (expired test token on a loaded VM); 23 of 23 in the OCR-fallback file on rerun | 119 passed, 3 skipped, 0 failed |
| `make eval-blind-small` | exit 0 | exit 0 |

`git diff --stat origin/main...HEAD`: 19 files, only `README.md`, `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `docs/` (`README.md`, `DEV-SETUP.md` one line, three `progress/PUBLIC-READY-*`/`DECISIONS-PUBLIC-READY` files) and `scripts/public-snapshot/`. Nothing under `apps/`, `services/`, `packages/`, `infra/`, `.github/workflows/`, `data/`, `tests/`, or any lockfile or manifest. CI (including the Docker-based checks that cannot run in the cloud session) is checked on the pull request.

## C. For Hrishi, on the laptop

1. On GitHub merge this pull request, then on your laptop: `git checkout main && git pull`.
2. Create an EMPTY public repository on GitHub (no README, no licence, no .gitignore) named `satya-eoa-sih26261`, unless you pick another name. (Decide first: [VERIFY: college approval of the licence].)
3. Run `scripts/public-snapshot/run.sh`. It needs `git`, Python with `pip` (it installs `git-filter-repo`), `pnpm`, `uv` and `make` for the test step (add `--skip-tests` for a fast run). It builds `../satya-eoa-public-staging`, verifies it and prints a summary. Read the summary, the identities list (names only) and the verify output. Nothing is pushed.
4. Run `scripts/public-snapshot/run.sh --push https://github.com/<you>/satya-eoa-sih26261.git` and type the repository name when asked.
5. On the new repository: Settings > Security: turn on private vulnerability reporting, secret scanning and push protection; add a description and topics; then protect `main` (require the CI checks, no force pushes).
6. Open the Actions tab and wait for CI to turn green (the stack smoke job needs Docker and network on GitHub's runners and builds the OCR-less image). Then clone the new repository in a private browser window or a clean machine to confirm it opens without signing in.
7. When the demo video is public, add the link to the README of the public repository and to the deck config. No placeholder was added.
8. Keep the private repository as the working repository. To refresh the public one: merge to private `main`, `git pull`, rerun `run.sh --push` with the same URL. The rewrite is deterministic, so unchanged history keeps its hashes and the push is a fast-forward (the tool refuses a target whose `main` is not an ancestor).

Before step 3, if you want teammates credited with their real GitHub accounts, add lines to `scripts/public-snapshot/mailmap.txt` (see the comment block there). The history currently has only one human identity.

### FLAG-FOR-HRISHI

| Item | What and why |
|---|---|
| Licence approval | `[VERIFY: college approval of the licence]`. `LICENSE` is Apache-2.0; the college has not confirmed. |
| Demo credentials in committed files | `infra/keycloak/realm-satya.json` commits 8 synthetic usernames (`rb.southern.demo` and similar, `@example.invalid` emails). No password or secret is in it; passwords are generated per machine by `make secrets`. The usernames become public. Nothing to rotate. |
| `CLAUDE.md` | Developer instructions for the coding assistant; no personal data. It stays in the snapshot by default. To drop it, uncomment its line in `scripts/public-snapshot/paths-remove.txt`. |
| Demo docs | `docs/DEMO-NOTES.md`, `DEMO-SCRIPT.md`, `DEMO-CHECKLIST.md` are recording preparation. Kept because other docs link to them; optional removal lines are in `paths-remove.txt`. |
| Teammates' frontend-redesign docs | None are on `main`. The wording-consistency work lives only on the on-hold branch (`fix/ui-wording-consistency`), which the snapshot drops. If it is merged later, review its docs (`UI-WORDING-PROGRESS.md`, `DECISIONS-UI-WORDING.md`) before the next refresh. |
| Licence-field follow-up | The seven workspace Python packages have no licence field (shown as UNKNOWN in `THIRD_PARTY_NOTICES.md`). Optional: add `license = "Apache-2.0"` in each `pyproject.toml`. Not done here (manifests are out of scope). |
| Screenshots | The README uses one existing synthetic screenshot from an earlier build. Add current screenshots after the on-hold UI branch is merged. |
| Weak-copyleft and `[VERIFY]` items | LGPL-3.0 (`psycopg`, npm `sharp-libvips`) and MPL-2.0 (`pikepdf`, `certifi`, `pathspec`, dev tools) are used as unmodified libraries; OCR model-weight licences are `[VERIFY]` in `THIRD_PARTY_NOTICES.md`. A lawyer should skim it if the college asks. |
| Stale doc line | `docs/DEV-SETUP.md` says the stack limits total 5.6 GB; the compose limits now total just under 8 GiB. Left unchanged (the README states the checked figure). |
| Fork pull requests | The CI workflow uses no secrets and no self-hosted runners and has `permissions: contents: read`, so fork PRs run with a read-only token. Nothing to change. |
| Cosmetic | `(#N)` PR numbers in commit subjects, internal codes in commit messages, the private-repository fallback path in `infra/scripts/create-issues.sh`, and a private-repository PR link in `docs/progress/PROGRESS-SLICE-2.md`. |
| Open PR #11 | Untouched, not part of the snapshot. |
