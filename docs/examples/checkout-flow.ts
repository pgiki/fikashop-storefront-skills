/**
 * Checkout screen load + place order.
 * GET payment-methods → POST shipping-methods → GET basket (recalc) → POST checkout
 */
import { PARTNER_ID, shopApi, toBasketCheckoutValue, type TokenStore } from './client-setup';

type ShippingAddress = {
  country: string;
  first_name: string;
  last_name: string;
  line1: string;
  line4?: string;
  postcode?: string;
  phone_number: string;
  notes?: string;
  location?: { type: 'Point'; coordinates: [number, number] };
};

type CheckoutInput = {
  sessionId: string;
  tokens?: TokenStore;
  basketId: number;
  shippingMethodCode: string;
  shippingAddress: ShippingAddress;
  paymentMethodType: string;
  paymentVariant: string;
  paymentInputFields: Record<string, string>;
  userAddressId?: number;
};

async function getPaymentMethods(sessionId: string, tokens?: TokenStore) {
  const res = await shopApi(
    `/checkout/payment-methods/available/?partner=${PARTNER_ID}`,
    { sessionId, tokens },
  );
  if (!res.ok) throw new Error(`payment-methods failed: ${res.status}`);
  return res.json();
}

async function quoteShipping(sessionId: string, address: ShippingAddress, tokens?: TokenStore) {
  const res = await shopApi('/basket/shipping-methods/', {
    method: 'POST',
    sessionId,
    tokens,
    body: JSON.stringify(address),
  });
  if (!res.ok) throw new Error(`shipping-methods failed: ${res.status}`);
  return res.json();
}

async function fetchBasketWithTotals(
  sessionId: string,
  paymentMethodCode: string,
  shippingMethodCode: string,
  tokens?: TokenStore,
) {
  const qs = new URLSearchParams({
    partner: PARTNER_ID,
    payment_method_code: paymentMethodCode,
    shipping_method_code: shippingMethodCode,
  });
  const res = await shopApi(`/basket/?${qs}`, { sessionId, tokens });
  if (!res.ok) throw new Error(`basket failed: ${res.status}`);
  return res.json();
}

function parseCheckoutErrors(body: {
  errors?: { basket?: string[]; non_field_errors?: string[] } & Record<string, unknown>;
  non_field_errors?: string[];
}): string {
  const parts: string[] = [];
  if (body.errors?.basket?.length) parts.push(...body.errors.basket);
  if (body.errors?.non_field_errors?.length) parts.push(...body.errors.non_field_errors);
  if (body.non_field_errors?.length) parts.push(...body.non_field_errors);
  if (body.errors) {
    for (const [key, val] of Object.entries(body.errors)) {
      if (key === 'basket' || key === 'non_field_errors') continue;
      if (Array.isArray(val)) parts.push(...val.map(String));
      else if (val && typeof val === 'object') {
        parts.push(...Object.values(val as Record<string, string[]>).flat());
      }
    }
  }
  return parts.join('; ') || 'Checkout failed';
}

async function placeOrder(input: CheckoutInput) {
  const body: Record<string, unknown> = {
    basket: toBasketCheckoutValue(input.basketId),
    shipping_method_code: input.shippingMethodCode,
    shipping_address: input.shippingAddress,
    payment: {
      [input.paymentMethodType]: {
        enabled: true,
        variant: input.paymentVariant,
        input_fields: input.paymentInputFields,
      },
    },
  };
  if (input.userAddressId != null) body.user_address = input.userAddressId;

  const res = await shopApi(`/checkout/?partner=${PARTNER_ID}`, {
    method: 'POST',
    sessionId: input.sessionId,
    tokens: input.tokens,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(parseCheckoutErrors(data));

  const payments = (data as { payments?: unknown[] }).payments ?? [];
  return {
    order: data,
    needsPayment: payments.length > 0,
  };
}

export {
  fetchBasketWithTotals,
  getPaymentMethods,
  placeOrder,
  quoteShipping,
  parseCheckoutErrors,
  type CheckoutInput,
  type ShippingAddress,
};
