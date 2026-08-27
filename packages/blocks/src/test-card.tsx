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

type TestCardProps = {
  description?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  imageSrc?: string;
  loading?: boolean;
  permissionDenied?: boolean;
  priceMdl?: number | null;
  sampleType?: string;
  title: string;
  vendor?: string;
  onAdd?: () => void;
  onRetry?: () => void;
};

function formatPrice(mdl: number) {
  return `${new Intl.NumberFormat("ro-RO").format(mdl)} MDL`;
}

export function TestCard({
  id,
  title,
  description,
  priceMdl,
  sampleType = "Sânge venos",
  vendor = "Synevo",
  imageSrc,
  loading = false,
  error,
  disabled = false,
  permissionDenied = false,
  onAdd,
  onRetry,
}: TestCardProps) {
  if (loading) {
    return (
      <Card className="min-w-0" id={id}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24 rounded-xl" />
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
  const hasImage = Boolean(imageSrc);

  return (
    <Card className="min-w-0" id={id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {hasImage ? (
              <img
                alt={`${title} — imagine analiză`}
                className="size-10 shrink-0 rounded-full object-cover"
                src={imageSrc}
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <CardTitle
                className={`text-sm ${isUnbreakable ? "break-all" : "truncate"}`}
              >
                {title}
              </CardTitle>
              <CardDescription
                className={`flex items-center gap-1.5 ${isUnbreakable ? "break-all" : "truncate"}`}
              >
                <span className="truncate">{sampleType}</span>
                {vendor && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="truncate">{vendor}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {priceMdl !== null && priceMdl !== undefined && (
            <Badge className="shrink-0">{priceLabel}</Badge>
          )}
        </div>
        {description && (
          <CardDescription
            className={isUnbreakable ? "break-all" : "line-clamp-2"}
          >
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {priceMdl === null || priceMdl === undefined ? (
          <p className="text-muted-foreground text-sm">
            Preț indisponibil temporar
          </p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">De la</span>
            <Badge className="shrink-0" variant="secondary">
              {priceLabel}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          aria-label={`Adaugă ${title} în listă`}
          disabled={disabled}
          onClick={onAdd}
          size="sm"
        >
          {disabled ? "Indisponibil" : "Adaugă"}
        </Button>
        <Button disabled={disabled} size="sm" variant="outline">
          Detalii
        </Button>
      </CardFooter>
    </Card>
  );
}
