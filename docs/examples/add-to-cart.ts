/**
 * Add product to basket with options and modifier groups.
 * POST /shop/api/basket/add-product/
 */
import { PARTNER_ID, shopApi } from './client-setup';

type AddToCartInput = {
  sessionId: string;
  productId: number;
  quantity?: number;
  options?: Array<{ option: string; value: string }>;
  modifierGroups?: Record<string, Array<{ id: number; quantity: number }>>;
};

async function addToCart(input: AddToCartInput) {
  const body = {
    id: input.productId,
    quantity: input.quantity ?? 1,
    ...(input.options?.length ? { options: input.options } : {}),
    ...(input.modifierGroups ? { modifier_groups: input.modifierGroups } : {}),
  };

  const res = await shopApi(`/basket/add-product/?partner=${PARTNER_ID}`, {
    method: 'POST',
    sessionId: input.sessionId,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const reason = (err as { reason?: string | Record<string, string[]> }).reason;
    const message =
      typeof reason === 'string'
        ? reason
        : reason
          ? Object.values(reason).flat().join('; ')
          : `add-product failed: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

// Example
async function example(sessionId: string) {
  return addToCart({
    sessionId,
    productId: 42,
    options: [{ option: 'special-instructions', value: 'No onions' }],
    modifierGroups: {
      '3': [{ id: 18081, quantity: 1 }],
    },
  });
}

export { addToCart, example };
