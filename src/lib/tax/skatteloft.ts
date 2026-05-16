// Personskattelovens §19 — horisontalt skatteloft.
// If the sum of state-bracket rates + kommune for a given personal-income
// bracket exceeds the bracket's loft, the highest-bracket rate gets a
// nedslag (in percentage points) that brings the total down to the loft.
// AM-bidrag and kirkeskat are excluded from the loft.

export interface SkatteloftInput {
  bundskat: number;
  middle?: number; // mellemskat rate (undefined => bracket inactive)
  top?: number; // topskat rate
  topTop?: number; // top-topskat rate
  kommune: number;
  loftMiddle?: number;
  loftTop?: number;
  loftTopTop?: number;

  middleBaseAnnual: number;
  topBaseAnnual: number;
  topTopBaseAnnual: number;
}

export interface SkatteloftResult {
  // Tax amounts AFTER any nedslag has been applied per bracket.
  middleTaxAnnual: number;
  topTaxAnnual: number;
  topTopTaxAnnual: number;
  // Effective rates after nedslag (for diagnostics / future UI hooks).
  effectiveMiddleRate: number;
  effectiveTopRate: number;
  effectiveTopTopRate: number;
  // Total DKK reduction caused by the loft (positive number).
  nedslagAnnual: number;
}

function reduce(rate: number, excessPP: number): number {
  return Math.max(0, rate - Math.max(0, excessPP));
}

export function applySkatteloft(input: SkatteloftInput): SkatteloftResult {
  const {
    bundskat,
    middle = 0,
    top = 0,
    topTop = 0,
    kommune,
    loftMiddle,
    loftTop,
    loftTopTop,
    middleBaseAnnual,
    topBaseAnnual,
    topTopBaseAnnual,
  } = input;

  // Per the law the loft applies independently to each bracket. The reduction
  // in each bracket reduces only that bracket's tax (it does not change the
  // lower brackets' tax amounts).
  let effMiddle = middle;
  let effTop = top;
  let effTopTop = topTop;

  if (middle > 0 && loftMiddle !== undefined) {
    const marginal = bundskat + middle + kommune;
    const excess = Math.max(0, marginal - loftMiddle);
    effMiddle = reduce(middle, excess);
  }

  if (top > 0 && loftTop !== undefined) {
    const marginal = bundskat + middle + top + kommune;
    const excess = Math.max(0, marginal - loftTop);
    effTop = reduce(top, excess);
  }

  if (topTop > 0 && loftTopTop !== undefined) {
    const marginal = bundskat + middle + top + topTop + kommune;
    const excess = Math.max(0, marginal - loftTopTop);
    effTopTop = reduce(topTop, excess);
  }

  const middleTaxAnnual = effMiddle * Math.max(0, middleBaseAnnual);
  const topTaxAnnual = effTop * Math.max(0, topBaseAnnual);
  const topTopTaxAnnual = effTopTop * Math.max(0, topTopBaseAnnual);

  const nominalTotal =
    middle * Math.max(0, middleBaseAnnual) +
    top * Math.max(0, topBaseAnnual) +
    topTop * Math.max(0, topTopBaseAnnual);
  const effectiveTotal = middleTaxAnnual + topTaxAnnual + topTopTaxAnnual;
  const nedslagAnnual = Math.max(0, nominalTotal - effectiveTotal);

  return {
    middleTaxAnnual,
    topTaxAnnual,
    topTopTaxAnnual,
    effectiveMiddleRate: effMiddle,
    effectiveTopRate: effTop,
    effectiveTopTopRate: effTopTop,
    nedslagAnnual,
  };
}
