/**
 * Guest checkout when OSCAR_ALLOW_ANON_CHECKOUT is enabled.
 * POST /shop/api/checkout/ with SID:ANON session only.
 */
import { PARTNER_ID, shopApi, toBasketCheckoutValue } from './client-setup';

async function guestCheckout(
  sessionId: string,
  basketId: number,
  shippingAddress: Record<string, unknown>,
) {
  const body = {
    basket: toBasketCheckoutValue(basketId),
    guest_email: 'guest@example.com',
    shipping_method_code: 'pick-up',
    shipping_address: shippingAddress,
    payment: {
      cash: {
        enabled: true,
        variant: 'cash',
        input_fields: {},
      },
    },
  };

  const res = await shopApi(`/checkout/?partner=${PARTNER_ID}`, {
    method: 'POST',
    sessionId,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  const order = await res.json();
  return {
    order,
    needsPayment: (order.payments?.length ?? 0) > 0,
  };
}

export { guestCheckout };
