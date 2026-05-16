// Tax bases per Personskattelovens §§ 5–7a.
// personalIncomeAnnual = brutto − AM-bidrag − ATP − arbejdsmarkedsbidragspligtige
//   pensionsindbetalinger (PSL §3).
// For bracket taxes (bundskat, mellem, top, top-top) the relevant pension
// contributions are *added back* (PSL §§7–7b). Bundskat additionally subtracts
// personfradrag.

export function computeTaxableMunicipalAnnual(
  personalIncomeAnnual: number,
  ligningsmaessigeFradragAnnual: number,
  personalAllowanceAnnual: number
): number {
  return Math.max(
    0,
    personalIncomeAnnual -
      ligningsmaessigeFradragAnnual -
      personalAllowanceAnnual
  );
}

export function computeTaxableBundskatAnnual(
  personalIncomeAnnual: number,
  pensionAddBackAnnual: number,
  personalAllowanceAnnual: number
): number {
  return Math.max(
    0,
    personalIncomeAnnual + pensionAddBackAnnual - personalAllowanceAnnual
  );
}

export function computeBracketBaseAnnual(
  personalIncomeAnnual: number,
  pensionAddBackAnnual: number,
  thresholdAnnual: number
): number {
  return Math.max(
    0,
    personalIncomeAnnual + pensionAddBackAnnual - thresholdAnnual
  );
}
