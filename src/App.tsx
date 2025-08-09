import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { computeTaxBreakdown, type Period } from "@/lib/tax";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { cn } from "@/lib/utils";
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

function App() {
  const [gross, setGross] = useState<string>("");
  const [period, setPeriod] = useState<Period>("month");
  const [includeChurch, setIncludeChurch] = useState<boolean>(false);
  const [municipalityId, setMunicipalityId] = useState<string>("koebenhavn");
  const [customMunicipalRate, setCustomMunicipalRate] = useState<string>("");
  const [municipalityQuery, setMunicipalityQuery] = useState<string>("");
  const [singleParent, setSingleParent] = useState<boolean>(false);
  const [commuteKm, setCommuteKm] = useState<string>("");
  const [workDays, setWorkDays] = useState<string>("226");
  const [atpSector, setAtpSector] = useState<"private" | "public">("private");
  const [atpHours, setAtpHours] = useState<string>("160");
  const [employeePensionRate, setEmployeePensionRate] = useState<string>("");
  const [applyStoreBededag, setApplyStoreBededag] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const periodLabel = period === "month" ? "måned" : "år";
  const showPeriodValue = (annual: number) =>
    period === "month" ? annual / 12 : annual;

  const result = useMemo(() => {
    const parsed = Number(gross.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    const selected = MUNICIPALITIES.find((m) => m.id === municipalityId);
    const municipalRateFromSelection = selected?.municipalTaxRate ?? 0.25;
    const municipalRate = customMunicipalRate
      ? Math.max(0, Math.min(1, Number(customMunicipalRate) / 100))
      : municipalRateFromSelection;

    return computeTaxBreakdown({
      grossIncome: parsed,
      period,
      includeChurchTax: includeChurch,
      municipalTaxRate: municipalRate,
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
    municipalityId,
    customMunicipalRate,
    singleParent,
    commuteKm,
    workDays,
    atpSector,
    atpHours,
    employeePensionRate,
    applyStoreBededag,
  ]);

  const filteredMunicipalities = useMemo(() => {
    const q = municipalityQuery
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (!q) return MUNICIPALITIES;
    return MUNICIPALITIES.filter((m) =>
      m.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(q)
    );
  }, [municipalityQuery]);

  return (
    <div className="min-h-dvh w-full flex items-start justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl">
            Dansk indkomstskatteberegner
          </CardTitle>
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
                  onClick={() => setPeriod("month")}
                  className="flex-1">
                  Måned
                </Button>
                <Button
                  type="button"
                  variant={period === "year" ? "default" : "outline"}
                  onClick={() => setPeriod("year")}
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
                  <div className="p-1">
                    <Input
                      autoFocus
                      placeholder="Søg kommune..."
                      value={municipalityQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMunicipalityQuery(e.target.value)
                      }
                    />
                  </div>
                  {filteredMunicipalities.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({formatPct(m.municipalTaxRate)})
                    </SelectItem>
                  ))}
                  {filteredMunicipalities.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Ingen resultater
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customRate">Egen kommuneskat (%)</Label>
              <Input
                id="customRate"
                inputMode="decimal"
                type="text"
                placeholder="Lad stå tom for at bruge valgte kommune"
                value={customMunicipalRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCustomMunicipalRate(e.target.value)
                }
              />
            </div>
          </div>

          <div>
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
              showAdvanced ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                    Inkluder kirkeskat (ca. 0,66 %)
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
                      Egen pension (%)
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
            <p className="text-sm text-muted-foreground">
              Indtast din løn for at se resultatet.
            </p>
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
                  <span className="text-right font-medium">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.basis.grossIncomeAnnual)
                      )}
                  </span>
                </div>

                <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Bidrag (før skat)
                </div>
                {result &&
                  result.contributions.employeePensionContributionAnnual >
                    0 && (
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">
                        Egen pension
                      </span>
                      <span className="text-right">
                        {formatDKK(
                          showPeriodValue(
                            result.contributions
                              .employeePensionContributionAnnual
                          )
                        )}
                      </span>
                    </div>
                  )}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">AM-bidrag (8 %)</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(
                          result.contributions.amContributionAnnual
                        )
                      )}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">
                    ATP (medarbejder)
                  </span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(
                          result.contributions.atpEmployeeContributionAnnual
                        )
                      )}
                  </span>
                </div>
                <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Fradrag
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Personfradrag</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(
                          result.deductions.personalAllowanceAnnual
                        )
                      )}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">
                    Beskæftigelsesfradrag
                  </span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(
                          result.deductions.employmentDeductionAnnual
                        )
                      )}
                  </span>
                </div>
                {result && result.deductions.pensionContributionAnnual > 0 && (
                  <div className="grid grid-cols-2 text-sm">
                    <span className="text-muted-foreground">
                      Pensionsfradrag
                    </span>
                    <span className="text-right">
                      {formatDKK(
                        showPeriodValue(
                          result.deductions.pensionContributionAnnual
                        )
                      )}
                    </span>
                  </div>
                )}
                {result &&
                  result.deductions.singleParentEmploymentSupplementAnnual >
                    0 && (
                    <div className="grid grid-cols-2 text-sm">
                      <span className="text-muted-foreground">
                        Ekstra beskæftigelsesfradrag (enlig)
                      </span>
                      <span className="text-right">
                        {formatDKK(
                          showPeriodValue(
                            result.deductions
                              .singleParentEmploymentSupplementAnnual
                          )
                        )}
                      </span>
                    </div>
                  )}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Jobfradrag</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.deductions.jobDeductionAnnual)
                      )}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">
                    Befordringsfradrag
                  </span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(
                          result.deductions.commutingDeductionAnnual
                        )
                      )}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Fradrag i alt</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.deductions.totalDeductionsAnnual)
                      )}
                  </span>
                </div>

                <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Skattepligtig indkomst
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">
                    Skattepligtig indkomst
                  </span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.taxable.taxableIncomeAnnual)
                      )}
                  </span>
                </div>
                <div className="pt-2 border-t mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Skatter
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Kommuneskat</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.taxes.municipalTaxAnnual)
                      )}
                  </span>
                </div>
                {includeChurch && result && (
                  <div className="grid grid-cols-2 text-sm">
                    <span className="text-muted-foreground">Kirkeskat</span>
                    <span className="text-right">
                      {formatDKK(showPeriodValue(result.taxes.churchTaxAnnual))}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Bundskat (stat)</span>
                  <span className="text-right">
                    {result &&
                      formatDKK(
                        showPeriodValue(result.taxes.stateBottomTaxAnnual)
                      )}
                  </span>
                </div>
                {result && result.taxes.stateTopTaxAnnual > 0 && (
                  <div className="grid grid-cols-2 text-sm">
                    <span className="text-muted-foreground">
                      Topskat (stat)
                    </span>
                    <span className="text-right">
                      {formatDKK(
                        showPeriodValue(result.taxes.stateTopTaxAnnual)
                      )}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 border-t pt-3 text-sm">
                  <span className="text-muted-foreground">Samlede skatter</span>
                  <span className="text-right font-medium">
                    {result &&
                      formatDKK(showPeriodValue(result.taxes.totalTaxAnnual))}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-base">
                  <span className="font-medium">Nettoløn</span>
                  <span className="text-right font-semibold">
                    {result && formatDKK(result.totals.netIncomePeriod)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
