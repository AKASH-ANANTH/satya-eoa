# Public-ready progress

Branch `chore/public-ready` (from `origin/main` at `dfb2000`). Resume: continue from the first step not DONE.

| Step | Status | Commit | Notes |
|---|---|---|---|
| PR0 Orient and baseline | DONE | 1st commit (this file) | Baseline below. |
| PR1 Inventory and scans | DONE | d988c6a | Report section A. |
| PR2 Licence and notices | DONE | d988c6a | Apache-2.0 `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md` (109 Python, 443 npm). Weak copyleft listed. |
| PR3 README and docs index | DONE | 14927aa | README, `docs/README.md`; clone URL in `docs/DEV-SETUP.md` made neutral. Paths and make targets script-checked. |
| PR4 Community files | DONE | 14927aa | `SECURITY.md`, `CONTRIBUTING.md`, PR template. |
| PR5 Snapshot tooling | DONE | 5cb2d32, e69ea2a, 2a3a1a9 | `scripts/public-snapshot/`. shellcheck clean. |
| PR6 Dry run in the cloud | DONE | 2a3a1a9 | Full run incl. lint, types, tests, gitleaks passed. Report section B. |
| PR7 Prove nothing functional changed | DONE | b1cad64 | Baseline rerun equals baseline; diff only allowed paths. Report B2 and C. |
| PR8 Pull request and handoff | TODO | | |

## Baseline (origin/main `dfb2000`, cloud VM, no Docker)

| Check | Result |
|---|---|
| `make lint` (eslint, ruff check, ruff format --check) | pass |
| `make typecheck` (tsc, mypy) | pass |
| `make synth-check` | pass |
| `make guard` (real-data guard) | pass, 447 tracked files, 0 allow-list entries |
| `node apps/web/scripts/gen-tokens.mjs --check` | pass |
| vitest: shared-types / mock-portal / web | 31 / 2 / 23 passed |
| pytest `packages/shared-types/python` | 38 passed |
| pytest `services/api` | 122 collected: 117 passed, 3 skipped, 2 failed in the first full run (two OCR-fallback tests got HTTP 401 because the test token had expired while the suite took 7 minutes on a loaded VM). Rerun of `test_ocr_fallback.py` alone: 23 passed. Treated as a timing flake of the VM, not a defect. |
| pytest `services/worker` | 4 passed, 1 deselected |
| pytest `packages/affidavit` | 63 passed |
| pytest `packages/forensics` | 114 passed |
| pytest `packages/blindgen` | 4 passed |
| pytest `packages/ocr` | 34 passed, 1 skipped (real-engine test) |
| `make eval-blind-small` | exit 0 |
| Not runnable here | `make e2e`, `make demo-reset`, `make smoke`, `make test-db`, compose checks (no Docker daemon); these run in CI |

Note: `make test` stops at the first failing suite, so the suites after `services/api` were run one by one.

## Blockers
None.

## Open questions
- Which public repository name (default `satya-eoa-sih26261`)? Hrishi decides in report section C.
