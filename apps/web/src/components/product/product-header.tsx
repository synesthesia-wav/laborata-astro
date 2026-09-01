import {
  RiCheckboxCircleLine,
  RiShoppingBagLine,
  RiStarFill,
} from "@remixicon/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { PRICE_OFFERS_B12 } from "./data";

interface Props {
  disabled?: boolean;
  idSuffix?: string;
  lang?: "ro" | "en";
  loading?: boolean;
  lowestPrice?: number | null;
  onAddToCart?: () => void;
  permissionDenied?: boolean;
  priceAsOf?: string;
  sourceUrl?: string;
  variant?: string | null;
}

function formatMdl(n: number): string {
  return new Intl.NumberFormat("ro-RO").format(n);
}

export function ProductHeader({
  loading = false,
  disabled = false,
  permissionDenied = false,
  onAddToCart,
  idSuffix = "",
  lang = "ro",
  lowestPrice,
  priceAsOf = "august 2026",
  sourceUrl = "https://www.invitro.md/ro/services/prelevarea-sangelui-venos",
  variant = null,
}: Props) {
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
      <div
        className="flex flex-col gap-6 rounded-xl border bg-card p-4"
        id={`product-header-${idSuffix}`}
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-balance font-heading font-semibold text-3xl tracking-tight">
            Vitamina B12 (Cobalamină)
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Acces restricționat — nu ai permisiunea să vezi prețul pentru acest
            test. Cere acces la lista partajată sau autentifică-te.
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
          aria-label="Adaugă în coș — indisponibil"
          className="w-full"
          disabled
          id={`add-to-cart-${idSuffix}`}
          size="lg"
        >
          <RiShoppingBagLine aria-hidden="true" data-icon="inline-start" />
          Indisponibil
        </Button>
      </div>
    );
  }

  const cheapest =
    lowestPrice ?? Math.min(...PRICE_OFFERS_B12.map((o) => o.price_mdl));
  const isLarge = cheapest >= 1_000_000;
  const currency = lang === "en" ? "MDL" : "lei";
  const priceLabel = `${formatMdl(cheapest)} ${currency}`;
  const priceAsOfLabel =
    lang === "en" ? `Updated: ${priceAsOf}` : `Actualizat: ${priceAsOf}`;

  return (
    <div className="flex flex-col gap-6" id={`product-header-${idSuffix}`}>
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">Test de sânge</Badge>
        {variant ? <Badge variant="outline">{variant}</Badge> : null}
        {isLarge ? <Badge variant="outline">preț mare</Badge> : null}
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-balance break-words font-heading font-semibold text-3xl tracking-tight">
          Vitamina B12 (Cobalamină)
        </h1>
        <span className="break-all font-heading font-semibold text-2xl tabular-nums tracking-tight">
          {priceLabel}
        </span>
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
          · provenance: lastSeen {priceAsOf}
        </p>
        <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
          Măsoară nivelul total de vitamină B12 circulantă pentru evaluarea
          deficitului și interpretarea suplimentării. Test cantitativ uzual pe
          ser, raportat în pg/mL (LOINC 2132-9).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Excelent</span>
        <span className="text-muted-foreground">4,8 din 5</span>
        <span
          aria-label="4.8 din 5 stele"
          className="inline-flex items-center gap-0.5 text-primary"
          role="img"
        >
          <RiStarFill aria-hidden="true" className="size-4" />
          <RiStarFill aria-hidden="true" className="size-4" />
          <RiStarFill aria-hidden="true" className="size-4" />
          <RiStarFill aria-hidden="true" className="size-4" />
          <RiStarFill aria-hidden="true" className="size-4 opacity-40" />
        </span>
        <span className="text-muted-foreground text-xs">
          · 1 200+ recenzii verificate
        </span>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 text-sm">
          <span className="inline-flex items-center gap-2">
            <RiCheckboxCircleLine
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            Fără trimitere necesară — rezervi direct
          </span>
          <span className="inline-flex items-center gap-2">
            <RiCheckboxCircleLine
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            Recoltare 5 min în rețeaua parteneră
          </span>
          <span className="inline-flex items-center gap-2">
            <RiCheckboxCircleLine
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            Rezultat cu interval explicat în 24h
          </span>
        </div>
        <Separator />
        <Button
          aria-label={`Adaugă în coș — Vitamina B12 — ${priceLabel}`}
          className="w-full"
          disabled={disabled}
          id={`add-to-cart-${idSuffix}`}
          onClick={onAddToCart}
          size="lg"
        >
          <RiShoppingBagLine aria-hidden="true" data-icon="inline-start" />
          Adaugă în coș — {priceLabel}
        </Button>
        <p className="text-center text-muted-foreground text-xs">
          Taxa de recoltare se adaugă o singură dată la final (Sante/MedExpert:
          0 lei — inclus). Poți adăuga mai multe teste într-o singură vizită.
        </p>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Afișăm mereu unitatea sursă (pg/mL). Nu amesteca valori în pmol/L fără
        conversie validată.
      </p>
    </div>
  );
}
