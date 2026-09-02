"use client";

import { TESTS } from "@workspace/data/canonical";
import type { CanonicalItem } from "@workspace/data/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
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
  disabled = false,
  idSuffix = "home-catalog",
  loading = false,
  error,
  onRetry,
  tests: testsProp,
}: Props) {
  const tests = testsProp ?? TESTS.slice(0, 8);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card className="overflow-hidden" key={i}>
            <AspectRatio ratio={4 / 3} className="w-full overflow-hidden">
              <Skeleton className="h-full w-full rounded-none" />
            </AspectRatio>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
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
    <div
      className="flex min-w-0 flex-col gap-5"
      id={`catalog-shelf-${idSuffix}`}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2
            className="font-heading font-semibold text-xl tracking-tight"
            id={`catalog-heading-${idSuffix}`}
          >
            Analize frecvente
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Most searched — honest coverage, same name everywhere
          </p>
        </div>
        <Button
          className="hidden rounded-full sm:inline-flex"
          render={<a href="/analize" />}
          size="sm"
          variant="outline"
        >
          Vezi toate
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tests.map((t) => {
          const slug = t.slug_ro ?? t.id;
          const sample = t.sampleType ?? t.tuple_key.split("|")[2] ?? "Sânge";
          const vendorsLabel =
            t.vendor_count > 0 ? `${t.vendor_count}/5 labs` : "catalog";
          return (
            <Card
              className="group flex h-full flex-col overflow-hidden transition-colors hover:bg-card/80"
              id={`test-${t.id}-${idSuffix}`}
              key={t.id}
            >
              <AspectRatio
                ratio={4 / 3}
                className="flex w-full items-center justify-center border-b bg-muted/40"
              >
                <span
                  aria-hidden="true"
                  className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground text-xs"
                >
                  Fără imagine · {sample}
                </span>
              </AspectRatio>
              <CardHeader className="gap-2 pb-3">
                <div className="flex items-center gap-1.5">
                  <Badge
                    className="rounded-full px-2 py-0 text-[11px]"
                    variant="secondary"
                  >
                    {sample}
                  </Badge>
                  <Badge
                    className="rounded-full px-2 py-0 text-[11px]"
                    variant="outline"
                  >
                    {vendorsLabel}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 break-words text-[15px] leading-tight">
                  {t.name_ro ?? t.name_en ?? t.id}
                </CardTitle>
                <CardDescription className="line-clamp-2 break-words text-xs leading-relaxed">
                  {t.oneSentenceWatcher ?? t.tuple_key}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto min-w-0 pt-0">
                <Button
                  className="w-full rounded-full"
                  disabled={disabled}
                  render={<a href={`/analize/${slug}`} />}
                  size="sm"
                  variant="outline"
                >
                  View details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
