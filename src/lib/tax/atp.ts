export type AtpSector = "private" | "public";

export function computeAtpEmployeeContributionAnnual(
  sector: AtpSector,
  monthlyHours: number
): number {
  const normalizedHours = Math.max(0, monthlyHours);
  let atpEmployeeMonthly = 0;

  if (sector === "private") {
    if (normalizedHours >= 117) atpEmployeeMonthly = 99.0;
    else if (normalizedHours >= 78) atpEmployeeMonthly = 66.0;
    else if (normalizedHours >= 39) atpEmployeeMonthly = 33.0;
    else atpEmployeeMonthly = 0;
  } else {
    if (normalizedHours >= 117) atpEmployeeMonthly = 66.6;
    else if (normalizedHours >= 78) atpEmployeeMonthly = 44.4;
    else if (normalizedHours >= 39) atpEmployeeMonthly = 22.2;
    else atpEmployeeMonthly = 0;
  }

  return atpEmployeeMonthly * 12;
}
