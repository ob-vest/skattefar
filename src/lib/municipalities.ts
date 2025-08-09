export interface Municipality {
  id: string;
  name: string;
  municipalTaxRate: number; // 0-1
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

type MunicipalitySource = { name: string; ratePct: number };

// 2025 municipality tax rates (kommuneskat) as provided by user. Values are percentages.
const SOURCES: MunicipalitySource[] = [
  { name: "Albertslund", ratePct: 25.6 },
  { name: "Allerød", ratePct: 25.3 },
  { name: "Assens", ratePct: 26.1 },
  { name: "Ballerup", ratePct: 25.5 },
  { name: "Billund", ratePct: 24.0 },
  { name: "Bornholm", ratePct: 26.2 },
  { name: "Brøndby", ratePct: 24.3 },
  { name: "Brønderslev", ratePct: 26.3 },
  { name: "Dragør", ratePct: 24.8 },
  { name: "Egedal", ratePct: 25.7 },
  { name: "Esbjerg", ratePct: 26.1 },
  { name: "Fanø", ratePct: 26.1 },
  { name: "Favrskov", ratePct: 25.7 },
  { name: "Faxe", ratePct: 25.8 },
  { name: "Fredensborg", ratePct: 25.3 },
  { name: "Fredericia", ratePct: 25.5 },
  { name: "Frederiksberg", ratePct: 24.57 },
  { name: "Frederikshavn", ratePct: 26.2 },
  { name: "Frederikssund", ratePct: 25.7 },
  { name: "Furesø", ratePct: 24.88 },
  { name: "Faaborg-Midtfyn", ratePct: 26.1 },
  { name: "Gentofte", ratePct: 24.24 },
  { name: "Gladsaxe", ratePct: 23.6 },
  { name: "Glostrup", ratePct: 24.6 },
  { name: "Greve", ratePct: 24.59 },
  { name: "Gribskov", ratePct: 25.4 },
  { name: "Guldborgsund", ratePct: 25.8 },
  { name: "Haderslev", ratePct: 26.3 },
  { name: "Halsnæs", ratePct: 25.7 },
  { name: "Hedensted", ratePct: 25.52 },
  { name: "Helsingør", ratePct: 25.82 },
  { name: "Herlev", ratePct: 23.7 },
  { name: "Herning", ratePct: 25.4 },
  { name: "Hillerød", ratePct: 25.6 },
  { name: "Hjørring", ratePct: 26.21 },
  { name: "Holbæk", ratePct: 25.3 },
  { name: "Holstebro", ratePct: 25.5 },
  { name: "Horsens", ratePct: 25.69 },
  { name: "Hvidovre", ratePct: 25.4 },
  { name: "Høje-Taastrup", ratePct: 24.6 },
  { name: "Hørsholm", ratePct: 23.7 },
  { name: "Ikast-Brande", ratePct: 25.1 },
  { name: "Ishøj", ratePct: 25.0 },
  { name: "Jammerbugt", ratePct: 25.7 },
  { name: "Kalundborg", ratePct: 24.2 },
  { name: "Kerteminde", ratePct: 26.1 },
  { name: "Kolding", ratePct: 25.5 },
  { name: "København", ratePct: 23.5 },
  { name: "Køge", ratePct: 25.26 },
  { name: "Langeland", ratePct: 26.3 },
  { name: "Lejre", ratePct: 25.31 },
  { name: "Lemvig", ratePct: 25.7 },
  { name: "Lolland", ratePct: 26.3 },
  { name: "Lyngby-Taarbæk", ratePct: 24.38 },
  { name: "Læsø", ratePct: 26.3 },
  { name: "Mariagerfjord", ratePct: 25.9 },
  { name: "Middelfart", ratePct: 25.8 },
  { name: "Morsø", ratePct: 25.8 },
  { name: "Norddjurs", ratePct: 26.0 },
  { name: "Nordfyns", ratePct: 26.0 },
  { name: "Nyborg", ratePct: 26.3 },
  { name: "Næstved", ratePct: 25.0 },
  { name: "Odder", ratePct: 25.1 },
  { name: "Odense", ratePct: 25.5 },
  { name: "Odsherred", ratePct: 26.3 },
  { name: "Randers", ratePct: 26.0 },
  { name: "Rebild", ratePct: 25.83 },
  { name: "Ringkøbing-Skjern", ratePct: 25.0 },
  { name: "Ringsted", ratePct: 26.1 },
  { name: "Roskilde", ratePct: 25.2 },
  { name: "Rudersdal", ratePct: 23.52 },
  { name: "Rødovre", ratePct: 25.7 },
  { name: "Samsø", ratePct: 25.9 },
  { name: "Silkeborg", ratePct: 25.5 },
  { name: "Skanderborg", ratePct: 26.0 },
  { name: "Skive", ratePct: 25.5 },
  { name: "Slagelse", ratePct: 26.1 },
  { name: "Solrød", ratePct: 24.99 },
  { name: "Sorø", ratePct: 26.3 },
  { name: "Stevns", ratePct: 26.0 },
  { name: "Struer", ratePct: 25.3 },
  { name: "Svendborg", ratePct: 26.3 },
  { name: "Syddjurs", ratePct: 25.9 },
  { name: "Sønderborg", ratePct: 25.7 },
  { name: "Thisted", ratePct: 25.5 },
  { name: "Tønder", ratePct: 25.3 },
  { name: "Tårnby", ratePct: 24.1 },
  { name: "Vallensbæk", ratePct: 25.6 },
  { name: "Varde", ratePct: 25.1 },
  { name: "Vejen", ratePct: 25.8 },
  { name: "Vejle", ratePct: 23.4 },
  { name: "Vesthimmerlands", ratePct: 26.3 },
  { name: "Viborg", ratePct: 25.5 },
  { name: "Vordingborg", ratePct: 26.3 },
  { name: "Ærø", ratePct: 26.1 },
  { name: "Aabenraa", ratePct: 25.6 },
  { name: "Aalborg", ratePct: 25.6 },
  { name: "Aarhus", ratePct: 24.52 },
];

export const MUNICIPALITIES: Municipality[] = SOURCES.map(
  ({ name, ratePct }) => ({
    id: slugifyDk(name),
    name,
    municipalTaxRate: ratePct / 100,
  })
);
