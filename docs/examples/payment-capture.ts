/**
 * Post-checkout payment capture + polling.
 * GET order → POST /payments/process/{reference}/ → poll payment-states
 */
import { API_BASE, PARTNER_ID, shopApi, type TokenStore } from './client-setup';

type Order = {
  id: number;
  payments?: Array<{
    reference: string;
    status: string;
    payment_method?: { input_fields?: Array<{ code: string; is_required?: boolean }> };
  }>;
};

const ACTIONABLE = new Set(['waiting', 'pending', 'preauth', 'error', 'failed']);
const SUCCESS = new Set(['confirmed', 'success', 'settled', 'paid']);

async function loadOrder(orderId: number, sessionId: string, tokens: TokenStore) {
  const res = await shopApi(`/orders/${orderId}/`, { sessionId, tokens });
  if (!res.ok) throw new Error(`order ${orderId} failed: ${res.status}`);
  return res.json() as Promise<Order>;
}

async function capturePayment(
  reference: string,
  inputFields: Record<string, string>,
  tokens: TokenStore,
) {
  const res = await fetch(`${API_BASE}/payments/process/${reference}/`, {
    method: 'POST',
    headers: {
      'X-Partner-Id': PARTNER_ID,
      Authorization: `Bearer ${tokens.getAccessToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ action: 'capture', input_fields: inputFields }),
  });
  const data = await res.json();
  return { ok: res.ok, data: data as { status?: string; redirect_url?: string; detail?: string } };
}

async function pollPaymentStates(
  orderId: number,
  sessionId: string,
  tokens: TokenStore,
  opts: { intervalMs?: number; maxAttempts?: number } = {},
) {
  const intervalMs = opts.intervalMs ?? 3000;
  const maxAttempts = opts.maxAttempts ?? 40;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await shopApi(`/checkout/payment-states/${orderId}/`, { sessionId, tokens });
    if (res.ok) {
      const data = await res.json();
      const states = (data as { payment_method_states?: Record<string, { status?: string }> })
        .payment_method_states;
      const statuses = states ? Object.values(states).map((s) => s.status ?? '') : [];
      if (statuses.some((s) => SUCCESS.has(s))) return { done: true, data };
      if (statuses.every((s) => !ACTIONABLE.has(s)) && statuses.length > 0) {
        return { done: true, data };
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { done: false };
}

async function completeOrderPayment(
  orderId: number,
  sessionId: string,
  tokens: TokenStore,
  inputFields: Record<string, string>,
) {
  const order = await loadOrder(orderId, sessionId, tokens);
  const payment = order.payments?.find((p) => ACTIONABLE.has(p.status));
  if (!payment?.reference) {
    return { step: 'no_payment_needed' as const, order };
  }

  const capture = await capturePayment(payment.reference, inputFields, tokens);
  if (capture.data.status === 'redirect' && capture.data.redirect_url) {
    return { step: 'redirect' as const, url: capture.data.redirect_url };
  }
  if (capture.data.status === 'error' || !capture.ok) {
    throw new Error(capture.data.detail ?? 'Payment capture failed');
  }

  await pollPaymentStates(orderId, sessionId, tokens);
  const refreshed = await loadOrder(orderId, sessionId, tokens);
  return { step: 'done' as const, order: refreshed };
}

export {
  capturePayment,
  completeOrderPayment,
  loadOrder,
  pollPaymentStates,
  ACTIONABLE,
  SUCCESS,
};
