import { RiScalesLine, RiShoppingCartLine } from "@remixicon/react";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type TestCarouselCardProps = {
  description?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  imageAlt?: string;
  imageSrc?: string;
  isComparing?: boolean;
  loading?: boolean;
  permissionDenied?: boolean;
  priceMdl?: number | null;
  title: string;
  onAddToCart?: () => void;
  onCompare?: () => void;
  onRetry?: () => void;
};

function formatPrice(mdl: number) {
  return `${new Intl.NumberFormat("ro-RO").format(mdl)} MDL`;
}

export function TestCarouselCard({
  id,
  title,
  description,
  priceMdl,
  imageSrc,
  imageAlt,
  loading = false,
  error,
  disabled = false,
  permissionDenied = false,
  isComparing = false,
  onAddToCart,
  onCompare,
  onRetry,
}: TestCarouselCardProps) {
  if (loading) {
    return (
      <Card className="min-w-0 pt-0" id={id}>
        <Skeleton className="aspect-square w-full rounded-t-[min(var(--radius-4xl),24px)] rounded-b-none border-0" />
        <CardHeader className="gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-24 rounded-full" />
        </CardContent>
        <CardFooter className="flex gap-2">
          <Skeleton className="h-7 flex-1 rounded-2xl" />
          <Skeleton className="h-7 flex-1 rounded-2xl" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-w-0" id={id}>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            !
          </div>
          <p className="font-medium text-sm">{error}</p>
          <p className="text-muted-foreground text-xs">
            Verifică conexiunea și încearcă din nou.
          </p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              Reîncearcă
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (permissionDenied) {
    return (
      <Card className="min-w-0" id={id}>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="font-medium text-sm">Acces restricționat</p>
          <p className="text-muted-foreground text-xs">
            Doar personalul de laborator poate edita prețurile.
          </p>
          <Button size="sm" variant="outline">
            Solicită acces
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initials = title.slice(0, 2).toUpperCase();
  const isUnbreakable = !title.includes(" ") && title.length > 20;
  const priceLabel =
    priceMdl === null || priceMdl === undefined
      ? "Preț indisponibil"
      : formatPrice(priceMdl);
  const hasImage = Boolean(imageSrc && imageSrc.trim().length > 0);
  const hasPrice = priceMdl !== null && priceMdl !== undefined;
  const altText = imageAlt ?? `${title} — imagine analiză`;

  const cardHasMedia = !(loading || error || permissionDenied);

  return (
    <Card className={`min-w-0 ${cardHasMedia ? "pt-0" : ""}`} id={id}>
      {cardHasMedia ? (
        <AspectRatio
          className="overflow-hidden rounded-t-[min(var(--radius-4xl),24px)] bg-muted"
          ratio={1}
        >
          {hasImage ? (
            <img
              alt={altText}
              className="size-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback =
                  target.nextElementSibling as HTMLElement | null;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
              src={imageSrc}
            />
          ) : null}
          <div
            aria-hidden={hasImage ? true : undefined}
            className="absolute inset-0 items-center justify-center bg-muted text-muted-foreground"
            style={{ display: hasImage ? "none" : "flex" }}
          >
            <span className="font-heading font-semibold text-lg tracking-tight">
              {initials}
            </span>
          </div>
          {hasImage ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden items-center justify-center bg-muted text-muted-foreground"
            >
              <span className="font-heading font-semibold text-lg tracking-tight">
                {initials}
              </span>
            </div>
          ) : null}
        </AspectRatio>
      ) : null}

      <CardHeader className="gap-2">
        <CardTitle
          className={`font-heading font-semibold text-sm leading-snug tracking-tight ${isUnbreakable ? "line-clamp-2 break-all" : "line-clamp-2"}`}
        >
          {title}
        </CardTitle>
        {description ? (
          <CardDescription
            className={`leading-relaxed ${isUnbreakable ? "break-all" : "line-clamp-2"}`}
          >
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent>
        {hasPrice ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">De la</span>
            <Badge
              className="max-w-[12ch] shrink-0 truncate"
              variant="secondary"
            >
              {priceLabel}
            </Badge>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Preț indisponibil temporar
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          aria-label={`Adaugă ${title} în coș`}
          className="min-w-0 flex-1"
          disabled={disabled || !hasPrice}
          onClick={onAddToCart}
          size="sm"
        >
          <RiShoppingCartLine data-icon="inline-start" />
          <span className="truncate">
            {disabled || !hasPrice ? "Indisponibil" : "Adaugă în coș"}
          </span>
        </Button>
        <Button
          aria-label={`${isComparing ? "Scoate" : "Compară"} ${title}`}
          aria-pressed={isComparing}
          className="min-w-0 flex-1"
          disabled={disabled}
          onClick={onCompare}
          size="sm"
          variant={isComparing ? "secondary" : "outline"}
        >
          <RiScalesLine data-icon="inline-start" />
          <span className="truncate">
            {isComparing ? "Comparat" : "Compară"}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export type { TestCarouselCardProps };
