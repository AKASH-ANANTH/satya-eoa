# Demo script: one Tamil Nadu self-disclosure EoA case (5–7 minutes)
Version 1.1 (slice 2, 26 Oct 2026: M6 / P-4, P-18 built; v1.0 slice 1). Synthetic data only; mock approval portal; advisory only.
Specs: design v2.2.1 (A1, B1, C2, C3, C4a), Portal spec v0.2.1 (§1 stage ②, §2.5, §2.6, §2.8, §2.9, §8.2), UI spec v0.7.1 (§2, §4, §6, §7). Promises: `docs/specs/00-BUILD-CONTEXT.md` (P-1…P-19).

## 1. The story in one line
A Tamil Nadu institution files its 2026-27 Extension of Approval on self-disclosure. No committee will look at it before the EoA letter (Table 2.3; APH 2.5). SATYA gives the Regulation Bureau the first-pass scrutiny it never had: the sworn affidavit is diffed against the portal's own draft, its signatures and stamp are checked, last year is compared, and an official records every decision.

**Say once, at the start:** "Everything you see is synthetic. The portal is our own mock, not the AICTE portal. SATYA advises; officials decide; there is no approve or reject button anywhere."

## 2. The case
| Item | Value (synthetic) |
|---|---|
| Institution | Demo Institute of Technology 03, Demo Town 03, Demo District 07, Tamil Nadu |
| Trust | Demo Educational Trust 03 |
| Application ID · Permanent ID · AY | `1-90000004217` · `1-9000317` · 2026-27 |
| Regional office · route · stage | Southern · `self_disclosure` (Table 2.3) · ② |
| Category set | EoA Only |
| SATYA case ID | `cas_01JD3M5A00000000000000DT03` |
| Contrast case (clean control, LOW band) | Demo College of Engineering 05, `1-90000005105`, `cas_01JD3M5A00000000000000CE05` |
| Demo users (Keycloak, passwords from `.env`) | `institution.demo03` (INS, mock portal only), `rb.southern.demo` (RB, Southern), `au.demo` (AU) |

**Planted findings (what the audience should see):**
| # | Finding | Rule (APH clause) | Module | Screen |
|---|---|---|---|---|
| F1 | Category line "1. EoA Only" missing from the opening block of the sworn copy | `AFF-CAT-LINE` (Affidavit-2 NOTE) | M5 | RB-05 |
| F2 | Declaration 9 narrowed: "contiguous and undisputed" became "contiguous" | `AFF-DECL-CHANGED` (Affidavit-2 NOTE; 7.4(a)) | M5 | RB-05 |
| F3 | Land deed 2 sworn as 3.50 acres; computed total 11.50 vs Application Report 12.50 | `LAND-AREA-RECON` (Annex-3 3.1g [VERIFY]) | M5 | RB-05 |
| F4 | Room ID `I-201` used in both the Instructional and the Instructional–Common Facilities tables | `ROOM-ID-DUP` (Affidavit-2 NOTE [VERIFY]) | M5 | RB-05 |
| F5 | "Digitally signed" mark on the notarised last page (page 4 of the synthetic copy) is printed text with no /ByteRange, dated two days after notarisation | `SIG-IMAGE` → `SIG_IMAGE_ONLY` (2.3.4a); `STAMP-CHRONO` `chronology:mark_after_notary` (2.3.4b) | M6 | RB-05, RB-06 |
| F6 | Uploader DSC present on the compiled file, chains to the TEST TRUST ANCHOR, signer role Chairman | `SIG_VALID` uploader check (2.3.4a); never makes the document verified | M6 | RB-05, RB-06 |
| F7 | Land 12.50 acres in 2025-26, 11.50 sworn in 2026-27 with no change-of-site or merger application | YoY land (Annex-3 3.1g; Table 2.3) → `discrepancy` | M13 | RB-07 |
| F8 | ECE intake 60 → 90 matched by the approved 2025-26 increase in the previous EoA letter | YoY intake (2.25) → `explained` | M13 | RB-07 |
| F9 | TN fire licence `9017/RFL/NMSB/2026` and TN Form D `93/2025` found at the source | `SRC_MATCH`, MOCK SOURCE (#22) | M7 | RB-06 |
| F10 | Audited accounts: no UDIN printed, no ICAI channel | `source_lookup` `SRC_NO_IDENTIFIER` → `source_unavailable` → manual task RB-09 (P-18; full adapter M7) | M6 now, M7 | RB-06, RB-09 |

## 3. Run of show (target 6 min 30 s; hard stop 7 min)
| Step | Time | Screen(s) | What the presenter does and says | Proves |
|---|---|---|---|---|
| 0 | 0:00–0:20 | Workbench Overview; mock portal banner | Point at the Simulated source tag (hover it) and at "Approval Portal (Mock, for demo)" in the portal. One-line story (§1). | Guard rails 1–3 |
| 1 | 0:20–1:20 | **MP-01** login → **MP-02** application form → **MP-03** uploads → **MP-04** Deficiency Report | Sign in as `institution.demo03`. Show the locked-data warning (2.3.3c). Show the Deficiency Report tagged PORTAL: "the portal computes these norms; SATYA never recomputes them" (D2). Upload status shows the 7 Annexure-2.1 slots. Click **Final submit**. The mock portal fires a signed `application.submitted` (HMAC, `X-SATYA-Signature`) and shows the 202 receipt. | **P-17** (mock portal, proposed hooks), **P-19** (M2 fetch + SHA-256 check on ingest), P-1 (route chosen: self-disclosure) |
| 2 | 1:20–2:00 | **MP-06** official side → "Open in SATYA" → **SH-01** SSO hand-off → **RB-02** validation queue | Switch to the official view, click "Open in SATYA" (only the opaque case ID travels in the URL, §8.3). Keycloak sign-in as `rb.southern.demo`. Queue grouped by band: DIT 03 is **HIGH** with its top 3 reasons; DCE 05 is **LOW**. "The band orders review only; it is not a finding and the institution never sees it." | **P-12** (dashboard), **P-14** (band, Phase 1), P-1 |
| 3 | 2:00–3:30 | **RB-05 Affidavit DiffView** (`/case/cas_…DT03/affidavit`) | Header cards: expected = the portal's draft for **this AID and AY** (template `aff2-portal-2024-27`), sworn copy = page count, text layer (no OCR yet), SHA-256. Structure check: **CATEGORY LINE MISSING** (F1), core 19/19, existing institute 5/5. Clause diff (changed only): declaration 9, "and undisputed" struck in red (F2). Normalisation note: whitespace, re-joined hyphens and resolved strike-through options are not differences. Land table: deed 2 cell 3.50 vs 4.50 in the heavy mismatch style, computed total 11.50 vs 12.50 (F3). Room tables: duplicate `I-201` (F4). Each FlagCard shows rule, APH clause, confidence and "Preliminary indicator. Needs human verification." | **P-3** (normalised 24-declaration diff + reconciliation), P-2 (template chosen from the document's own text) |
| 4 | 3:30–4:20 | RB-05 header badges + "Stamp and signing order" → tab **Verification** (RB-06, `/case/cas_…DT03/verification`) | RB-05 header: issuer badge **IMAGE ONLY, NOT A REAL SIGNATURE**, uploader badge **UPLOADER SIGNATURE PRESENT · Chain to TEST TRUST ANCHOR ok · signer role Chairman**. Stamp: e-Stamp certificate (number masked), Second Party AICTE NEW DELHI, Rs 100. Signing order table: application 11-20 → stamp 11-21 → notarised 11-22 → deponent signature 11-24 (printed mark, image only) → upload 11-24: **IN ORDER**, but **PRINTED MARK DATED AFTER NOTARISATION** (F5); notary seal VALID ON THE NOTARISATION DATE. Click the Verification tab: label counts (1 MANUAL REVIEW REQUIRED, 1 SOURCE UNAVAILABLE), one row per document with both badges; affidavit MANUAL REVIEW REQUIRED although the uploader DSC is valid (F6); audited statement NOT DIGITAL (WET SEAL) issuer, "ICAI UDIN: no automated channel", SOURCE UNAVAILABLE (F10). Point at the mapping legend: "A valid uploader DSC never makes a document verified." Fire licence and Form D with MOCK SOURCE (F9) join with M7. Contrast: DCE 05 shows ISSUER SIGNATURE VERIFIED and VERIFIED. | **P-4** (DSC vs image, chain, chronology, notary expiry), **P-5** (6 labels, mock adapters), P-6 (Annexure-14 issuer on the fire licence) |
| 5 | 4:20–5:00 | **RB-07 YoYView** | Land 12.50 → 11.50 with no matching application: **DISCREPANCY**, links to both years' documents (F7). ECE intake 60 → 90: **EXPLAINED** by the approved 2025-26 increase (F8). "A change is cleared only if an approved application explains it." | **P-8** |
| 6 | 5:00–5:50 | **DecisionBar** on RB-05 / RB-03 flags → **RB-09** manual tasks → **MP-05** section C | F3: **ACCEPT · record as an official observation**, reason typed (≥10 characters). F1: **ESCALATE → ask institution to clarify**; switch to MP-05 section C and show the request with only the evidence the official chose to share. F5: **ESCALATE → send for manual verification**; it appears in RB-09. "No action changes regulatory status. The decision is taken in the portal." | **P-10** (evidence-linked flags + 5 dispositions), P-17 (`observation.recorded`, `clarification.requested` echoed to the mock portal) |
| 7 | 5:50–6:30 | **AU-01** audit trail → **AU-02** chain integrity → **AU-03** case replay | Sign in as `au.demo`. Timeline: inbound event hash, run, flags, the three dispositions with reasons, outbound advisory events (`advisory: true`, `regulatory_effect: "none"`). AU-02: chain valid. AU-03: replaying the same inputs returns the same `run_id`. Close on the guard rails. | **P-11** (hash-chained trail + replay) |

Buffer: 30 s for questions inside the 7-minute slot. If time runs short, cut step 4's RB-06 visit (keep the DiffView stamp panel) and step 7's replay.

## 4. Screens used (all P1, UI spec §2.8)
| Screen | Route / app | Built in | Status on 26 Oct 2026 |
|---|---|---|---|
| MP-01, MP-02, MP-03, MP-04, MP-05, MP-06 | `apps/mock-portal` | Mock portal slice (P-17) | Slice 0 has the banner and signed test event only |
| SH-01 SSO hand-off | `/` | Slice 0 | Built (Keycloak code + PKCE) |
| RB-02 Validation queue | `/rb-queue` | M11 (P-10, P-12) | Slice 1 lists the demo cases with a link to RB-05; band grouping arrives with M11 |
| **RB-05 Affidavit DiffView** | `/case/[id]/affidavit` | **Slice 1 (M5, P-3) + slice 2 (M6, P-4)** | **Built**: structure check, clause diff, tables, flag rail (M5 + M6 findings), issuer/uploader SignatureBadges, stamp and signing order, notary seal; case tabs |
| **RB-06 Verification panel** | `/case/[id]/verification` | **Slice 2 (M6, P-4, P-18)**; M7 (P-5) adds source adapters | **Built** for signatures, stamp, notary, UDIN: label counts, one row per document, both badges, source + mode marker, checks and findings per document, mapping legend. Source lookups (SHCIL, TN Form D, fire) and the action buttons arrive with M7 / M11 |
| RB-07 YoYView | `/case/[id]/yoy` | M13 (P-8) | Planned (slice 4) |
| RB-09 Manual tasks | `/rb-queue/manual` | M11 | Planned |
| DecisionBar (on RB-05, RB-07) | component | M11 (P-10) | Planned; RB-05 shows "no disposition recorded yet" |
| AU-01, AU-02, AU-03 | `/audit…` | M12 (P-11) | Ledger + `make ledger-verify` exist since slice 0; screens planned |

## 5. Synthetic data needed
| Data | Used in step | Source in repo | Status |
|---|---|---|---|
| 2026-27 `ApplicationSnapshot` for DIT 03 and DCE 05 (basic, trust, courses, land + 2 deeds, buildings, 4 room blocks, declaration category list) | 1, 3, 5 | `data/synthetic/cases/<case>/snapshot.json` | Slice 1 |
| Portal affidavit draft metadata (`template_id`, `ay`, `category_set`) | 3 | `data/synthetic/cases/<case>/case.json` | Slice 1 |
| Sworn affidavit PDFs (text layer): DIT 03 with F1–F4 planted, DCE 05 clean | 3 | `data/synthetic/cases/<case>/affidavit-sworn.pdf` (generated by `make synth`) | Slice 1 |
| Synthetic e-stamp page (`IN-TN` + 14 digits + letter, demo range), notary block with reg. no. and expiry, all marked SYNTHETIC | 3, 4 | same PDF, page 1 and last page | Slice 1 (text only; checked by M6) |
| Uploader DSC on the compiled file (TEST TRUST ANCHOR), the image-only mark on the notarised last page, e-stamp page and notary block | 4 | `data/synthetic/cases/<case>/affidavit-sworn.pdf` (signed), `data/synthetic/pki/` (public test PKI), `truth-m6.json` | **Slice 2** (built) |
| Audited statement: DIT 03 without UDIN (F10), DCE 05 with a valid UDIN | 4 | `data/synthetic/cases/<case>/audited-accounts.pdf`, `data/synthetic/registry/prior-filings.json` | **Slice 2** (built) |
| Fire licence `9017/RFL/NMSB/2026`, Form D `93/2025` and their mock adapter records | 4 | M7 fixtures | Slice 5 |
| Audited statement without UDIN | 4 | M7 fixtures | Slice 5 |
| 2025-26 snapshot + 2025-26 EoA letter (approved ECE increase, deficiency block "Six Months") | 5 | M13 fixtures | Slice 4 |
| Deficiency Report result (portal, overall "No") | 1 | snapshot `deficiency_report` | Slice 1 (imported, never recomputed) |
| Keycloak demo users | 1, 2, 7 | `infra/keycloak/realm-satya.json` (+ `.env`) | `institution.demo03`, `au.demo` to be added with the portal / M12 slices |

No real institution, person, application ID, document or logo appears anywhere (guard rails 3–5). Coordinates point into the Bay of Bengal.

## 6. Promise coverage
| Promise | Shown in step |
|---|---|
| P-1 category router | 1, 2 (route + stage in the case header) |
| P-2 template-aware extraction | 3 |
| **P-3 affidavit diff + reconciliation** | **3** |
| P-4 signatures, stamp chronology, notary expiry | 4 |
| P-5 six labels, mock sources | 4 |
| P-6 Annexure-14 issuer checks | 4 (fire licence) |
| P-8 year-over-year | 5 |
| P-10 evidence-linked flags + dispositions | 3, 6 |
| P-11 audit trail + replay | 7 |
| P-12 dashboard + alerts | 2 (alert count in the rail) |
| P-14 risk band | 2 |
| P-17 mock portal + hooks + SSO | 1, 2, 6 |
| P-19 vault + hash check | 1 |
| P-18 UDIN structure | 4 (F10: no UDIN → SOURCE UNAVAILABLE); structure, membership and reuse checks on Q&A backup (`make eval-m6`) |
| Not shown (Phase 1, time): P-7 date rules, P-9 identity graph, P-13 coordinates | Q&A backup slides |

## 7. Before the demo
1. `make secrets && make up`, `make trust-ca` (import the CA once), `make synth` (regenerates the synthetic PDFs; output must match the commit).
2. Sign in once as each demo user to warm Keycloak; clear the browser session afterwards.
3. `make ledger-verify` returns `{"ok": true}`.
4. Browser at 100 % zoom, 1440 × 900, English. Hindi switch shown only if asked.
5. Backup: a screen recording of the same run made on the same build, labelled "synthetic data, mock portal".

## 8. What not to say
- Never "integrated with AICTE", "verified by AICTE" or "approved". Say "mock portal", "advisory finding", "official decision".
- Never call a flag proof of forgery. Say "preliminary indicator, needs human verification".
- Never claim the Deficiency Report norms, the within-portal faculty duplicate flag or PAN validation as SATYA's (D2).
