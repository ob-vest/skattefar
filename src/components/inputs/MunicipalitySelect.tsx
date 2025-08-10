import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { formatPct } from "@/lib/format";

export function MunicipalitySelect({
  municipalityId,
  onChange,
}: {
  municipalityId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="municipality">Kommune</Label>
      <Select value={municipalityId} onValueChange={onChange}>
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
  );
}

export default MunicipalitySelect;
