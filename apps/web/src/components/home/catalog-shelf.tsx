"use client";

import { TESTS } from "@workspace/data/canonical";
import type { CanonicalItem } from "@workspace/data/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface Props {
  disabled?: boolean;
  error?: string;
  idSuffix?: string;
  loading?: boolean;
  onRetry?: () => void;
  tests?: CanonicalItem[];
}

export function CatalogShelf({
  idSuffix = "home-catalog",
  loading = false,
  error,
  onRetry,
  tests: testsProp,
}: Props) {
  const tests = testsProp ?? TESTS.slice(0, 8);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Item key={i} variant="outline" size="sm" className="rounded-2xl">
                <ItemMedia variant="icon">
                  <Skeleton className="size-8 rounded-full" />
                </ItemMedia>
                <ItemContent>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load tests</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-3">
          <Button onClick={onRetry} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (tests.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">🔬</EmptyMedia>
          <EmptyTitle>No tests yet</EmptyTitle>
          <EmptyDescription>
            No tests match. Try a different concern.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card id={`catalog-shelf-${idSuffix}`}>
      <CardHeader className="flex-row items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="font-heading text-xl tracking-tight" id={`catalog-heading-${idSuffix}`}>
            Analize frecvente
          </CardTitle>
          <CardDescription>
            Most searched — honest coverage, same name everywhere
          </CardDescription>
        </div>
        <CardAction>
          <Button
            className="hidden rounded-full sm:inline-flex"
            render={<a href="/analize" />}
            size="sm"
            variant="outline"
          >
            Vezi toate
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-2.5">
          {tests.map((t) => {
            const slug = t.slug_ro ?? t.id;
            const sample = t.sampleType ?? t.tuple_key.split("|")[2] ?? "Sânge";
            return (
              <Item
                key={t.id}
                id={`test-${t.id}-${idSuffix}`}
                variant="outline"
                size="sm"
                className="rounded-2xl bg-muted/20 hover:bg-muted/30"
                render={<a href={`/analize/${slug}`} />}
              >
                <ItemMedia variant="icon" className="bg-muted">
                  <span className="text-[11px] font-medium">{sample[0]?.toUpperCase() ?? "S"}</span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1 break-words text-sm">
                    {t.name_ro ?? t.name_en ?? t.id}
                  </ItemTitle>
                  <ItemDescription className="line-clamp-1 break-words text-xs">
                    {t.oneSentenceWatcher ??
                      `${t.vendor_count}/5 labs · ${sample}`}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
                    {t.vendor_count}/5 labs
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {sample}
                  </Badge>
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
      <CardFooter className="border-t pt-[--card-spacing]">
        <Button
          className="w-full rounded-full sm:hidden"
          render={<a href="/analize" />}
          size="sm"
          variant="outline"
        >
          Vezi toate
        </Button>
      </CardFooter>
    </Card>
  );
}
