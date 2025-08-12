import type { TaxInput, TaxBreakdown } from "./types";
import { toAnnual, clamp } from "./math";
import { computeAtpEmployeeContributionAnnual } from "./atp";
import { computeEmployeePensionContributionAnnual } from "./pension";
import { computeAMContributions } from "./am";
import {
  computeCommutingDeductionAnnual,
  computeEmploymentDeductionAnnual,
  computeJobDeductionAnnual,
  computeSingleParentEmploymentSupplementAnnual,
} from "./deductions";
import {
  computeTaxableBottomStateAnnual,
  computeTaxableMunicipalAnnual,
  computeTopTaxBaseAnnual,
} from "./taxable";
import { computeMunicipalAndChurchTaxes, computeStateTaxes } from "./taxes";

export function computeTaxBreakdown(input: TaxInput): TaxBreakdown {
  const {
    grossIncome,
    period,
    municipalTaxRate = 0.25,
    includeChurchTax = false,
    churchTaxRate = 0.0066,
    amContributionRate = 0.08,
    bottomStateTaxRate = 0.1201,
    topStateTaxRate = 0.15,
    topTaxThresholdAnnual = 588_900,
    personalAllowanceAnnual = 51_600,

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

    commutingDistanceKmDaily = 0,
    commutingWorkingDaysAnnual = 226,
    commutingRateLow = 2.23,
    commutingRateHigh = 1.12,
    commutingLowThresholdKm = 24,
    commutingHighThresholdKm = 120,

    employeePensionRate = 0,

    applyStoreBededagCompensation = false,
    storeBededagCompensationRate = 0.0045,
  } = input;

  // Annualize base income
  const grossIncomeAnnualBase = toAnnual(grossIncome, period);

  // Store Bededag compensation on gross income
  const storeBededagCompensationAnnual = applyStoreBededagCompensation
    ? Math.max(
        0,
        grossIncomeAnnualBase * clamp(storeBededagCompensationRate, 0, 1)
      )
    : 0;

  const grossIncomeAnnual =
    grossIncomeAnnualBase + storeBededagCompensationAnnual;

  // Employee pension contribution (deductible)
  const { contributionAnnual: employeePensionContributionAnnual } =
    computeEmployeePensionContributionAnnual(
      grossIncomeAnnual,
      employeePensionRate
    );

  // ATP employee (monthly thresholds → annual)
  const atpEmployeeContributionAnnual = computeAtpEmployeeContributionAnnual(
    input.atpSector ?? "private",
    input.atpMonthlyHours ?? 160
  );

  // AM contribution
  const { amContributionAnnual, afterAMAnnual } = computeAMContributions(
    grossIncomeAnnual,
    atpEmployeeContributionAnnual,
    employeePensionContributionAnnual,
    amContributionRate
  );

  // Deductions
  const employmentDeductionAnnual = computeEmploymentDeductionAnnual(
    afterAMAnnual,
    applyEmploymentDeduction,
    employmentDeductionRate,
    employmentDeductionCapAnnual
  );

  const singleParentEmploymentSupplementAnnual =
    computeSingleParentEmploymentSupplementAnnual(
      afterAMAnnual,
      applyEmploymentDeduction,
      singleParent,
      singleParentEmploymentSupplementRate,
      singleParentEmploymentSupplementCapAnnual
    );

  const jobDeductionAnnual = computeJobDeductionAnnual(
    afterAMAnnual,
    applyJobDeduction,
    jobDeductionRate,
    jobDeductionThresholdAnnual,
    jobDeductionCapAnnual
  );

  const commutingDeductionAnnual = computeCommutingDeductionAnnual(
    commutingDistanceKmDaily,
    commutingWorkingDaysAnnual,
    commutingRateLow,
    commutingRateHigh,
    commutingLowThresholdKm,
    commutingHighThresholdKm
  );

  const pensionContributionAnnual = employeePensionContributionAnnual;

  const totalDeductionsAnnual =
    personalAllowanceAnnual +
    employmentDeductionAnnual +
    singleParentEmploymentSupplementAnnual +
    jobDeductionAnnual +
    commutingDeductionAnnual +
    pensionContributionAnnual;

  // Taxable bases
  const taxableMunicipalAnnual = computeTaxableMunicipalAnnual(
    afterAMAnnual,
    totalDeductionsAnnual
  );
  const taxableChurchAnnual = computeTaxableMunicipalAnnual(
    afterAMAnnual,
    totalDeductionsAnnual
  );
  const taxableBottomStateAnnual = computeTaxableBottomStateAnnual(
    afterAMAnnual,
    personalAllowanceAnnual,
    pensionContributionAnnual
  );

  const { topBaseAnnual } = computeTopTaxBaseAnnual(
    afterAMAnnual,
    employeePensionContributionAnnual,
    topTaxThresholdAnnual
  );

  // Taxes
  const { municipalTaxAnnual, churchTaxAnnual } =
    computeMunicipalAndChurchTaxes(
      taxableMunicipalAnnual,
      taxableChurchAnnual,
      municipalTaxRate,
      includeChurchTax,
      churchTaxRate
    );

  const { stateBottomTaxAnnual, stateTopTaxAnnual } = computeStateTaxes(
    taxableBottomStateAnnual,
    bottomStateTaxRate,
    topBaseAnnual,
    topStateTaxRate
  );

  const totalTaxAnnual =
    stateBottomTaxAnnual +
    stateTopTaxAnnual +
    municipalTaxAnnual +
    churchTaxAnnual;

  // Totals
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

  // Build breakdown
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
      taxableMunicipalAnnual,
      taxableBottomStateAnnual,
      taxableTopStateAnnual: topBaseAnnual,
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
