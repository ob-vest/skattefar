export function computeAMContributions(
  grossIncomeAnnual: number,
  atpEmployeeContributionAnnual: number,
  employeePensionContributionAnnual: number,
  amContributionRate: number
): {
  amBaseAnnual: number;
  amContributionAnnual: number;
  afterAMAnnual: number;
} {
  const amBaseAnnual = Math.max(
    0,
    grossIncomeAnnual -
      atpEmployeeContributionAnnual -
      employeePensionContributionAnnual
  );
  const amContributionAnnual = Math.max(0, amBaseAnnual * amContributionRate);
  const afterAMAnnual = Math.max(0, grossIncomeAnnual - amContributionAnnual);
  return { amBaseAnnual, amContributionAnnual, afterAMAnnual };
}
