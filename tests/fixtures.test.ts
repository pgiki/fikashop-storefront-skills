import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const FIXTURES_DIR = join(import.meta.dirname, '../contracts/fixtures');

function loadJson(name: string): unknown {
  const raw = readFileSync(join(FIXTURES_DIR, name), 'utf8');
  return JSON.parse(raw);
}

const FIXTURE_KEYS: Record<string, string[]> = {
  'start-session.json': ['user', 'basket_id'],
  'basket.json': ['id', 'lines', 'total_incl_tax'],
  'add-product-request.json': ['id', 'quantity'],
  'shipping-methods-request.json': ['country', 'location'],
  'shipping-methods-response.json': [],
  'checkout-request.json': ['basket', 'payment', 'shipping_address'],
  'checkout-request-by-id.json': ['basket', 'payment', 'user_address', 'shipping_method_code'],
  'checkout-order-mpesa.json': ['id', 'payments'],
  'checkout-order-cash-empty-payments.json': ['id', 'payments'],
  'checkout-order-wallet.json': ['id', 'payments'],
  'guest-checkout-request.json': ['basket', 'guest_email', 'payment'],
  'payment-methods-available.json': [],
  'payment-capture-request.json': ['action', 'input_fields'],
  'payment-capture-success.json': ['status'],
  'payment-capture-redirect.json': ['status', 'redirect_url'],
  'order-detail.json': ['id', 'payments', 'lines'],
  'payment-states.json': ['order_status', 'payment_method_states'],
  'product-detail-digital.json': ['id', 'is_digital'],
  'product-detail-modifiers.json': ['id', 'stockrecords'],
  'order-receipt.json': ['receipt_url'],
};

describe('status-map.json', () => {
  it('defines order and payment status groups', () => {
    const map = loadJson('../status-map.json') as {
      order: { actionable: string[]; success: string[] };
      payment: { actionable: string[]; success: string[] };
    };
    expect(map.order.success.length).toBeGreaterThan(0);
    expect(map.payment.actionable).toContain('waiting');
  });
});

describe('storefront fixtures', () => {
  it('listed fixture files exist and parse as JSON', () => {
    for (const name of Object.keys(FIXTURE_KEYS)) {
      expect(() => loadJson(name), name).not.toThrow();
    }
  });

  it('fixtures include required top-level keys', () => {
    for (const [name, keys] of Object.entries(FIXTURE_KEYS)) {
      const data = loadJson(name) as Record<string, unknown>;
      for (const key of keys) {
        expect(data, `${name} missing ${key}`).toHaveProperty(key);
      }
      if (name === 'payment-methods-available.json' || name === 'shipping-methods-response.json') {
        expect(Array.isArray(data)).toBe(true);
      }
    }
  });

  it('every json fixture in directory is valid JSON', () => {
    const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      expect(() => loadJson(file), file).not.toThrow();
    }
  });

  it('cash checkout has empty payments array', () => {
    const data = loadJson('checkout-order-cash-empty-payments.json') as { payments: unknown[] };
    expect(data.payments).toEqual([]);
  });

  it('checkout-request-by-id uses numeric basket id', () => {
    const data = loadJson('checkout-request-by-id.json') as {
      basket: unknown;
      user_address: unknown;
      shipping_address?: unknown;
    };
    expect(typeof data.basket).toBe('number');
    expect(data.user_address).toBe(5);
    expect(data.shipping_address).toBeUndefined();
  });
});
