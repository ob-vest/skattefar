export function computeMunicipalAndChurchTaxes(
  taxableMunicipalAnnual: number,
  taxableChurchAnnual: number,
  municipalTaxRate: number,
  includeChurchTax: boolean,
  churchTaxRate: number
): { municipalTaxAnnual: number; churchTaxAnnual: number } {
  const municipalTaxAnnual = taxableMunicipalAnnual * municipalTaxRate;
  const churchTaxAnnual = includeChurchTax
    ? taxableChurchAnnual * churchTaxRate
    : 0;
  return { municipalTaxAnnual, churchTaxAnnual };
}

export function computeStateTaxes(
  taxableBottomStateAnnual: number,
  bottomStateTaxRate: number,
  topBaseAnnual: number,
  topStateTaxRate: number
): { stateBottomTaxAnnual: number; stateTopTaxAnnual: number } {
  const stateBottomTaxAnnual = taxableBottomStateAnnual * bottomStateTaxRate;
  const stateTopTaxAnnual = topBaseAnnual * topStateTaxRate;
  return { stateBottomTaxAnnual, stateTopTaxAnnual };
}
