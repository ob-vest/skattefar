import type { TaxInput, TaxBreakdown } from "./types";
import { toAnnual, clamp } from "./math";
import { computeAtpEmployeeContributionAnnual } from "./atp";
import { computeEmployeePensionContributionAnnual } from "./pension";
import { computeAMContributions } from "./am";
import {
  computeCommutingDeductionAnnual,
  computeCommutingLowIncomeSupplementAnnual,
  computeEmploymentDeductionAnnual,
  computeJobDeductionAnnual,
  computeSingleParentEmploymentSupplementAnnual,
} from "./deductions";
import {
  computeBracketBaseAnnual,
  computeTaxableBundskatAnnual,
  computeTaxableMunicipalAnnual,
} from "./taxable";
import { applySkatteloft } from "./skatteloft";
import { DEFAULT_TAX_YEAR, getYearRates } from "./years";

export function computeTaxBreakdown(input: TaxInput): TaxBreakdown {
  const taxYear = input.taxYear ?? DEFAULT_TAX_YEAR;
  const yr = getYearRates(taxYear);

  const {
    grossIncome,
    period,
    municipalTaxRate = 0.25,
    includeChurchTax = false,
    churchTaxRate = 0.0066,
    amContributionRate = yr.amContributionRate,
    bottomStateTaxRate = yr.bundskat,
    middleStateTaxRate = yr.mellemskat,
    middleStateTaxThresholdAnnual = yr.mellemskatThresholdAnnual,
    topStateTaxRate = yr.topskat,
    topTaxThresholdAnnual = yr.topskatThresholdAnnual,
    topTopStateTaxRate = yr.toptopskat,
    topTopStateTaxThresholdAnnual = yr.toptopskatThresholdAnnual,
    skatteloftMiddle = yr.skatteloftMellem,
    skatteloftTop = yr.skatteloftTop,
    skatteloftTopTop = yr.skatteloftToptop,
    personalAllowanceAnnual = yr.personalAllowanceAnnual,

    applyEmploymentDeduction = true,
    employmentDeductionRate = yr.employmentDeductionRate,
    employmentDeductionCapAnnual = yr.employmentDeductionCapAnnual,
    singleParent = false,
    singleParentEmploymentSupplementRate = yr.singleParentEmploymentSupplementRate,
    singleParentEmploymentSupplementCapAnnual = yr.singleParentEmploymentSupplementCapAnnual,

    applyJobDeduction = true,
    jobDeductionRate = yr.jobDeductionRate,
    jobDeductionThresholdAnnual = yr.jobDeductionThresholdAnnual,
    jobDeductionCapAnnual = yr.jobDeductionCapAnnual,

    commutingDistanceKmDaily = 0,
    commutingWorkingDaysAnnual = 226,
    commutingRateLow = yr.commutingRateLow,
    commutingRateHigh = yr.commutingRateHigh,
    commutingLowThresholdKm = yr.commutingLowThresholdKm,
    commutingHighThresholdKm = yr.commutingHighThresholdKm,
    commutingYderkommune = false,
    commutingYderkommuneRate = yr.commutingYderkommuneRate,
    commutingLowIncomeSupplementRate = yr.commutingLowIncomeSupplementRate,
    commutingLowIncomeSupplementMaxAnnual = yr.commutingLowIncomeSupplementMaxAnnual,
    commutingLowIncomeSupplementFullThresholdAnnual = yr.commutingLowIncomeSupplementFullThresholdAnnual,
    commutingLowIncomeSupplementZeroThresholdAnnual = yr.commutingLowIncomeSupplementZeroThresholdAnnual,

    employeePensionRate = 0,

    applyStoreBededagCompensation = false,
    storeBededagCompensationRate = 0.0045,
  } = input;

  // 1. Annualize base income, add Store Bededag compensation if enabled.
  const grossIncomeAnnualBase = toAnnual(grossIncome, period);
  const storeBededagCompensationAnnual = applyStoreBededagCompensation
    ? Math.max(
        0,
        grossIncomeAnnualBase * clamp(storeBededagCompensationRate, 0, 1)
      )
    : 0;
  const grossIncomeAnnual =
    grossIncomeAnnualBase + storeBededagCompensationAnnual;

  // 2. Employee pension contribution (deductible).
  const { contributionAnnual: employeePensionContributionAnnual } =
    computeEmployeePensionContributionAnnual(
      grossIncomeAnnual,
      employeePensionRate
    );

  // 3. ATP employee (monthly thresholds → annual).
  const atpEmployeeContributionAnnual = computeAtpEmployeeContributionAnnual(
    input.atpSector ?? "private",
    input.atpMonthlyHours ?? 160,
    taxYear
  );

  // 4. AM-bidrag (8 % of brutto minus ATP minus pension).
  const { amBaseAnnual, amContributionAnnual } = computeAMContributions(
    grossIncomeAnnual,
    atpEmployeeContributionAnnual,
    employeePensionContributionAnnual,
    amContributionRate
  );

  // 5. Personlig indkomst (PSL §3) = brutto − AM − ATP − pension.
  const personalIncomeAnnual = Math.max(
    0,
    grossIncomeAnnual -
      amContributionAnnual -
      atpEmployeeContributionAnnual -
      employeePensionContributionAnnual
  );

  // 6. Beskæftigelses-/job-fradrag use "arbejdsindkomst" ≈ personalIncome
  //    with pension added back (= brutto − AM − ATP). For commuting the
  //    deduction is independent.
  const arbejdsindkomstAnnual =
    personalIncomeAnnual + employeePensionContributionAnnual;

  const employmentDeductionAnnual = computeEmploymentDeductionAnnual(
    arbejdsindkomstAnnual,
    applyEmploymentDeduction,
    employmentDeductionRate,
    employmentDeductionCapAnnual
  );

  const singleParentEmploymentSupplementAnnual =
    computeSingleParentEmploymentSupplementAnnual(
      arbejdsindkomstAnnual,
      applyEmploymentDeduction,
      singleParent,
      singleParentEmploymentSupplementRate,
      singleParentEmploymentSupplementCapAnnual
    );

  const jobDeductionAnnual = computeJobDeductionAnnual(
    arbejdsindkomstAnnual,
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
    commutingHighThresholdKm,
    commutingYderkommune,
    commutingYderkommuneRate
  );

  // Ekstra befordringsfradrag for lav indkomst (LL §9C stk 4). The taper is
  // based on the AM-bidrag-pligtige helårsindkomst (≈ AM-base).
  const commutingLowIncomeSupplementAnnual =
    computeCommutingLowIncomeSupplementAnnual(
      commutingDeductionAnnual,
      amBaseAnnual,
      commutingLowIncomeSupplementRate,
      commutingLowIncomeSupplementMaxAnnual,
      commutingLowIncomeSupplementFullThresholdAnnual,
      commutingLowIncomeSupplementZeroThresholdAnnual
    );

  // Ligningsmæssige fradrag reduce skattepligtig indkomst (kommune + kirke).
  const ligningsmaessigeFradragAnnual =
    employmentDeductionAnnual +
    singleParentEmploymentSupplementAnnual +
    jobDeductionAnnual +
    commutingDeductionAnnual +
    commutingLowIncomeSupplementAnnual;

  // 7. Skattepligtig indkomst (kommune + kirke) — personfradrag is applied
  //    by reducing the tax base.
  const taxableMunicipalAnnual = computeTaxableMunicipalAnnual(
    personalIncomeAnnual,
    ligningsmaessigeFradragAnnual,
    personalAllowanceAnnual
  );

  // 8. Bundskat base — pension is added back per PSL §7. Pension was already
  //    excluded from personalIncome, so add it back here.
  const taxableBottomStateAnnual = computeTaxableBundskatAnnual(
    personalIncomeAnnual,
    employeePensionContributionAnnual,
    personalAllowanceAnnual
  );

  // 9–11. Mellem-/top-/top-top-skat bases (pension added back, threshold subtracted).
  const taxableMiddleStateAnnual = middleStateTaxRate
    ? computeBracketBaseAnnual(
        personalIncomeAnnual,
        employeePensionContributionAnnual,
        middleStateTaxThresholdAnnual ?? Infinity
      )
    : 0;

  const taxableTopStateAnnual = computeBracketBaseAnnual(
    personalIncomeAnnual,
    employeePensionContributionAnnual,
    topTaxThresholdAnnual
  );

  const taxableTopTopStateAnnual = topTopStateTaxRate
    ? computeBracketBaseAnnual(
        personalIncomeAnnual,
        employeePensionContributionAnnual,
        topTopStateTaxThresholdAnnual ?? Infinity
      )
    : 0;

  // 12. Skatteloft — reduce per-bracket rates so state+kommune for that
  //     bracket does not exceed the loft.
  const loft = applySkatteloft({
    bundskat: bottomStateTaxRate,
    middle: middleStateTaxRate,
    top: topStateTaxRate,
    topTop: topTopStateTaxRate,
    kommune: municipalTaxRate,
    loftMiddle: skatteloftMiddle,
    loftTop: skatteloftTop,
    loftTopTop: skatteloftTopTop,
    middleBaseAnnual: taxableMiddleStateAnnual,
    topBaseAnnual: taxableTopStateAnnual,
    topTopBaseAnnual: taxableTopTopStateAnnual,
  });

  // 13. Municipal + church taxes (loft does not apply to kommune/kirke).
  const stateBottomTaxAnnual = taxableBottomStateAnnual * bottomStateTaxRate;
  const stateMiddleTaxAnnual = loft.middleTaxAnnual;
  const stateTopTaxAnnual = loft.topTaxAnnual;
  const stateTopTopTaxAnnual = loft.topTopTaxAnnual;

  const municipalTaxAnnual = taxableMunicipalAnnual * municipalTaxRate;
  const churchTaxAnnual = includeChurchTax
    ? taxableMunicipalAnnual * churchTaxRate
    : 0;

  const totalTaxAnnual =
    stateBottomTaxAnnual +
    stateMiddleTaxAnnual +
    stateTopTaxAnnual +
    stateTopTopTaxAnnual +
    municipalTaxAnnual +
    churchTaxAnnual;

  const totalDeductionsAnnual =
    personalAllowanceAnnual +
    employmentDeductionAnnual +
    singleParentEmploymentSupplementAnnual +
    jobDeductionAnnual +
    commutingDeductionAnnual +
    commutingLowIncomeSupplementAnnual +
    employeePensionContributionAnnual;

  // 15. Net income.
  const netIncomeAnnual = Math.max(
    0,
    grossIncomeAnnual -
      amContributionAnnual -
      atpEmployeeContributionAnnual -
      employeePensionContributionAnnual -
      totalTaxAnnual
  );
  const netIncomePeriod =
    period === "month" ? netIncomeAnnual / 12 : netIncomeAnnual;

  return {
    basis: {
      period,
      grossIncomePeriod: grossIncome,
      grossIncomeAnnual,
      taxYear,
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
      commutingLowIncomeSupplementAnnual,
      pensionContributionAnnual: employeePensionContributionAnnual,
      totalDeductionsAnnual,
    },
    taxable: {
      taxableMunicipalAnnual,
      taxableBottomStateAnnual,
      taxableMiddleStateAnnual,
      taxableTopStateAnnual,
      taxableTopTopStateAnnual,
      personalAllowanceAnnual,
    },
    taxes: {
      municipalTaxAnnual,
      churchTaxAnnual,
      stateBottomTaxAnnual,
      stateMiddleTaxAnnual,
      stateTopTaxAnnual,
      stateTopTopTaxAnnual,
      totalTaxAnnual,
      skatteloftNedslagAnnual: loft.nedslagAnnual,
    },
    totals: {
      netIncomeAnnual,
      netIncomePeriod,
    },
  };
}
