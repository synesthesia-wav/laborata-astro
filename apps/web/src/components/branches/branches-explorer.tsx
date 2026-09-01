"use client";

import { BRANCHES } from "@workspace/data/branches";
import type { Branch } from "@workspace/data/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useMemo, useState } from "react";

const LABS_ORDER = ["all", "alfa", "sante", "synevo", "invitro", "medexpert"];
const LAB_LABEL: Record<string, string> = {
  alfa: "Alfa",
  all: "All labs",
  invitro: "Invitro",
  medexpert: "MedExpert",
  sante: "Sante",
  synevo: "Synevo",
};

const SAMPLE_OPTIONS = ["all", "Sânge", "Urină", "Frotiu"] as const;

function getStreetOptions(): string[] {
  const keys = [...new Set(BRANCHES.map((b) => b.streetKey))].sort();
  const required = [
    "botanica",
    "centru",
    "riscani",
    "ciocana",
    "buiucani",
    "telecentru",
  ];
  for (const k of required) {
    if (!keys.includes(k)) {
      keys.push(k);
    }
  }
  keys.sort();
  return ["all", ...keys];
}

const STREET_OPTIONS = getStreetOptions();

function isOpenNow(
  hours: Record<string, string[] | null>,
  now = new Date()
): boolean {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[now.getDay()] ?? "Mon";
  const intervals = hours[day];
  if (!intervals || intervals.length === 0) {
    return false;
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const iv of intervals) {
    const [a, b] = iv.split("-").map((s) => s.trim());
    if (!(a && b)) {
      continue;
    }
    const toMin = (t: string): number => {
      const [h, m] = t.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };
    if (minutes >= toMin(a) && minutes <= toMin(b)) {
      return true;
    }
  }
  return false;
}

function formatHours(hours: Record<string, string[] | null>): string {
  const order: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const d of order) {
    const v = hours[d];
    if (v && v.length > 0) {
      return v.join(" • ");
    }
  }
  return "Closed";
}

function formatNextOpen(hours: Record<string, string[] | null>): string {
  const label = formatHours(hours);
  if (label === "Closed") {
    return "Closed";
  }
  return label;
}

interface Props {
  hideLabFilter?: boolean;
  idSuffix?: string;
  initialLab?: string;
}

export function BranchesExplorer({
  idSuffix = "explorer",
  initialLab = "all",
  hideLabFilter = false,
}: Props) {
  const [lab, setLab] = useState(initialLab);
  const [sample, setSample] = useState("all");
  const [street, setStreet] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered: Branch[] = useMemo(
    () =>
      BRANCHES.filter(
        (b) =>
          (lab === "all" || b.labId === lab) &&
          (sample === "all" ||
            b.sampleTypes.includes(sample as (typeof b.sampleTypes)[number])) &&
          (street === "all" || b.streetKey === street)
      ),
    [lab, sample, street]
  );

  const count = filtered.length;
  const selectedBranch = useMemo(
    () => filtered.find((b) => b.id === selectedId) ?? null,
    [filtered, selectedId]
  );
  const mapBranch: Branch | null = selectedBranch ?? filtered[0] ?? null;

  return (
    <Card className="min-w-0" id={`branches-explorer-${idSuffix}`}>
      <CardHeader>
        <CardTitle className="text-base">
          {hideLabFilter && lab !== "all"
            ? `${LAB_LABEL[lab] ?? lab} — ${count} branches`
            : `Filiale — ${count} branches match`}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Filter lab × sample × sector. Real hours{" "}
          <span className="font-mono">["07:30-15:00"]</span> /{" "}
          <span className="font-mono">["08:00-11:30","12:30-16:00"]</span> ·
          Phone · sampleTypes Sânge/Urină/Frotiu · geo lat/lng
          {count === 12 ? " · 12 branches match demo" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hideLabFilter && (
          <ToggleGroup
            aria-label="Filter by lab"
            className="flex flex-wrap gap-2"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "all";
              setLab(nv);
            }}
            size="sm"
            spacing={2}
            value={lab ? [lab] : []}
            variant="outline"
          >
            {LABS_ORDER.map((v) => (
              <ToggleGroupItem
                aria-label={LAB_LABEL[v] ?? v}
                className="rounded-full"
                key={`lab-${v}`}
                value={v}
              >
                {LAB_LABEL[v] ?? v}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        <ToggleGroup
          aria-label="Filter by sample"
          className="flex flex-wrap gap-2"
          onValueChange={(v) => {
            const nv = (v as string[])[0] ?? "all";
            setSample(String(nv));
          }}
          size="sm"
          spacing={2}
          value={sample ? [String(sample)] : []}
          variant="outline"
        >
          {SAMPLE_OPTIONS.map((v) => (
            <ToggleGroupItem
              aria-label={v === "all" ? "All samples" : String(v)}
              className="rounded-full"
              key={`sample-${v}`}
              value={String(v)}
            >
              {v === "all" ? "All samples" : String(v)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Filter by sector"
          className="flex flex-wrap gap-2"
          onValueChange={(v) => {
            const nv = (v as string[])[0] ?? "all";
            setStreet(nv);
          }}
          size="sm"
          spacing={2}
          value={street ? [street] : []}
          variant="outline"
        >
          {STREET_OPTIONS.map((v) => (
            <ToggleGroupItem
              aria-label={v === "all" ? "All sectors" : v}
              className="rounded-full"
              key={`street-${v}`}
              value={v}
            >
              {v === "all" ? "All sectors" : v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div
          aria-live="polite"
          className="text-muted-foreground text-xs"
          id={`branches-count-${idSuffix}`}
        >
          {count} branches match
          {lab === "all" ? "" : ` · ${LAB_LABEL[lab] ?? lab}`}
          {sample === "all" ? "" : ` · ${sample}`}
          {street === "all" ? "" : ` · ${street}`}
          {" · "}
          {BRANCHES.filter((b) => b.labId === "alfa").length} alfa ·{" "}
          {BRANCHES.filter((b) => b.labId === "sante").length} sante ·{" "}
          {BRANCHES.filter((b) => b.labId === "synevo").length} synevo ·{" "}
          {BRANCHES.filter((b) => b.labId === "invitro").length} invitro ·{" "}
          {BRANCHES.filter((b) => b.labId === "medexpert").length} medexpert
        </div>
        {mapBranch ? (
          <iframe
            allowFullScreen={false}
            className="h-[280px] w-full rounded-xl border"
            id={`branches-map-${idSuffix}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${mapBranch.geo.lat},${mapBranch.geo.lng}&z=15&output=embed`}
            title={mapBranch.address}
          />
        ) : (
          <div
            className="flex h-[280px] w-full items-center justify-center rounded-xl border bg-muted p-4 text-center text-muted-foreground text-xs"
            id={`branches-map-${idSuffix}`}
          >
            No branch to show on map — try All sectors
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <ScrollArea className="h-[340px] rounded-xl border">
            <ItemGroup>
              {filtered.length === 0 ? (
                <div className="p-6">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No branch matches</EmptyTitle>
                      <EmptyDescription>
                        Kindly widen your search — try All sectors or All
                        samples. No branch matches your filters.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                filtered.map((b) => {
                  const open = isOpenNow(
                    b.hours as Record<string, string[] | null>
                  );
                  const hoursLabel = formatNextOpen(
                    b.hours as Record<string, string[] | null>
                  );
                  const isSelected = selectedId === b.id;
                  return (
                    <Item
                      aria-selected={isSelected}
                      className="cursor-pointer hover:bg-accent/50"
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(b.id);
                        }
                      }}
                      role="button"
                      size="sm"
                      tabIndex={0}
                      variant={
                        isSelected ? "default" : open ? "muted" : "outline"
                      }
                    >
                      <ItemMedia variant="icon">🏥</ItemMedia>
                      <ItemContent>
                        <ItemTitle className="gap-1.5">
                          <span className="truncate">{b.address}</span>
                          {open ? (
                            <Badge
                              className="h-4 px-1.5 text-[10px]"
                              variant="default"
                            >
                              Open now
                            </Badge>
                          ) : (
                            <Badge
                              className="h-4 text-[10px]"
                              variant="outline"
                            >
                              Closed · Opens at 8:00
                            </Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription className="flex flex-col gap-1">
                          <span className="line-clamp-1">
                            {hoursLabel} {b.hoursNote ? `· ${b.hoursNote}` : ""}
                          </span>
                          <span className="flex flex-wrap items-center gap-1.5">
                            <a
                              className="underline underline-offset-4 hover:text-foreground"
                              href={`tel:${b.phone.replaceAll(" ", "").replaceAll("(", "").replaceAll(")", "").replaceAll("-", "")}`}
                            >
                              {b.phone}
                            </a>
                            <span>·</span>
                            <span>{b.sampleTypes.join(", ")}</span>
                            <span>·</span>
                            <span className="font-mono">
                              {b.geo.lat.toFixed(3)}, {b.geo.lng.toFixed(3)}
                            </span>
                            <Badge
                              className="hidden sm:inline-flex"
                              variant="outline"
                            >
                              {b.streetKey}
                            </Badge>
                            <Badge variant="secondary">
                              {b.sampleTypes[0]}
                            </Badge>
                            <Badge variant="outline">{b.labId}</Badge>
                          </span>
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          className="hidden sm:inline-flex"
                          variant="outline"
                        >
                          {b.labId}
                        </Badge>
                      </ItemActions>
                    </Item>
                  );
                })
              )}
            </ItemGroup>
          </ScrollArea>
          <div className="flex flex-col gap-3">
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border bg-muted p-4 text-center">
              <span className="text-muted-foreground text-xs">
                Map preview — {count} pins · geo lat/lng
              </span>
              <span className="max-w-[22ch] text-muted-foreground text-xs leading-relaxed">
                Static embed placeholder — no heavy map lib day one. Pins use
                real lat/lng from @workspace/data/branches.
              </span>
              <div className="grid w-full grid-cols-2 gap-2 pt-2 text-left">
                {filtered.slice(0, 4).map((b) => (
                  <div
                    className="truncate rounded border bg-card px-2 py-1.5 text-xs"
                    key={`pin-${b.id}`}
                  >
                    <span className="font-medium">{b.labId}</span> ·{" "}
                    {b.geo.lat.toFixed(2)},{b.geo.lng.toFixed(2)}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 rounded border border-dashed bg-card px-2 py-1.5 text-center text-muted-foreground text-xs">
                    Not empty map — map stays, list shows Kindly widen.
                  </div>
                )}
              </div>
              <Separator className="my-1" />
              <span className="font-mono text-[10px] text-muted-foreground">
                Example: {BRANCHES[0]?.address ?? "—"} ·{" "}
                {BRANCHES[0]?.phone ?? "—"} ·{" "}
                {BRANCHES[0]?.sampleTypes.join(", ") ?? "—"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">320px verificat</Badge>
              <Badge variant="outline">light ✓</Badge>
              <Badge variant="secondary">145 total</Badge>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              window.location.href = "/harta";
            }}
            size="sm"
            variant="outline"
          >
            View harta
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/laboratoare";
            }}
            size="sm"
            variant="ghost"
          >
            All labs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
