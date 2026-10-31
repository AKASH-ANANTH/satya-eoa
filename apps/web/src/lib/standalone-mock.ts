// Standalone mock data provider for SATYA-EoA workbench.
// Allows running Next.js without Docker, Keycloak, or FastAPI microservices.
// Uses the committed synthetic demo cases in data/synthetic/cases/.
import fs from "node:fs";
import path from "node:path";
import type { AffidavitDiff, CaseVerification, VerificationLabel } from "@satya/shared-types";
import type { AlertItem, Audit, Band, Overview, QueueRow, Review, ReviewDocument, ReviewFlag, SortDir, SortKey, Status } from "./demo-types";
import type { QueueResponse } from "./demo";

const WHY: Record<string, string> = {
  "AFF-CAT-LINE": "The numbered category line of the portal draft is missing from the sworn copy.",
  "AFF-DECL-MISSING": "A declaration in the portal draft does not appear in the sworn copy.",
  "AFF-DECL-CHANGED": "A declaration in the sworn copy has different wording from the portal draft.",
  "AFF-DECL-ADDED": "The sworn copy has a declaration that the portal draft does not have.",
  "AFF-HEADER": "The header of the sworn copy differs from the portal draft.",
  "LAND-AREA-RECON": "The sworn land area differs from the application report.",
  "LAND-ROW-RECON": "A land row in the sworn copy differs from the application report.",
  "ROOM-RECON": "A room value in the sworn copy differs from the application report.",
  "ROOM-ID-DUP": "A room ID appears in more than one room table.",
  "SIG-IMAGE": "The 'digitally signed' mark is printed text or an image, not a real signature.",
  "STAMP-CHRONO": "The dates of stamp, notarisation or signing are not in the expected order.",
  "UDIN-STRUCT": "The UDIN does not have the expected structure or year.",
};

const DISPOSITION_STORE = new Map<string, { action: string; reason: string; at: string; ledger_no: number }>();
let LEDGER_SEQ = 100;

function getCasesDir(): string {
  const candidate1 = path.resolve(process.cwd(), "../../data/synthetic/cases");
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(process.cwd(), "data/synthetic/cases");
  if (fs.existsSync(candidate2)) return candidate2;
  return candidate1;
}

export interface CaseDiskData {
  dir: string;
  caseJson: any;
  truthJson: any;
  truthM6Json: any;
}

const DEFAULT_FALLBACK_CASE: CaseDiskData = {
  dir: "",
  caseJson: {
    case_id: "cas_01JD3M5A00000000000000CE05",
    application_id: "1-90000005105",
    permanent_id: "1-9000305",
    ay: "2026-27",
    regional_office: "Southern",
    institution_name: "Demo College of Engineering 05",
    route: "self_disclosure",
    stage: "2",
    category_set: ["EoA Only"],
    documents: [
      { doc_id: "doc_4614YH6SZR73CNM7JW3FRJZ9DP", title: "Affidavit 2 (sworn copy)", slot: "annex2.1(i) affidavit", sha256: "ca79c52661a13baa8a344d797190231fb124c50f8d31f0d0175a07d83ff047c7" },
      { doc_id: "doc_QVTBGQ49NA3RVJB2KZMWH66SV7", title: "Audited statement of accounts FY 2025-26", slot: "annex2.1(vii) audited accounts", sha256: "e4ad01d524e4cc4cc7e39e1d5f809db1e67c10ed00d3df9063501130b21b8b07" },
    ],
  },
  truthJson: { expected_flags: [], printed: { declarations: [] } },
  truthM6Json: { expected_flags: [], expected_document_labels: {} },
};

function loadAllCases(): CaseDiskData[] {
  const dir = getCasesDir();
  if (!fs.existsSync(dir)) return [DEFAULT_FALLBACK_CASE];
  const entries = fs.readdirSync(dir);
  const cases: CaseDiskData[] = [];
  for (const e of entries) {
    const p = path.join(dir, e);
    const caseFile = path.join(p, "case.json");
    if (fs.existsSync(caseFile)) {
      try {
        const caseJson = JSON.parse(fs.readFileSync(caseFile, "utf-8"));
        const truthJson = fs.existsSync(path.join(p, "truth.json")) ? JSON.parse(fs.readFileSync(path.join(p, "truth.json"), "utf-8")) : {};
        const truthM6Json = fs.existsSync(path.join(p, "truth-m6.json")) ? JSON.parse(fs.readFileSync(path.join(p, "truth-m6.json"), "utf-8")) : {};
        cases.push({ dir: p, caseJson, truthJson, truthM6Json });
      } catch {
        // ignore parse error
      }
    }
  }
  return cases.length > 0 ? cases : [DEFAULT_FALLBACK_CASE];
}

function getCaseDiskData(caseId: string): CaseDiskData {
  const all = loadAllCases();
  return all.find((c) => c.caseJson.case_id === caseId) ?? all[0] ?? DEFAULT_FALLBACK_CASE;
}

function buildFlags(c: CaseDiskData): ReviewFlag[] {
  const flags: ReviewFlag[] = [];
  const caseId = c.caseJson.case_id;
  const t = c.truthJson;
  const tm6 = c.truthM6Json;
  const docs = c.caseJson.documents || [];
  const affDoc = docs[0] || { doc_id: "doc_default", title: "Affidavit" };

  if (Array.isArray(t.expected_flags)) {
    for (let i = 0; i < t.expected_flags.length; i++) {
      const f = t.expected_flags[i];
      const flagId = `flg_01JD3M5A${caseId.slice(-4)}${String(i).padStart(4, "0")}00000000`;
      const disp = DISPOSITION_STORE.get(flagId) ?? null;
      flags.push({
        flag_id: flagId,
        rule_id: f.rule_id,
        rule_version: "0.1.0",
        rule_text_key: f.rule_id,
        aph_clause: f.aph_clause ?? "2.3.4",
        aph_edition: "2024-27",
        confidence: f.confidence ?? 0.95,
        confidence_band: "high",
        severity: f.severity ?? "warning",
        label: f.label ?? "mismatch_detected",
        doc_id: affDoc.doc_id,
        doc_title: affDoc.title,
        page: f.page ?? 1,
        regions: [{ x: 0.1, y: 0.2 + i * 0.1, w: 0.8, h: 0.08 }],
        extracted_value: f.extracted_value != null ? String(f.extracted_value) : null,
        expected_value: f.expected_value != null ? String(f.expected_value) : null,
        value_unit: f.value_unit ?? null,
        extracted_source: { doc_label: affDoc.title, page: f.page ?? 1 },
        expected_source: { label: "Portal Application Draft" },
        provenance: "satya",
        preliminary_indicator: true,
        stage: "2",
        institution_visible: true,
        evidence_sha256: "0".repeat(64),
        check_ref: f.check_ref ?? `m5:${f.rule_id}`,
        why: WHY[f.rule_id] ?? f.extracted_value ?? "Discrepancy detected with portal declaration.",
        disposition: disp
          ? { action: disp.action as any, reason: disp.reason, by_role: "RB", by_user_ref: "usr_rb_demo", at: disp.at, ledger_no: disp.ledger_no }
          : null,
      });
    }
  }

  if (Array.isArray(tm6.expected_flags)) {
    for (let i = 0; i < tm6.expected_flags.length; i++) {
      const f = tm6.expected_flags[i];
      const flagId = `flg_01JD3M5A${caseId.slice(-4)}SIG${String(i).padStart(2, "0")}00000000`;
      const disp = DISPOSITION_STORE.get(flagId) ?? null;
      flags.push({
        flag_id: flagId,
        rule_id: f.rule_id,
        rule_version: "0.1.0",
        rule_text_key: f.rule_id,
        aph_clause: "2.3.4b",
        aph_edition: "2024-27",
        confidence: 0.98,
        confidence_band: "high",
        severity: "critical",
        label: f.label ?? "manual_review_required",
        doc_id: f.doc_id ?? affDoc.doc_id,
        doc_title: affDoc.title,
        page: 1,
        regions: [{ x: 0.15, y: 0.6, w: 0.7, h: 0.12 }],
        extracted_value: f.extracted_value ?? null,
        expected_value: null,
        value_unit: null,
        extracted_source: { doc_label: affDoc.title, page: 1 },
        expected_source: { label: "Approval Process Handbook" },
        provenance: "satya",
        preliminary_indicator: true,
        stage: "2",
        institution_visible: true,
        evidence_sha256: "0".repeat(64),
        check_ref: f.check_ref ?? `m6:${f.rule_id}`,
        why: WHY[f.rule_id] ?? "Signature or stamp anomaly detected.",
        disposition: disp
          ? { action: disp.action as any, reason: disp.reason, by_role: "RB", by_user_ref: "usr_rb_demo", at: disp.at, ledger_no: disp.ledger_no }
          : null,
      });
    }
  }

  return flags;
}

export function getMockOverview(ay = "2026-27"): Overview {
  const cases = loadAllCases();
  const byBand: Record<Band, number> = { high: 0, medium: 0, low: 0 };
  const byStatus: Record<Status, number> = {
    not_started: 0,
    in_review: 0,
    waiting_on_institution: 0,
    referred: 0,
    all_flags_decided: 0,
  };
  const byLabel: Record<VerificationLabel, number> = {
    verified: 0,
    mismatch_detected: 0,
    expired: 0,
    manual_review_required: 0,
    source_unavailable: 0,
    verification_pending: 0,
  };

  for (const c of cases) {
    const flags = buildFlags(c);
    let band: Band = "low";
    if (flags.some((f) => f.severity === "critical" || f.label === "mismatch_detected")) {
      band = "high";
    } else if (flags.some((f) => f.severity === "warning" || f.label === "manual_review_required")) {
      band = "medium";
    }
    byBand[band]++;
    byStatus["in_review"]++;

    const docLabels = c.truthM6Json?.expected_document_labels || {};
    for (const d of c.caseJson.documents || []) {
      const l: VerificationLabel = docLabels[d.doc_id] || (flags.length > 0 ? "manual_review_required" : "verified");
      byLabel[l] = (byLabel[l] || 0) + 1;
    }
  }

  return {
    as_of: new Date().toISOString(),
    ay,
    region: "southern",
    route: "self_disclosure",
    cases: { submitted: cases.length || 8, by_band: byBand },
    status: byStatus,
    documents: { total: (cases.length || 8) * 2, by_label: byLabel },
    manual_tasks: {
      open: 2,
      oldest_age_days: 3,
      top: [
        { case_id: "cas_01JD3M5A00000000000000DT03", application_id: "1-90000004217", reason_key: "printed_signature", age_days: 3 },
      ],
    },
    expiring: {
      d30: 1,
      d60: 2,
      d90: 1,
      top: [
        { doc_type: "fire_licence", doc_title: "Fire Safety Certificate", case_id: "cas_01JD3M5A00000000000000DT03", application_id: "1-90000004217", valid_to: "2026-11-30", days_left: 20 },
      ],
    },
    recent_decisions: Array.from(DISPOSITION_STORE.entries()).map(([k, v]) => ({
      at: v.at,
      case_id: "cas_01JD3M5A00000000000000DT03",
      application_id: "1-90000004217",
      flag_id: k,
      action: v.action as any,
      by_role: "RB",
      ledger_no: v.ledger_no,
    })),
    sources: [
      { adapter_id: "src_estamp", name_key: "estamp", mode: "mock", status: "answering" },
      { adapter_id: "src_udin", name_key: "udin", mode: "mock", status: "answering" },
      { adapter_id: "src_cca_pki", name_key: "cca", mode: "offline", status: "answering" },
      { adapter_id: "src_tn_building", name_key: "tn_building", mode: "mock", status: "answering" },
    ],
  };
}

export function getMockQueue(sort?: { key: SortKey; dir: SortDir }): QueueResponse {
  const cases = loadAllCases();
  const items: QueueRow[] = [];
  const byBand: Record<Band, number> = { high: 0, medium: 0, low: 0 };

  for (const c of cases) {
    const flags = buildFlags(c);
    let band: Band = "low";
    if (flags.some((f) => f.severity === "critical" || f.label === "mismatch_detected")) {
      band = "high";
    } else if (flags.some((f) => f.severity === "warning" || f.label === "manual_review_required")) {
      band = "medium";
    }
    byBand[band]++;

    const topReasons = flags.slice(0, 3).map((f) => ({
      flag_id: f.flag_id,
      rule_id: f.rule_id,
      aph_clause: f.aph_clause,
      short_text: f.why,
    }));

    const docLabels = c.truthM6Json?.expected_document_labels || {};
    const labelCounts: Record<VerificationLabel, number> = {
      verified: 0,
      mismatch_detected: 0,
      expired: 0,
      manual_review_required: 0,
      source_unavailable: 0,
      verification_pending: 0,
    };
    for (const d of c.caseJson.documents || []) {
      const l: VerificationLabel = docLabels[d.doc_id] || (flags.length > 0 ? "manual_review_required" : "verified");
      labelCounts[l] = (labelCounts[l] || 0) + 1;
    }

    const undisposed = flags.filter((f) => !f.disposition).length;

    items.push({
      case_id: c.caseJson.case_id,
      application_id: c.caseJson.application_id,
      region: c.caseJson.regional_office || "Southern",
      ay: c.caseJson.ay || "2026-27",
      route: c.caseJson.route || "self_disclosure",
      stage: c.caseJson.stage || "2",
      institution_name: c.caseJson.institution_name,
      open_flags: flags.length,
      undisposed_flags: undisposed,
      risk_band: band,
      top_reasons: topReasons,
      label_counts: labelCounts,
      status: undisposed === 0 && flags.length > 0 ? "all_flags_decided" : "in_review",
      manual_tasks: band === "high" ? 1 : 0,
      submitted_at: "2026-11-19T16:40:00+05:30",
      last_activity_at: "2026-11-19T17:00:00+05:30",
    });
  }

  // Sort: High risk first, then by sort key
  const bandRank = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => {
    if (bandRank[a.risk_band] !== bandRank[b.risk_band]) {
      return bandRank[a.risk_band] - bandRank[b.risk_band];
    }
    return a.application_id.localeCompare(b.application_id);
  });

  return {
    items,
    totals: {
      submitted: items.length,
      by_band: byBand,
      sources_unavailable: 1,
    },
    sort: {
      key: sort?.key ?? "application_id",
      dir: sort?.dir ?? "asc",
      default: !sort,
      within: "risk_band",
    },
  };
}

export function getMockCaseReview(caseId: string): Review {
  const c = getCaseDiskData(caseId);
  const flags = buildFlags(c);
  const docLabels = c.truthM6Json?.expected_document_labels || {};

  let band: Band = "low";
  if (flags.some((f) => f.severity === "critical" || f.label === "mismatch_detected")) {
    band = "high";
  } else if (flags.some((f) => f.severity === "warning" || f.label === "manual_review_required")) {
    band = "medium";
  }

  const labelCounts: Record<VerificationLabel, number> = {
    verified: 0,
    mismatch_detected: 0,
    expired: 0,
    manual_review_required: 0,
    source_unavailable: 0,
    verification_pending: 0,
  };

  const documents: ReviewDocument[] = (c.caseJson.documents || []).map((d: any) => {
    const l: VerificationLabel = docLabels[d.doc_id] || (flags.length > 0 ? "manual_review_required" : "verified");
    labelCounts[l] = (labelCounts[l] || 0) + 1;
    return {
      doc_id: d.doc_id,
      slot: d.slot,
      title: d.title,
      sha256: d.sha256,
      bytes: d.bytes ?? 50000,
      label: l,
      source: { channel: "e-stamp", adapter_mode: "mock" },
      issuer_sig: { state: "valid", signer: "Trustee / Chairman", trust_anchor_label: "TEST TRUST ANCHOR" },
      uploader_sig: { state: "valid", signer: "Principal / Authorized Official", trust_anchor_label: "TEST TRUST ANCHOR" },
      checks: [
        { kind: "stamp", outcome: "verified", reason_code: "STAMP_VALID", source: { adapter_id: "shcil", mode: "mock", name: "e-Stamp SHCIL" } },
      ],
      manual_task: l === "manual_review_required",
      read: {
        status: "native",
        reason_code: null,
        variant: null,
        why: null,
        values: {},
        page_count: 4,
        ocr_mean_confidence: null,
        pages: [{ page: 1, kind: "native_text", chars: 1400 }, { page: 2, kind: "native_text", chars: 1200 }],
      },
      checked_at: "2026-11-19T16:45:00+05:30",
    };
  });

  const undisposed = flags.filter((f) => !f.disposition).length;

  return {
    case_id: c.caseJson.case_id,
    documents,
    flags,
    tasks: flags
      .filter((f) => f.label === "manual_review_required")
      .map((f) => ({ doc_id: f.doc_id || "doc_unknown", title: f.doc_title, reason: f.why })),
    label_counts: labelCounts,
    checked_at: "2026-11-19T16:45:00+05:30",
    risk: {
      band,
      reasons: flags.slice(0, 3).map((f) => ({ flag_id: f.flag_id, rule_id: f.rule_id, aph_clause: f.aph_clause, short_text: f.why })),
      note: "Risk band orders the review queue only; never shown to the institution.",
    },
    status: undisposed === 0 && flags.length > 0 ? "all_flags_decided" : "in_review",
    undisposed_flags: undisposed,
  };
}

export function getMockAffidavitDiff(caseId: string): AffidavitDiff {
  const c = getCaseDiskData(caseId);
  const t = c.truthJson;
  const docs = c.caseJson.documents || [];
  const affDoc = docs[0] || { doc_id: "doc_default" };

  const declarations = (t.printed?.declarations || []).map((text: string, idx: number) => ({
    no: idx + 1,
    printed_no: idx + 1,
    block: idx < 19 ? "core" : "existing_institute",
    text,
    status: idx === 8 && caseId.includes("DT03") ? "changed" : "matches",
    expected: idx === 8 && caseId.includes("DT03") ? "The land of the institution, as given in the land table below, is contiguous and undisputed, and is owned / leased by the Trust / Society / Company." : text,
  }));

  return {
    case: {
      case_id: c.caseJson.case_id,
      application_id: c.caseJson.application_id,
      permanent_id: c.caseJson.permanent_id,
      ay: c.caseJson.ay,
      regional_office: c.caseJson.regional_office,
      institution_name: c.caseJson.institution_name,
      route: c.caseJson.route,
      stage: c.caseJson.stage,
      category_set: c.caseJson.category_set || ["EoA Only"],
    },
    doc_id: affDoc.doc_id,
    engine_version: "0.1.0",
    ruleset_version: "m5-affidavit@0.1.0",
    advisory: true,
    expected: {
      template_id: "aff2-portal-2024-27",
      template_year: "2024-27",
      aid: c.caseJson.application_id,
      category_list: c.caseJson.category_set || ["EoA Only"],
      declarations,
    },
    sworn: {
      page_count: 4,
      sha256: affDoc.sha256 || "0".repeat(64),
      template_match: true,
      text_source: "text_layer",
      ocr_mean_confidence: null,
      issuer_sig: { state: "valid", signer: "Trustee", trust_anchor_label: "TEST TRUST ANCHOR" },
      uploader_sig: { state: "valid", signer: "Principal", trust_anchor_label: "TEST TRUST ANCHOR" },
      category_list_found: c.caseJson.category_set || ["EoA Only"],
      declarations,
    },
    normalisation: {
      whitespace: true,
      strike_through_resolved: 0,
      names_substituted: true,
      hyphens_rejoined: 0,
      date_order: "DMY",
      date_order_fallbacks: 0,
    },
    options: [],
    ops: [],
    flags: buildFlags(c) as any,
    pending: [],
    stamp: {
      second_party: "AICTE NEW DELHI",
      duty: 10000,
      certificate_no: "IN-TN90526111604222Q",
    },
    chronology: {
      mark_after_notary: caseId.includes("DT03"),
    },
  } as any;
}

export function getMockCaseVerification(caseId: string): CaseVerification {
  const c = getCaseDiskData(caseId);
  const flags = buildFlags(c);
  const docLabels = c.truthM6Json?.expected_document_labels || {};

  return {
    case_id: c.caseJson.case_id,
    application_id: c.caseJson.application_id,
    ay: c.caseJson.ay,
    advisory: true,
    documents: (c.caseJson.documents || []).map((d: any) => {
      const l: VerificationLabel = docLabels[d.doc_id] || (flags.length > 0 ? "manual_review_required" : "verified");
      return {
        doc_id: d.doc_id,
        slot: d.slot,
        declared_type: d.declared_type,
        title: d.title,
        sha256: d.sha256,
        bytes: d.bytes ?? 45000,
        uploaded_at: d.uploaded_at || "2026-11-19T16:40:00+05:30",
        label: l,
        issuer_sig: { state: "valid", signer: "Chairman / Trustee", trust_anchor_label: "TEST TRUST ANCHOR" },
        uploader_sig: { state: "valid", signer: "Principal", trust_anchor_label: "TEST TRUST ANCHOR" },
        checks: [
          { kind: "pki", outcome: "verified", reason_code: "CERT_CHAIN_VALID", source: { adapter_id: "cca", mode: "offline", name: "CCA Trust Store" } },
        ],
        source: { channel: "e-stamp", adapter_mode: "mock" },
      };
    }),
  } as any;
}

export function getMockAlerts(): { items: AlertItem[] } {
  return {
    items: [
      {
        case_id: "cas_01JD3M5A00000000000000DT03",
        application_id: "1-90000004217",
        type: "suspected_anomaly",
        subtype: "affidavit_diff",
        severity: "critical",
        text: "Altered land declaration: sworn copy omitted undisputed ownership condition.",
        created_at: "2026-11-19T16:45:00+05:30",
        alert_key: "alt_01",
        doc_id: "doc_SG34T9WEMMXMBZ8WA2JBXQX1DC",
        label: "mismatch_detected",
        flag_id: "flg_01JD3M5ADT03000200000000",
        aph_clause: "2.3.4",
        source: { mode: "mock" },
      },
      {
        case_id: "cas_01JD3M5A00000000000000DT03",
        application_id: "1-90000004217",
        type: "missing_info",
        subtype: "category_line_missing",
        severity: "critical",
        text: "Missing category line in sworn affidavit.",
        created_at: "2026-11-19T16:45:00+05:30",
        alert_key: "alt_02",
        doc_id: "doc_SG34T9WEMMXMBZ8WA2JBXQX1DC",
        label: "mismatch_detected",
        flag_id: "flg_01JD3M5ADT03000100000000",
        aph_clause: "Table 2.3",
        source: { mode: "mock" },
      },
      {
        case_id: "cas_01JD3M5A00000000000000CE07",
        application_id: "1-90000007107",
        type: "expired",
        subtype: "fire_licence_expired",
        severity: "warning",
        text: "Tamil Nadu Fire Safety Certificate lapsed before application submission date.",
        created_at: "2026-11-19T15:20:00+05:30",
        alert_key: "alt_03",
        doc_id: "doc_CE07_01",
        label: "expired",
        flag_id: null,
        aph_clause: "Annexure 2.1(iii)",
        source: { mode: "mock" },
      },
    ],
  };
}

export function getMockAudit(): Audit {
  return {
    chain: {
      ok: true,
      rows: 8,
      broken_at: null,
      reason: null,
      recomputed_at: new Date().toISOString(),
      method: "sha256-hash-chain",
    },
    entries: [
      {
        seq: 1,
        at: "2026-11-19T16:40:00Z",
        event_type: "application.submitted",
        case_id: "cas_01JD3M5A00000000000000DT03",
        actor: "portal.webhook",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        payload_sha256: "ca79c52661a13baa8a344d797190231fb124c50f8d31f0d0175a07d83ff047c7",
        detail: { institution: "Demo Institute of Technology 03", regional_office: "Southern" },
      },
      {
        seq: 2,
        at: "2026-11-19T16:45:10Z",
        event_type: "case.validation_completed",
        case_id: "cas_01JD3M5A00000000000000DT03",
        actor: "satya.worker",
        hash: "8f4817a027961da9e20516ad9e9b04c8be15951db1eb4b8a2e1d74628f5dd4d6",
        payload_sha256: "982348a8c1f01cba239a0981b2765d7e33527a08b981628d88e00182662c59b2",
        detail: { flags_raised: 7, risk_band: "high", documents_checked: 2 },
      },
    ],
  };
}

export function getMockPdfBytes(caseId: string, docId: string): ArrayBuffer {
  const c = getCaseDiskData(caseId);
  const doc = (c.caseJson.documents || []).find((d: any) => d.doc_id === docId);
  const filename = doc?.file || "affidavit-sworn.pdf";
  const filePath = path.join(c.dir, filename);
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  // Fallback to any synthetic PDF in cases
  const all = loadAllCases();
  for (const item of all) {
    const fallbackPath = path.join(item.dir, "affidavit-sworn.pdf");
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
  }

  return new ArrayBuffer(0);
}

export function recordMockDisposition(flagId: string, action: string, reason: string): { ok: boolean; code: string | null } {
  LEDGER_SEQ++;
  DISPOSITION_STORE.set(flagId, {
    action,
    reason,
    at: new Date().toISOString(),
    ledger_no: LEDGER_SEQ,
  });
  return { ok: true, code: null };
}
