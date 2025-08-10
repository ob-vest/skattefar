import * as React from "react";
import { formatNumberDa } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Period } from "@/lib/tax";

export function IncomePeriodInputs({
  gross,
  period,
  onGrossChange,
  onPeriodChange,
}: {
  gross: string;
  period: Period;
  onGrossChange: (value: string) => void;
  onPeriodChange: (next: Period, maybeConvertGross?: boolean) => void;
}) {
  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep only digits
    const digitsOnly = raw.replace(/\D+/g, "");
    onGrossChange(digitsOnly);
  };

  const displayGross = React.useMemo(() => {
    if (!gross) return "";
    const n = Number(gross);
    if (!Number.isFinite(n)) return gross;
    return formatNumberDa(n);
  }, [gross]);
  const handlePeriodClick = (next: Period) => {
    onPeriodChange(next, true);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="gross">Løn før skat</Label>
        <Input
          id="gross"
          inputMode="decimal"
          type="text"
          placeholder={period === "month" ? "fx 45.000" : "fx 540.000"}
          value={displayGross}
          onChange={handleGrossChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="period">Periode</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={period === "month" ? "default" : "outline"}
            onClick={() => handlePeriodClick("month")}
            className="flex-1">
            Måned
          </Button>
          <Button
            type="button"
            variant={period === "year" ? "default" : "outline"}
            onClick={() => handlePeriodClick("year")}
            className="flex-1">
            År
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IncomePeriodInputs;
