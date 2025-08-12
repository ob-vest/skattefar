export function computeTaxableMunicipalAnnual(
  afterAMAnnual: number,
  totalDeductionsAnnual: number
): number {
  return Math.max(0, afterAMAnnual - totalDeductionsAnnual);
}

export function computeTaxableBottomStateAnnual(
  afterAMAnnual: number,
  personalAllowanceAnnual: number,
  pensionContributionAnnual: number
): number {
  return Math.max(
    0,
    afterAMAnnual - (personalAllowanceAnnual + pensionContributionAnnual)
  );
}

export function computeTopTaxBaseAnnual(
  afterAMAnnual: number,
  employeePensionContributionAnnual: number,
  topTaxThresholdAnnual: number
): { topPersonalIncomeAnnual: number; topBaseAnnual: number } {
  const topPersonalIncomeAnnual = Math.max(
    0,
    afterAMAnnual - employeePensionContributionAnnual
  );
  const topBaseAnnual = Math.max(
    0,
    topPersonalIncomeAnnual - topTaxThresholdAnnual
  );
  return { topPersonalIncomeAnnual, topBaseAnnual };
}
