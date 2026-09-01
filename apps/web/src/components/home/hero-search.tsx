"use client";

import { RiSearchLine } from "@remixicon/react";
import { Button } from "@workspace/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

interface Props {
  idSuffix?: string;
  onSearch?: (q: string) => void;
}

export function HeroSearch({ idSuffix = "home-hero", onSearch }: Props) {
  const [value, setValue] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [open, setOpen] = useState(false);

  const normalizedPreview = foldDiacritics(value);

  useEffect(() => {
    fetch("/search-light.json")
      .then((r) => r.json())
      .then((j) => setDocs((j.docs ?? j) as SearchDoc[]))
      .catch(() => setDocs([]));
  }, []);

  const mini = useMemo(() => {
    if (!docs) {
      return null;
    }
    const ms = new MiniSearch<SearchDoc>({
      fields: ["searchText", "title", "foldedSlug"],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true },
      storeFields: ["id", "slug", "title", "type", "role"],
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const results = useMemo(() => {
    if (!(mini && value.trim())) {
      return [];
    }
    const q = foldDiacritics(value.trim());
    // glicemie ≡ glucoza alias: if query is one, also search the other via doc aliases already in searchText
    const r = mini.search(q, { fuzzy: 0.2, prefix: true });
    // fallback linear for alias edge: MiniSearch already indexes aliases via searchText
    if (r.length === 0 && docs) {
      const folded = foldDiacritics(value);
      return docs
        .filter((d) => d.searchText.includes(folded))
        .slice(0, 8)
        .map((d) => ({ id: d.id, slug: d.slug, title: d.title }));
    }
    return r.slice(0, 8).map((hit) => ({
      id:
        (hit as unknown as SearchDoc).id ??
        (hit as unknown as { id: string }).id,
      slug:
        (hit as unknown as SearchDoc).slug ??
        (hit as unknown as { slug: string }).slug,
      title:
        (hit as unknown as SearchDoc).title ??
        (hit as unknown as { title: string }).title,
    }));
  }, [mini, value, docs]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h1 className="text-balance break-words font-heading font-semibold text-3xl tracking-tight">
        Find the right tests, at a fair price.
      </h1>
      <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
        Understand without diacritics —{" "}
        <span className="font-medium text-foreground">tsh</span> finds
        <span className="font-medium text-foreground"> TSH</span>,{" "}
        <span className="font-medium text-foreground">feritina</span> finds{" "}
        <span className="font-medium text-foreground">Feritină</span>,{" "}
        <span className="font-medium text-foreground">glicemie</span>≡
        <span className="font-medium text-foreground">glucoză</span>. Neutral
        comparison across 5 labs. Wired to{" "}
        <span className="font-mono text-xs">search-light.json 417</span> (full
        7033 on /analize) • MiniSearch • foldDiacritics.
      </p>
      <div className="flex flex-col gap-2">
        <form
          aria-label="Search tests"
          className="flex w-full max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch?.(value);
            if (value) {
              window.location.href = `/analize?query=${encodeURIComponent(value)}`;
            }
          }}
          role="search"
        >
          <div className="relative w-full">
            <InputGroup className="h-12 rounded-2xl bg-card">
              <InputGroupAddon align="inline-start">
                <RiSearchLine aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoComplete="off"
                enterKeyHint="search"
                id={`hero-search-${idSuffix}`}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                onChange={(e) => {
                  setValue(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Try: tsh / feritină / glicemie / vitamina d"
                value={value}
              />
              <InputGroupAddon align="inline-end">
                <Button aria-label="Search" size="sm" type="submit">
                  Search
                </Button>
              </InputGroupAddon>
            </InputGroup>
            {open && value.trim() && results.length > 0 ? (
              <div className="absolute right-0 left-0 z-20 mt-2 max-h-72 overflow-auto rounded-xl border bg-card shadow-lg">
                <ul className="p-1" role="listbox">
                  {results.map((r) => (
                    <li key={r.id}>
                      <a
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        href={`/analize/${r.slug}`}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {r.title}
                        </span>
                        <span className="ml-2 shrink-0 break-all font-mono text-[11px] text-muted-foreground">
                          {r.slug}
                        </span>
                      </a>
                    </li>
                  ))}
                  <li className="border-t px-3 py-2 text-center text-muted-foreground text-xs">
                    <a
                      className="underline"
                      href={`/analize?query=${encodeURIComponent(value)}`}
                    >
                      Vezi toate rezultatele pentru “{value}” →
                    </a>
                  </li>
                </ul>
              </div>
            ) : null}
            {open && value.trim() && docs && results.length === 0 ? (
              <div className="absolute right-0 left-0 z-20 mt-2 rounded-xl border bg-card p-4 shadow-lg">
                <p className="text-sm">No match for “{value}”.</p>
                <p className="text-muted-foreground text-xs">
                  Kindly widen — try tsh, feritina (without diacritics), or
                  glicemie≡glucoza.
                </p>
              </div>
            ) : null}
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <span>Try:</span>
          {[
            { label: "tsh", q: "tsh" },
            { label: "feritină", q: "feritina" },
            { label: "vitamina d", q: "vitamina d" },
          ].map((c) => (
            <Button
              aria-label={`Search ${c.label}`}
              className="h-7 rounded-full"
              key={c.q}
              onClick={() => setValue(c.q)}
              size="sm"
              variant="secondary"
            >
              {c.label}
            </Button>
          ))}
          <span className="hidden sm:inline">Type to see results</span>
          {value ? (
            <span className="font-mono text-[11px]">
              normalized: {normalizedPreview || "—"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
