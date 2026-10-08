import { describe, expect, it } from 'vitest';

import {
  orderTotalLabel,
  priceLabel,
  resolveDisplayMoney,
  resolveOrderMoney,
} from '../docs/examples/display-price';

describe('display-price helpers', () => {
  it('resolves base money without display fields', () => {
    expect(
      resolveDisplayMoney(
        { price: '13500.00', price_currency: 'TZS' },
        'display_price',
        'price',
        'price_currency',
      ),
    ).toEqual({ amount: 13500, currency: 'TZS' });
  });

  it('prefers converted display fields mirroring base names', () => {
    expect(
      resolveDisplayMoney(
        {
          price: '13500.00',
          price_currency: 'TZS',
          display_price: '5.40',
          display_currency: 'USD',
        },
        'display_price',
        'price',
        'price_currency',
      ),
    ).toEqual({ amount: 5.4, currency: 'USD' });
  });

  it('prefers the locked order quote', () => {
    expect(
      resolveOrderMoney({
        total_incl_tax: '15500.00',
        currency: 'TZS',
        display_total_incl_tax: '6.20',
        display_currency: 'USD',
      }),
    ).toEqual({ amount: 6.2, currency: 'USD' });
    expect(priceLabel({ price: '13500.00', price_currency: 'TZS' }, 'display_price', 'price', 'price_currency')).toContain(
      'TZS',
    );
    expect(
      orderTotalLabel({
        total_incl_tax: '15500.00',
        currency: 'TZS',
        display_total_incl_tax: '6.20',
        display_currency: 'USD',
      }),
    ).toContain('USD');
  });
});
