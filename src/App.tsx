import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { computeTaxBreakdown, type Period } from "@/lib/tax";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDKK(value: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(rate: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(rate);
}

function AnimatedNumber({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 450,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState<number>(value);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const fromValueRef = useRef<number>(value);

  useEffect(() => {
    // Start animation from the current displayed value
    fromValueRef.current = displayed;
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic for a smooth finish
      const eased = 1 - Math.pow(1 - t, 3);
      const next =
        fromValueRef.current + (value - fromValueRef.current) * eased;
      setDisplayed(next);
      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{format(displayed)}</span>;
}

function App() {
  const [gross, setGross] = useState<string>("");
  const [period, setPeriod] = useState<Period>("month");
  const [includeChurch, setIncludeChurch] = useState<boolean>(false);
  const [municipalityId, setMunicipalityId] = useState<string>("koebenhavn");
  const [singleParent, setSingleParent] = useState<boolean>(false);
  const [commuteKm, setCommuteKm] = useState<string>("");
  const [workDays, setWorkDays] = useState<string>("226");
  const [atpSector, setAtpSector] = useState<"private" | "public">("private");
  const [atpHours, setAtpHours] = useState<string>("160");
  const [employeePensionRate, setEmployeePensionRate] = useState<string>("");
  const [applyStoreBededag, setApplyStoreBededag] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const periodLabel = period === "month" ? "måned" : "år";
  const showPeriodValue = (annual: number) =>
    period === "month" ? annual / 12 : annual;

  const selectedMunicipality = useMemo(
    () => MUNICIPALITIES.find((m) => m.id === municipalityId),
    [municipalityId]
  );

  const result = useMemo(() => {
    const parsed = Number(gross.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    const municipalRate = selectedMunicipality?.municipalTaxRate ?? 0.25;

    return computeTaxBreakdown({
      grossIncome: parsed,
      period,
      includeChurchTax: includeChurch,
      municipalTaxRate: municipalRate,
      churchTaxRate: selectedMunicipality?.churchTaxRate,
      singleParent,
      commutingDistanceKmDaily: Number(commuteKm) || 0,
      commutingWorkingDaysAnnual: Number(workDays) || 226,
      atpSector,
      atpMonthlyHours: Number(atpHours) || 0,
      employeePensionRate: (() => {
        const pct = Number(employeePensionRate);
        if (!Number.isFinite(pct)) return 0;
        return Math.max(0, Math.min(1, pct / 100));
      })(),
      applyStoreBededagCompensation: applyStoreBededag,
    });
  }, [
    gross,
    period,
    includeChurch,
    selectedMunicipality,
    singleParent,
    commuteKm,
    workDays,
    atpSector,
    atpHours,
    employeePensionRate,
    applyStoreBededag,
  ]);

  // Removed municipality search; show full list directly

  const handlePeriodChange = (nextPeriod: Period) => {
    if (nextPeriod === period) return;
    const parsedGross = Number(gross.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsedGross) && parsedGross > 0) {
      const convertedGross =
        nextPeriod === "year" ? parsedGross * 12 : parsedGross / 12;
      setGross(String(Math.round(convertedGross)));
    }
    setPeriod(nextPeriod);
  };

  const SignedAmount = ({
    value,
    variant,
    bold = false,
  }: {
    value: number;
    variant: "neg" | "pos" | "neutral" | "deduction";
    bold?: boolean;
  }) => {
    const colorClass =
      variant === "neg"
        ? "text-red-600"
        : variant === "pos"
        ? "text-emerald-600"
        : variant === "deduction"
        ? "text-muted-foreground"
        : "text-foreground";
    const sign = variant === "neg" ? "-" : variant === "pos" ? "+" : "";
    return (
      <span className={cn("text-right", bold ? "font-medium" : "", colorClass)}>
        {sign}
        {formatDKK(showPeriodValue(value))}
      </span>
    );
  };

  return (
    <div className="min-h-dvh w-full flex items-start justify-center p-6">
      <Card className="w-full max-w-xl ring-4 ring-primary">
        <CardHeader>
          <CardTitle className="text-3xl">Dansk lønberegner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gross">Løn før skat</Label>
              <Input
                id="gross"
                inputMode="decimal"
                type="text"
                placeholder={period === "month" ? "fx 45.000" : "fx 540.000"}
                value={gross}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGross(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Periode</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={period === "month" ? "default" : "outline"}
                  onClick={() => handlePeriodChange("month")}
                  className="flex-1">
                  Måned
                </Button>
                <Button
                  type="button"
                  variant={period === "year" ? "default" : "outline"}
                  onClick={() => handlePeriodChange("year")}
                  className="flex-1">
                  År
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="municipality">Kommune</Label>
              <Select value={municipalityId} onValueChange={setMunicipalityId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Vælg kommune" />
                </SelectTrigger>
                <SelectContent>
                  {MUNICIPALITIES.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({formatPct(m.municipalTaxRate)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Removed custom municipal override */}
          </div>

          <div className="mb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full sm:w-auto">
              {showAdvanced
                ? "Skjul avancerede indstillinger"
                : "Vis avancerede indstillinger"}
            </Button>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              showAdvanced ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
            )}
            aria-hidden={!showAdvanced}>
            <div className="overflow-hidden">
              <div className="space-y-4 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <input
                    id="church"
                    type="checkbox"
                    className="h-4 w-4 accent-foreground"
                    checked={includeChurch}
                    onChange={(e) => setIncludeChurch(e.target.checked)}
                  />
                  <Label htmlFor="church">
                    Inkluder kirkeskat (
                    {selectedMunicipality
                      ? formatPct(selectedMunicipality.churchTaxRate)
                      : "ca. 0,87 %"}
                    )
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="single-parent"
                    type="checkbox"
                    className="h-4 w-4 accent-foreground"
                    checked={singleParent}
                    onChange={(e) => setSingleParent(e.target.checked)}
                  />
                  <Label htmlFor="single-parent">Enlig forsørger</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="storebededag"
                    type="checkbox"
                    className="h-4 w-4 accent-foreground"
                    checked={applyStoreBededag}
                    onChange={(e) => setApplyStoreBededag(e.target.checked)}
                  />
                  <Label htmlFor="storebededag">
                    Store bededag kompensation (0,45 %)
                  </Label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commuteKm">
                      Afstand hjem-arbejde (km tur/retur)
                    </Label>
                    <Input
                      id="commuteKm"
                      inputMode="decimal"
                      type="text"
                      placeholder="fx 60"
                      value={commuteKm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCommuteKm(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workDays">Arbejdsdage pr. år</Label>
                    <Input
                      id="workDays"
                      inputMode="numeric"
                      type="text"
                      placeholder="226"
                      value={workDays}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setWorkDays(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="atpSector">ATP sektor</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          atpSector === "private" ? "default" : "outline"
                        }
                        onClick={() => setAtpSector("private")}
                        className="flex-1">
                        Privat
                      </Button>
                      <Button
                        type="button"
                        variant={atpSector === "public" ? "default" : "outline"}
                        onClick={() => setAtpSector("public")}
                        className="flex-1">
                        Offentlig
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="atpHours">Månedlige arbejdstimer</Label>
                    <Input
                      id="atpHours"
                      inputMode="numeric"
                      type="text"
                      placeholder="fx 160"
                      value={atpHours}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAtpHours(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeePensionRate">
                      Eget pensionsbidrag (%)
                    </Label>
                    <Input
                      id="employeePensionRate"
                      inputMode="decimal"
                      type="text"
                      placeholder="fx 12"
                      value={employeePensionRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmployeePensionRate(e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results area with smooth expand from bottom */}
          {!result && (
            <div
              role="note"
              className="flex items-start gap-2 rounded-md border bg-accent p-3 text-sm text-muted-foreground mb-0">
              <Info
                className="h-4 w-4 mt-0.5 text-foreground"
                aria-hidden="true"
              />
              <div>Indtast din løn for at se resultatet.</div>
            </div>
          )}

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              result ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
            aria-hidden={!result}>
            <div className="overflow-hidden">
              <div
                className={cn(
                  "grid gap-3",
                  result
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2",
                  "transition-all duration-300"
                )}>
                {result && (
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
                        <div className="mt-0.5">
                          Reel skat:{" "}
                          {formatPct(
                            Math.max(
                              0,
                              Math.min(
                                1,
                                (result.taxes.totalTaxAnnual +
                                  result.contributions.amContributionAnnual) /
                                  Math.max(1, result.basis.grossIncomeAnnual)
                              )
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowBreakdown((v) => !v)}
                        aria-expanded={showBreakdown}
                        className="w-full sm:w-auto mt-2">
                        {showBreakdown ? "Skjul opdeling" : "Vis opdeling"}
                      </Button>
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
                            {result && (
                              <SignedAmount
                                value={result.basis.grossIncomeAnnual}
                                variant="neutral"
                                bold
                              />
                            )}
                          </div>

                          <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Bidrag (før skat)
                          </div>
                          {result &&
                            result.contributions
                              .employeePensionContributionAnnual > 0 && (
                              <div className="grid grid-cols-2 text-sm">
                                <span className="text-muted-foreground">
                                  Eget pensionsbidrag
                                </span>
                                <SignedAmount
                                  value={
                                    result.contributions
                                      .employeePensionContributionAnnual
                                  }
                                  variant="neg"
                                />
                              </div>
                            )}
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              ATP (medarbejder)
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.contributions
                                    .atpEmployeeContributionAnnual
                                }
                                variant="neg"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              AM-bidrag (8 %)
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.contributions.amContributionAnnual
                                }
                                variant="neg"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="font-medium">Bidrag i alt</span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.contributions.amContributionAnnual +
                                  result.contributions
                                    .atpEmployeeContributionAnnual +
                                  result.contributions
                                    .employeePensionContributionAnnual
                                }
                                variant="neg"
                                bold
                              />
                            )}
                          </div>
                          <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Fradrag
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Personfradrag
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.deductions.personalAllowanceAnnual
                                }
                                variant="deduction"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Beskæftigelsesfradrag
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.deductions.employmentDeductionAnnual
                                }
                                variant="deduction"
                              />
                            )}
                          </div>
                          {result &&
                            result.deductions.pensionContributionAnnual > 0 && (
                              <div className="grid grid-cols-2 text-sm">
                                <span className="text-muted-foreground">
                                  Pensionsfradrag
                                </span>
                                <SignedAmount
                                  value={
                                    result.deductions.pensionContributionAnnual
                                  }
                                  variant="deduction"
                                />
                              </div>
                            )}
                          {result &&
                            result.deductions
                              .singleParentEmploymentSupplementAnnual > 0 && (
                              <div className="grid grid-cols-2 text-sm">
                                <span className="text-muted-foreground">
                                  Ekstra beskæftigelsesfradrag (enlig)
                                </span>
                                <SignedAmount
                                  value={
                                    result.deductions
                                      .singleParentEmploymentSupplementAnnual
                                  }
                                  variant="deduction"
                                />
                              </div>
                            )}
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Jobfradrag
                            </span>
                            {result && (
                              <SignedAmount
                                value={result.deductions.jobDeductionAnnual}
                                variant="deduction"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Befordringsfradrag
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.deductions.commutingDeductionAnnual
                                }
                                variant="deduction"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="font-medium">Fradrag i alt</span>
                            {result && (
                              <SignedAmount
                                value={result.deductions.totalDeductionsAnnual}
                                variant="deduction"
                                bold
                              />
                            )}
                          </div>

                          <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Skattepligtig indkomst
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Skattepligtig indkomst
                            </span>
                            {result && (
                              <SignedAmount
                                value={result.taxable.taxableIncomeAnnual}
                                variant="neutral"
                                bold
                              />
                            )}
                          </div>
                          <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Skatter
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Kommuneskat
                            </span>
                            {result && (
                              <SignedAmount
                                value={result.taxes.municipalTaxAnnual}
                                variant="neg"
                              />
                            )}
                          </div>
                          {includeChurch && result && (
                            <div className="grid grid-cols-2 text-sm">
                              <span className="text-muted-foreground">
                                Kirkeskat
                              </span>
                              <SignedAmount
                                value={result.taxes.churchTaxAnnual}
                                variant="neg"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">
                              Bundskat (stat)
                            </span>
                            {result && (
                              <SignedAmount
                                value={result.taxes.stateBottomTaxAnnual}
                                variant="neg"
                              />
                            )}
                          </div>
                          {result && result.taxes.stateTopTaxAnnual > 0 && (
                            <div className="grid grid-cols-2 text-sm">
                              <span className="text-muted-foreground">
                                Topskat (stat)
                              </span>
                              <SignedAmount
                                value={result.taxes.stateTopTaxAnnual}
                                variant="neg"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 text-sm">
                            <span className="font-medium">Skat i alt</span>
                            {result && (
                              <SignedAmount
                                value={result.taxes.totalTaxAnnual}
                                variant="neg"
                                bold
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 border-t pt-3 text-sm">
                            <span className="text-muted-foreground">
                              Samlede skatter og bidrag
                            </span>
                            {result && (
                              <SignedAmount
                                value={
                                  result.taxes.totalTaxAnnual +
                                  result.contributions.amContributionAnnual +
                                  result.contributions
                                    .atpEmployeeContributionAnnual +
                                  result.contributions
                                    .employeePensionContributionAnnual
                                }
                                variant="neg"
                                bold
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 text-base">
                            <span className="font-medium">Nettoløn</span>
                            <span className="text-right font-semibold">
                              {result &&
                                formatDKK(result.totals.netIncomePeriod)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
