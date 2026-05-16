import type { TaxYear } from "./years";
import { getYearRates } from "./years";

export type AtpSector = "private" | "public";

// Employee monthly ATP contribution by working hours, derived from the
// full-time (≥117 h/month) amount per year+sector. The tier ratios are
// stable across years (full=3/3, B=2/3, C=1/3, D=0).
export function computeAtpEmployeeContributionAnnual(
  sector: AtpSector,
  monthlyHours: number,
  taxYear?: TaxYear
): number {
  const normalizedHours = Math.max(0, monthlyHours);
  const fulltime = getYearRates(taxYear).atpEmployeeFulltimeMonthly[sector];

  let atpEmployeeMonthly = 0;
  if (normalizedHours >= 117) atpEmployeeMonthly = fulltime;
  else if (normalizedHours >= 78) atpEmployeeMonthly = (fulltime * 2) / 3;
  else if (normalizedHours >= 39) atpEmployeeMonthly = fulltime / 3;
  else atpEmployeeMonthly = 0;

  return atpEmployeeMonthly * 12;
}
