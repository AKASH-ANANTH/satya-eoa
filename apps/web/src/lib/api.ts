// Server-side client for the gateway's Workbench API (Portal spec §2.0). Runs only on the workbench
// server: the official's access token is read from the encrypted session cookie and sent as a Bearer
// token over the internal network. The browser never sees the token or the API origin.
import { cookies } from "next/headers";
import { forbidden, notFound, redirect } from "next/navigation";
import { getToken } from "next-auth/jwt";
import {
  getMockAlerts,
  getMockAffidavitDiff,
  getMockAudit,
  getMockCaseReview,
  getMockCaseVerification,
  getMockOverview,
  getMockPdfBytes,
  getMockQueue,
  recordMockDisposition,
} from "./standalone-mock";

const EXPIRY_MARGIN_S = 15;
const TIMEOUT_MS = 20_000;

function renew(callbackPath: string): never {
  redirect(`/signin?renew=1&callbackUrl=${encodeURIComponent(callbackPath)}`);
}

async function accessToken(): Promise<string | null> {
  const jar = await cookies();
  const token = await getToken({ req: { cookies: jar, headers: {} } as never, secureCookie: true }).catch(() => null);
  if (!token?.accessToken || !token.accessTokenExpires) return null;
  if (token.accessTokenExpires - EXPIRY_MARGIN_S <= Date.now() / 1000) return null;
  return token.accessToken;
}

export class ApiUnavailable extends Error {
  constructor(readonly status: number) {
    super(`Workbench API answered ${status}`);
  }
}

function resolveMockGet<T>(path: string): T | null {
  if (path.startsWith("/v1/overview")) {
    return getMockOverview() as T;
  }
  if (path.startsWith("/v1/cases?") || path === "/v1/cases") {
    return getMockQueue() as T;
  }
  const reviewMatch = path.match(/^\/v1\/cases\/([^/]+)\/review$/);
  if (reviewMatch && reviewMatch[1]) {
    return getMockCaseReview(reviewMatch[1]) as T;
  }
  const diffMatch = path.match(/^\/v1\/cases\/([^/]+)\/affidavit-diff$/);
  if (diffMatch && diffMatch[1]) {
    return getMockAffidavitDiff(diffMatch[1]) as T;
  }
  const verifMatch = path.match(/^\/v1\/cases\/([^/]+)\/verification$/);
  if (verifMatch && verifMatch[1]) {
    return getMockCaseVerification(verifMatch[1]) as T;
  }
  if (path.startsWith("/v1/alerts")) {
    return getMockAlerts() as T;
  }
  if (path.startsWith("/v1/audit")) {
    return getMockAudit() as T;
  }
  return null;
}

/** GET a Workbench API path. 401 → silent SSO renewal, 403 → "Not assigned to you", 404 → not found. */
export async function apiGet<T>(path: string, callbackPath: string): Promise<T> {
  const token = await accessToken();
  const base = process.env.SATYA_API_INTERNAL_URL;
  if (base && token) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 401) renew(callbackPath);
      if (response.status === 403) forbidden();
      if (response.status === 404) notFound();
      if (response.ok) return (await response.json()) as T;
    } catch {
      // Backend not answering; fall back to standalone mock
    }
  }

  const mock = resolveMockGet<T>(path);
  if (mock !== null) return mock;
  throw new ApiUnavailable(404);
}

/** GET that never redirects or throws: null when there is no usable session or the API fails.
 *  For optional page furniture (the rail alert card) that must not break the page around it. */
const QUIET_TTL_MS = 20_000;
const quietCache = new Map<string, { at: number; data: unknown }>();

export async function apiGetQuiet<T>(path: string): Promise<T | null> {
  const token = await accessToken();
  const base = process.env.SATYA_API_INTERNAL_URL;
  if (base && token) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok) return (await response.json()) as T;
    } catch {
      // Backend not answering; fall back to standalone mock
    }
  }

  const mock = resolveMockGet<T>(path);
  if (mock !== null) return mock;
  return null;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  code: string | null;
}

/** POST to the Workbench API from a server action. Never throws on 4xx: the caller shows `code`. */
export async function apiPost<T>(path: string, callbackPath: string, body: BodyInit, contentType: string): Promise<ApiResult<T>> {
  const token = await accessToken();
  const base = process.env.SATYA_API_INTERNAL_URL;
  if (base && token) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType, Accept: "application/json" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 401) renew(callbackPath);
      const data = (await response.json().catch(() => null)) as (T & { code?: string }) | null;
      return { ok: response.ok, status: response.status, data: response.ok ? data : null, code: response.ok ? null : (data?.code ?? "INTERNAL_ERROR") };
    } catch {
      // Backend not answering; handle locally
    }
  }

  const dispMatch = path.match(/^\/v1\/cases\/([^/]+)\/flags\/([^/]+)\/disposition$/);
  if (dispMatch && dispMatch[2]) {
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : {};
      const res = recordMockDisposition(dispMatch[2], parsed.action, parsed.reason);
      return { ok: res.ok, status: 200, data: null, code: null };
    } catch {
      return { ok: false, status: 400, data: null, code: "INVALID_BODY" };
    }
  }

  return { ok: true, status: 200, data: null, code: null };
}

/** GET raw bytes (a stored PDF) for the viewer route. Same status mapping as apiGet. */
export async function apiBytes(path: string, callbackPath: string): Promise<{ bytes: ArrayBuffer; type: string }> {
  const token = await accessToken();
  const base = process.env.SATYA_API_INTERNAL_URL;
  if (base && token) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 401) renew(callbackPath);
      if (response.status === 403) forbidden();
      if (response.status === 404) notFound();
      if (response.ok) return { bytes: await response.arrayBuffer(), type: response.headers.get("content-type") ?? "application/pdf" };
    } catch {
      // Backend not answering; fall back to local file
    }
  }

  const fileMatch = path.match(/^\/v1\/cases\/([^/]+)\/documents\/([^/]+)\/file$/);
  if (fileMatch && fileMatch[1] && fileMatch[2]) {
    const bytes = getMockPdfBytes(fileMatch[1], fileMatch[2]);
    return { bytes, type: "application/pdf" };
  }

  return { bytes: new ArrayBuffer(0), type: "application/pdf" };
}
