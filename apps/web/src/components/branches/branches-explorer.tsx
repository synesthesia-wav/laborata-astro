"use client";

import { BRANCHES } from "@workspace/data/branches";
import type { Branch } from "@workspace/data/types";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useMemo, useState } from "react";

const LABS_ORDER = ["all", "alfa", "sante", "synevo", "invitro", "medexpert"];
const LAB_LABEL: Record<string, string> = {
  alfa: "Alfa",
  all: "Toate",
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
  disabled?: boolean;
  error?: string;
  hideLabFilter?: boolean;
  idSuffix?: string;
  initialLab?: string;
  initialSample?: string;
  initialStreet?: string;
  loading?: boolean;
  onRetry?: () => void;
}

export function BranchesExplorer({
  idSuffix = "explorer",
  initialLab = "all",
  initialSample = "all",
  initialStreet = "all",
  hideLabFilter = false,
  loading = false,
  error,
  onRetry,
  disabled = false,
}: Props) {
  const [lab, setLab] = useState(initialLab);
  const [sample, setSample] = useState(initialSample);
  const [street, setStreet] = useState(initialStreet);
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

  if (loading) {
    return (
      <Card id={`branches-explorer-${idSuffix}`}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[340px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card id={`branches-explorer-${idSuffix}`}>
        <CardHeader>
          <CardTitle className="text-base">Filiale</CardTitle>
          <CardDescription>Nu am putut încărca filialele</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRetry ? (
            <Button onClick={onRetry} size="sm" variant="outline">
              Reîncearcă
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0" id={`branches-explorer-${idSuffix}`}>
      <CardHeader>
        <CardTitle className="text-base">
          {hideLabFilter && lab !== "all"
            ? `${LAB_LABEL[lab] ?? lab} — ${count} filiale`
            : `Filiale — ${count} găsite`}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Filtrează după laborator, probă și sector. Vezi program, telefon și
          hartă.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hideLabFilter && (
          <ToggleGroup
            aria-label="Filtrează după laborator"
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
                disabled={disabled}
                key={`lab-${v}`}
                value={v}
              >
                {LAB_LABEL[v] ?? v}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        <ToggleGroup
          aria-label="Filtrează după probă"
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
              aria-label={v === "all" ? "Toate probele" : String(v)}
              className="rounded-full"
              disabled={disabled}
              key={`sample-${v}`}
              value={String(v)}
            >
              {v === "all" ? "Toate" : String(v)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Filtrează după sector"
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
              aria-label={v === "all" ? "Toate sectoarele" : v}
              className="rounded-full"
              disabled={disabled}
              key={`street-${v}`}
              value={v}
            >
              {v === "all" ? "Toate" : v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div
          aria-live="polite"
          className="text-muted-foreground text-xs"
          id={`branches-count-${idSuffix}`}
        >
          {count} filiale găsite
          {lab === "all" ? "" : ` · ${LAB_LABEL[lab] ?? lab}`}
          {sample === "all" ? "" : ` · ${sample}`}
          {street === "all" ? "" : ` · ${street}`}
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
            Nicio filială de afișat — încearcă „Toate sectoarele”
          </div>
        )}
        <ScrollArea className="h-[340px] rounded-xl border">
          <ItemGroup>
            {filtered.length === 0 ? (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Nicio filială potrivită</EmptyTitle>
                    <EmptyDescription>
                      Lărgește filtrele — încearcă „Toate sectoarele” sau „Toate
                      probele”.
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
                    aria-disabled={disabled}
                    aria-selected={isSelected}
                    className={
                      disabled
                        ? "opacity-60"
                        : "cursor-pointer hover:bg-accent/50"
                    }
                    key={b.id}
                    onClick={() => {
                      if (!disabled) {
                        setSelectedId(b.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (disabled) {
                        return;
                      }
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(b.id);
                      }
                    }}
                    role="button"
                    size="sm"
                    tabIndex={disabled ? -1 : 0}
                    variant={
                      isSelected ? "default" : open ? "muted" : "outline"
                    }
                  >
                    <ItemMedia variant="icon">🏥</ItemMedia>
                    <ItemContent>
                      <ItemTitle className="gap-1.5">
                        <span className="truncate">{b.address}</span>
                        {open ? (
                          <Badge variant="default">Deschis acum</Badge>
                        ) : (
                          <Badge variant="outline">Închis acum</Badge>
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
                          <Badge
                            className="hidden sm:inline-flex"
                            variant="outline"
                          >
                            {b.streetKey}
                          </Badge>
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
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={disabled}
            onClick={() => {
              window.location.href = "/harta";
            }}
            size="sm"
            variant="outline"
          >
            Vezi harta
          </Button>
          <Button
            disabled={disabled}
            onClick={() => {
              window.location.href = "/laboratoare";
            }}
            size="sm"
            variant="ghost"
          >
            Toate laboratoarele
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
