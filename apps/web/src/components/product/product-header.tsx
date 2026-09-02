import { RiCheckboxCircleLine, RiShoppingBagLine } from "@remixicon/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { PRICE_OFFERS_B12 } from "./data";

interface Props {
  disabled?: boolean;
  error?: string;
  idSuffix?: string;
  lang?: "ro" | "en";
  loading?: boolean;
  lowestPrice?: number | null;
  name?: string;
  onAddToCart?: () => void;
  onRetry?: () => void;
  permissionDenied?: boolean;
  priceAsOf?: string;
  sampleType?: string | null;
  sourceUrl?: string;
  turnaround?: string | null;
  variant?: string | null;
}

function formatMdl(n: number): string {
  return new Intl.NumberFormat("ro-RO").format(n);
}

function specimenShort(v: string | null | undefined): string | null {
  if (!v) {
    return null;
  }
  const m: Record<string, string> = {
    blood: "Sânge",
    frotiu: "Frotiu",
    plasma: "Plasmă",
    serum: "Ser",
    swab: "Frotiu",
    urine: "Urină",
  };
  const key = v.toLowerCase();
  return m[key] ?? v;
}

export function ProductHeader({
  loading = false,
  disabled = false,
  permissionDenied = false,
  onAddToCart,
  idSuffix = "",
  lang = "ro",
  lowestPrice,
  name = "Vitamina B12 (Cobalamină)",
  priceAsOf = "august 2026",
  sourceUrl = "https://www.invitro.md/ro/services/prelevarea-sangelui-venos",
  variant = null,
  sampleType = null,
  turnaround = null,
  error,
  onRetry,
}: Props) {
  if (error) {
    return (
      <div className="flex flex-col gap-3" id={`product-header-${idSuffix}`}>
        <Alert variant="destructive">
          <AlertTitle>Nu am putut încărca datele</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {onRetry ? (
          <Button onClick={onRetry} size="sm" variant="outline">
            Reîncearcă
          </Button>
        ) : null}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <Card id={`product-header-${idSuffix}`}>
        <CardContent className="flex flex-col gap-6 pt-(--card-spacing)">
          <div className="flex flex-col gap-3">
            <h1 className="text-balance font-heading font-semibold text-3xl tracking-tight">
              {name}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Acces restricționat — nu ai permisiunea să vezi prețul pentru
              acest test. Cere acces la lista partajată sau autentifică-te.
            </p>
          </div>
          <div
            aria-live="polite"
            className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center"
          >
            <p className="font-medium text-sm">Permission denied</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Stare showcase — nu este eroare de date.
            </p>
          </div>
          <Button
            aria-label="Adaugă în listă — indisponibil"
            className="w-full"
            disabled
            id={`add-to-list-${idSuffix}`}
            size="lg"
          >
            <RiShoppingBagLine aria-hidden="true" data-icon="inline-start" />
            Indisponibil
          </Button>
        </CardContent>
      </Card>
    );
  }

  const cheapest =
    lowestPrice !== undefined && lowestPrice !== null
      ? lowestPrice
      : name === "Vitamina B12 (Cobalamină)"
        ? Math.min(...PRICE_OFFERS_B12.map((o) => o.price_mdl))
        : null;
  const isLarge = cheapest !== null && cheapest >= 1_000_000;
  const currency = lang === "en" ? "MDL" : "lei";
  const priceLabel =
    cheapest === null ? null : `${formatMdl(cheapest)} ${currency}`;
  const priceAsOfLabel =
    lang === "en" ? `Updated: ${priceAsOf}` : `Actualizat: ${priceAsOf}`;

  return (
    <div
      className="flex flex-col gap-(--gap) [--gap:--spacing(6)]"
      id={`product-header-${idSuffix}`}
    >
      <div className="flex flex-wrap gap-2.5">
        <Badge variant="secondary">Test de sânge</Badge>
        {sampleType && specimenShort(sampleType) ? (
          <Badge
            className="text-[12px] uppercase tracking-wider"
            variant="outline"
          >
            {specimenShort(sampleType)}
          </Badge>
        ) : null}
        {turnaround ? (
          <Badge
            className="text-[12px] uppercase tracking-wider"
            variant="outline"
          >
            {turnaround}
          </Badge>
        ) : null}
        {variant ? <Badge variant="outline">{variant}</Badge> : null}
        {isLarge ? <Badge variant="outline">preț mare</Badge> : null}
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-balance break-words font-heading font-semibold text-3xl tracking-tight">
          {name}
        </h1>
        {priceLabel ? (
          <span className="break-words font-heading font-semibold text-2xl tabular-nums tracking-tight [overflow-wrap:anywhere]">
            {priceLabel}
          </span>
        ) : (
          <span className="font-medium text-muted-foreground text-sm">
            Preț la cerere — adaugă în listă pentru comparație
          </span>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {priceAsOfLabel} · cel mai mic preț dintre parteneri (fără taxă
          recoltare) ·{" "}
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href={sourceUrl}
            rel="noopener"
            target="_blank"
          >
            sursă
          </a>{" "}
          · verificat {priceAsOf}
        </p>
        <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
          {name === "Vitamina B12 (Cobalamină)"
            ? "Măsoară nivelul total de vitamină B12 circulantă pentru evaluarea deficitului și interpretarea suplimentării. Test cantitativ uzual pe ser, raportat în pg/mL (LOINC 2132-9)."
            : `Analiză ${name} — compară prețuri la partenerii Laborata și vezi taxa de recoltare o singură dată.`}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-(--gap) [--gap:--spacing(4)]">
          <ItemGroup className="gap-2">
            <Item variant="muted" size="sm" className="rounded-2xl">
              <ItemMedia variant="icon" className="text-primary">
                <RiCheckboxCircleLine aria-hidden="true" className="size-4" />
              </ItemMedia>
              <ItemTitle className="font-normal text-sm">
                Fără trimitere necesară — rezervi direct
              </ItemTitle>
            </Item>
            <Item variant="muted" size="sm" className="rounded-2xl">
              <ItemMedia variant="icon" className="text-primary">
                <RiCheckboxCircleLine aria-hidden="true" className="size-4" />
              </ItemMedia>
              <ItemTitle className="font-normal text-sm">
                Recoltare 5 min în rețeaua parteneră
              </ItemTitle>
            </Item>
            <Item variant="muted" size="sm" className="rounded-2xl">
              <ItemMedia variant="icon" className="text-primary">
                <RiCheckboxCircleLine aria-hidden="true" className="size-4" />
              </ItemMedia>
              <ItemTitle className="font-normal text-sm">
                Rezultat cu interval explicat în 24h
              </ItemTitle>
            </Item>
          </ItemGroup>
          <Separator />
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            aria-label={`Adaugă în listă — ${name}${priceLabel ? ` — ${priceLabel}` : ""}`}
            className="w-full"
            disabled={disabled}
            id={`add-to-list-${idSuffix}`}
            onClick={onAddToCart}
            size="lg"
          >
            <RiShoppingBagLine aria-hidden="true" data-icon="inline-start" />
            {priceLabel ? `Adaugă în listă — ${priceLabel}` : "Adaugă în listă"}
          </Button>
          <p className="text-center text-muted-foreground text-xs">
            Taxa de recoltare se adaugă o singură dată la final
            (Sante/MedExpert: 0 lei — inclus). Poți adăuga mai multe teste
            într-o singură vizită.
          </p>
        </CardFooter>
      </Card>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Afișăm mereu unitatea sursă (pg/mL). Nu amesteca valori în pmol/L fără
        conversie validată.
      </p>
    </div>
  );
}
