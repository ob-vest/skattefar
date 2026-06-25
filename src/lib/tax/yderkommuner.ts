// The 25 designated "yderkommuner" (LL §9C stk 3) whose residents may compute
// befordringsfradrag for the whole distance over 24 km/day at the full (un-
// reduced) yderkommune rate. The list is unchanged by the June 2026 reform.
//
// IDs are the slugified kommune names produced by slugifyDk() in
// src/lib/municipalities.ts (Ø→oe, Æ→ae, Å→aa).
//
// The 10 designated småøer (Bågø, Egholm, Endelave, Hjarnø, Mandø, Nekselø,
// Orø, Sejerø, Tunø, Årø) belong to non-yderkommuner and therefore cannot be
// auto-detected from the municipality selector — residents there enable the
// benefit via the manual override.
// Source: info.skat.dk C.A.4.3.3.2.2.
export const YDERKOMMUNE_IDS: ReadonlySet<string> = new Set([
  "bornholm",
  "broenderslev",
  "faaborg-midtfyn",
  "frederikshavn",
  "guldborgsund",
  "hjoerring",
  "jammerbugt",
  "langeland",
  "lolland",
  "laesoe",
  "morsoe",
  "norddjurs",
  "odsherred",
  "samsoe",
  "skive",
  "slagelse",
  "struer",
  "svendborg",
  "soenderborg",
  "thisted",
  "toender",
  "vesthimmerlands",
  "vordingborg",
  "aeroe",
  "aabenraa",
]);

export function isYderkommuneId(id: string | undefined | null): boolean {
  return id ? YDERKOMMUNE_IDS.has(id) : false;
}
