/**
 * Simplified VAT / GST helpers for quotes (not legal tax advice).
 * Full compliance needs MoR registration, B2B reverse charge, digital rules, etc.
 */

export type VatGstRegion = 'EU_VAT' | 'CA_GST' | 'AU_GST';

export interface InternationalTaxQuote {
  region: VatGstRegion;
  countryCode: string;
  rate: number;
  taxAmount: number;
  netAmount: number;
  grossAmount: number;
  label: string;
}

/** Standard EU VAT rates (approximate; reduced rates not modeled). */
const EU_STANDARD: Record<string, number> = {
  AT: 0.2,
  BE: 0.21,
  BG: 0.2,
  HR: 0.25,
  CY: 0.19,
  CZ: 0.21,
  DK: 0.25,
  EE: 0.22,
  FI: 0.24,
  FR: 0.2,
  DE: 0.19,
  GR: 0.24,
  HU: 0.27,
  IE: 0.23,
  IT: 0.22,
  LV: 0.21,
  LT: 0.21,
  LU: 0.17,
  MT: 0.18,
  NL: 0.21,
  PL: 0.23,
  PT: 0.23,
  RO: 0.19,
  SK: 0.2,
  SI: 0.22,
  ES: 0.21,
  SE: 0.25,
};

/** Canadian GST 5% + simplified combined HST/PST by province (quote only). */
const CA_COMBINED: Record<string, number> = {
  ON: 0.13,
  NS: 0.15,
  NB: 0.15,
  NL: 0.15,
  PE: 0.15,
  QC: 0.14975,
  BC: 0.12,
  SK: 0.11,
  MB: 0.12,
  AB: 0.05,
  NT: 0.05,
  NU: 0.05,
  YT: 0.05,
};

const AU_GST = 0.1;

function detectRegion(countryCode: string, provinceOrState?: string): { region: VatGstRegion; rate: number; label: string } {
  const cc = countryCode.toUpperCase();
  if (cc === 'CA') {
    const prov = (provinceOrState || 'ON').toUpperCase();
    const rate = CA_COMBINED[prov] ?? 0.05;
    return { region: 'CA_GST', rate, label: `Canada (${prov}) combined GST/PST/HST` };
  }
  if (cc === 'AU') {
    return { region: 'AU_GST', rate: AU_GST, label: 'Australia GST' };
  }
  if (EU_STANDARD[cc] != null) {
    return { region: 'EU_VAT', rate: EU_STANDARD[cc], label: `EU VAT (${cc})` };
  }
  return { region: 'EU_VAT', rate: 0, label: 'Unsupported country — add rate or use TaxJar' };
}

/** Net → add VAT/GST (amount is pretax subtotal). */
export function calculateVatGstInclusive(amountNet: number, countryCode: string, provinceOrState?: string): InternationalTaxQuote {
  const { region, rate, label } = detectRegion(countryCode, provinceOrState);
  const taxAmount = Math.round(amountNet * rate * 100) / 100;
  const grossAmount = Math.round((amountNet + taxAmount) * 100) / 100;
  return {
    region,
    countryCode: countryCode.toUpperCase(),
    rate,
    taxAmount,
    netAmount: amountNet,
    grossAmount,
    label,
  };
}

/** Gross price includes tax → split net + tax. */
export function splitVatFromGross(grossAmount: number, countryCode: string, provinceOrState?: string): InternationalTaxQuote {
  const { region, rate, label } = detectRegion(countryCode, provinceOrState);
  const netAmount = Math.round((grossAmount / (1 + rate)) * 100) / 100;
  const taxAmount = Math.round((grossAmount - netAmount) * 100) / 100;
  return {
    region,
    countryCode: countryCode.toUpperCase(),
    rate,
    taxAmount,
    netAmount,
    grossAmount,
    label,
  };
}
