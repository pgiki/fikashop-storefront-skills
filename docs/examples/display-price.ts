/**
 * Multi-currency display helpers for fikashop-api `X-Currency` responses.
 *
 * Naming mirrors the API: every converted amount is `display_<base_field>`
 * with one shared `display_currency` + `exchange_rate` per object.
 *
 * Rules (see contracts/INTEGRATION.md "Multi-currency display"):
 * - Render `display_*` fields; keep base `price`/`total` + `*_currency`
 *   for money logic (they are what gets charged/settled).
 * - Never sum display lines into a total — use the converted total.
 * - Orders carry a LOCKED quote (`display_currency`/`exchange_rate`/
 *   `display_total_incl_tax`) frozen at checkout; later rate changes never
 *   rewrite receipts.
 */

function finiteAmount(value: unknown): number | null {
  const n = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

function code(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

type MoneyRow = Record<string, unknown>;

/** Prefer the converted `display_<base>` amount, fall back to base fields. */
export function resolveDisplayMoney(
  row: MoneyRow | null | undefined,
  displayKey: string,
  baseAmountKey: string,
  baseCurrencyKey: string,
): {
  amount: number | null;
  currency: string;
} {
  const displayAmount = finiteAmount(row?.[displayKey]);
  const displayCurrency = code(row?.display_currency);
  if (displayAmount != null && displayCurrency) {
    return { amount: displayAmount, currency: displayCurrency };
  }
  return { amount: finiteAmount(row?.[baseAmountKey]), currency: code(row?.[baseCurrencyKey]) };
}

/** Order totals: `display_total_incl_tax` (locked quote) with base fallback. */
export function resolveOrderMoney(order: MoneyRow | null | undefined): {
  amount: number | null;
  currency: string;
} {
  return resolveDisplayMoney(order, 'display_total_incl_tax', 'total_incl_tax', 'currency');
}

export function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !currency) return '';
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** One-line price label for a stockrecord (catalog, basket lines). */
export function priceLabel(
  row: MoneyRow | null | undefined,
  displayKey: string,
  baseAmountKey: string,
  baseCurrencyKey: string,
): string {
  const money = resolveDisplayMoney(row, displayKey, baseAmountKey, baseCurrencyKey);
  return formatMoney(money.amount, money.currency);
}

/** Receipt total line for an order (locked quote preferred). */
export function orderTotalLabel(order: MoneyRow | null | undefined): string {
  const money = resolveOrderMoney(order);
  return formatMoney(money.amount, money.currency);
}
