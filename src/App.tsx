import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeTaxBreakdown, type Period } from "@/lib/tax";
import {
  DEFAULT_CONFIG,
  type AppConfig,
  loadLastConfig,
  saveLastConfig,
  areConfigsEqual,
  clearLastConfig,
} from "@/lib/config";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { IncomePeriodInputs } from "@/components/inputs/IncomePeriodInputs";
import { MunicipalitySelect } from "@/components/inputs/MunicipalitySelect";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { ResultsCard } from "@/components/results/ResultsCard";
import { toast } from "sonner";

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

  const loadConfigFromStorage = () => loadLastConfig();

  useEffect(() => {
    const cfg = loadConfigFromStorage();
    if (!cfg) return;
    setGross(cfg.gross);
    setPeriod(cfg.period);
    setIncludeChurch(cfg.includeChurch);
    setMunicipalityId(cfg.municipalityId);
    setSingleParent(cfg.singleParent);
    setCommuteKm(cfg.commuteKm);
    setWorkDays(cfg.workDays);
    setAtpSector(cfg.atpSector);
    setAtpHours(cfg.atpHours);
    setEmployeePensionRate(cfg.employeePensionRate);
    setApplyStoreBededag(cfg.applyStoreBededag);
  }, []);

  const selectedMunicipality = useMemo(
    () => MUNICIPALITIES.find((m) => m.id === municipalityId),
    [municipalityId]
  );

  const result = useMemo(() => {
    const parsed = Number(gross.replace(/\D+/g, ""));
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

  // Convert gross when switching period if possible
  const handlePeriodChange = (nextPeriod: Period, maybeConvertGross = true) => {
    if (nextPeriod === period) return;
    if (maybeConvertGross) {
      const parsedGross = Number(gross.replace(/\D+/g, ""));
      if (Number.isFinite(parsedGross) && parsedGross > 0) {
        const convertedGross =
          nextPeriod === "year" ? parsedGross * 12 : parsedGross / 12;
        setGross(String(Math.round(convertedGross)));
      }
    }
    setPeriod(nextPeriod);
  };

  const handleSaveConfig = () => {
    const payload: AppConfig = {
      gross,
      period,
      includeChurch,
      municipalityId,
      singleParent,
      commuteKm,
      workDays,
      atpSector,
      atpHours,
      employeePensionRate,
      applyStoreBededag,
    };
    const ok = saveLastConfig(payload);
    if (ok) toast.success("Gemt!");
    else toast.error("Kunne ikke gemme");
  };

  const handleResetConfig = () => {
    setGross(DEFAULT_CONFIG.gross);
    setPeriod(DEFAULT_CONFIG.period);
    setIncludeChurch(DEFAULT_CONFIG.includeChurch);
    setMunicipalityId(DEFAULT_CONFIG.municipalityId);
    setSingleParent(DEFAULT_CONFIG.singleParent);
    setCommuteKm(DEFAULT_CONFIG.commuteKm);
    setWorkDays(DEFAULT_CONFIG.workDays);
    setAtpSector(DEFAULT_CONFIG.atpSector);
    setAtpHours(DEFAULT_CONFIG.atpHours);
    setEmployeePensionRate(DEFAULT_CONFIG.employeePensionRate);
    setApplyStoreBededag(DEFAULT_CONFIG.applyStoreBededag);
    clearLastConfig();
    toast.success(
      "Nulstillet til standard og lokal data slettet (Hvis du havde gemt)"
    );
  };

  const canReset = useMemo(() => {
    const current: AppConfig = {
      gross,
      period,
      includeChurch,
      municipalityId,
      singleParent,
      commuteKm,
      workDays,
      atpSector,
      atpHours,
      employeePensionRate,
      applyStoreBededag,
    };
    return !areConfigsEqual(current, DEFAULT_CONFIG);
  }, [
    gross,
    period,
    includeChurch,
    municipalityId,
    singleParent,
    commuteKm,
    workDays,
    atpSector,
    atpHours,
    employeePensionRate,
    applyStoreBededag,
  ]);

  return (
    <div className="min-h-dvh w-full flex items-start justify-center p-6">
      <Card className="w-full max-w-xl ring-4 ring-primary">
        <CardHeader>
          <CardTitle className="text-3xl">Dansk lønberegner</CardTitle>
          <CardAction>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetConfig}
              disabled={!canReset}
              className={cn(!canReset && "invisible")}>
              Nulstil
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <IncomePeriodInputs
            gross={gross}
            period={period}
            onGrossChange={setGross}
            onPeriodChange={handlePeriodChange}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MunicipalitySelect
              municipalityId={municipalityId}
              onChange={setMunicipalityId}
            />
            {/* Reserved column for future custom overrides */}
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
              <AdvancedSettings
                includeChurch={includeChurch}
                onIncludeChurch={setIncludeChurch}
                selectedMunicipalityId={municipalityId}
                singleParent={singleParent}
                onSingleParent={setSingleParent}
                applyStoreBededag={applyStoreBededag}
                onApplyStoreBededag={setApplyStoreBededag}
                commuteKm={commuteKm}
                onCommuteKm={setCommuteKm}
                workDays={workDays}
                onWorkDays={setWorkDays}
                atpSector={atpSector}
                onAtpSector={setAtpSector}
                atpHours={atpHours}
                onAtpHours={setAtpHours}
                employeePensionRate={employeePensionRate}
                onEmployeePensionRate={setEmployeePensionRate}
              />
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
                  <ResultsCard
                    result={result}
                    period={period}
                    showBreakdown={showBreakdown}
                    onToggleBreakdown={() => setShowBreakdown((v) => !v)}
                    onSaveConfig={handleSaveConfig}
                  />
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
