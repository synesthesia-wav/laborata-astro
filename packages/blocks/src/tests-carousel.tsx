"use client";

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
  // retain api for embla keyboard + snap, but arrows removed per Paper structure (no pointer nav)
  const onSelect = useCallback((currentApi: CarouselApi) => {
    if (!currentApi) {
      return;
    }
    // kept for potential future use; no visual state needed for Paper structure
    void currentApi.canScrollPrev();
    void currentApi.canScrollNext();
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
        className="flex flex-col gap-6"
        id={idPrefix}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2
            className="text-balance font-heading font-semibold text-3xl leading-none tracking-tight"
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
        <div className="mx-auto w-full max-w-3xl">
          <Button className="w-full rounded-full" size="lg" variant="outline">
            Shop all
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`${idPrefix}-heading`}
      className="flex flex-col gap-6"
      id={idPrefix}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <h2
          className="text-balance font-heading font-semibold text-3xl leading-none tracking-tight"
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

      <div className="mx-auto w-full max-w-[1536px]">
        <Carousel
          className="min-w-0"
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            slidesToScroll: 1,
          }}
          setApi={setApi}
        >
          <CarouselContent className="-ml-4">
            {items.map((item, index) => (
              <CarouselItem
                className="w-64 min-w-0 shrink-0 basis-auto snap-start pl-4"
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
            <div aria-hidden="true" className="shrink-0 basis-4 pl-4" />
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Button className="w-full rounded-full" size="lg" variant="outline">
          Shop all
        </Button>
      </div>
    </section>
  );
}

export type { TestsCarouselItem, TestsCarouselProps };
