"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
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
    label: "Energie",
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
    label: "Hormoni",
    value: "hormones",
  },
  {
    keywords: ["colesterol", "hdl", "ldl", "trigliceride", "lipid"],
    label: "Inimă",
    value: "heart",
  },
  {
    keywords: ["helicobacter", "calprotectina", "celiacia"],
    label: "Digestiv",
    value: "gut",
  },
  {
    keywords: ["pcr", "vsh", "fibrinogen"],
    label: "Inflamație",
    value: "inflammation",
  },
  {
    keywords: ["glucoza", "glicemie", "hba1c", "insulina"],
    label: "Diabet",
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

interface Props {
  disabled?: boolean;
  docs?: SearchDoc[] | null;
  error?: string | null;
  loading?: boolean;
  onRetry?: () => void;
}

export function AnalizeBrowse({
  disabled = false,
  docs: docsProp,
  error: errorProp,
  loading: loadingProp,
  onRetry,
}: Props = {}) {
  const [query, setQuery] = useState("");
  const [concern, setConcern] = useState("");
  const [lab, setLab] = useState("");
  const [sample, setSample] = useState("");
  const [docsInternal, setDocsInternal] = useState<SearchDoc[] | null>(null);
  const [loadingInternal, setLoadingInternal] = useState(true);
  const [errorInternal, setErrorInternal] = useState<string | null>(null);

  const docs = docsProp === undefined ? docsInternal : docsProp;
  const loading = loadingProp === undefined ? loadingInternal : loadingProp;
  const error = errorProp === undefined ? errorInternal : errorProp;
  const handleRetry = onRetry ?? (() => window.location.reload());

  // hydrate from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get("query") ?? "");
    setConcern(p.get("concern") ?? "");
    setLab(p.get("lab") ?? "");
    setSample(p.get("sample") ?? "");
  }, []);

  useEffect(() => {
    if (docsProp !== undefined || loadingProp !== undefined) {
      return;
    }
    fetch("/search.json")
      .then((r) => {
        if (!r.ok) {
          throw new Error("Failed to load search.json");
        }
        return r.json();
      })
      .then((j) => {
        const fetched = (j.docs ?? j) as SearchDoc[];
        setDocsInternal(fetched);
        setLoadingInternal(false);
      })
      .catch((e) => {
        setErrorInternal(e instanceof Error ? e.message : String(e));
        setLoadingInternal(false);
      });
  }, [docsProp, loadingProp]);

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
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card className="overflow-hidden" key={i}>
              <CardHeader className="gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
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
            Nu am putut încărca analizele
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRetry} size="sm" variant="outline">
            Reîncearcă
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (disabled) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-sm">Analize</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/20 px-3 py-6 text-center text-muted-foreground text-sm">
            Conținut dezactivat
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-3">
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
            {totalCount} analize comparabile • fără diacritice: tsh → TSH,
            feritina → Feritină, glicemie = glucoză
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Concernare:
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
              Resetează
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Laborator:
          </span>
          <ToggleGroup
            aria-label="Filter by lab"
            className="flex flex-wrap gap-2"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "";
              setLab(nv);
              updateUrl({ lab: nv });
            }}
            size="sm"
            spacing={2}
            value={lab ? [lab] : []}
            variant="outline"
          >
            {LABS.map((l) => (
              <ToggleGroupItem
                aria-label={l}
                className="h-7 rounded-full text-xs"
                key={l}
                value={l}
              >
                {l}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="py-1 font-medium text-muted-foreground text-xs">
            Probă:
          </span>
          <ToggleGroup
            aria-label="Filter by sample"
            className="flex flex-wrap gap-2"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "";
              setSample(nv);
              updateUrl({ sample: nv });
            }}
            size="sm"
            spacing={2}
            value={sample ? [sample] : []}
            variant="outline"
          >
            {SAMPLES.map((s) => (
              <ToggleGroupItem
                aria-label={String(s)}
                className="h-7 rounded-full text-xs"
                key={String(s)}
                value={String(s)}
              >
                {String(s)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
                <EmptyTitle>Niciun rezultat</EmptyTitle>
                <EmptyDescription>
                  Nicio analiză nu se potrivește filtrelor. Resetează filtrele
                  sau caută „tsh”, „feritina” fără diacritice, ori „glicemie”
                  pentru „glucoza”.
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
                Resetează filtrele
              </Button>
              <Button
                onClick={() => {
                  setQuery("tsh");
                  updateUrl({ q: "tsh" });
                }}
                size="sm"
              >
                Încearcă tsh
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
                <p className="line-clamp-1 break-all font-mono text-[11px] text-muted-foreground">
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
