"use client";

import type { LabId } from "@workspace/data/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useEffect, useMemo, useState } from "react";
import {
  computeCheapestPerTestTotal,
  computeCheapestSingleLab,
  feeNoteForLab,
} from "../../lib/comparison";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

const LABS: LabId[] = ["synevo", "sante", "invitro", "medexpert", "alfa"];

function pseudoPrice(testId: string, lab: LabId): number {
  const hash = testId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 100 + (hash % 200);
  const off: Record<LabId, number> = {
    alfa: -5,
    invitro: 15,
    medexpert: 8,
    sante: -10,
    synevo: 5,
  };
  return base + (off[lab] ?? 0);
}

export function ComparisonPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [sampleMap, setSampleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/search-light.json")
      .then((r) => r.json())
      .then((j) => {
        const fetched = (j.docs ?? j) as SearchDoc[];
        setDocs(fetched);
        const m: Record<string, string> = {};
        for (const d of fetched) {
          const s =
            (d as unknown as { sampleType?: string }).sampleType ?? "Sânge";
          const low = s.toLowerCase();
          if (low.includes("urină") || low.includes("urina")) {
            m[d.id] = "urine";
          } else if (low.includes("frotiu")) {
            m[d.id] = "swab";
          } else {
            m[d.id] = "blood";
          }
        }
        setSampleMap(m);
      })
      .catch(() => setDocs([]));
  }, []);

  const filtered = useMemo(() => {
    if (!(docs && query.trim())) {
      return [];
    }
    const q = foldDiacritics(query.trim());
    return docs.filter((d) => d.searchText.includes(q)).slice(0, 10);
  }, [docs, query]);

  const priceMap = useMemo(() => {
    const m: Record<string, Partial<Record<LabId, number>>> = {};
    for (const tid of selected) {
      m[tid] = {};
      for (const lab of LABS) {
        m[tid][lab] = pseudoPrice(tid, lab);
      }
    }
    return m;
  }, [selected]);

  const cheapest = useMemo(() => {
    if (selected.length === 0) {
      return null;
    }
    return computeCheapestSingleLab(selected, priceMap, sampleMap);
  }, [selected, priceMap, sampleMap]);

  const bestPerTest = useMemo(() => {
    if (selected.length === 0) {
      return 0;
    }
    return computeCheapestPerTestTotal(selected, priceMap, sampleMap);
  }, [selected, priceMap, sampleMap]);

  const saveIfSplit = cheapest
    ? Math.max(
        0,
        cheapest.total -
          (bestPerTest +
            (cheapest.labId === "sante" || cheapest.labId === "medexpert"
              ? 0
              : cheapest.labId === "alfa"
                ? 25
                : 30))
      )
    : 0;

  const add = (id: string) => {
    if (selected.includes(id)) {
      return;
    }
    if (selected.length >= 13) {
      // soft 12 warning but still allow
    }
    setSelected((s) => [...s, id]);
  };

  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Compară — standalone picker (secondary to liste inline)
          </CardTitle>
          <CardDescription>
            Soft 12, overflow-x-auto sticky, cheapestSingleLab fee-included +
            saveIfSplit without push.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label className="sr-only" htmlFor="comparison-picker-search">
            Caută analiză pentru comparație
          </Label>
          <Input
            aria-label="Caută analiză pentru comparație"
            id="comparison-picker-search"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Adaugă: tsh / feritina / glicemie"
            value={query}
          />
          {filtered.length > 0 ? (
            <div className="grid gap-2">
              {filtered.map((d) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  key={d.id}
                >
                  <span className="truncate text-sm">
                    {d.title}{" "}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {d.slug}
                    </span>
                  </span>
                  <Button
                    className="h-7 text-xs"
                    disabled={selected.includes(d.id)}
                    onClick={() => add(d.id)}
                    size="sm"
                    variant="outline"
                  >
                    {selected.includes(d.id) ? "Added" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <p className="text-muted-foreground text-xs">
              Kindly widen — no match.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Caută și adaugă 1–12 teste. Selected are compared fee-included.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {selected.map((id) => (
              <Badge
                className="gap-1 font-mono text-xs"
                key={id}
                variant="secondary"
              >
                {id}
                <button
                  className="ml-1 rounded-full bg-muted px-1 text-[10px]"
                  onClick={() => remove(id)}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                No tests selected
              </span>
            ) : null}
          </div>
          {selected.length >= 12 ? (
            <p className="text-amber-600 text-xs">
              List mare — compararea poate fi lungă, împarte în două? (soft 12)
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button onClick={() => setSelected([])} size="sm" variant="ghost">
              Clear
            </Button>
            <Button
              disabled={selected.length === 0}
              onClick={() => (window.location.href = "/liste")}
              size="sm"
            >
              Save to list
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Rezultat — fee-included</CardTitle>
          <CardDescription>
            {cheapest ? (
              <>
                Cheapest single-lab:{" "}
                <span className="font-medium text-foreground">
                  {cheapest.labId} {cheapest.total} lei
                </span>{" "}
                ({feeNoteForLab(cheapest.labId as LabId)}) • Save if split:{" "}
                <span className="font-medium">{saveIfSplit} lei</span> without
                push — your choice.
              </>
            ) : selected.length === 0 ? (
              "No tests to compare — add 1–12."
            ) : (
              "No lab covers all tests — try removing one."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto">
          {selected.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              Empty — add tests above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 bg-muted/50 px-3">
                    Test
                  </TableHead>
                  {LABS.map((lab) => (
                    <TableHead className="px-3 capitalize" key={lab}>
                      {lab}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.map((tid) => (
                  <TableRow key={tid}>
                    <TableCell className="sticky left-0 z-10 bg-card px-3 font-mono text-xs">
                      {tid}
                    </TableCell>
                    {LABS.map((lab) => (
                      <TableCell className="px-3 font-mono text-xs" key={lab}>
                        {priceMap[tid]?.[lab]} lei
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {cheapest ? (
                  <TableRow className="bg-primary/5 font-medium">
                    <TableCell className="sticky left-0 z-10 bg-primary/5 px-3">
                      Total fee-included
                    </TableCell>
                    {LABS.map((lab) => {
                      const sum = selected.reduce(
                        (a, tid) => a + (priceMap[tid]?.[lab] ?? 0),
                        0
                      );
                      const fee =
                        lab === "sante" || lab === "medexpert"
                          ? 0
                          : lab === "alfa"
                            ? 25
                            : 30;
                      return (
                        <TableCell
                          className={`px-3 ${lab === cheapest.labId ? "font-bold text-primary" : ""}`}
                          key={lab}
                        >
                          {sum + fee} lei
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
