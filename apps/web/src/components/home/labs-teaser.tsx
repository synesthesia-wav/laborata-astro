"use client";

import { BRANCHES } from "@workspace/data/branches";
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
      // hours are 07:30-15:00 format (RO), no AM/PM
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (minutes >= toMin(a) && minutes <= toMin(b)) {
      return true;
    }
  }
  return false;
}

interface Props {
  idSuffix?: string;
}

export function LabsTeaser({ idSuffix = "home" }: Props) {
  const [lab, setLab] = useState("all");
  const [sample, setSample] = useState("all");
  const [street, setStreet] = useState("all");

  const filtered = useMemo(
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

  return (
    <Card className="min-w-0" id={`labs-teaser-${idSuffix}`}>
      <CardHeader>
        <CardTitle className="text-base">
          Partner network — 5 labs, {BRANCHES.length} branches
        </CardTitle>
        <CardDescription>
          Filter by lab × sample × sector. Map on /harta. Real hours{" "}
          <span className="font-mono text-xs">
            [&#34;07:30-15:00&#34;] / [&#34;08:00-11:30&#34;,
            &#34;12:30-16:00&#34;]
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
          {["all", "synevo", "invitro", "sante", "medexpert", "alfa"].map(
            (v) => (
              <ToggleGroupItem
                aria-label={v === "all" ? "All labs" : v}
                className="rounded-full"
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
            setSample(nv);
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
            setStreet(nv);
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
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-cover bg-muted">
            <span className="text-muted-foreground text-xs">
              Map preview — {count} pins · geo lat/lng
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={() => (window.location.href = "/harta")}
            variant="outline"
          >
            View full map
          </Button>
          <Button
            onClick={() => (window.location.href = "/laboratoare")}
            variant="ghost"
          >
            All labs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LabsTeaserSkeleton() {
  return (
    <Card>
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
