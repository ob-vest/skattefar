import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMunicipalities } from "@/lib/municipalities";
import { formatPct } from "@/lib/format";
import type { TaxYear } from "@/lib/tax";

export function MunicipalitySelect({
  municipalityId,
  taxYear,
  onChange,
}: {
  municipalityId: string;
  taxYear: TaxYear;
  onChange: (id: string) => void;
}) {
  const municipalities = getMunicipalities(taxYear);
  return (
    <div className="space-y-2">
      <Label htmlFor="municipality">Kommune</Label>
      <Select value={municipalityId} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Vælg kommune" />
        </SelectTrigger>
        <SelectContent>
          {municipalities.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name} ({formatPct(m.municipalTaxRate)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default MunicipalitySelect;
