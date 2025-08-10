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
    grossIncomeAnnual: number; // annualized
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
    taxableIncomeAnnual: number; // after AM and personal allowance
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

export function computeTaxBreakdown(input: TaxInput): TaxBreakdown {
  const {
    grossIncome, // for given period
    period,
    municipalTaxRate = 0.25,
    includeChurchTax = false,
    churchTaxRate = 0.0066,
    amContributionRate = 0.08,
    bottomStateTaxRate = 0.121,
    topStateTaxRate = 0.15,
    topTaxThresholdAnnual = 588_900,
    personalAllowanceAnnual = 51_600,

    // defaults for deductions (2025 approximations)
    applyEmploymentDeduction = true,
    employmentDeductionRate = 0.123,
    employmentDeductionCapAnnual = 55_600,
    singleParent = false,
    singleParentEmploymentSupplementRate = 0.115,
    singleParentEmploymentSupplementCapAnnual = 48_300,

    applyJobDeduction = true,
    jobDeductionRate = 0.045,
    jobDeductionThresholdAnnual = 224_500,
    jobDeductionCapAnnual = 2_900,

    // defaults for Befordringsfradrag (commuting deduction, 2025)
    commutingDistanceKmDaily = 0,
    commutingWorkingDaysAnnual = 226,
    commutingRateLow = 2.23,
    commutingRateHigh = 1.12,
    commutingLowThresholdKm = 24,
    commutingHighThresholdKm = 120,

    // pension
    employeePensionRate = 0,

    // Store Bededag compensation
    applyStoreBededagCompensation = false,
    storeBededagCompensationRate = 0.0045,
  } = input;

  const grossIncomeAnnualBase =
    period === "month" ? grossIncome * 12 : grossIncome;

  // Store Bededag compensation is calculated as a percentage of annual gross salary
  const storeBededagCompensationAnnual = applyStoreBededagCompensation
    ? Math.max(
        0,
        grossIncomeAnnualBase *
          Math.max(0, Math.min(1, storeBededagCompensationRate))
      )
    : 0;

  const grossIncomeAnnual =
    grossIncomeAnnualBase + storeBededagCompensationAnnual;

  // Employee pension contribution (percentage of gross salary) – tax-deductible
  const normalizedEmployeePensionRate = Math.max(
    0,
    Math.min(1, employeePensionRate)
  );
  const employeePensionContributionAnnual =
    grossIncomeAnnual * normalizedEmployeePensionRate;

  // ATP employee contribution (monthly -> annual)
  const atpSector = input.atpSector ?? "private";
  const atpMonthlyHours = input.atpMonthlyHours ?? 160;
  let atpEmployeeMonthly = 0;
  if (atpSector === "private") {
    if (atpMonthlyHours >= 117) atpEmployeeMonthly = 99.0;
    else if (atpMonthlyHours >= 78) atpEmployeeMonthly = 66.0;
    else if (atpMonthlyHours >= 39) atpEmployeeMonthly = 33.0;
    else atpEmployeeMonthly = 0;
  } else {
    // public sector
    if (atpMonthlyHours >= 117) atpEmployeeMonthly = 66.6;
    else if (atpMonthlyHours >= 78) atpEmployeeMonthly = 44.4;
    else if (atpMonthlyHours >= 39) atpEmployeeMonthly = 22.2;
    else atpEmployeeMonthly = 0;
  }
  const atpEmployeeContributionAnnual = atpEmployeeMonthly * 12;

  // AM contribution is calculated on income after ATP and employee pension
  const amBaseAnnual = Math.max(
    0,
    grossIncomeAnnual -
      atpEmployeeContributionAnnual -
      employeePensionContributionAnnual
  );
  const amContributionAnnual = Math.max(0, amBaseAnnual * amContributionRate);
  const afterAMAnnual = Math.max(0, grossIncomeAnnual - amContributionAnnual);

  // Deductions (fradrag)
  const employmentDeductionAnnual = applyEmploymentDeduction
    ? Math.min(
        afterAMAnnual * employmentDeductionRate,
        employmentDeductionCapAnnual
      )
    : 0;
  const singleParentEmploymentSupplementAnnual =
    applyEmploymentDeduction && singleParent
      ? Math.min(
          afterAMAnnual * singleParentEmploymentSupplementRate,
          singleParentEmploymentSupplementCapAnnual
        )
      : 0;
  const jobDeductionEligible = Math.max(
    0,
    afterAMAnnual - jobDeductionThresholdAnnual
  );
  const jobDeductionAnnual = applyJobDeduction
    ? Math.min(jobDeductionEligible * jobDeductionRate, jobDeductionCapAnnual)
    : 0;

  // Befordringsfradrag (daily, based on total daily round-trip distance)
  const dailyKm = Math.max(0, commutingDistanceKmDaily);
  const band1Km = Math.max(
    0,
    Math.min(dailyKm, commutingHighThresholdKm) - commutingLowThresholdKm
  );
  const band2Km = Math.max(0, dailyKm - commutingHighThresholdKm);
  const commutingDeductionDaily =
    band1Km * commutingRateLow + band2Km * commutingRateHigh;
  const commutingDeductionAnnual =
    commutingDeductionDaily * Math.max(0, commutingWorkingDaysAnnual);

  const pensionContributionAnnual = employeePensionContributionAnnual;

  const totalDeductionsAnnual =
    personalAllowanceAnnual +
    employmentDeductionAnnual +
    singleParentEmploymentSupplementAnnual +
    jobDeductionAnnual +
    commutingDeductionAnnual +
    pensionContributionAnnual;

  // Taxable income for municipal, church and state bottom tax
  const taxableIncomeAnnual = Math.max(
    0,
    afterAMAnnual - totalDeductionsAnnual
  );

  // State bottom tax on the full taxable income
  const stateBottomTaxAnnual = taxableIncomeAnnual * bottomStateTaxRate;

  // State top tax only on amount above threshold
  // Top tax is calculated on personal income after AM and deductions in personal income (e.g., pension)
  const topPersonalIncomeAnnual = Math.max(
    0,
    afterAMAnnual - employeePensionContributionAnnual
  );
  const topBase = Math.max(0, topPersonalIncomeAnnual - topTaxThresholdAnnual);
  const stateTopTaxAnnual = topBase * topStateTaxRate;

  // Municipal and optional church tax on taxable income
  const municipalTaxAnnual = taxableIncomeAnnual * municipalTaxRate;
  const churchTaxAnnual = includeChurchTax
    ? taxableIncomeAnnual * churchTaxRate
    : 0;

  const totalTaxAnnual =
    stateBottomTaxAnnual +
    stateTopTaxAnnual +
    municipalTaxAnnual +
    churchTaxAnnual;

  const netIncomeAnnual = Math.max(
    0,
    grossIncomeAnnual -
      amContributionAnnual -
      atpEmployeeContributionAnnual -
      totalTaxAnnual -
      employeePensionContributionAnnual
  );
  const netIncomePeriod =
    period === "month" ? netIncomeAnnual / 12 : netIncomeAnnual;

  return {
    basis: {
      period,
      grossIncomePeriod: grossIncome,
      grossIncomeAnnual,
    },
    contributions: {
      amContributionAnnual,
      atpEmployeeContributionAnnual,
      employeePensionContributionAnnual,
    },
    supplements: {
      storeBededagCompensationAnnual,
    },
    deductions: {
      personalAllowanceAnnual,
      employmentDeductionAnnual,
      singleParentEmploymentSupplementAnnual,
      jobDeductionAnnual,
      commutingDeductionAnnual,
      pensionContributionAnnual,
      totalDeductionsAnnual,
    },
    taxable: {
      taxableIncomeAnnual,
      personalAllowanceAnnual,
    },
    taxes: {
      municipalTaxAnnual,
      churchTaxAnnual,
      stateBottomTaxAnnual,
      stateTopTaxAnnual,
      totalTaxAnnual,
    },
    totals: {
      netIncomeAnnual,
      netIncomePeriod,
    },
  };
}
