# Blind evaluation and replay: progress

Branch `blind-eval-replay`. Order override: Part B first, then Part A. Resume from the first unchecked step.

## Part B: deterministic replay (P-11)
- [x] B1 rule pack, engine versions, flags, doc hashes, source answers recorded in the check.run ledger entry (BR-2) — ae6c55a
- [x] B2 replay service and endpoint `GET /v1/cases/{id}/replay`, rate limit, roles, caps — 932a52b
- [x] B3 tamper behaviour (HASH_MISMATCH for vault document and ledger link, never 500), logged as security events; tests — 7af9af7
- [x] B4 CLI `make replay CASE=<id> [RULE_VERSION=<id>]` — 8bd1fe4
- [x] B5 tests (16 in services/api/tests/test_replay.py: 8 seeded cases identical, older-pack diff, tamper, broken chain, old records, access control, rate limit); docs 10b0996; PR opened (see PR)

## Part A: independent blind test set (B-17) (pending)
- [x] A1 packages/blindgen generator (independent code; imports only the signing helper from the existing synth)
- [x] A2 coverage: AFF-DECL-MISSING/CHANGED/ADDED, AFF-HEADER, STAMP-DUTY/PARTY/CHRONO, NOTARY-EXPIRY, SIG-IMAGE/UNTRUSTED/MODIFIED/SIGNER, UDIN-STRUCT/MEMBER; >= 40% clean enforced. NOT covered: see DEFERRED.md
- [x] A3 sealed manifest (seeds 7301-7303, N=300): SHA-256 `78bea8b7ad8d5c6859633986ddd0e19d8a43d8871728912aad779c153f640e7c` recorded BEFORE any full evaluation run
- [x] A4 full run on the sealed set (hash checked with --expect-sha); docs/eval/BLIND-REPORT.md and blind-results.json committed. Headline: clean flagged 10/139; 3 misses; 117 false flags (clusters: LAND-ROW-RECON/ROOM-RECON 30 each, AFF-DECL-MISSING 31, STAMP-CHRONO 16, AFF-DECL-CHANGED 10), cause not diagnosed; no rule changed
- [x] A5 guard test (BR-9)
- [x] A6 CI step: pytest packages/blindgen + make eval-blind-small

## Next step
final: full suites green, update PR description, final message

## BLOCKED
none

## Notes
- Flaky, pre-existing: `test_verification_counts_against_the_user_quota` (fixed-window limiter) failed once when the 6-minute full run crossed a minute boundary; passes alone and on the base commit. Not changed.
