import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TaxYear } from "@/lib/tax";

const YEARS: TaxYear[] = [2025, 2026];

export function YearSelect({
  year,
  onChange,
}: {
  year: TaxYear;
  onChange: (next: TaxYear) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="taxYear">Indkomstår</Label>
      <div className="flex gap-2">
        {YEARS.map((y) => (
          <Button
            key={y}
            type="button"
            variant={year === y ? "default" : "outline"}
            onClick={() => onChange(y)}
            className="flex-1">
            {y}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default YearSelect;
