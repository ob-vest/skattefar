import type { TaxYear } from "./years";

export type Period = "year" | "month";

export interface TaxInput {
  grossIncome: number; // in DKK, for the selected period
  period: Period;

  // Income year — determines default rates, thresholds, ATP table, etc.
  taxYear?: TaxYear;

  municipalTaxRate?: number; // 0-1, default 0.25
  includeChurchTax?: boolean; // default false
  churchTaxRate?: number; // 0-1, default 0.0066
  amContributionRate?: number; // 0-1
  bottomStateTaxRate?: number; // 0-1 (bundskat)

  // Mellemskat (introduced 2026)
  middleStateTaxRate?: number; // 0-1
  middleStateTaxThresholdAnnual?: number; // DKK/year

  topStateTaxRate?: number; // 0-1
  topTaxThresholdAnnual?: number; // DKK/year

  // Top-topskat (introduced 2026)
  topTopStateTaxRate?: number; // 0-1
  topTopStateTaxThresholdAnnual?: number; // DKK/year

  // Skatteloft (horisontal tax ceiling, personal income, excl. AM + church)
  skatteloftMiddle?: number; // 0-1 (only applies when middle bracket active)
  skatteloftTop?: number; // 0-1
  skatteloftTopTop?: number; // 0-1 (only applies when top-top bracket active)

  personalAllowanceAnnual?: number; // DKK/year

  // Deductions
  applyEmploymentDeduction?: boolean; // Employment deduction (beskæftigelsesfradrag), default true
  employmentDeductionRate?: number;
  employmentDeductionCapAnnual?: number;
  singleParent?: boolean; // Single parent
  singleParentEmploymentSupplementRate?: number;
  singleParentEmploymentSupplementCapAnnual?: number;

  applyJobDeduction?: boolean; // Job deduction (jobfradrag), default true
  jobDeductionRate?: number;
  jobDeductionThresholdAnnual?: number;
  jobDeductionCapAnnual?: number;

  // Commuting deduction (Befordringsfradrag, pendlerfradrag)
  commutingDistanceKmDaily?: number; // total daily distance (round trip)
  commutingWorkingDaysAnnual?: number; // default 226
  commutingRateLow?: number; // 25-120 km per day, DKK/km
  commutingRateHigh?: number; // >120 km per day, DKK/km
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
    taxYear: TaxYear;
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
    taxableMunicipalAnnual: number; // skattepligtig indkomst
    taxableBottomStateAnnual: number; // bundskat base
    taxableMiddleStateAnnual: number; // mellemskat base (0 if bracket inactive)
    taxableTopStateAnnual: number; // topskat base
    taxableTopTopStateAnnual: number; // top-topskat base (0 if inactive)
    personalAllowanceAnnual: number; // kept for backward compat
  };
  taxes: {
    municipalTaxAnnual: number;
    churchTaxAnnual: number;
    stateBottomTaxAnnual: number;
    stateMiddleTaxAnnual: number; // 0 if mellemskat inactive
    stateTopTaxAnnual: number;
    stateTopTopTaxAnnual: number; // 0 if top-topskat inactive
    totalTaxAnnual: number; // all taxes (municipal + church + state brackets)
    // Skatteloft reductions actually applied to state bracket tax amounts
    skatteloftNedslagAnnual: number;
  };
  totals: {
    netIncomeAnnual: number;
    netIncomePeriod: number;
  };
}
