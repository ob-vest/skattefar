import { ArrowRight } from "lucide-react";
import { formatNumberDa, formatPct } from "@/lib/format";
import { getMunicipalities } from "@/lib/municipalities";

function formatDkkPrecise(value: number): string {
  return `${new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} kr.`;
}

// A static comparison panel highlighting what changed from 2025 to 2026.
// All numbers are sourced from src/lib/tax/years.ts; this component just
// renders them next to each other for the user.

type Row = {
  label: string;
  before: string;
  after: string;
  emphasis?: boolean; // visually highlight changed lines (default true)
  unchanged?: boolean; // dim rows where nothing changed
};

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="rounded-md border bg-background/50">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={[
              "grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2.5 py-1.5 text-sm",
              i > 0 ? "border-t" : "",
              r.unchanged ? "text-muted-foreground" : "",
            ].join(" ")}>
            <span className="truncate">{r.label}</span>
            <span
              className={[
                "tabular-nums",
                r.unchanged ? "" : "line-through text-muted-foreground",
              ].join(" ")}>
              {r.before}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <span
              className={[
                "tabular-nums font-medium",
                r.unchanged ? "" : "text-foreground",
              ].join(" ")}>
              {r.after}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatThreshold(value: number): string {
  // e.g. 641_200 -> "641.200 kr."
  return `${formatNumberDa(value)} kr.`;
}

export function YearChangesNote({
  selectedMunicipalityId,
}: {
  selectedMunicipalityId: string;
}) {
  const m25 = getMunicipalities(2025).find((m) => m.id === selectedMunicipalityId);
  const m26 = getMunicipalities(2026).find((m) => m.id === selectedMunicipalityId);

  const stateRows: Row[] = [
    {
      label: "Bundskat",
      before: formatPct(0.1201),
      after: formatPct(0.1201),
      unchanged: true,
    },
    {
      label: "Mellemskat (ny)",
      before: "—",
      after: `${formatPct(0.075)} fra ${formatThreshold(641_200)}`,
    },
    {
      label: "Topskat",
      before: `${formatPct(0.15)} fra ${formatThreshold(588_900)}`,
      after: `${formatPct(0.075)} fra ${formatThreshold(777_900)}`,
    },
    {
      label: "Top-topskat (ny)",
      before: "—",
      after: `${formatPct(0.05)} fra ${formatThreshold(2_592_700)}`,
    },
  ];

  const skatteloftRows: Row[] = [
    {
      label: "Mellemskat-loft (nyt)",
      before: "—",
      after: formatPct(0.4457),
    },
    {
      label: "Topskat-loft",
      before: formatPct(0.5207),
      after: formatPct(0.5207),
      unchanged: true,
    },
    {
      label: "Top-topskat-loft (nyt)",
      before: "—",
      after: formatPct(0.5707),
    },
  ];

  const fradragRows: Row[] = [
    {
      label: "Personfradrag",
      before: formatThreshold(51_600),
      after: formatThreshold(54_100),
    },
    {
      label: "Beskæftigelsesfradrag",
      before: formatPct(0.123),
      after: formatPct(0.1275),
    },
    {
      label: "Beskæftigelses-loft",
      before: formatThreshold(55_600),
      after: formatThreshold(63_300),
    },
    {
      label: "Enlig-forsørger-loft",
      before: formatThreshold(48_300),
      after: formatThreshold(50_600),
    },
    {
      label: "Jobfradrag (tærskel)",
      before: formatThreshold(224_500),
      after: formatThreshold(235_200),
    },
    {
      label: "Jobfradrag (loft)",
      before: formatThreshold(2_900),
      after: formatThreshold(3_100),
    },
  ];

  const befordringRows: Row[] = [
    {
      label: "Sats 25–120 km/dag",
      before: "2,23 kr./km",
      after: "3,17 kr./km",
    },
    {
      label: "Sats over 120 km/dag",
      before: "1,12 kr./km",
      after: "1,59 kr./km",
    },
    {
      label: "Yderkommune (alle km)",
      before: "2,47 kr./km",
      after: "3,51 kr./km",
    },
    {
      label: "Lavindkomsttillæg (maks.)",
      before: formatThreshold(15_400),
      after: formatThreshold(30_800),
    },
  ];

  const atpRows: Row[] = [
    {
      label: "ATP privat (fuld tid)",
      before: formatDkkPrecise(99),
      after: formatDkkPrecise(99),
      unchanged: true,
    },
    {
      label: "ATP offentlig (fuld tid)",
      before: formatDkkPrecise(66.6),
      after: formatDkkPrecise(99),
    },
  ];

  const kommuneChanged =
    !!m25 && !!m26 &&
    (m25.municipalTaxRate !== m26.municipalTaxRate ||
      m25.churchTaxRate !== m26.churchTaxRate);

  const kommuneRows: Row[] = m25 && m26 ? [
    {
      label: "Kommuneskat",
      before: formatPct(m25.municipalTaxRate),
      after: formatPct(m26.municipalTaxRate),
      unchanged: m25.municipalTaxRate === m26.municipalTaxRate,
    },
    {
      label: "Kirkeskat",
      before: formatPct(m25.churchTaxRate),
      after: formatPct(m26.churchTaxRate),
      unchanged: m25.churchTaxRate === m26.churchTaxRate,
    },
  ] : [];

  return (
    <div className="space-y-4 rounded-md border bg-accent/40 p-3">
      <div>
        <div className="text-sm font-medium">
          Ændringer fra 2025 til 2026
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Skattereform 2024 træder i kraft i 2026. Bundskatten er uændret,
          mens topskatten splittes i tre nye intervaller. §20-beløb er
          generelt opskrevet ca. 4,8 %.
        </p>
      </div>

      <Section title="Statsskat" rows={stateRows} />
      <Section title="Skatteloft (uden AM og kirke)" rows={skatteloftRows} />
      <Section title="Fradrag og beløb" rows={fradragRows} />
      <div className="space-y-1.5">
        <Section title="Befordring" rows={befordringRows} />
        <p className="text-xs text-muted-foreground">
          Midlertidig forhøjelse vedtaget juni 2026, gælder hele indkomståret
          2026. Yderkommune-satsen gælder for alle km over 24 (ingen reduktion
          over 120 km) for de 25 udpegede yderkommuner og 10 småøer.
          Lavindkomsttillægget er 64 % af befordringsfradraget og aftrappes fra
          341.500 til 391.500 kr.
        </p>
      </div>
      <Section title="ATP-bidrag (medarbejder)" rows={atpRows} />

      {m26 && (
        <Section
          title={`Din kommune: ${m26.name}${kommuneChanged ? "" : " (uændret)"}`}
          rows={kommuneRows}
        />
      )}
    </div>
  );
}

export default YearChangesNote;
