"use client";

import { RiSearchLine } from "@remixicon/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

interface Props {
  disabled?: boolean;
  idSuffix?: string;
  onSearch?: (q: string) => void;
}

export function HeroSearch({
  idSuffix = "home-hero",
  onSearch,
  disabled = false,
}: Props) {
  const [value, setValue] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [open, setOpen] = useState(false);

  const inputId = `hero-search-${idSuffix}`;
  const listboxId = `hero-listbox-${idSuffix}`;
  const trimmed = value.trim();
  const normalizedPreview = foldDiacritics(value);

  const load = () => {
    setHasError(false);
    setDocs(null);
    fetch("/search-light.json")
      .then((r) => r.json())
      .then((j) => setDocs((j.docs ?? j) as SearchDoc[]))
      .catch(() => {
        setHasError(true);
        setDocs([]);
      });
  };

  useEffect(() => {
    load();
  }, [load]);

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
    if (!(mini && trimmed)) {
      return [];
    }
    const q = foldDiacritics(trimmed);
    const r = mini.search(q, { fuzzy: 0.2, prefix: true });
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
  }, [mini, trimmed, docs, value]);

  const isLoading = docs === null && !hasError;
  const shouldShowEmpty =
    !(isLoading || hasError) && trimmed.length > 0 && results.length === 0;
  const shouldShowResults =
    !(isLoading || hasError) && trimmed.length > 0 && results.length > 0;

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
      <FieldGroup>
        <Field>
          <FieldLabel className="sr-only" htmlFor={inputId}>
            Search tests
          </FieldLabel>
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
              <Popover onOpenChange={setOpen} open={open && trimmed.length > 0}>
                <PopoverTrigger asChild>
                  <div className="w-full">
                    <InputGroup className="h-12 rounded-2xl bg-card">
                      <InputGroupAddon align="inline-start">
                        <RiSearchLine
                          aria-hidden="true"
                          className="size-4"
                          data-icon="inline-start"
                        />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-controls={listboxId}
                        aria-expanded={open && trimmed.length > 0}
                        autoComplete="off"
                        disabled={disabled || isLoading}
                        enterKeyHint="search"
                        id={inputId}
                        onChange={(e) => {
                          setValue(e.target.value);
                          setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Try: tsh / feritină / glicemie / vitamina d"
                        value={value}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          aria-label="Search"
                          disabled={disabled || isLoading}
                          size="sm"
                          type="submit"
                        >
                          Search
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0 sm:w-[36rem]"
                  id={listboxId}
                  sideOffset={8}
                >
                  <Command shouldFilter={false}>
                    <CommandList id={listboxId} role="listbox">
                      {isLoading ? (
                        <div className="p-2">
                          <Skeleton className={cn("h-12 w-full")} />
                        </div>
                      ) : null}
                      {hasError ? (
                        <div className="p-2">
                          <Alert variant="destructive">
                            <AlertTitle>Search failed</AlertTitle>
                            <AlertDescription>
                              Could not load search. Try again.
                            </AlertDescription>
                          </Alert>
                          <Button
                            className="mt-2"
                            onClick={load}
                            size="sm"
                            variant="outline"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : null}
                      {shouldShowResults ? (
                        <CommandGroup>
                          {results.map((r) => (
                            <CommandItem
                              aria-selected={false}
                              asChild
                              key={r.id}
                              onMouseDown={(e) => e.preventDefault()}
                              role="option"
                              value={r.title}
                            >
                              <a
                                className="flex min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
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
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : null}
                      {shouldShowEmpty ? (
                        <CommandEmpty>
                          <div className="p-4 text-center">
                            <p className="text-sm">No match for “{value}”.</p>
                            <p className="text-muted-foreground text-xs">
                              Kindly widen — try tsh, feritina (without
                              diacritics), or glicemie≡glucoza.
                            </p>
                          </div>
                        </CommandEmpty>
                      ) : null}
                      {shouldShowResults ? (
                        <div className="border-t px-3 py-2 text-center text-muted-foreground text-xs">
                          <a
                            className="underline"
                            href={`/analize?query=${encodeURIComponent(value)}`}
                          >
                            Vezi toate rezultatele pentru “{value}” →
                          </a>
                        </div>
                      ) : null}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </form>
        </Field>
      </FieldGroup>
      {isLoading ? <Skeleton className="h-4 w-32" /> : null}
      {hasError ? (
        <div className="flex flex-wrap items-center gap-2">
          <Alert className="max-w-3xl" variant="destructive">
            <AlertTitle>Could not load search</AlertTitle>
            <AlertDescription>Retry to search 417 tests.</AlertDescription>
          </Alert>
          <Button onClick={load} size="sm" variant="outline">
            Retry search
          </Button>
        </div>
      ) : null}
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
            disabled={disabled || isLoading || hasError}
            key={c.q}
            onClick={() => {
              setValue(c.q);
              setOpen(true);
            }}
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
      <div className="flex flex-wrap gap-2">
        <span className="break-all font-mono text-muted-foreground text-xs">
          1.250.000 lei grouping test — large price wraps
        </span>
      </div>
    </div>
  );
}
