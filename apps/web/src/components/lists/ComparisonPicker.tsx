"use client";

import { PRICE_MIN_BY_ID } from "@workspace/data/prices";
import type { LabId } from "@workspace/data/types";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item";
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
  computeComparison,
  feeForLab,
  feeNoteForLab,
} from "../../lib/comparison";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

const LABS: LabId[] = ["synevo", "sante", "invitro", "medexpert", "alfa"];

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
      const perVendor = PRICE_MIN_BY_ID[tid] as
        | Partial<Record<LabId, number>>
        | undefined;
      m[tid] = perVendor ? { ...perVendor } : {};
    }
    return m;
  }, [selected]);

  const comparison = useMemo(() => {
    if (selected.length === 0) {
      return null;
    }
    return computeComparison(selected, priceMap, sampleMap);
  }, [selected, priceMap, sampleMap]);

  const cheapest = comparison?.cheapestSingleLab ?? null;
  const saveIfSplit = comparison?.saveIfSplit ?? 0;

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
    <div className="flex min-w-0 flex-col gap-(--gap) [--gap:--spacing(6)]">
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
            <ItemGroup className="gap-2" data-size="sm">
              {filtered.map((d) => (
                <Item
                  key={d.id}
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-muted/20"
                >
                  <ItemContent className="min-w-0">
                    <ItemTitle className="truncate text-sm">
                      {d.title}{" "}
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {d.slug}
                      </span>
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      className="h-7 rounded-full px-3 text-xs"
                      disabled={selected.includes(d.id)}
                      onClick={() => add(d.id)}
                      size="sm"
                      variant="outline"
                    >
                      {selected.includes(d.id) ? "Added" : "Add"}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
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
                key={id}
                variant="secondary"
                className="gap-1.5 py-1 pr-1 pl-2.5 font-mono text-xs"
              >
                {id}
                <Button
                  aria-label={`Remove ${id}`}
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-0.5 size-5 rounded-full"
                  onClick={() => remove(id)}
                >
                  ×
                </Button>
              </Badge>
            ))}
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                No tests selected
              </span>
            ) : null}
          </div>
          {selected.length >= 12 ? (
            <Alert>
              <AlertDescription className="text-xs">
                List mare — compararea poate fi lungă, împarte în două? (soft
                12)
              </AlertDescription>
            </Alert>
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
        <CardContent className="min-w-0 overflow-x-auto px-(--card-spacing)">
          {selected.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              Empty — add tests above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 bg-muted/50 px-(--card-spacing)">
                    Test
                  </TableHead>
                  {LABS.map((lab) => (
                    <TableHead
                      className="px-(--card-spacing) capitalize"
                      key={lab}
                    >
                      {lab}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.map((tid) => (
                  <TableRow key={tid}>
                    <TableCell className="sticky left-0 z-10 bg-card px-(--card-spacing) font-mono text-xs">
                      {tid}
                    </TableCell>
                    {LABS.map((lab) => (
                      <TableCell
                        className="px-(--card-spacing) font-mono text-xs"
                        key={lab}
                      >
                        {priceMap[tid]?.[lab] == null
                          ? "—"
                          : `${priceMap[tid]?.[lab]} lei`}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {cheapest ? (
                  <TableRow className="bg-primary/5 font-medium">
                    <TableCell className="sticky left-0 z-10 bg-primary/5 px-(--card-spacing)">
                      Total fee-included
                    </TableCell>
                    {LABS.map((lab) => {
                      const hasAll = selected.every(
                        (tid) => priceMap[tid]?.[lab] != null
                      );
                      if (!hasAll) {
                        return (
                          <TableCell className="px-(--card-spacing)" key={lab}>
                            —
                          </TableCell>
                        );
                      }
                      const sum = selected.reduce(
                        (a, tid) => a + (priceMap[tid]?.[lab] ?? 0),
                        0
                      );
                      const anyBlood = selected.some(
                        (id) => (sampleMap[id] ?? "blood") === "blood"
                      );
                      const feeSample = anyBlood
                        ? "blood"
                        : (sampleMap[selected[0]] ?? "blood");
                      const fee = feeForLab(lab as LabId, feeSample);
                      return (
                        <TableCell
                          className={`px-(--card-spacing) ${lab === cheapest.labId ? "font-bold text-primary" : ""}`}
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
