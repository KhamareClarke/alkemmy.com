import 'server-only';

export interface SalesTaxResult {
  amountToCollect: number;
  rate: number;
  freightTaxable?: boolean;
  taxSource: 'taxjar';
  raw: unknown;
}

/**
 * US sales tax via TaxJar v2 `/taxes`.
 * @see https://developers.taxjar.com/api/reference/#taxes
 */
export async function calculateSalesTax(
  amount: number,
  fromZip: string,
  toZip: string,
  toState: string,
  opts?: {
    fromCountry?: string;
    fromState?: string;
    toCountry?: string;
    shipping?: number;
  }
): Promise<SalesTaxResult> {
  const key = process.env.TAXJAR_API_KEY?.trim();
  if (!key) {
    throw new Error('TAXJAR_API_KEY is not set');
  }

  const body = {
    from_country: opts?.fromCountry ?? 'US',
    from_zip: fromZip,
    from_state: opts?.fromState ?? '',
    to_country: opts?.toCountry ?? 'US',
    to_zip: toZip,
    to_state: toState,
    amount,
    shipping: opts?.shipping ?? 0,
  };

  const res = await fetch('https://api.taxjar.com/v2/taxes', {
    method: 'POST',
    headers: {
      Authorization: `Token token="${key}"`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`TaxJar ${res.status}: ${JSON.stringify(raw)}`);
  }

  const tax = (raw as { tax?: { amount_to_collect?: number; rate?: number; freight_taxable?: boolean } }).tax;
  if (!tax || typeof tax.amount_to_collect !== 'number') {
    throw new Error('TaxJar: unexpected response shape');
  }

  return {
    amountToCollect: tax.amount_to_collect,
    rate: typeof tax.rate === 'number' ? tax.rate : 0,
    freightTaxable: tax.freight_taxable,
    taxSource: 'taxjar',
    raw,
  };
}
