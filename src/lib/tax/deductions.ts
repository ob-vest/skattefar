export function computeEmploymentDeductionAnnual(
  afterAMAnnual: number,
  applyEmploymentDeduction: boolean,
  employmentDeductionRate: number,
  employmentDeductionCapAnnual: number
): number {
  if (!applyEmploymentDeduction) return 0;
  return Math.min(
    afterAMAnnual * employmentDeductionRate,
    employmentDeductionCapAnnual
  );
}

export function computeSingleParentEmploymentSupplementAnnual(
  afterAMAnnual: number,
  applyEmploymentDeduction: boolean,
  singleParent: boolean,
  singleParentEmploymentSupplementRate: number,
  singleParentEmploymentSupplementCapAnnual: number
): number {
  if (!applyEmploymentDeduction || !singleParent) return 0;
  return Math.min(
    afterAMAnnual * singleParentEmploymentSupplementRate,
    singleParentEmploymentSupplementCapAnnual
  );
}

export function computeJobDeductionAnnual(
  afterAMAnnual: number,
  applyJobDeduction: boolean,
  jobDeductionRate: number,
  jobDeductionThresholdAnnual: number,
  jobDeductionCapAnnual: number
): number {
  if (!applyJobDeduction) return 0;
  const eligible = Math.max(0, afterAMAnnual - jobDeductionThresholdAnnual);
  return Math.min(eligible * jobDeductionRate, jobDeductionCapAnnual);
}

export function computeCommutingDeductionAnnual(
  commutingDistanceKmDaily: number,
  commutingWorkingDaysAnnual: number,
  commutingRateLow: number,
  commutingRateHigh: number,
  commutingLowThresholdKm: number,
  commutingHighThresholdKm: number
): number {
  const dailyKm = Math.max(0, commutingDistanceKmDaily);
  const band1Km = Math.max(
    0,
    Math.min(dailyKm, commutingHighThresholdKm) - commutingLowThresholdKm
  );
  const band2Km = Math.max(0, dailyKm - commutingHighThresholdKm);
  const commutingDeductionDaily =
    band1Km * commutingRateLow + band2Km * commutingRateHigh;
  return commutingDeductionDaily * Math.max(0, commutingWorkingDaysAnnual);
}
