// Year-keyed Danish personal income tax constants.
// All thresholds are annual amounts in DKK; rates are 0..1 fractions.
// Sources:
//  - skm.dk personskatteloven satser
//  - skm.dk § 20 beløbsgrænser 2025-2026
//  - sktst.dk befordringsfradrag 2026
//  - skm.dk forhøjet befordringsfradrag (juni 2026, gælder hele indkomståret 2026)
//  - info.skat.dk C.A.4.3.3.2.2 (yderkommuner/småøer, LL §9C stk 3, 10,75 % tillæg)
//  - info.skat.dk C.A.4.3.3.2.3 (forhøjet befordringsfradrag for lav indkomst, LL §9C stk 4)
//  - borger.dk ATP-satser 2026 (privat + offentlig virksomhed)

export type TaxYear = 2025 | 2026;

export interface YearRates {
  amContributionRate: number;

  // State income tax brackets
  bundskat: number;
  // Mellemskat exists from 2026 onwards
  mellemskat?: number;
  mellemskatThresholdAnnual?: number;
  topskat: number;
  topskatThresholdAnnual: number;
  // Top-topskat exists from 2026 onwards
  toptopskat?: number;
  toptopskatThresholdAnnual?: number;

  // Skatteloft (personal-income tax ceiling, excl. AM-bidrag and church)
  skatteloftMellem?: number; // 2026+
  skatteloftTop: number;
  skatteloftToptop?: number; // 2026+

  personalAllowanceAnnual: number;

  // Beskæftigelsesfradrag
  employmentDeductionRate: number;
  employmentDeductionCapAnnual: number;
  singleParentEmploymentSupplementRate: number;
  singleParentEmploymentSupplementCapAnnual: number;

  // Jobfradrag
  jobDeductionRate: number;
  jobDeductionThresholdAnnual: number;
  jobDeductionCapAnnual: number;

  // Befordringsfradrag
  commutingRateLow: number; // DKK/km, band 25..120 km/day
  commutingRateHigh: number; // DKK/km, >120 km/day
  commutingLowThresholdKm: number; // 24 km/day (no deduction below)
  commutingHighThresholdKm: number; // 120 km/day (split point)

  // Yderkommune-sats (LL §9C stk 3 + 10,75 % tillæg, gældende 2024–2027):
  // bosiddende i en af de 25 udpegede yderkommuner / 10 småøer bruger denne
  // ene sats for ALLE km over 24/dag — ingen reduktion over 120 km.
  commutingYderkommuneRate: number; // DKK/km

  // Ekstra befordringsfradrag for personer med lav indkomst (LL §9C stk 4):
  // tillæg = rate × det almindelige befordringsfradrag, dog højst maks-beløbet.
  // Både procent og maks aftrappes lineært fra full- til zero-grænsen.
  commutingLowIncomeSupplementRate: number; // fraction, fx 0,64
  commutingLowIncomeSupplementMaxAnnual: number; // DKK loft
  commutingLowIncomeSupplementFullThresholdAnnual: number; // fuldt tillæg under denne indkomst
  commutingLowIncomeSupplementZeroThresholdAnnual: number; // bortfaldet ved/over denne indkomst

  // ATP full-time (≥117 h/month) employee monthly amount, in DKK
  atpEmployeeFulltimeMonthly: {
    private: number;
    public: number;
  };
}

export const YEAR_RATES: Record<TaxYear, YearRates> = {
  2025: {
    amContributionRate: 0.08,

    bundskat: 0.1201,
    topskat: 0.15,
    topskatThresholdAnnual: 588_900,

    // 2025 had a single horisontal skatteloft for topskat = 52.07 %
    skatteloftTop: 0.5207,

    personalAllowanceAnnual: 51_600,

    employmentDeductionRate: 0.123,
    employmentDeductionCapAnnual: 55_600,
    singleParentEmploymentSupplementRate: 0.115,
    singleParentEmploymentSupplementCapAnnual: 48_300,

    jobDeductionRate: 0.045,
    jobDeductionThresholdAnnual: 224_500,
    jobDeductionCapAnnual: 2_900,

    commutingRateLow: 2.23,
    commutingRateHigh: 1.12,
    commutingLowThresholdKm: 24,
    commutingHighThresholdKm: 120,

    // Yderkommune: 2,23 × 1,1075 (10,75 % tillæg) ≈ 2,47 kr./km for alle km over 24.
    commutingYderkommuneRate: 2.47,

    commutingLowIncomeSupplementRate: 0.64,
    commutingLowIncomeSupplementMaxAnnual: 15_400,
    commutingLowIncomeSupplementFullThresholdAnnual: 325_800,
    commutingLowIncomeSupplementZeroThresholdAnnual: 375_800,

    atpEmployeeFulltimeMonthly: {
      private: 99.0,
      public: 66.6,
    },
  },

  2026: {
    amContributionRate: 0.08,

    bundskat: 0.1201,
    mellemskat: 0.075,
    mellemskatThresholdAnnual: 641_200,
    topskat: 0.075,
    topskatThresholdAnnual: 777_900,
    toptopskat: 0.05,
    toptopskatThresholdAnnual: 2_592_700,

    skatteloftMellem: 0.4457,
    skatteloftTop: 0.5207,
    skatteloftToptop: 0.5707,

    personalAllowanceAnnual: 54_100,

    employmentDeductionRate: 0.1275,
    employmentDeductionCapAnnual: 63_300,
    singleParentEmploymentSupplementRate: 0.115,
    singleParentEmploymentSupplementCapAnnual: 50_600,

    jobDeductionRate: 0.045,
    jobDeductionThresholdAnnual: 235_200,
    jobDeductionCapAnnual: 3_100,

    // Midlertidig forhøjelse af befordringsfradraget vedtaget juni 2026.
    // Gælder for hele indkomståret 2026 (med tilbagevirkende kraft).
    //  - 25..120 km/dag: 2,28 → 3,17 kr./km (+0,89)
    //  - over 120 km/dag: 1,14 → 1,59 kr./km (+0,45)
    // (Den særlige yderkommune-/lavindkomstforhøjelse modelleres ikke her.)
    commutingRateLow: 3.17,
    commutingRateHigh: 1.59,
    commutingLowThresholdKm: 24,
    commutingHighThresholdKm: 120,

    // Yderkommune: 2,53 (2,28 × 1,1075) + 0,98 (juni-forhøjelse) = 3,51 kr./km
    // for alle km over 24 — ingen reduktion over 120 km.
    commutingYderkommuneRate: 3.51,

    // Juni 2026: maks-beløbet for lavindkomsttillægget fordoblet 15.400 → 30.800.
    commutingLowIncomeSupplementRate: 0.64,
    commutingLowIncomeSupplementMaxAnnual: 30_800,
    commutingLowIncomeSupplementFullThresholdAnnual: 341_500,
    commutingLowIncomeSupplementZeroThresholdAnnual: 391_500,

    // In 2026 public-sector default A-bidrag equalized with private.
    atpEmployeeFulltimeMonthly: {
      private: 99.0,
      public: 99.0,
    },
  },
};

export const DEFAULT_TAX_YEAR: TaxYear = 2026;

export function getYearRates(year: TaxYear | undefined): YearRates {
  return YEAR_RATES[year ?? DEFAULT_TAX_YEAR];
}
