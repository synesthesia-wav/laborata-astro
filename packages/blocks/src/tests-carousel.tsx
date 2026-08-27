"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import type { CarouselApi } from "@workspace/ui/components/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { useCallback, useEffect, useState } from "react";
import {
  TestCarouselCard,
  type TestCarouselCardProps,
} from "./test-carousel-card";

type TestsCarouselItem = TestCarouselCardProps & { key: string };

type TestsCarouselProps = {
  description?: string;
  idPrefix?: string;
  items: TestsCarouselItem[];
  title?: string;
};

export function TestsCarousel({
  items,
  title = "Teste populare",
  description = "Alege analiza potrivită — compară prețuri și adaugă în coș.",
  idPrefix = "tests-carousel",
}: TestsCarouselProps) {
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((currentApi: CarouselApi) => {
    if (!currentApi) {
      return;
    }
    setCanPrev(currentApi.canScrollPrev());
    setCanNext(currentApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (items.length === 0) {
    return (
      <section
        aria-labelledby={`${idPrefix}-heading`}
        className="flex flex-col gap-4"
        id={idPrefix}
      >
        <div className="flex flex-col gap-1">
          <h2
            className="font-heading font-semibold text-lg tracking-tight"
            id={`${idPrefix}-heading`}
          >
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                ⌕
              </span>
            </EmptyMedia>
            <EmptyTitle>Nu există analize</EmptyTitle>
            <EmptyDescription>
              Lista de teste este goală pentru acest filtru.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Vezi toate testele</Button>
          </EmptyContent>
        </Empty>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`${idPrefix}-heading`}
      className="flex flex-col gap-4"
      id={idPrefix}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            className="font-heading font-semibold text-lg tracking-tight"
            id={`${idPrefix}-heading`}
          >
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button
            aria-label="Slide precedent"
            disabled={!canPrev}
            onClick={() => api?.scrollPrev()}
            size="icon-sm"
            variant="outline"
          >
            <RiArrowLeftSLine data-icon="inline-start" />
          </Button>
          <Button
            aria-label="Slide următor"
            disabled={!canNext}
            onClick={() => api?.scrollNext()}
            size="icon-sm"
            variant="outline"
          >
            <RiArrowRightSLine data-icon="inline-start" />
          </Button>
        </div>
      </div>

      <Carousel
        className="min-w-0"
        opts={{ align: "start", containScroll: "trimSnaps", slidesToScroll: 1 }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              className="min-w-0 basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              id={`${idPrefix}-slide-${index}`}
              key={item.key}
            >
              <TestCarouselCard
                description={item.description}
                disabled={item.disabled}
                error={item.error}
                id={`${idPrefix}-card-${item.key}`}
                imageAlt={item.imageAlt}
                imageSrc={item.imageSrc}
                isComparing={item.isComparing}
                loading={item.loading}
                onAddToCart={item.onAddToCart}
                onCompare={item.onCompare}
                onRetry={item.onRetry}
                permissionDenied={item.permissionDenied}
                priceMdl={item.priceMdl}
                title={item.title}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-between gap-4 md:hidden">
        <Badge className="shrink-0" variant="secondary">
          {items.length} teste
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Slide precedent"
            disabled={!canPrev}
            onClick={() => api?.scrollPrev()}
            size="icon-sm"
            variant="outline"
          >
            <RiArrowLeftSLine data-icon="inline-start" />
          </Button>
          <Button
            aria-label="Slide următor"
            disabled={!canNext}
            onClick={() => api?.scrollNext()}
            size="icon-sm"
            variant="outline"
          >
            <RiArrowRightSLine data-icon="inline-start" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export type { TestsCarouselItem, TestsCarouselProps };
