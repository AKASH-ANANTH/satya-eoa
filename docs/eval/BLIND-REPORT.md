# Blind test set report

**Synthetic data, generated for this repository by an independent generator. Not real AICTE data. The numbers below describe this synthetic set only.**

- Applications: 300 across seeds [7301, 7302, 7303]; clean (no planted anomaly): 139 (46%).
- Manifest SHA-256 (recorded before evaluation): `78bea8b7ad8d5c6859633986ddd0e19d8a43d8871728912aad779c153f640e7c`
- False-flag rate on clean applications: **10 of 139** clean applications wrongly flagged.
- Engine crashes: 0
- Document label accuracy: 553/600

## Per rule (presence of the rule on a document; counts are documents)

| rule | TP | FP | FN | precision | recall | F1 | recall 95% CI (Wilson) | recall range over seeds |
|---|---|---|---|---|---|---|---|---|
| AFF-DECL-ADDED | 5 | 0 | 1 | 1.000 | 0.833 | 0.909 | 0.44 to 0.97 | 0.50 to 1.00 |
| AFF-DECL-CHANGED | 23 | 10 | 2 | 0.697 | 0.920 | 0.793 | 0.75 to 0.98 | 0.80 to 1.00 |
| AFF-DECL-MISSING | 16 | 31 | 0 | 0.340 | 1.000 | 0.508 | 0.81 to 1.00 | 1.00 to 1.00 |
| AFF-HEADER | 18 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.82 to 1.00 | 1.00 to 1.00 |
| LAND-ROW-RECON | 0 | 30 | 0 | 0.000 | n/a | n/a | 0.00 to 1.00 | n/a |
| NOTARY-EXPIRY | 21 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.85 to 1.00 | 1.00 to 1.00 |
| ROOM-RECON | 0 | 30 | 0 | 0.000 | n/a | n/a | 0.00 to 1.00 | n/a |
| SIG-IMAGE | 16 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.81 to 1.00 | 1.00 to 1.00 |
| SIG-MODIFIED | 15 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.80 to 1.00 | 1.00 to 1.00 |
| SIG-SIGNER | 17 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.82 to 1.00 | 1.00 to 1.00 |
| SIG-UNTRUSTED | 21 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.85 to 1.00 | 1.00 to 1.00 |
| STAMP-CHRONO | 20 | 16 | 0 | 0.556 | 1.000 | 0.714 | 0.84 to 1.00 | 1.00 to 1.00 |
| STAMP-DUTY | 14 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.78 to 1.00 | 1.00 to 1.00 |
| STAMP-PARTY | 17 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.82 to 1.00 | 1.00 to 1.00 |
| UDIN-MEMBER | 16 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.81 to 1.00 | 1.00 to 1.00 |
| UDIN-STRUCT | 16 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0.81 to 1.00 | 1.00 to 1.00 |

## Field extraction accuracy

| field | correct | total | accuracy |
|---|---|---|---|
| notary.date | 300 | 300 | 1.000 |
| notary.valid_till | 294 | 300 | 0.980 |
| stamp.certificate_no | 300 | 300 | 1.000 |
| stamp.duty | 300 | 300 | 1.000 |
| udin | 300 | 300 | 1.000 |
| udin.membership_no | 300 | 300 | 1.000 |

## Misses (3)

- `b7302-0003` AFF-DECL-CHANGED: planted (stamp_duty, decl_changed); AFF-DECL-CHANGED did not fire on its document
- `b7303-0035` AFF-DECL-ADDED: planted (decl_added, sig_untrusted); AFF-DECL-ADDED did not fire on its document
- `b7303-0066` AFF-DECL-CHANGED: planted (decl_changed, sig_signer, stamp_party); AFF-DECL-CHANGED did not fire on its document

## False flags (117)

- `b7301-0012` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified, chrono
- `b7301-0012` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_modified, chrono
- `b7301-0014` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified, stamp_duty
- `b7301-0019` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7301-0021` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: udin_member, notary_expired
- `b7301-0021` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: udin_member, notary_expired
- `b7301-0021` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: udin_member, notary_expired
- `b7301-0026` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified, chrono, udin_struct
- `b7301-0028` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified
- `b7301-0028` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_modified
- `b7301-0035` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7301-0035` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7301-0035` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7301-0040` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7301-0040` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7301-0040` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7301-0045` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7301-0057` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: sig_signer
- `b7301-0057` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_signer
- `b7301-0057` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: sig_signer
- `b7301-0059` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: notary_expired, udin_member
- `b7301-0059` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: notary_expired, udin_member
- `b7301-0059` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: notary_expired, udin_member
- `b7301-0075` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified
- `b7301-0083` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: stamp_party, sig_image
- `b7301-0093` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7301-0094` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: stamp_party
- `b7301-0094` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: stamp_party
- `b7301-0094` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: stamp_party
- `b7302-0003` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: stamp_duty, decl_changed
- `b7302-0003` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: stamp_duty, decl_changed
- `b7302-0003` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: stamp_duty, decl_changed
- `b7302-0018` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7302-0018` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7302-0018` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7302-0023` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7302-0026` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: udin_struct, sig_image
- `b7302-0029` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image, decl_missing, udin_member
- `b7302-0034` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: notary_expired
- `b7302-0034` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: notary_expired
- `b7302-0034` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: notary_expired
- `b7302-0038` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: stamp_party
- `b7302-0038` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: stamp_party
- `b7302-0038` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: stamp_party
- `b7302-0042` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: notary_expired
- `b7302-0042` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: notary_expired
- `b7302-0042` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: notary_expired
- `b7302-0054` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7302-0054` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7302-0054` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7302-0058` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7302-0058` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7302-0058` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7302-0059` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7302-0060` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image, decl_missing, stamp_duty
- `b7302-0064` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: udin_member
- `b7302-0064` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: udin_member
- `b7302-0064` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: udin_member
- `b7302-0065` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7302-0066` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified
- `b7302-0070` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: sig_image
- `b7302-0070` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: sig_image
- `b7302-0070` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_image
- `b7302-0070` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7302-0081` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7302-0081` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: sig_image
- `b7302-0081` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: sig_image
- `b7302-0081` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_image
- `b7302-0089` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7302-0089` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7302-0089` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7302-0097` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified
- `b7302-0097` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_modified
- `b7303-0000` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7303-0002` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: chrono
- `b7303-0002` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: chrono
- `b7303-0002` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: chrono
- `b7303-0003` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified
- `b7303-0009` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7303-0009` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7303-0009` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7303-0018` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7303-0018` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7303-0018` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7303-0024` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: stamp_party
- `b7303-0024` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: stamp_party
- `b7303-0024` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: stamp_party
- `b7303-0035` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: decl_added, sig_untrusted
- `b7303-0035` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: decl_added, sig_untrusted
- `b7303-0035` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: decl_added, sig_untrusted
- `b7303-0036` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: sig_modified, decl_missing
- `b7303-0045` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: decl_missing, sig_image
- `b7303-0045` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: decl_missing, sig_image
- `b7303-0045` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: decl_missing, sig_image
- `b7303-0051` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7303-0054` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7303-0054` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7303-0054` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7303-0055` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; clean application
- `b7303-0055` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; clean application
- `b7303-0055` ROOM-RECON: ROOM-RECON fired but was not planted on this document; clean application
- `b7303-0060` AFF-DECL-CHANGED: AFF-DECL-CHANGED fired but was not planted on this document; application carries: stamp_duty, sig_modified
- `b7303-0062` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: sig_modified, chrono
- `b7303-0062` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: sig_modified, chrono
- `b7303-0062` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: sig_modified, chrono
- `b7303-0066` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: decl_changed, sig_signer, stamp_party
- `b7303-0066` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: decl_changed, sig_signer, stamp_party
- `b7303-0066` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: decl_changed, sig_signer, stamp_party
- `b7303-0080` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: decl_missing, udin_struct
- `b7303-0080` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: decl_missing, udin_struct
- `b7303-0084` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: stamp_party
- `b7303-0084` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: stamp_party
- `b7303-0084` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: stamp_party
- `b7303-0088` STAMP-CHRONO: STAMP-CHRONO fired but was not planted on this document; application carries: sig_image
- `b7303-0097` AFF-DECL-MISSING: AFF-DECL-MISSING fired but was not planted on this document; application carries: udin_member
- `b7303-0097` ROOM-RECON: ROOM-RECON fired but was not planted on this document; application carries: udin_member
- `b7303-0097` LAND-ROW-RECON: LAND-ROW-RECON fired but was not planted on this document; application carries: udin_member

## Clean applications wrongly flagged

- b7301-0035: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7301-0040: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7302-0018: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7302-0054: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7302-0058: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7302-0089: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7303-0009: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7303-0018: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7303-0054: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON
- b7303-0055: AFF-DECL-MISSING, LAND-ROW-RECON, ROOM-RECON

## Label differences

- b7301-0002 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7301-0015 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0023 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0030 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7301-0031 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0032 annex2.1(i) affidavit: engine expired, expected mismatch_detected
- b7301-0037 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0048 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0053 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7301-0060 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0063 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0067 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0068 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0069 annex2.1(i) affidavit: engine expired, expected mismatch_detected
- b7301-0080 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7301-0081 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7301-0089 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0001 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7302-0007 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0012 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7302-0015 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0029 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7302-0030 annex2.1(i) affidavit: engine expired, expected mismatch_detected
- b7302-0040 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0048 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0069 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7302-0082 annex2.1(i) affidavit: engine expired, expected mismatch_detected
- b7302-0083 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7302-0090 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0025 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0026 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0027 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7303-0034 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0035 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7303-0038 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7303-0039 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0045 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7303-0063 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0065 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0069 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0071 annex2.1(i) affidavit: engine expired, expected mismatch_detected
- b7303-0072 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0076 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0080 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0085 annex2.1(i) affidavit: engine manual_review_required, expected mismatch_detected
- b7303-0092 annex2.1(i) affidavit: engine verified, expected mismatch_detected
- b7303-0093 annex2.1(i) affidavit: engine expired, expected mismatch_detected

## Engine crashes

- none

## What this set does not cover

Land and room reconciliation, stamp reuse, UDIN reuse, revoked and expired certificates, the source-hub verification states and the scan fallback reason codes are not planted by this generator. Rule logic was not changed after seeing these results.
