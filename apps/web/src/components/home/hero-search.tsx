"use client";

import { RiSearchLine } from "@remixicon/react";
import { Button } from "@workspace/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { useState } from "react";

function normalizeDiacritics(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface Props {
  idSuffix?: string;
  onSearch?: (q: string) => void;
}

export function HeroSearch({ idSuffix = "home-hero", onSearch }: Props) {
  const [value, setValue] = useState("");

  const normalizedPreview = normalizeDiacritics(value);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-balance font-heading font-semibold text-3xl tracking-tight">
        Find the right tests, at a fair price.
      </h1>
      <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
        Understand without diacritics —{" "}
        <span className="font-medium text-foreground">tsh</span> finds
        <span className="font-medium text-foreground"> TSH</span>,{" "}
        <span className="font-medium text-foreground">feritina</span> finds{" "}
        <span className="font-medium text-foreground">Feritină</span>. Neutral
        comparison across 5 labs. Wired to{" "}
        <span className="font-mono text-xs">dist/search.json</span> • minisearch
        diacritics-insensitive.
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
          <InputGroup className="h-12 rounded-2xl bg-card">
            <InputGroupAddon align="inline-start">
              <RiSearchLine aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              autoComplete="off"
              enterKeyHint="search"
              id={`hero-search-${idSuffix}`}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Try: tsh / feritină / vitamina d"
              value={value}
            />
            <InputGroupAddon align="inline-end">
              <Button aria-label="Search" size="sm" type="submit">
                Search
              </Button>
            </InputGroupAddon>
          </InputGroup>
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
