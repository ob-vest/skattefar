import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { formatPct } from "@/lib/format";

export function AdvancedSettings({
  includeChurch,
  onIncludeChurch,
  selectedMunicipalityId,
  singleParent,
  onSingleParent,
  applyStoreBededag,
  onApplyStoreBededag,
  commuteKm,
  onCommuteKm,
  workDays,
  onWorkDays,
  atpSector,
  onAtpSector,
  atpHours,
  onAtpHours,
  employeePensionRate,
  onEmployeePensionRate,
}: {
  includeChurch: boolean;
  onIncludeChurch: (v: boolean) => void;
  selectedMunicipalityId: string;
  singleParent: boolean;
  onSingleParent: (v: boolean) => void;
  applyStoreBededag: boolean;
  onApplyStoreBededag: (v: boolean) => void;
  commuteKm: string;
  onCommuteKm: (v: string) => void;
  workDays: string;
  onWorkDays: (v: string) => void;
  atpSector: "private" | "public";
  onAtpSector: (v: "private" | "public") => void;
  atpHours: string;
  onAtpHours: (v: string) => void;
  employeePensionRate: string;
  onEmployeePensionRate: (v: string) => void;
}) {
  const selectedMunicipality = MUNICIPALITIES.find(
    (m) => m.id === selectedMunicipalityId
  );

  return (
    <div className="space-y-4 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <input
          id="church"
          type="checkbox"
          className="h-4 w-4 accent-foreground"
          checked={includeChurch}
          onChange={(e) => onIncludeChurch(e.target.checked)}
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
          onChange={(e) => onSingleParent(e.target.checked)}
        />
        <Label htmlFor="single-parent">Enlig forsørger</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="storebededag"
          type="checkbox"
          className="h-4 w-4 accent-foreground"
          checked={applyStoreBededag}
          onChange={(e) => onApplyStoreBededag(e.target.checked)}
        />
        <Label htmlFor="storebededag">
          Store bededag kompensation (0,45 %)
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="commuteKm">Afstand hjem-arbejde (km tur/retur)</Label>
          <Input
            id="commuteKm"
            inputMode="decimal"
            type="text"
            placeholder="fx 60"
            value={commuteKm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onCommuteKm(e.target.value)
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
              onWorkDays(e.target.value)
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
              variant={atpSector === "private" ? "default" : "outline"}
              onClick={() => onAtpSector("private")}
              className="flex-1">
              Privat
            </Button>
            <Button
              type="button"
              variant={atpSector === "public" ? "default" : "outline"}
              onClick={() => onAtpSector("public")}
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
              onAtpHours(e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employeePensionRate">Eget pensionsbidrag (%)</Label>
          <Input
            id="employeePensionRate"
            inputMode="decimal"
            type="text"
            placeholder="fx 12"
            value={employeePensionRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onEmployeePensionRate(e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default AdvancedSettings;
