import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { SignedAmount } from "@/components/SignedAmount";
import { formatDKK, formatPct } from "@/lib/format";
import type { TaxBreakdown, Period } from "@/lib/tax";

export function ResultsCard({
  result,
  period,
  showBreakdown,
  onToggleBreakdown,
  onSaveConfig,
}: {
  result: TaxBreakdown | null;
  period: Period;
  showBreakdown: boolean;
  onToggleBreakdown: () => void;
  onSaveConfig?: () => void;
}) {
  const periodLabel = period === "month" ? "måned" : "år";
  const periodDivisor = period === "month" ? 12 : 1;

  const realTaxRate = useMemo(() => {
    if (!result) return 0;
    const base = Math.max(1, result.basis.grossIncomeAnnual);
    const tax =
      result.taxes.totalTaxAnnual + result.contributions.amContributionAnnual;
    return Math.max(0, Math.min(1, tax / base));
  }, [result]);

  if (!result) return null;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-accent px-4 py-3 shadow-sm ring-1 ring-primary/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/15 to-transparent [mask-image:radial-gradient(280px_140px_at_85%_40%,black,transparent_65%)]" />
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Nettoløn
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <AnimatedNumber
          className="text-3xl font-bold tracking-tight drop-shadow-sm inline-block"
          value={result.totals.netIncomePeriod}
          format={(n) => formatDKK(n)}
          duration={500}
        />
        <div className="text-right text-xs text-muted-foreground">
          <div>pr. {periodLabel}</div>
          <div className="mt-0.5">Reel skat: {formatPct(realTaxRate)}</div>
        </div>
      </div>
      <div className="mt-2 flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleBreakdown}
          aria-expanded={showBreakdown}
          className="sm:w-auto">
          {showBreakdown ? "Skjul opdeling" : "Vis opdeling"}
        </Button>
        {onSaveConfig && (
          <Button type="button" onClick={onSaveConfig} className="sm:w-auto">
            Gem
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          showBreakdown ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!showBreakdown}>
        <div className="overflow-hidden">
          <div className="mt-3 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Alle beløb er pr. {periodLabel}
            </div>

            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Indkomst
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">
                Bruttoindkomst inkl. kompensation
              </span>
              <SignedAmount
                value={result.basis.grossIncomeAnnual}
                variant="neutral"
                bold
                periodDivisor={periodDivisor}
              />
            </div>

            <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Bidrag (før skat)
            </div>
            {result.contributions.employeePensionContributionAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">
                  Eget pensionsbidrag
                </span>
                <SignedAmount
                  value={result.contributions.employeePensionContributionAnnual}
                  variant="neg"
                  periodDivisor={periodDivisor}
                />
              </div>
            )}
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">ATP (medarbejder)</span>
              <SignedAmount
                value={result.contributions.atpEmployeeContributionAnnual}
                variant="neg"
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">AM-bidrag (8 %)</span>
              <SignedAmount
                value={result.contributions.amContributionAnnual}
                variant="neg"
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="font-medium">Bidrag i alt</span>
              <SignedAmount
                value={
                  result.contributions.amContributionAnnual +
                  result.contributions.atpEmployeeContributionAnnual +
                  result.contributions.employeePensionContributionAnnual
                }
                variant="neg"
                bold
                periodDivisor={periodDivisor}
              />
            </div>

            <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Fradrag
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Personfradrag</span>
              <SignedAmount
                value={result.deductions.personalAllowanceAnnual}
                variant="deduction"
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">
                Beskæftigelsesfradrag
              </span>
              <SignedAmount
                value={result.deductions.employmentDeductionAnnual}
                variant="deduction"
                periodDivisor={periodDivisor}
              />
            </div>
            {result.deductions.pensionContributionAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Pensionsfradrag</span>
                <SignedAmount
                  value={result.deductions.pensionContributionAnnual}
                  variant="deduction"
                  periodDivisor={periodDivisor}
                />
              </div>
            )}
            {result.deductions.singleParentEmploymentSupplementAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">
                  Ekstra beskæftigelsesfradrag (enlig)
                </span>
                <SignedAmount
                  value={
                    result.deductions.singleParentEmploymentSupplementAnnual
                  }
                  variant="deduction"
                  periodDivisor={periodDivisor}
                />
              </div>
            )}
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Jobfradrag</span>
              <SignedAmount
                value={result.deductions.jobDeductionAnnual}
                variant="deduction"
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Befordringsfradrag</span>
              <SignedAmount
                value={result.deductions.commutingDeductionAnnual}
                variant="deduction"
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="font-medium">Fradrag i alt</span>
              <SignedAmount
                value={result.deductions.totalDeductionsAnnual}
                variant="deduction"
                bold
                periodDivisor={periodDivisor}
              />
            </div>

            <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Skattegrundlag
            </div>

            {/* Municipal/church taxable income. They are deducted the same way, for things we are accounting for. That's why they are the same. */}
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Kommunal/kirkelig</span>
              <SignedAmount
                value={result.taxable.taxableMunicipalAnnual}
                variant="neutral"
                bold
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Bundskat (stat)</span>
              <SignedAmount
                value={result.taxable.taxableBottomStateAnnual}
                variant="neutral"
                bold
                periodDivisor={periodDivisor}
              />
            </div>
            {result.taxable.taxableTopStateAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Topskat (stat)</span>
                <SignedAmount
                  value={result.taxable.taxableTopStateAnnual}
                  variant="neutral"
                  bold
                  periodDivisor={periodDivisor}
                />
              </div>
            )}

            <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Skatter
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Kommuneskat</span>
              <SignedAmount
                value={result.taxes.municipalTaxAnnual}
                variant="neg"
                periodDivisor={periodDivisor}
              />
            </div>
            {result.taxes.churchTaxAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Kirkeskat</span>
                <SignedAmount
                  value={result.taxes.churchTaxAnnual}
                  variant="neg"
                  periodDivisor={periodDivisor}
                />
              </div>
            )}
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Bundskat (stat)</span>
              <SignedAmount
                value={result.taxes.stateBottomTaxAnnual}
                variant="neg"
                periodDivisor={periodDivisor}
              />
            </div>
            {result.taxes.stateTopTaxAnnual > 0 && (
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Topskat (stat)</span>
                <SignedAmount
                  value={result.taxes.stateTopTaxAnnual}
                  variant="neg"
                  periodDivisor={periodDivisor}
                />
              </div>
            )}
            <div className="grid grid-cols-2 text-sm">
              <span className="font-medium">Skat i alt</span>
              <SignedAmount
                value={result.taxes.totalTaxAnnual}
                variant="neg"
                bold
                periodDivisor={periodDivisor}
              />
            </div>

            <div className="grid grid-cols-2 border-t pt-3 text-sm">
              <span className="text-muted-foreground">
                Samlede skatter og bidrag
              </span>
              <SignedAmount
                value={
                  result.taxes.totalTaxAnnual +
                  result.contributions.amContributionAnnual +
                  result.contributions.atpEmployeeContributionAnnual +
                  result.contributions.employeePensionContributionAnnual
                }
                variant="neg"
                bold
                periodDivisor={periodDivisor}
              />
            </div>
            <div className="grid grid-cols-2 text-base">
              <span className="font-medium">Nettoløn</span>
              <span className="text-right font-semibold">
                {formatDKK(result.totals.netIncomePeriod)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsCard;
