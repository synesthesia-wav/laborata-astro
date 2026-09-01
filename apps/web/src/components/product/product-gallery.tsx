import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

interface Props {
  idSuffix?: string;
  images: readonly string[];
  loading?: boolean;
}

export function ProductGallery({
  images,
  idSuffix = "",
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed bg-muted p-6 text-center">
        <p className="max-w-xs text-muted-foreground text-sm">
          Fără imagine — adaugă o ilustrație pentru acest test.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Carousel
        className="group/gallery w-full"
        id={`gallery-${idSuffix}`}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={src}>
              <div className="overflow-hidden rounded-xl border bg-muted">
                <div
                  aria-label={`Imagine produs ${i + 1} din ${images.length}`}
                  className={cn(
                    "aspect-square w-full bg-center bg-cover",
                    "bg-muted"
                  )}
                  role="img"
                  style={{ backgroundImage: `url(${src})` }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 ? (
          <>
            <CarouselPrevious className="left-2 size-8 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
            <CarouselNext className="right-2 size-8 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
          </>
        ) : null}
      </Carousel>

      {images.length > 1 ? (
        <div className="hidden gap-3 sm:flex">
          {images.slice(0, 4).map((src) => (
            <div
              aria-hidden="true"
              className="size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
              key={`thumb-${src}`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
