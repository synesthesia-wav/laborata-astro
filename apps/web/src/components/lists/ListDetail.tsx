"use client";

import { BRANCHES } from "@workspace/data/branches";
import { PRICE_MIN_BY_ID } from "@workspace/data/prices";
import type { LabId } from "@workspace/data/types";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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
  computeCheapestSingleLab,
  feeForLab,
  feeNoteForLab,
} from "../../lib/comparison";
import type { List } from "../../lib/lists";
import {
  decodeShareToken,
  encodeShareToken,
  shareUrlFor,
} from "../../lib/lists";
import type { SearchDoc } from "../../lib/search";
import { foldDiacritics } from "../../lib/search";

const LABS: LabId[] = ["synevo", "sante", "invitro", "medexpert", "alfa"];

function sampleFor(testId: string, docs: SearchDoc[] | null): string {
  const d = docs?.find((x) => x.id === testId);
  return d?.sampleType ?? "Sânge";
}

export function ListDetail({ id: propId }: { id: string }) {
  const [list, setList] = useState<List | null>(null);
  const [allLists, setAllLists] = useState<List[]>([]);
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [shareReadOnly, setShareReadOnly] = useState<List | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchDocs, setSearchDocs] = useState<SearchDoc[] | null>(null);

  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() ?? propId;
    const effectiveId = pathId && pathId !== "liste" ? pathId : propId;
    const p = new URLSearchParams(window.location.search);
    const token = p.get("share");
    if (token) {
      const payload = decodeShareToken(token);
      if (payload) {
        setShareReadOnly(payload as unknown as List);
      }
    }

    const raw = window.localStorage.getItem("laborata:lists");
    let parsed: List[] = [];
    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch {
      parsed = [];
    }
    setAllLists(parsed);
    const found =
      parsed.find((l) => l.id === effectiveId) ??
      parsed.find((l) => l.id === propId) ??
      (token
        ? (decodeShareToken(token ?? "") as unknown as List | null)
        : null);
    if (found) {
      setList(found as List);
    } else if (parsed.length > 0) {
      setList(parsed[0]);
    }

    fetch("/search-light.json")
      .then((r) => r.json())
      .then((j) => setDocs((j.docs ?? j) as SearchDoc[]))
      .catch(() => setDocs([]));
    fetch("/search.json")
      .then((r) => r.json())
      .then((j) => setSearchDocs((j.docs ?? j) as SearchDoc[]))
      .catch(() => setSearchDocs([]));
  }, [propId]);

  const persist = (updated: List) => {
    const next = allLists.map((l) => (l.id === updated.id ? updated : l));
    const exists = next.some((l) => l.id === updated.id);
    const finalList = exists ? next : [...next, updated];
    window.localStorage.setItem("laborata:lists", JSON.stringify(finalList));
    setAllLists(finalList);
    setList(updated);
  };

  const handleRemove = (testId: string) => {
    if (!list) {
      return;
    }
    persist({ ...list, items: list.items.filter((x) => x !== testId) });
  };

  const handleAddFromSearch = (testId: string) => {
    if (!list) {
      return;
    }
    if (list.items.includes(testId)) {
      return;
    }
    const warn =
      list.items.length >= 12
        ? "List mare — compararea poate fi lungă, împarte în două?"
        : undefined;
    if (warn && list.items.length >= 13) {
      // still allow but we already warn
    }
    persist({ ...list, items: [...list.items, testId] });
  };

  const handlePinBranch = (branchId: string) => {
    if (!list) {
      return;
    }
    persist({ ...list, pinnedBranchId: branchId || undefined });
  };

  const handleCopyShare = async () => {
    if (!list) {
      return;
    }
    try {
      const url = shareUrlFor(
        list as unknown as Parameters<typeof shareUrlFor>[0],
        window.location.origin
      );
      const token = encodeShareToken(
        list as unknown as Parameters<typeof encodeShareToken>[0]
      );
      if (token.length > 2000) {
        throw new Error("Token >2k — split list");
      }
      await navigator.clipboard.writeText(url);
      alert(`Copied share link token ${token.length} <2k`);
    } catch (e) {
      alert(String(e));
    }
  };

  const handleRename = (name: string) => {
    if (!list) {
      return;
    }
    persist({ ...list, name: name.trim() || list.name });
  };

  const priceMap = useMemo(() => {
    const map: Record<string, Partial<Record<LabId, number>>> = {};
    for (const tid of list?.items ?? []) {
      const perVendor = PRICE_MIN_BY_ID[tid] as
        | Partial<Record<LabId, number>>
        | undefined;
      if (perVendor) {
        map[tid] = { ...perVendor };
      } else {
        map[tid] = {};
      }
    }
    return map;
  }, [list]);

  const sampleMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const tid of list?.items ?? []) {
      const s = sampleFor(tid, docs);
      const low = s.toLowerCase();
      if (low.includes("urină") || low.includes("urina")) {
        m[tid] = "urine";
      } else if (low.includes("frotiu")) {
        m[tid] = "swab";
      } else {
        m[tid] = "blood";
      }
    }
    return m;
  }, [list, docs]);

  const cheapest = useMemo(() => {
    if (!list || list.items.length === 0) {
      return null;
    }
    return computeCheapestSingleLab(list.items, priceMap, sampleMap);
  }, [list, priceMap, sampleMap]);

  const filteredSearch = useMemo(() => {
    if (!(searchInput.trim() && searchDocs)) {
      return [];
    }
    const q = foldDiacritics(searchInput.trim());
    return searchDocs.filter((d) => d.searchText.includes(q)).slice(0, 8);
  }, [searchInput, searchDocs]);

  if (!list) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>List not found</CardTitle>
          <CardDescription>
            Check /liste or open share link ?share=token
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => (window.location.href = "/liste")}>
            Go to lists
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overWarning = list.items.length > 12 || list.items.length === 12;
  const warning =
    list.items.length > 12
      ? "List mare — compararea poate fi lungă, împarte în două? (soft 12, 13th allowed non-blocking)"
      : list.items.length === 12
        ? "12/12 — următorul va fi soft warning."
        : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-(--gap) [--gap:--spacing(6)]">
      {shareReadOnly ? (
        <Alert>
          <AlertTitle>Shared view — read-only</AlertTitle>
          <AlertDescription>
            Opened via ?share= token &lt;2k on another phone with no account.
            Same prices +{" "}
            {shareReadOnly.pinnedBranchId
              ? "pinned branch"
              : "no pinned branch"}
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{list.items.length}/12 soft</Badge>
            {overWarning ? <Badge variant="outline">soft 12</Badge> : null}
            <span className="font-mono text-[10px] text-muted-foreground">
              {list.id}
            </span>
          </div>
          <Label className="sr-only" htmlFor={`list-name-${list.id}`}>
            Nume listă
          </Label>
          <Input
            aria-label="Nume listă"
            className="font-medium"
            defaultValue={list.name}
            id={`list-name-${list.id}`}
            onBlur={(e) => handleRename(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.target as HTMLInputElement).blur()
            }
          />
          {warning ? (
            <Alert className="mt-2">
              <AlertDescription className="text-xs">{warning}</AlertDescription>
            </Alert>
          ) : null}
          <CardDescription>
            <span className="font-mono text-xs">
              ?share= token {(() => {
                try {
                  return encodeShareToken(
                    list as unknown as Parameters<typeof encodeShareToken>[0]
                  ).length;
                } catch {
                  return 9999;
                }
              })()} &lt;2k
            </span>
            {list.pinnedBranchId ? (
              <span>
                {" "}
                • Pinned:{" "}
                {BRANCHES.find((b) => b.id === list.pinnedBranchId)?.address}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={handleCopyShare} size="sm">
            Copy share link
          </Button>
          <Button
            onClick={() => (window.location.href = "/comparatie")}
            size="sm"
            variant="outline"
          >
            Compară standalone
          </Button>
          <Select
            onValueChange={(v) =>
              handlePinBranch(v === "none" ? "" : (v ?? ""))
            }
            value={list.pinnedBranchId ?? "none"}
          >
            <SelectTrigger
              aria-label="Pinned branch"
              className="h-9 text-xs"
              size="sm"
            >
              <SelectValue placeholder="No pinned branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">No pinned branch</SelectItem>
                {BRANCHES.slice(0, 12).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.labId} — {b.address.slice(0, 40)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add tests</CardTitle>
          <CardDescription>
            Typeahead glicemie≡glucoza, feritina→Feritină, tsh→TSH
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label className="sr-only" htmlFor="list-detail-search">
            Caută analiză
          </Label>
          <Input
            aria-label="Caută analiză"
            id="list-detail-search"
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Caută tsh / feritina / glicemie"
            value={searchInput}
          />
          {filteredSearch.length > 0 ? (
            <ItemGroup className="gap-2" data-size="sm">
              {filteredSearch.map((d) => (
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
                      disabled={list.items.includes(d.id)}
                      onClick={() => handleAddFromSearch(d.id)}
                      size="sm"
                      variant="outline"
                    >
                      {list.items.includes(d.id) ? "Added" : "Add"}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          ) : searchInput.trim() ? (
            <p className="text-muted-foreground text-xs">
              Kindly widen — no match.
            </p>
          ) : null}
          {list.items.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Empty — add from analize or profil Bundle Add all.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Items ({list.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {list.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tests yet.</p>
          ) : (
            <ItemGroup className="gap-2" data-size="sm">
              {list.items.map((tid) => (
                <Item
                  key={tid}
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-muted/20"
                >
                  <ItemContent className="min-w-0">
                    <a
                      className="min-w-0 break-words font-medium font-mono text-sm underline decoration-dotted [overflow-wrap:anywhere]"
                      href={`/analize/${tid}`}
                    >
                      {tid}
                    </a>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      className="h-7 rounded-full px-3 text-xs"
                      onClick={() => handleRemove(tid)}
                      size="sm"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Compară — inline</CardTitle>
          <CardDescription>
            {cheapest ? (
              <>
                Cheapest single-lab:{" "}
                <span className="font-medium text-foreground">
                  {cheapest.labId} {cheapest.total} lei total
                </span>{" "}
                ({feeNoteForLab(cheapest.labId as LabId)}) • Save if split
                without push: see comparatie. Fee-included once.
              </>
            ) : list.items.length === 0 ? (
              "Add 1–12 tests to compare."
            ) : (
              "No lab covers all tests — try removing one."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto px-(--card-spacing)">
          {list.items.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              Empty comparison • Kindly widen — add tests.
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
                {list.items.map((tid) => (
                  <TableRow key={tid}>
                    <TableCell className="sticky left-0 z-10 bg-card px-(--card-spacing) font-medium font-mono text-xs">
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
                      const isCheapest = lab === cheapest.labId;
                      const hasAll = list.items.every(
                        (tid) => priceMap[tid]?.[lab] != null
                      );
                      if (!hasAll) {
                        return (
                          <TableCell className="px-(--card-spacing)" key={lab}>
                            —
                          </TableCell>
                        );
                      }
                      const sum = list.items.reduce(
                        (a, tid) => a + (priceMap[tid]?.[lab] ?? 0),
                        0
                      );
                      // one-fee-per-visit: determine correct fee sample (blood if any)
                      const anyBlood = list.items.some(
                        (tid) => (sampleMap[tid] ?? "blood") === "blood"
                      );
                      const feeSample = anyBlood
                        ? "blood"
                        : (sampleMap[list.items[0]] ?? "blood");
                      const honestFee = feeForLab(lab as LabId, feeSample);
                      const display = `${sum + honestFee} lei`;
                      return (
                        <TableCell
                          className={`px-(--card-spacing) ${isCheapest ? "font-bold text-primary" : ""}`}
                          key={lab}
                        >
                          {display}
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
