# Pre-public check (read-only; repository visibility not changed)
Run 26 Oct 2026 over all refs (36 commits scanned by gitleaks, 37 revisions walked by grep).

| Check | Result |
|---|---|
| gitleaks v8.30.1, repo config `.gitleaks.toml`, full history (`--all`) | no leaks found |
| gitleaks, default rules, full history | no leaks found |
| Real-data guard (`infra/scripts/real-data-guard.sh`), working tree | OK, 320 tracked files, 0 allow-list entries |
| Phone / PAN / Aadhaar patterns, every revision in history | 0 hits |
| `data/real-samples/`, `.env`, private keys in history | none tracked; only public test certs (`data/synthetic/pki/*.pem`, `infra/certs/no-extra-ca.pem`) and synthetic PDFs |
| Emails in files | only `*.demo@example.invalid` synthetic accounts |
| AICTE logos, emblem, AICTE/gov.in URLs | none (only text saying none are used) |
| Real institution names in code, data, docs | none found (institution/university hits are generic template wording) |
| Secrets in history | none |

## Findings to decide before going public
1. **Commit author metadata**: 8 commits are authored as `HRISHI RMKEC <25ev022@rmkec.ac.in>`. This is a personal name plus a real college email, visible in `git log`. Guard rails 4 and 5 cover repo content, not commit metadata, but the team should decide whether that is acceptable. Rewriting history would be needed to remove it (not done here).
2. **Owner handle** `GM-Hrishi` appears in DEV-SETUP, PROGRESS-SLICE-2 and `create-issues.sh` (repository URL). Expected for a public repo; flagged for awareness.
3. **No LICENSE file** (open question from slice 0). Without one, public code is all-rights-reserved by default.
4. Real sample PDFs: guard confirms none are tracked, but this cannot prove that none ever existed outside git.

**Safe to make public: no** (blocked only by finding 1 and 3 needing a team decision; no secrets or personal data inside repository files were found). If the team accepts the author metadata and adds a licence, the answer becomes yes.
