export interface Municipality {
  id: string;
  name: string;
  municipalTaxRate: number; // 0-1
  churchTaxRate: number; // 0-1
}

function slugifyDk(input: string): string {
  return input
    .replace(/[Ææ]/g, "ae")
    .replace(/[Øø]/g, "oe")
    .replace(/[Åå]/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type MunicipalitySource = { name: string; ratePct: number; churchRate: number };

// 2025 municipality tax rates (kommuneskat) and church tax rates (kirkeskat).
// Values are percentages.
const SOURCES: MunicipalitySource[] = [
  { name: "Albertslund", ratePct: 25.6, churchRate: 0.8 },
  { name: "Allerød", ratePct: 25.3, churchRate: 0.58 },
  { name: "Assens", ratePct: 26.1, churchRate: 0.98 },
  { name: "Ballerup", ratePct: 25.5, churchRate: 0.75 },
  { name: "Billund", ratePct: 24.0, churchRate: 0.89 },
  { name: "Bornholm", ratePct: 26.2, churchRate: 0.93 },
  { name: "Brøndby", ratePct: 24.3, churchRate: 0.8 },
  { name: "Brønderslev", ratePct: 26.3, churchRate: 1.06 },
  { name: "Dragør", ratePct: 24.8, churchRate: 0.61 },
  { name: "Egedal", ratePct: 25.7, churchRate: 0.76 },
  { name: "Esbjerg", ratePct: 26.1, churchRate: 0.81 },
  { name: "Fanø", ratePct: 26.1, churchRate: 1.14 },
  { name: "Favrskov", ratePct: 25.7, churchRate: 0.96 },
  { name: "Faxe", ratePct: 25.8, churchRate: 1.08 },
  { name: "Fredensborg", ratePct: 25.3, churchRate: 0.62 },
  { name: "Fredericia", ratePct: 25.5, churchRate: 0.88 },
  { name: "Frederiksberg", ratePct: 24.57, churchRate: 0.5 },
  { name: "Frederikshavn", ratePct: 26.2, churchRate: 1.03 },
  { name: "Frederikssund", ratePct: 25.7, churchRate: 0.96 },
  { name: "Furesø", ratePct: 24.88, churchRate: 0.65 },
  { name: "Faaborg-Midtfyn", ratePct: 26.1, churchRate: 1.05 },
  { name: "Gentofte", ratePct: 24.24, churchRate: 0.39 },
  { name: "Gladsaxe", ratePct: 23.6, churchRate: 0.75 },
  { name: "Glostrup", ratePct: 24.6, churchRate: 0.8 },
  { name: "Greve", ratePct: 24.59, churchRate: 0.81 },
  { name: "Gribskov", ratePct: 25.4, churchRate: 0.85 },
  { name: "Guldborgsund", ratePct: 25.8, churchRate: 1.16 },
  { name: "Haderslev", ratePct: 26.3, churchRate: 0.95 },
  { name: "Halsnæs", ratePct: 25.7, churchRate: 0.85 },
  { name: "Hedensted", ratePct: 25.52, churchRate: 0.98 },
  { name: "Helsingør", ratePct: 25.82, churchRate: 0.63 },
  { name: "Herlev", ratePct: 23.7, churchRate: 0.75 },
  { name: "Herning", ratePct: 25.4, churchRate: 0.99 },
  { name: "Hillerød", ratePct: 25.6, churchRate: 0.69 },
  { name: "Hjørring", ratePct: 26.21, churchRate: 1.19 },
  { name: "Holbæk", ratePct: 25.3, churchRate: 0.96 },
  { name: "Holstebro", ratePct: 25.5, churchRate: 1.08 },
  { name: "Horsens", ratePct: 25.69, churchRate: 0.79 },
  { name: "Hvidovre", ratePct: 25.4, churchRate: 0.72 },
  { name: "Høje-Taastrup", ratePct: 24.6, churchRate: 0.8 },
  { name: "Hørsholm", ratePct: 23.7, churchRate: 0.62 },
  { name: "Ikast-Brande", ratePct: 25.1, churchRate: 0.97 },
  { name: "Ishøj", ratePct: 25.0, churchRate: 0.9 },
  { name: "Jammerbugt", ratePct: 25.7, churchRate: 1.2 },
  { name: "Kalundborg", ratePct: 24.2, churchRate: 1.01 },
  { name: "Kerteminde", ratePct: 26.1, churchRate: 0.98 },
  { name: "Kolding", ratePct: 25.5, churchRate: 0.92 },
  { name: "København", ratePct: 23.5, churchRate: 0.8 },
  { name: "Køge", ratePct: 25.26, churchRate: 0.87 },
  { name: "Langeland", ratePct: 26.3, churchRate: 1.14 },
  { name: "Lejre", ratePct: 25.31, churchRate: 1.05 },
  { name: "Lemvig", ratePct: 25.7, churchRate: 1.27 },
  { name: "Lolland", ratePct: 26.3, churchRate: 1.23 },
  { name: "Lyngby-Taarbæk", ratePct: 24.38, churchRate: 0.6 },
  { name: "Læsø", ratePct: 26.3, churchRate: 1.3 },
  { name: "Mariagerfjord", ratePct: 25.9, churchRate: 1.15 },
  { name: "Middelfart", ratePct: 25.8, churchRate: 0.9 },
  { name: "Morsø", ratePct: 25.8, churchRate: 1.2 },
  { name: "Norddjurs", ratePct: 26.0, churchRate: 1.0 },
  { name: "Nordfyns", ratePct: 26.0, churchRate: 1.04 },
  { name: "Nyborg", ratePct: 26.3, churchRate: 1.0 },
  { name: "Næstved", ratePct: 25.0, churchRate: 0.98 },
  { name: "Odder", ratePct: 25.1, churchRate: 0.95 },
  { name: "Odense", ratePct: 25.5, churchRate: 0.68 },
  { name: "Odsherred", ratePct: 26.3, churchRate: 0.98 },
  { name: "Randers", ratePct: 26.0, churchRate: 0.89 },
  { name: "Rebild", ratePct: 25.83, churchRate: 1.2 },
  { name: "Ringkøbing-Skjern", ratePct: 25.0, churchRate: 1.05 },
  { name: "Ringsted", ratePct: 26.1, churchRate: 0.95 },
  { name: "Roskilde", ratePct: 25.2, churchRate: 0.84 },
  { name: "Rudersdal", ratePct: 23.52, churchRate: 0.57 },
  { name: "Rødovre", ratePct: 25.7, churchRate: 0.72 },
  { name: "Samsø", ratePct: 25.9, churchRate: 1.2 },
  { name: "Silkeborg", ratePct: 25.5, churchRate: 0.95 },
  { name: "Skanderborg", ratePct: 26.0, churchRate: 0.86 },
  { name: "Skive", ratePct: 25.5, churchRate: 1.09 },
  { name: "Slagelse", ratePct: 26.1, churchRate: 0.96 },
  { name: "Solrød", ratePct: 24.99, churchRate: 0.89 },
  { name: "Sorø", ratePct: 26.3, churchRate: 0.95 },
  { name: "Stevns", ratePct: 26.0, churchRate: 1.1 },
  { name: "Struer", ratePct: 25.3, churchRate: 1.2 },
  { name: "Svendborg", ratePct: 26.3, churchRate: 1.02 },
  { name: "Syddjurs", ratePct: 25.9, churchRate: 0.98 },
  { name: "Sønderborg", ratePct: 25.7, churchRate: 0.91 },
  { name: "Thisted", ratePct: 25.5, churchRate: 1.27 },
  { name: "Tønder", ratePct: 25.3, churchRate: 1.16 },
  { name: "Tårnby", ratePct: 24.1, churchRate: 0.61 },
  { name: "Vallensbæk", ratePct: 25.6, churchRate: 0.8 },
  { name: "Varde", ratePct: 25.1, churchRate: 0.95 },
  { name: "Vejen", ratePct: 25.8, churchRate: 1.06 },
  { name: "Vejle", ratePct: 23.4, churchRate: 0.89 },
  { name: "Vesthimmerlands", ratePct: 26.3, churchRate: 1.18 },
  { name: "Viborg", ratePct: 25.5, churchRate: 0.93 },
  { name: "Vordingborg", ratePct: 26.3, churchRate: 1.02 },
  { name: "Ærø", ratePct: 26.1, churchRate: 1.05 },
  { name: "Aabenraa", ratePct: 25.6, churchRate: 0.95 },
  { name: "Aalborg", ratePct: 25.6, churchRate: 0.98 },
  { name: "Aarhus", ratePct: 24.52, churchRate: 0.74 },
];

export const MUNICIPALITIES: Municipality[] = SOURCES.map(
  ({ name, ratePct, churchRate }) => ({
    id: slugifyDk(name),
    name,
    municipalTaxRate: ratePct / 100,
    churchTaxRate: (churchRate ?? 0.87) / 100, // default to national average 0.87% if missing
  })
);
