"use client";

import { RiSearchLine } from "@remixicon/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mini = useMemo(() => {
    if (!docs) {
      return null;
    }
    const uniqueDocs = Array.from(new Map(docs.map((d) => [d.id, d])).values());
    const ms = new MiniSearch<SearchDoc>({
      fields: ["searchText", "title", "foldedSlug"],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true },
      storeFields: ["id", "slug", "title", "type", "role"],
    });
    ms.addAll(uniqueDocs);
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
    <Card className="overflow-hidden">
      <CardHeader className="gap-2 pb-4">
        <CardTitle className="text-balance break-words font-heading font-semibold text-[28px] leading-tight tracking-tight md:text-3xl">
          Find the right tests, at a fair price.
        </CardTitle>
        <CardDescription className="max-w-prose text-pretty text-sm leading-relaxed">
          Without diacritics —{" "}
          <span className="font-medium text-foreground">tsh</span> finds{" "}
          <span className="font-medium text-foreground">TSH</span> ·{" "}
          <span className="font-medium text-foreground">feritina</span> finds{" "}
          <span className="font-medium text-foreground">Feritină</span> ·{" "}
          <span className="font-medium text-foreground">glicemie</span> ≡{" "}
          <span className="font-medium text-foreground">glucoză</span> · Neutral
          comparison across 5 labs.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel className="sr-only" htmlFor={inputId}>
              Search tests
            </FieldLabel>
            <form
              aria-label="Search tests"
              className="flex w-full"
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
                <Popover
                  onOpenChange={setOpen}
                  open={open && trimmed.length > 0}
                >
                  <PopoverTrigger asChild>
                    <div className="w-full">
                      <InputGroup className="h-12 rounded-2xl bg-muted/40">
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
                          className="bg-transparent"
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
                        <InputGroupAddon align="inline-end" className="pr-1.5">
                          <Button
                            aria-label="Search"
                            className="rounded-full px-5"
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
                    className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl p-0"
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
                          <div className="p-3">
                            <Alert variant="destructive">
                              <AlertTitle>Search failed</AlertTitle>
                              <AlertDescription>
                                Could not load search. Try again.
                              </AlertDescription>
                            </Alert>
                            <Button
                              className="mt-3 w-full rounded-full"
                              onClick={load}
                              size="sm"
                              variant="outline"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : null}
                        {shouldShowResults ? (
                          <CommandGroup className="p-1">
                            {results.map((r) => (
                              <CommandItem
                                aria-selected={false}
                                asChild
                                className="rounded-xl"
                                key={r.id}
                                onMouseDown={(e) => e.preventDefault()}
                                role="option"
                                value={r.title}
                              >
                                <a
                                  className="flex min-w-0 items-center justify-between gap-2 px-3 py-2"
                                  href={`/analize/${r.slug}`}
                                  onMouseDown={(e) => e.preventDefault()}
                                >
                                  <span className="min-w-0 flex-1 truncate font-medium text-sm">
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
                            <div className="p-6 text-center">
                              <p className="font-medium text-sm">
                                No match for &ldquo;{value}&rdquo;
                              </p>
                              <p className="mt-1 text-muted-foreground text-xs">
                                Try tsh, feritina without diacritics, or
                                glicemie ≡ glucoza.
                              </p>
                            </div>
                          </CommandEmpty>
                        ) : null}
                        {shouldShowResults ? (
                          <div className="border-t bg-muted/30 px-3 py-2.5 text-center">
                            <a
                              className="font-medium text-foreground text-xs underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground"
                              href={`/analize?query=${encodeURIComponent(value)}`}
                            >
                              Vezi toate rezultatele pentru &ldquo;{value}
                              &rdquo; →
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

        {/* Suggestions — inset muted strip like Savings Targets cards */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs">
            Try:
          </span>
          {[
            { label: "tsh", q: "tsh" },
            { label: "feritină", q: "feritina" },
            { label: "vitamina d", q: "vitamina d" },
          ].map((c) => (
            <Button
              aria-label={`Search ${c.label}`}
              className="h-7 rounded-full bg-muted px-3 font-medium text-xs hover:bg-muted/80"
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
          <span className="hidden text-muted-foreground text-xs sm:inline">
            · type to see results
          </span>
        </div>

        {isLoading ? <Skeleton className="h-3 w-28 rounded-full" /> : null}
        {hasError ? (
          <div className="inset-card flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-sm">Could not load search</p>
            <Button
              className="rounded-full"
              onClick={load}
              size="sm"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
