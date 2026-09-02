import { RiArrowDownSLine } from "@remixicon/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { SPEC_OFFERS_B12, type SpecOffer } from "./data";

interface Props {
  disabled?: boolean;
  error?: string;
  idSuffix?: string;
  loading?: boolean;
  name?: string;
  offers?: readonly SpecOffer[];
  onRetry?: () => void;
  permissionDenied?: boolean;
}

function specimenLabel(v: string | null): string {
  if (!v) {
    return "—";
  }
  const m: Record<string, string> = {
    blood: "Sânge venos",
    frotiu: "Frotiu",
    plasma: "Plasmă",
    serum: "Ser",
    swab: "Exsudat",
    urine: "Urină",
  };
  return m[v.toLowerCase()] ?? v;
}

function methodLabel(v: string | null): string {
  if (!v) {
    return "—";
  }
  return v.toUpperCase();
}

export function ProductSpecs({
  loading = false,
  disabled = false,
  permissionDenied = false,
  idSuffix = "specs",
  name = "Vitamina B12 (Cobalamină)",
  offers,
  error,
  onRetry,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <Card id={`specs-${idSuffix}`}>
        <CardHeader>
          <CardTitle className="text-sm">Detalii analiză</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertTitle>Nu am putut încărca specificațiile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRetry ? (
            <Button onClick={onRetry} size="sm" variant="outline">
              Reîncearcă
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (permissionDenied) {
    return (
      <Card id={`specs-${idSuffix}`}>
        <CardHeader>
          <CardTitle className="text-sm">Detalii analiză</CardTitle>
          <CardDescription>Acces restricționat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-8 text-center">
            <p className="font-medium text-sm">Permission denied</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Nu ai permisiunea să vezi specificațiile — stare showcase.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (disabled) {
    return (
      <Card className="opacity-60" id={`specs-${idSuffix}`}>
        <CardHeader>
          <CardTitle className="text-sm">Detalii analiză</CardTitle>
          <CardDescription>Dezactivat — showcase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/20 px-3 py-6 text-center text-muted-foreground text-sm">
            Conținut dezactivat (disabled)
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = offers ?? SPEC_OFFERS_B12;
  const available = data.filter(
    (d) => d.specimen !== null || d.method !== null || d.turnaround !== null
  );

  // Group honest stats
  const specimenValues = data
    .map((d) => ({ lab: d.lab, v: d.specimen }))
    .filter((x) => x.v !== null) as { lab: string; v: string }[];
  const methodValues = data
    .map((d) => ({ lab: d.lab, v: d.method }))
    .filter((x) => x.v !== null) as { lab: string; v: string }[];
  const tatValues = data.filter((d) => d.turnaround !== null);
  const protocolValues = data.filter((d) => d.collection_protocol !== null);
  const refRanges = data.flatMap((d) => d.reference_ranges);

  const hasRefs = refRanges.length > 0;

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-8"
      id={`specs-${idSuffix}`}
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-balance font-heading font-semibold text-2xl tracking-tight">
          Ce măsoară {name}
        </h2>
        <div className="flex flex-col gap-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            Măsoară nivelul total de vitamină B12 circulantă pentru a evalua un
            posibil deficit și a interpreta suplimentarea.
          </p>
          {expanded ? (
            <div
              className="flex flex-col gap-3"
              id={`masoara-extra-${idSuffix}`}
            >
              <p>
                Este un test cantitativ izolat, uzual pe ser prin imunoanaliză.
                Rețelele partenere din RO folosesc LOINC 2132-9 și raportează în
                pg/mL. Unele laboratoare/ghiduri folosesc pmol/L — unitate
                diferită care necesită conversie; afișează mereu unitatea sursă.
              </p>
              <p>
                Vitamina B12 e esențială pentru sinteza ADN, formarea
                eritrocitelor și funcția neurologică. B12 total e un test
                inițial util la suspiciune de deficit, dar nu reflectă perfect
                statusul funcțional. Simptomele și factorii de risc contează; un
                rezultat la limită poate necesita MMA.
              </p>
              <p className="text-xs">
                Date per partener — afișăm „—” unde sursa nu listează valoarea.
              </p>
            </div>
          ) : null}
          <Button
            aria-controls={`masoara-extra-${idSuffix}`}
            aria-expanded={expanded}
            className="-ml-2 self-start"
            onClick={() => setExpanded((v) => !v)}
            size="sm"
            variant="ghost"
          >
            {expanded ? "Citește mai puțin" : "Citește mai mult"}
            <RiArrowDownSLine
              aria-hidden="true"
              className={cn("transition-transform", expanded && "rotate-180")}
              data-icon="inline-end"
            />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detalii analiză</CardTitle>
          <CardDescription>
            Specificații per partener — lipsă = „—”.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-(--card-spacing)">
          <ItemGroup className="gap-3">
            {/* Probă */}
            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Probă
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                <ItemDescription className="break-words font-medium text-foreground text-sm">
                  {specimenValues.length > 0
                    ? specimenValues
                        .map((x) => specimenLabel(x.v))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(" · ")
                    : "—"}
                </ItemDescription>
                <ItemDescription className="break-words text-xs">
                  {specimenValues
                    .map((x) => `${x.lab}: ${specimenLabel(x.v)}`)
                    .join(" · ")}
                  {data.some((d) => d.specimen === null)
                    ? ` · ${data
                        .filter((d) => d.specimen === null)
                        .map((d) => d.lab)
                        .join(", ")}: — (lipsă în sursă)`
                    : null}
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* Metodă */}
            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Metodă
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                <ItemDescription className="break-words font-medium text-foreground text-sm">
                  {methodValues.length > 0
                    ? methodValues
                        .map((x) => methodLabel(x.v))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(" · ")
                    : "—"}
                </ItemDescription>
                <ItemDescription className="break-words text-xs">
                  {methodValues.length > 0
                    ? methodValues
                        .map((x) => `${x.lab}: ${methodLabel(x.v)}`)
                        .join(" · ")
                    : "Nicio metodă listată"}
                  {data.some((d) => d.method === null)
                    ? ` · ${data
                        .filter((d) => d.method === null)
                        .map((d) => d.lab)
                        .join(", ")}: —`
                    : null}
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* TAT */}
            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Timp rezultat
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                <ItemDescription className="break-words font-medium text-foreground text-sm">
                  {tatValues.length > 0
                    ? tatValues
                        .map((d) => `${d.lab}: ${d.turnaround}`)
                        .join(" · ")
                    : "—"}
                </ItemDescription>
                <ItemDescription className="break-words text-xs">
                  Synevo 1 zi · Sante 14 zile lucrătoare
                  {data.some((d) => d.turnaround === null)
                    ? ` · ${data
                        .filter((d) => d.turnaround === null)
                        .map((d) => d.lab)
                        .join(", ")}: —`
                    : null}
                </ItemDescription>
              </ItemContent>
            </Item>

            {/* Pregătire */}
            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Pregătire
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                {protocolValues.length > 0 ? (
                  <>
                    <ItemDescription className="break-words font-medium text-foreground text-sm">
                      {protocolValues[0].collection_protocol}
                    </ItemDescription>
                    <ItemDescription className="break-words text-xs">
                      {protocolValues
                        .map((d) => `${d.lab}: ${d.collection_protocol}`)
                        .join(" · ")}
                      {data.filter((d) => d.collection_protocol === null)
                        .length > 0
                        ? ` · ${data
                            .filter((d) => d.collection_protocol === null)
                            .map((d) => d.lab)
                            .join(", ")}: Nespecifică`
                        : null}
                    </ItemDescription>
                  </>
                ) : (
                  <>
                    <ItemDescription className="break-words font-medium text-foreground text-sm">
                      Nespecifică
                    </ItemDescription>
                    <ItemDescription className="break-words text-xs">
                      Niciun protocol listat pentru acest test.
                    </ItemDescription>
                  </>
                )}
              </ItemContent>
            </Item>

            {/* Reference ranges */}
            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Intervale de referință
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                {hasRefs ? (
                  <>
                    <ItemDescription className="break-words font-medium text-foreground text-sm">
                      {refRanges
                        .map((r) => `${r.range} ${r.unit ?? ""}`.trim())
                        .join(" · ")}
                    </ItemDescription>
                    <ItemDescription className="break-words text-xs">
                      Sursă:{" "}
                      {data.find((d) => d.reference_ranges.length > 0)?.lab ??
                        "Synevo"}{" "}
                      — afișăm doar când există.
                    </ItemDescription>
                  </>
                ) : (
                  <ItemDescription className="break-words text-xs">
                    Indisponibil — niciun interval listat pentru acest test.
                    Afișăm intervalul sursă pe buletin când există.
                  </ItemDescription>
                )}
              </ItemContent>
            </Item>

            <Item
              variant="outline"
              className="flex-col items-start gap-2 rounded-2xl bg-muted/20 sm:flex-row sm:items-center sm:gap-4"
              size="sm"
            >
              <ItemTitle className="w-full shrink-0 font-medium text-muted-foreground text-sm sm:w-[160px]">
                Acoperire
              </ItemTitle>
              <ItemContent className="min-w-0 flex-1">
                <ItemDescription className="break-words text-muted-foreground text-xs">
                  {available.length}/{data.length} parteneri cu date.
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 text-muted-foreground text-xs">
        <Separator />
        <p>
          Date din surse parteneri — actualizate august 2026. Afișăm „—” unde
          sursa nu listează valoarea.
        </p>
      </div>
    </div>
  );
}
