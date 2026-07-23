/**
 * Storefront HTTP client bootstrap — Session-Id, X-Partner-Id, Bearer, 401 refresh.
 * Canonical HTTP client bootstrap — Session-Id, X-Partner-Id, Bearer, 401 refresh.
 *
 * Storage: use localStorage (web) or AsyncStorage (React Native / Expo).
 * Pass a custom get/set pair instead of localStorage when not in the browser.
 */
const API_BASE = process.env.API_BASE ?? 'https://api.fikashop.app';
const PARTNER_ID = process.env.PARTNER_ID ?? '1';
const OIDC_ISS = process.env.OIDC_ISS ?? 'https://oidc.fikachu.com';
const SESSION_STORAGE_KEY = 'fikashop_session_id';

type TokenStore = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (access: string, refresh?: string) => void;
  clear: () => void;
};

function apiHostname(baseUrl: string): string {
  return new URL(baseUrl).hostname;
}

function loadOrCreateSessionId(baseUrl: string, authType: 'ANON' | 'AUTH' = 'ANON'): string {
  const hostname = apiHostname(baseUrl);
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null;
  if (stored && stored.includes(`:${hostname}:`)) {
    if (authType === 'AUTH' && stored.startsWith('SID:ANON:')) {
      return stored.replace('SID:ANON:', 'SID:AUTH:');
    }
    return stored;
  }
  const uuid = crypto.randomUUID();
  const sessionId = `SID:${authType}:${hostname}:${uuid}`;
  localStorage?.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

async function refreshAccessToken(tokens: TokenStore): Promise<string | null> {
  const refresh = tokens.getRefreshToken();
  if (!refresh) return null;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: process.env.OIDC_CLIENT_ID ?? '',
  });
  const res = await fetch(`${OIDC_ISS}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    tokens.clear();
    return null;
  }
  const data = await res.json();
  tokens.setTokens(data.access_token, data.refresh_token ?? refresh);
  return data.access_token as string;
}

async function shopApi(
  path: string,
  options: RequestInit & { sessionId: string; tokens?: TokenStore } = { sessionId: '' },
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('X-Partner-Id', PARTNER_ID);
  headers.set('Session-Id', options.sessionId);
  headers.set('Accept', 'application/json');
  const access = options.tokens?.getAccessToken();
  if (access) headers.set('Authorization', `Bearer ${access}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE}/shop/api${path.startsWith('/') ? path : `/${path}`}`;
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && options.tokens) {
    const newAccess = await refreshAccessToken(options.tokens);
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      res = await fetch(url, { ...options, headers });
    }
  }
  return res;
}

async function startSession(sessionId: string, tokens: TokenStore) {
  const res = await shopApi('/start-session/', { sessionId, tokens });
  if (!res.ok) throw new Error(`start-session failed: ${res.status}`);
  return res.json() as Promise<{ user: Record<string, unknown>; basket_id: number }>;
}

/** Checkout accepts basket id directly; line PATCH/DELETE still use hypermedia URLs. */
function toBasketCheckoutValue(basketId: number | string) {
  return basketId;
}

function toBasketUrl(apiBase: string, basketId: number) {
  return `${apiBase.replace(/\/$/, '')}/shop/api/baskets/${basketId}/`;
}

export {
  API_BASE,
  PARTNER_ID,
  loadOrCreateSessionId,
  shopApi,
  startSession,
  toBasketCheckoutValue,
  toBasketUrl,
  type TokenStore,
};
