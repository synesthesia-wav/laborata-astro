"use client";

import { BRANCHES } from "@workspace/data/branches";
import type { Branch } from "@workspace/data/types";
import { LABS } from "@workspace/data/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
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
import { useEffect, useMemo, useState } from "react";

function isOpenNow(
  hours: Record<string, string[] | null>,
  now = new Date()
): boolean {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[now.getDay()];
  const intervals = hours[day as string];
  if (!intervals) {
    return false;
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const iv of intervals) {
    const [a, b] = iv.split("-").map((s) => s.trim());
    const toMin = (t: string): number => {
      const [h, m] = t.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };
    if (minutes >= toMin(a as string) && minutes <= toMin(b as string)) {
      return true;
    }
  }
  return false;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LAB_LABEL: Record<string, string> = {
  alfa: "Alfa",
  all: "Toate",
  invitro: "Invitro",
  medexpert: "MedExpert",
  sante: "Sante",
  synevo: "Synevo",
};

function telHref(phone: string): string {
  const cleaned = phone.replaceAll(/[^+\d]/g, "");
  return `tel:${cleaned}`;
}

interface Props {
  branches?: Branch[];
  disabled?: boolean;
  error?: string;
  idSuffix?: string;
  initialLab?: string;
  initialSample?: string;
  initialStreet?: string;
  loading?: boolean;
  onRetry?: () => void;
}

export function LabsTeaser({
  idSuffix = "home",
  disabled = false,
  loading = false,
  error,
  onRetry,
  initialLab = "all",
  initialSample = "all",
  initialStreet = "all",
  branches,
}: Props) {
  const [lab, setLab] = useState(initialLab);
  const [sample, setSample] = useState(initialSample);
  const [street, setStreet] = useState(initialStreet);

  const sourceBranches = branches ?? BRANCHES;

  const filtered = useMemo(
    () =>
      sourceBranches.filter(
        (b) =>
          (lab === "all" || b.labId === lab) &&
          (sample === "all" ||
            b.sampleTypes.includes(sample as (typeof b.sampleTypes)[number])) &&
          (street === "all" || b.streetKey === street)
      ),
    [lab, sample, street, sourceBranches]
  );

  const count = filtered.length;
  const mapBranch: Branch | null = filtered[0] ?? sourceBranches[0] ?? null;
  const streetLabel = street === "all" ? "Harta" : capitalize(street);
  const labLabel = lab === "all" ? "" : (LAB_LABEL[lab] ?? capitalize(lab));
  const isLabFiltered = lab !== "all";

  // hydration-safe open state
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [selectedOpen, setSelectedOpen] = useState(false);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const b of filtered) {
      next[b.id] = isOpenNow(b.hours as Record<string, string[] | null>);
    }
    if (mapBranch) {
      const v = isOpenNow(mapBranch.hours as Record<string, string[] | null>);
      next[mapBranch.id] = v;
      setSelectedOpen(v);
    } else {
      setSelectedOpen(false);
    }
    setOpenMap(next);
  }, [filtered, mapBranch]);

  if (loading) {
    return <LabsTeaserSkeleton idSuffix={idSuffix} />;
  }

  if (error) {
    return (
      <Card className="min-w-0" id={`labs-teaser-${idSuffix}`}>
        <CardHeader>
          <CardTitle className="text-base">
            Partner network — branches
          </CardTitle>
          <CardDescription>Could not load branches</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertTitle>Could not load branches</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onRetry} size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedLabMeta = mapBranch
    ? LABS.find((l) => l.id === mapBranch.labId)
    : undefined;
  const mapsSearchHref = mapBranch
    ? `https://www.google.com/maps/search/?api=1&query=${mapBranch.geo.lat},${mapBranch.geo.lng}`
    : "#";
  const embedSrc = mapBranch
    ? `https://www.google.com/maps?q=${mapBranch.geo.lat},${mapBranch.geo.lng}&z=15&output=embed`
    : "";

  const weekdayOrder: Array<keyof Branch["hours"]> = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
  const weekdayLabel: Record<string, string> = {
    Mon: "Mon",
    Tue: "Tue",
    Wed: "Wed",
    Thu: "Thu",
    Fri: "Fri",
    Sat: "Sat",
    Sun: "Sun",
  };

  return (
    <Card className="min-w-0 overflow-hidden" id={`labs-teaser-${idSuffix}`}>
      <CardHeader className="gap-2 pb-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="/laboratoare">Laboratoare</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {isLabFiltered ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/laboratoare/${lab}`}>
                    {labLabel}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbPage>{streetLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <CardTitle className="text-balance font-heading font-semibold text-[15px] leading-tight">
          Rețea parteneră — 5 laboratoare, {sourceBranches.length} filiale
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Filtrează după laborator, probă și sector. Vezi program, telefon și
          hartă.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-(--gap) [--gap:--spacing(4)]">
        <div className="inset-card flex flex-col gap-3 rounded-2xl">
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
            Laborator
          </span>
          <ToggleGroup
            aria-label="Filtrează după laborator"
            className="flex flex-wrap gap-1.5"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "all";
              if (!disabled) {
                setLab(nv);
              }
            }}
            size="sm"
            spacing={2}
            value={lab ? [lab] : []}
            variant="outline"
          >
            {["all", "synevo", "invitro", "sante", "medexpert", "alfa"].map(
              (v) => (
                <ToggleGroupItem
                  aria-label={v === "all" ? "Toate laboratoarele" : (LAB_LABEL[v] ?? capitalize(v))}
                  className="rounded-full px-3 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  disabled={disabled}
                  key={v}
                  value={v}
                >
                  {LAB_LABEL[v] ?? capitalize(v)}
                </ToggleGroupItem>
              )
            )}
          </ToggleGroup>
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
            Probă
          </span>
          <ToggleGroup
            aria-label="Filtrează după probă"
            className="flex flex-wrap gap-1.5"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "all";
              if (!disabled) {
                setSample(nv);
              }
            }}
            size="sm"
            spacing={2}
            value={sample ? [sample] : []}
            variant="outline"
          >
            {["all", "Sânge", "Urină", "Frotiu"].map((v) => (
              <ToggleGroupItem
                aria-label={v === "all" ? "Toate probele" : v}
                className="rounded-full px-3 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled={disabled}
                key={v}
                value={String(v)}
              >
                {v === "all" ? "Toate" : v}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
            Sector
          </span>
          <ToggleGroup
            aria-label="Filtrează după sector"
            className="flex flex-wrap gap-1.5"
            onValueChange={(v) => {
              const nv = (v as string[])[0] ?? "all";
              if (!disabled) {
                setStreet(nv);
              }
            }}
            size="sm"
            spacing={2}
            value={street ? [street] : []}
            variant="outline"
          >
            {[
              "all",
              "botanica",
              "centru",
              "riscani",
              "buiucani",
              "ciocana",
              "telecentru",
            ].map((v) => (
              <ToggleGroupItem
                aria-label={v === "all" ? "Toate sectoarele" : capitalize(v)}
                className="rounded-full px-3 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled={disabled}
                key={v}
                value={v}
              >
                {v === "all" ? "Toate" : capitalize(v)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div
          aria-live="polite"
          className="inset-card py-2.5 font-medium text-muted-foreground text-xs"
        >
          <span className="tabular-nums">{count} filiale</span> găsite
          {street === "all" ? "" : ` · ${capitalize(street)}`}{" "}
          {sample === "all" ? "" : ` · ${sample}`} ·{" "}
          <span className={selectedOpen ? "text-primary" : ""}>
            {selectedOpen ? "deschis acum" : "închis"}
          </span>
        </div>
        <div className="grid gap-(--gap) [--gap:--spacing(3)] lg:grid-cols-[1.2fr_0.8fr]">
          <ScrollArea className="h-[320px] rounded-2xl border bg-muted/20">
            <ItemGroup className="p-1.5">
              {filtered.length === 0 ? (
                <div className="p-8">
                  <Empty className="border border-dashed bg-transparent">
                    <EmptyHeader>
                      <EmptyTitle>Nicio filială potrivită</EmptyTitle>
                      <EmptyDescription>
                        Lărgește filtrele — încearcă „Toate sectoarele” sau
                        „Toate probele”.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                filtered.map((b) => {
                  const open = openMap[b.id] ?? false;
                  return (
                    <Item
                      className="rounded-xl"
                      key={b.id}
                      size="sm"
                      variant={open ? "muted" : "outline"}
                    >
                      <ItemMedia variant="icon">🏥</ItemMedia>
                      <ItemContent>
                        <ItemTitle className="gap-1.5 text-sm">
                          <span className="truncate">{b.address}</span>
                          {open ? (
                            <Badge className="rounded-full" variant="default">
                              Deschis
                            </Badge>
                          ) : (
                            <Badge className="rounded-full" variant="outline">
                              Închis
                            </Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription className="line-clamp-1 text-xs">
                          {b.hours.Mon?.join(" · ") ?? "Închis"}{" "}
                          {b.hoursNote ? `· ${b.hoursNote} · ` : "· "}
                          {b.phone}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          className="rounded-full inline-flex"
                          variant="outline"
                        >
                          {LAB_LABEL[b.labId] ?? capitalize(b.labId)}
                        </Badge>
                        <Badge className="rounded-full" variant="secondary">
                          {b.sampleTypes[0]}
                        </Badge>
                      </ItemActions>
                    </Item>
                  );
                })
              )}
            </ItemGroup>
          </ScrollArea>
          <div className="flex flex-col gap-3">
            {mapBranch ? (
              <>
                <iframe
                  className="h-[200px] w-full rounded-2xl border"
                  loading="lazy"
                  src={embedSrc}
                  title={`Map — ${mapBranch.address}`}
                />
                <div className="inset-card flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="rounded-full" variant="outline">
                      {LAB_LABEL[mapBranch.labId] ?? capitalize(mapBranch.labId)}
                    </Badge>
                    {selectedLabMeta?.renar ? (
                      <Badge className="rounded-full" variant="secondary">
                        Renar
                      </Badge>
                    ) : null}
                    <Badge className="rounded-full" variant="secondary">
                      {mapBranch.sampleTypes[0] ?? "Sânge"}
                    </Badge>
                    {selectedOpen ? (
                      <Badge className="rounded-full" variant="default">
                        Deschis acum
                      </Badge>
                    ) : (
                      <Badge className="rounded-full" variant="outline">
                        Închis acum
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="break-words font-medium text-sm leading-tight">
                      {mapBranch.address}
                    </span>
                    <a
                      className="w-fit break-all font-medium text-xs underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground"
                      href={telHref(mapBranch.phone)}
                    >
                      {mapBranch.phone}
                    </a>
                    <a
                      className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
                      href={mapsSearchHref}
                      rel="noopener"
                      target="_blank"
                    >
                      Open in Google Maps · Direcții →
                    </a>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {mapBranch.geo.lat.toFixed(5)},{" "}
                      {mapBranch.geo.lng.toFixed(5)}
                    </span>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                    {weekdayOrder.map((d) => {
                      const v = mapBranch.hours[d];
                      return (
                        <div
                          className="contents"
                          key={d}
                        >
                          <span className="font-medium">
                            {weekdayLabel[d]}
                          </span>
                          <span
                            className="font-mono text-muted-foreground"
                          >
                            {v ? v.join(" · ") : "Închis"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border bg-muted/20">
                <span className="text-muted-foreground text-xs">
                  Harta — selectează o filială
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            className="rounded-full"
            render={<a href="/harta" />}
            variant="default"
          >
            Vezi harta completă
          </Button>
          <Button
            className="rounded-full"
            render={<a href="/laboratoare" />}
            variant="outline"
          >
            Toate laboratoarele
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LabsTeaserSkeleton({
  idSuffix = "skeleton",
}: {
  idSuffix?: string;
}) {
  return (
    <Card id={`labs-teaser-${idSuffix}`}>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-(--gap) [--gap:--spacing(4)]">
        <div className="inset-card flex flex-col gap-3 rounded-2xl">
          <Skeleton className="h-3 w-16" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-12" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-7 w-12 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-14" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-2xl" />
        <div className="grid gap-(--gap) [--gap:--spacing(3)] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[320px] rounded-2xl bg-muted/20 p-1.5">
            <ItemGroup className="p-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Item
                  className="rounded-xl bg-muted/20"
                  key={i}
                  size="sm"
                  variant="outline"
                >
                  <Skeleton className="size-8 rounded-xl" />
                  <ItemContent className="gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </ItemContent>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </Item>
              ))}
            </ItemGroup>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <div className="inset-card flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
