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
  commutingHighThresholdKm: number,
  isYderkommune = false,
  commutingYderkommuneRate = commutingRateLow
): number {
  const dailyKm = Math.max(0, commutingDistanceKmDaily);
  const days = Math.max(0, commutingWorkingDaysAnnual);

  // Yderkommune/småø residents (LL §9C stk 3) apply a single rate to every km
  // over the lower threshold — the over-120 km reduction does not apply.
  if (isYderkommune) {
    const deductibleKm = Math.max(0, dailyKm - commutingLowThresholdKm);
    return deductibleKm * commutingYderkommuneRate * days;
  }

  const band1Km = Math.max(
    0,
    Math.min(dailyKm, commutingHighThresholdKm) - commutingLowThresholdKm
  );
  const band2Km = Math.max(0, dailyKm - commutingHighThresholdKm);
  const commutingDeductionDaily =
    band1Km * commutingRateLow + band2Km * commutingRateHigh;
  return commutingDeductionDaily * days;
}

// Ekstra befordringsfradrag for personer med lav indkomst (LL §9C stk 4).
// The supplement is `rate` (64 %) of the ordinary commuting deduction, capped
// at `maxAnnual`. For income above the full threshold both the rate and the cap
// taper linearly to zero at the zero threshold (the statutory 1,28 pct-point /
// 2,0 % reductions per 1.000 kr over a 50.000 kr span are equivalent to this
// single linear fraction).
export function computeCommutingLowIncomeSupplementAnnual(
  ordinaryCommutingDeductionAnnual: number,
  incomeForTaperAnnual: number,
  rate: number,
  maxAnnual: number,
  fullThresholdAnnual: number,
  zeroThresholdAnnual: number
): number {
  if (ordinaryCommutingDeductionAnnual <= 0 || rate <= 0 || maxAnnual <= 0) {
    return 0;
  }
  const span = Math.max(1, zeroThresholdAnnual - fullThresholdAnnual);
  const taper = Math.min(
    1,
    Math.max(0, (incomeForTaperAnnual - fullThresholdAnnual) / span)
  );
  const effectiveRate = rate * (1 - taper);
  const effectiveMax = maxAnnual * (1 - taper);
  return Math.min(
    ordinaryCommutingDeductionAnnual * effectiveRate,
    effectiveMax
  );
}
