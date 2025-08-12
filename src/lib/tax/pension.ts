import { clamp } from "./math";

export function computeEmployeePensionContributionAnnual(
  grossIncomeAnnual: number,
  employeePensionRate: number | undefined
): { normalizedRate: number; contributionAnnual: number } {
  const normalizedRate = clamp(employeePensionRate ?? 0, 0, 1);
  const contributionAnnual = grossIncomeAnnual * normalizedRate;
  return { normalizedRate, contributionAnnual };
}
