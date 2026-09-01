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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useMemo, useState } from "react";

function isOpenNow(
  hours: Record<string, string[] | null>,
  now = new Date()
): boolean {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[now.getDay()];
  const intervals = hours[day];
  if (!intervals) {
    return false;
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const iv of intervals) {
    const [a, b] = iv.split("-").map((s) => s.trim());
    const toMin = (t: string): number => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (minutes >= toMin(a) && minutes <= toMin(b)) {
      return true;
    }
  }
  return false;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  const labLabel = lab === "all" ? "" : capitalize(lab);
  const isLabFiltered = lab !== "all";

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

  const selectedOpen = mapBranch
    ? isOpenNow(mapBranch.hours as Record<string, string[] | null>)
    : false;
  const selectedLabMeta = mapBranch
    ? LABS.find((l) => l.id === mapBranch.labId)
    : undefined;
  const directionsHref = mapBranch
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapBranch.address)}`
    : "#";
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
    <Card className="min-w-0" id={`labs-teaser-${idSuffix}`}>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
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
        <CardTitle className="text-base">
          Partner network — 5 labs, {sourceBranches.length} branches
        </CardTitle>
        <CardDescription>
          Filter by lab × sample × sector. Map on /harta. Real hours{" "}
          <span className="font-mono text-xs">
            [&#34;07:30-15:00&#34;] / [&#34;08:00-11:30&#34;,
            &#34;12:30-16:00&#34;]
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ToggleGroup
          aria-label="Filter by lab"
          className="flex flex-wrap gap-2"
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
                aria-label={v === "all" ? "All labs" : v}
                className="rounded-full"
                disabled={disabled}
                key={v}
                value={v}
              >
                {v === "all" ? "All labs" : v}
              </ToggleGroupItem>
            )
          )}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Filter by sample"
          className="flex flex-wrap gap-2"
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
              aria-label={v === "all" ? "All samples" : v}
              className="rounded-full"
              disabled={disabled}
              key={v}
              value={String(v)}
            >
              {v === "all" ? "All samples" : v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Filter by sector"
          className="flex flex-wrap gap-2"
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
          {["all", "botanica", "centru", "riscani", "buiucani", "ciocana"].map(
            (v) => (
              <ToggleGroupItem
                aria-label={v === "all" ? "All sectors" : v}
                className="rounded-full"
                disabled={disabled}
                key={v}
                value={v}
              >
                {v === "all" ? "All sectors" : v}
              </ToggleGroupItem>
            )
          )}
        </ToggleGroup>
        <div aria-live="polite" className="text-muted-foreground text-xs">
          {count} branches found
          {street === "all" ? "" : ` • ${street}`}{" "}
          {sample === "all" ? "" : ` • ${sample}`}{" "}
          {count === 12 ? "• 12 match demo" : ""}
          {count === 145 ? "• 145 total" : ""}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <ScrollArea className="h-[280px] rounded-xl border">
            <ItemGroup>
              {filtered.length === 0 ? (
                <div className="p-6">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No branch matches</EmptyTitle>
                      <EmptyDescription>
                        Try widening filters — try All sectors. Kindly widen
                        your search.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                filtered.map((b) => {
                  const open = isOpenNow(
                    b.hours as Record<string, string[] | null>
                  );
                  return (
                    <Item
                      key={b.id}
                      size="sm"
                      variant={open ? "muted" : "outline"}
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
                            <Badge className="h-4" variant="outline">
                              Closed · Opens at 8:00
                            </Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription className="line-clamp-1">
                          {b.hours.Mon?.join(" • ") ?? "Closed"}{" "}
                          {b.hoursNote ? `· ${b.hoursNote}` : ""} · {b.phone} ·{" "}
                          {b.sampleTypes.join(", ")} · {b.geo.lat.toFixed(3)},{" "}
                          {b.geo.lng.toFixed(3)}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          className="hidden sm:inline-flex"
                          variant="outline"
                        >
                          {b.labId}
                        </Badge>
                        <Badge variant="secondary">{b.sampleTypes[0]}</Badge>
                      </ItemActions>
                    </Item>
                  );
                })
              )}
            </ItemGroup>
          </ScrollArea>
          <div className="flex flex-col gap-2">
            {mapBranch ? (
              <>
                <iframe
                  className="h-[280px] w-full rounded-xl border"
                  loading="lazy"
                  src={embedSrc}
                  title={`Map — ${mapBranch.address}`}
                />
                <a
                  className="text-xs underline underline-offset-4 hover:text-foreground"
                  href={mapsSearchHref}
                  rel="noopener"
                  target="_blank"
                >
                  Open in Google Maps
                </a>
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{mapBranch.labId}</Badge>
                    {selectedLabMeta?.renar ? (
                      <Badge variant="secondary">
                        Renar • Operated by {capitalize(mapBranch.labId)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Operated by {capitalize(mapBranch.labId)}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {mapBranch.sampleTypes[0] ?? "Sânge"}
                    </Badge>
                    {selectedOpen ? (
                      <Badge variant="default">Open now</Badge>
                    ) : (
                      <Badge variant="outline">Closed</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="break-words font-medium">
                      {mapBranch.address}
                    </span>
                    <a
                      className="w-fit break-all text-xs underline underline-offset-4 hover:text-foreground"
                      href={telHref(mapBranch.phone)}
                    >
                      {mapBranch.phone}
                    </a>
                    <a
                      className="w-fit text-xs underline underline-offset-4 hover:text-foreground"
                      href={directionsHref}
                      rel="noopener"
                      target="_blank"
                    >
                      Directions
                    </a>
                    <span className="text-muted-foreground text-xs">
                      {mapBranch.geo.lat.toFixed(5)},{" "}
                      {mapBranch.geo.lng.toFixed(5)}
                    </span>
                  </div>
                  <Separator />
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 text-xs">Day</TableHead>
                          <TableHead className="px-2 text-xs">Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weekdayOrder.map((d) => {
                          const v = mapBranch.hours[d];
                          return (
                            <TableRow key={d}>
                              <TableCell className="px-2 py-1 font-medium text-xs">
                                {weekdayLabel[d]}
                              </TableCell>
                              <TableCell className="px-2 py-1 font-mono text-xs">
                                {v ? v.join(" • ") : "Closed"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
                <span className="text-muted-foreground text-xs">
                  Map preview — {count} pins · geo lat/lng
                </span>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex gap-2">
          <Button render={<a href="/harta" />} variant="outline">
            View full map
          </Button>
          <Button render={<a href="/laboratoare" />} variant="ghost">
            All labs
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
      <CardContent>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}
