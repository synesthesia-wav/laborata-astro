"use client";

import { TESTS } from "@workspace/data/canonical";
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
  error?: string;
  idSuffix?: string;
  loading?: boolean;
  onRetry?: () => void;
}

export function CatalogShelf({
  idSuffix = "home-catalog",
  loading = false,
  error,
  onRetry,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card className="overflow-hidden" key={i}>
            <Skeleton className="aspect-[4/3] w-full" />
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
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">
            Could not load tests
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tests = TESTS.slice(0, 8);

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          className="font-heading font-semibold text-xl tracking-tight"
          id={`catalog-heading-${idSuffix}`}
        >
          Common tests
        </h2>
        <p className="text-muted-foreground text-sm">
          Most searched — same name everywhere
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tests.map((t) => (
          <Card
            className="flex h-full flex-col overflow-hidden"
            id={`test-${t.id}-${idSuffix}`}
            key={t.id}
          >
            <div className="flex aspect-[4/3] w-full items-center justify-center border-b bg-muted">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge className="text-[11px]" variant="secondary">
                  {t.sampleType ?? t.tuple_key.split("|")[2] ?? "Sânge"}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  From 33 MDL
                </span>
              </div>
              <CardTitle className="line-clamp-2 text-base leading-tight">
                {t.name_ro ?? t.name_en ?? t.id}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {t.oneSentenceWatcher ?? t.tuple_key}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                onClick={() =>
                  (window.location.href = `/tests/${t.slug_en ?? t.id}`)
                }
                size="sm"
                variant="outline"
              >
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
