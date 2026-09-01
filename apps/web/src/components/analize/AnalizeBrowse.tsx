"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Input } from "@workspace/ui/components/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import { addToList, createList, getOrCreateAnonToken } from "../../lib/lists";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

const CONCERNS: { label: string; value: string; keywords: string[] }[] = [
  {
    keywords: [
      "vitamina b12",
      "feritina",
      "vitamina d",
      "b12",
      "hemoleucograma",
    ],
    label: "Energy",
    value: "energy",
  },
  {
    keywords: [
      "tsh",
      "ft4",
      "ft3",
      "testosteron",
      "estradiol",
      "progesteron",
      "cortizol",
    ],
    label: "Hormones",
    value: "hormones",
  },
  {
    keywords: ["colesterol", "hdl", "ldl", "trigliceride", "lipid"],
    label: "Heart",
    value: "heart",
  },
  {
    keywords: ["helicobacter", "calprotectina", "celiacia"],
    label: "Gut",
    value: "gut",
  },
  {
    keywords: ["pcr", "vsh", "fibrinogen"],
    label: "Inflammation",
    value: "inflammation",
  },
  {
    keywords: ["glucoza", "glicemie", "hba1c", "insulina"],
    label: "Diabetes",
    value: "diabetes",
  },
];

const LABS = ["synevo", "sante", "invitro", "medexpert", "alfa"] as const;
const SAMPLES = ["Sânge", "Urină", "Frotiu"] as const;

function concernMatches(doc: SearchDoc, concern: string): boolean {
  if (!concern) {
    return true;
  }
  const c = CONCERNS.find((x) => x.value === concern);
  if (!c) {
    return true;
  }
  const folded = foldDiacritics(`${doc.title} ${doc.slug} ${doc.tuple_key}`);
  return c.keywords.some((k) => folded.includes(foldDiacritics(k)));
}

export function AnalizeBrowse() {
  const [query, setQuery] = useState("");
  const [concern, setConcern] = useState("");
  const [lab, setLab] = useState("");
  const [sample, setSample] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // hydrate from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get("query") ?? "");
    setConcern(p.get("concern") ?? "");
    setLab(p.get("lab") ?? "");
    setSample(p.get("sample") ?? "");
  }, []);

  useEffect(() => {
    fetch("/search.json")
      .then((r) => {
        if (!r.ok) {
          throw new Error("Failed to load search.json");
        }
        return r.json();
      })
      .then((j) => {
        const fetched = (j.docs ?? j) as SearchDoc[];
        // keep only comparison for browse? But task says keep full 7033 for SEO — show comparison primary but also catalog? For browse we show comparison (417) as main, but allow catalog as well? We'll show comparison only for UX, catalog reachable via direct link.
        // To allow SEO long-tail, we keep full but default filter to comparison for performance; user can see all if they search catalog term.
        setDocs(fetched);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  const mini = useMemo(() => {
    if (!docs) {
      return null;
    }
    const ms = new MiniSearch<SearchDoc>({
      fields: ["searchText", "title", "foldedSlug"],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true },
      storeFields: [
        "id",
        "slug",
        "title",
        "type",
        "role",
        "vendors",
        "sampleType",
      ],
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const filtered = useMemo(() => {
    if (!docs) {
      return [];
    }
    let pool: SearchDoc[] = docs;

    // typeahead query filtering via MiniSearch
    if (query.trim() && mini) {
      const q = foldDiacritics(query.trim());
      const hits = mini.search(q, { fuzzy: 0.2, prefix: true });
      if (hits.length > 0) {
        const ids = new Set(
          hits.map(
            (h) =>
              (h as unknown as SearchDoc).id ??
              (h as unknown as { id: string }).id
          )
        );
        pool = docs.filter((d) => ids.has(d.id));
      } else {
        // linear folded fallback (covers glicemie≡glucoza alias already in searchText)
        pool = docs.filter((d) => d.searchText.includes(q));
      }
    }

    // Concern chip
    if (concern) {
      pool = pool.filter((d) => concernMatches(d, concern));
    }
    // Lab chip
    if (lab) {
      pool = pool.filter((d) =>
        (d.vendors as string[] | undefined)?.includes(lab)
      );
    }
    // Sample chip
    if (sample) {
      pool = pool.filter((d) => (d.sampleType ?? "Sânge") === sample);
    }

    // default: show comparison first, but if query matches catalog_only, keep them
    // For empty query, show only comparison (417) to avoid overwhelming 7033
    if (!(query.trim() || concern || lab || sample)) {
      pool = pool.filter((d) => d.role === "comparison");
    }

    return pool.slice(0, 48);
  }, [docs, query, concern, lab, sample, mini]);

  const updateUrl = (next: {
    q?: string;
    concern?: string;
    lab?: string;
    sample?: string;
  }) => {
    const p = new URLSearchParams(window.location.search);
    const q = next.q === undefined ? query : next.q;
    const c = next.concern === undefined ? concern : next.concern;
    const l = next.lab === undefined ? lab : next.lab;
    const s = next.sample === undefined ? sample : next.sample;
    if (q) {
      p.set("query", q);
    } else {
      p.delete("query");
    }
    if (c) {
      p.set("concern", c);
    } else {
      p.delete("concern");
    }
    if (l) {
      p.set("lab", l);
    } else {
      p.delete("lab");
    }
    if (s) {
      p.set("sample", s);
    } else {
      p.delete("sample");
    }
    const url = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState(
      null,
      "",
      p.toString() ? url : window.location.pathname
    );
  };

  const totalCount = docs
    ? docs.filter((d) => d.role === "comparison").length
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card className="h-36 animate-pulse bg-muted" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">
            Could not load analize
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm" htmlFor="analize-search">
            Caută analiză
          </label>
          <Input
            autoComplete="off"
            enterKeyHint="search"
            id="analize-search"
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              updateUrl({ q: v });
            }}
            placeholder="tsh / feritina / glicemie ≡ glucoza / vitamina d"
            value={query}
          />
          <p className="text-muted-foreground text-xs">
            {totalCount} comparison • typeahead diacritics-insensitive
            (feritina→Feritină, tsh→TSH, glicemie≡glucoza) • search.json 7033
            for SEO
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Concern:
          </span>
          <ToggleGroup
            className="flex flex-wrap gap-2"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "";
              setConcern(nv);
              updateUrl({ concern: nv });
            }}
            value={concern ? [concern] : []}
            variant="outline"
          >
            {CONCERNS.map((c) => (
              <ToggleGroupItem
                aria-label={c.label}
                className="h-7 rounded-full text-xs"
                key={c.value}
                value={c.value}
              >
                {c.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {concern ? (
            <Button
              className="h-7 text-xs"
              onClick={() => {
                setConcern("");
                updateUrl({ concern: "" });
              }}
              size="sm"
              variant="ghost"
            >
              Clear
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Lab:
          </span>
          {LABS.map((l) => (
            <Button
              className="h-7 rounded-full text-xs"
              key={l}
              onClick={() => {
                const next = lab === l ? "" : l;
                setLab(next);
                updateUrl({ lab: next });
              }}
              size="sm"
              variant={lab === l ? "default" : "outline"}
            >
              {l}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Sample:
          </span>
          {SAMPLES.map((s) => (
            <Button
              className="h-7 rounded-full text-xs"
              key={s}
              onClick={() => {
                const next = sample === s ? "" : s;
                setSample(next);
                updateUrl({ sample: next });
              }}
              size="sm"
              variant={sample === s ? "default" : "outline"}
            >
              {s}
            </Button>
          ))}
        </div>

        <div aria-live="polite" className="text-muted-foreground text-xs">
          {filtered.length} rezultate {query ? `pentru “${query}”` : ""}{" "}
          {concern ? `• ${concern}` : ""} {lab ? `• ${lab}` : ""}{" "}
          {sample ? `• ${sample}` : ""}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Kindly widen</EmptyTitle>
                <EmptyDescription>
                  No analize match your filters. Try clearing Concern×Lab×Sample
                  chips or searching “tsh”, “feritina” without diacritics, or
                  “glicemie” for “glucoza”.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                onClick={() => {
                  setQuery("");
                  setConcern("");
                  setLab("");
                  setSample("");
                  updateUrl({ concern: "", lab: "", q: "", sample: "" });
                }}
                size="sm"
                variant="outline"
              >
                Clear all filters
              </Button>
              <Button
                onClick={() => {
                  setQuery("tsh");
                  updateUrl({ q: "tsh" });
                }}
                size="sm"
              >
                Try tsh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <Card className="flex flex-col overflow-hidden" key={d.id}>
              <CardHeader className="pb-2">
                <div className="flex gap-2">
                  <Badge className="text-[10px]" variant="secondary">
                    {d.sampleType ?? "Sânge"}
                  </Badge>
                  <Badge className="text-[10px]" variant="outline">
                    {d.role === "comparison" ? "comparison" : "catalog"}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-sm leading-tight">
                  {d.title}
                </CardTitle>
                <p className="line-clamp-1 font-mono text-[11px] text-muted-foreground">
                  {d.slug} • {d.vendors?.join(", ") || `${d.vendor_count} labs`}
                </p>
              </CardHeader>
              <CardContent className="mt-auto flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => (window.location.href = `/analize/${d.slug}`)}
                  size="sm"
                  variant="outline"
                >
                  Vezi
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const anon = getOrCreateAnonToken();
                    const listsRaw =
                      window.localStorage.getItem("laborata:lists");
                    let lists: ReturnType<typeof createList>[] = [];
                    try {
                      lists = listsRaw ? JSON.parse(listsRaw) : [];
                    } catch {
                      lists = [];
                    }
                    if (lists.length === 0) {
                      const nl = createList("Analizele mele", anon);
                      lists = [nl];
                    }
                    // add to first list
                    const updated = addToList(
                      lists[0] as unknown as Parameters<typeof addToList>[0],
                      d.id
                    );
                    lists[0] = updated as unknown as (typeof lists)[0];
                    window.localStorage.setItem(
                      "laborata:lists",
                      JSON.stringify(lists)
                    );
                    window.location.href = `/liste/${lists[0].id}`;
                  }}
                  size="sm"
                >
                  Adaugă
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
