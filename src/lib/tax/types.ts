export type Period = "year" | "month";

export interface TaxInput {
  grossIncome: number; // in DKK, for the selected period
  period: Period;
  municipalTaxRate?: number; // 0-1, default 0.25
  includeChurchTax?: boolean; // default false
  churchTaxRate?: number; // 0-1, default 0.0066
  amContributionRate?: number; // 0-1, default 0.08
  bottomStateTaxRate?: number; // 0-1, default 0.121
  topStateTaxRate?: number; // 0-1, default 0.15
  topTaxThresholdAnnual?: number; // in DKK/year, default 588900
  personalAllowanceAnnual?: number; // in DKK/year, default 51,600

  // Deductions
  applyEmploymentDeduction?: boolean; // Employment deduction (beskæftigelsesfradrag), default true
  employmentDeductionRate?: number; // ~0.123 in 2025
  employmentDeductionCapAnnual?: number; // ~55_600 in 2025
  singleParent?: boolean; // Single parent
  singleParentEmploymentSupplementRate?: number; // ~0.115 in 2025
  singleParentEmploymentSupplementCapAnnual?: number; // ~48_300 in 2025

  applyJobDeduction?: boolean; // Job deduction (jobfradrag), default true
  jobDeductionRate?: number; // ~0.045 in 2025
  jobDeductionThresholdAnnual?: number; // ~224_500 in 2025
  jobDeductionCapAnnual?: number; // ~2_900 in 2025

  // Commuting deduction (Befordringsfradrag, pendlerfradrag)
  commutingDistanceKmDaily?: number; // total daily distance (round trip)
  commutingWorkingDaysAnnual?: number; // default 226
  commutingRateLow?: number; // 25-120 km per day, DKK/km (2025 ~2.23)
  commutingRateHigh?: number; // >120 km per day, DKK/km (2025 ~1.12)
  commutingLowThresholdKm?: number; // 24 km
  commutingHighThresholdKm?: number; // 120 km

  // ATP (Arbejdsmarkedets Tillægspension) – employee contribution
  atpSector?: "private" | "public"; // default "private"
  atpMonthlyHours?: number; // default 160 (full time)

  // Employee pension contribution (percentage of gross salary)
  employeePensionRate?: number; // 0-1, default 0

  // Store Bededag (Great Prayer Day) compensation
  applyStoreBededagCompensation?: boolean; // default false
  storeBededagCompensationRate?: number; // 0-1, default 0.0045 (0.45%)
}

export interface TaxBreakdown {
  basis: {
    period: Period;
    grossIncomePeriod: number; // in selected period
    grossIncomeAnnual: number; // annualized (including compensation if applied)
  };
  contributions: {
    amContributionAnnual: number;
    atpEmployeeContributionAnnual: number;
    employeePensionContributionAnnual: number;
  };
  supplements: {
    storeBededagCompensationAnnual: number;
  };
  deductions: {
    personalAllowanceAnnual: number;
    employmentDeductionAnnual: number; // employment deduction (beskæftigelsesfradrag)
    singleParentEmploymentSupplementAnnual: number; // extra employment deduction (single parent)
    jobDeductionAnnual: number; // job deduction (jobfradrag)
    commutingDeductionAnnual: number; // commuting deduction (Befordringsfradrag)
    pensionContributionAnnual: number; // employee pension contribution (deduction)
    totalDeductionsAnnual: number; // sum of above
  };
  taxable: {
    taxableMunicipalAnnual: number; // after AM and all taxable-income-only deductions
    taxableBottomStateAnnual: number; // after AM and personal-income deductions
    taxableTopStateAnnual: number; // part of personal income above top threshold
    // kept for backward-compat: equals deductions.personalAllowanceAnnual
    personalAllowanceAnnual: number;
  };
  taxes: {
    municipalTaxAnnual: number;
    churchTaxAnnual: number;
    stateBottomTaxAnnual: number;
    stateTopTaxAnnual: number;
    totalTaxAnnual: number; // all taxes (municipal + church + state bottom + state top)
  };
  totals: {
    netIncomeAnnual: number;
    netIncomePeriod: number;
  };
}
