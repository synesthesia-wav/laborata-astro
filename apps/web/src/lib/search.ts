import MiniSearch from "minisearch";

export interface SearchDoc {
  aliases: string[];
  foldedSlug: string;
  foldedTitle: string;
  foldedTuple: string;
  id: string;
  role: string;
  sampleType?: string;
  searchText: string;
  slug: string;
  title: string;
  tuple_key: string;
  type: string;
  vendor_count: number;
  vendors?: string[];
}

export function foldDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// glycaemia equivalence handled by aliases in index; but client also folds query
export function normalizeQuery(q: string): string {
  return foldDiacritics(q.trim());
}

export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const ms = new MiniSearch<SearchDoc>({
    fields: ["searchText", "title", "foldedSlug", "foldedTitle"],
    searchOptions: {
      boost: { foldedSlug: 2, title: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    storeFields: [
      "id",
      "slug",
      "title",
      "type",
      "role",
      "vendor_count",
      "tuple_key",
    ],
  });
  ms.addAll(docs);
  return ms;
}

export function searchWithFold(
  ms: MiniSearch<SearchDoc>,
  rawQuery: string,
  max = 20
): SearchDoc[] {
  const q = normalizeQuery(rawQuery);
  if (!q) {
    return [];
  }
  // try minisearch first
  const results = ms.search(q, { fuzzy: 0.2, prefix: true });
  if (results.length > 0) {
    // results are storeFields, but we can map back
    return results.slice(0, max).map((r) => ({
      aliases: [],
      foldedSlug: "",
      foldedTitle: "",
      foldedTuple: "",
      id: (r as unknown as SearchDoc).id ?? (r as unknown as { id: string }).id,
      role: (r as unknown as SearchDoc).role ?? "",
      searchText: "",
      slug: (r as unknown as SearchDoc).slug ?? "",
      title: (r as unknown as SearchDoc).title ?? "",
      tuple_key: "",
      type: "",
      vendor_count: 0,
    }));
  }
  // fallback: linear folded includes (handles aliases glicemie≡glucoza)
  // we need original docs for fallback — caller should handle if ms has no match
  return [];
}

export async function loadSearchDocs(
  url = "/search-light.json"
): Promise<SearchDoc[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  const json = await res.json();
  return (json.docs ?? json) as SearchDoc[];
}

export async function loadFullSearchDocs(): Promise<SearchDoc[]> {
  return loadSearchDocs("/search.json");
}
