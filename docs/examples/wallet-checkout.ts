/**
 * Wallet checkout — pay from FikaChu wallet balance at place order.
 * Requires authenticated user with sufficient wallet balance.
 */
import { PARTNER_ID, shopApi, toBasketCheckoutValue, type TokenStore } from './client-setup';
import type { ShippingAddress } from './checkout-flow';

async function walletCheckout(
  sessionId: string,
  tokens: TokenStore,
  basketId: number,
  shippingMethodCode: string,
  shippingAddress: ShippingAddress,
) {
  const body = {
    basket: toBasketCheckoutValue(basketId),
    shipping_method_code: shippingMethodCode,
    shipping_address: shippingAddress,
    payment: {
      wallet: {
        enabled: true,
        variant: 'wallet',
        input_fields: {},
      },
    },
  };

  const res = await shopApi(`/checkout/?partner=${PARTNER_ID}`, {
    method: 'POST',
    sessionId,
    tokens,
    body: JSON.stringify(body),
  });

  const order = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(order));

  return {
    order,
    needsPayment: (order.payments?.length ?? 0) > 0,
  };
}

export { walletCheckout };
