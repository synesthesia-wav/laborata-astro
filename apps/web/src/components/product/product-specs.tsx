import { RiArrowDownSLine } from "@remixicon/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { SPEC_OFFERS_B12, type SpecOffer } from "./data";

interface Props {
  disabled?: boolean;
  idSuffix?: string;
  loading?: boolean;
  offers?: readonly SpecOffer[];
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
  offers,
}: Props) {
  const [expanded, setExpanded] = useState(false);

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
          Ce măsoară Vitamina B12 (Cobalamină)
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
                Acoperire sursă: probă 91% · metodă 69% · TAT 93% · pregătire
                53% · intervale 6,9% (honest null unde lipsesc).
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
            Specificații per partener — valori oneste, neinventate. Lipsă =
            afișăm „—”.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="divide-y">
            {/* Specimen 91% */}
            <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Probă
              </dt>
              <dd className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {specimenValues.length > 0
                    ? specimenValues
                        .map((x) => specimenLabel(x.v))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(" · ")
                    : "—"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {specimenValues
                    .map((x) => `${x.lab}: ${specimenLabel(x.v)}`)
                    .join(" · ")}
                  {data.some((d) => d.specimen === null)
                    ? ` · ${data
                        .filter((d) => d.specimen === null)
                        .map((d) => d.lab)
                        .join(", ")}: — (lipsă în sursă)`
                    : null}
                </span>
              </dd>
            </div>

            {/* Method 69% */}
            <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Metodă
              </dt>
              <dd className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {methodValues.length > 0
                    ? methodValues
                        .map((x) => methodLabel(x.v))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(" · ")
                    : "—"}
                  <Badge className="ml-2 text-[10px]" variant="outline">
                    69% acoperire
                  </Badge>
                </span>
                <span className="text-muted-foreground text-xs">
                  {methodValues.length > 0
                    ? methodValues
                        .map((x) => `${x.lab}: ${methodLabel(x.v)}`)
                        .join(" · ")
                    : "Nicio metodă listată"}
                  {data.some((d) => d.method === null)
                    ? ` · ${data
                        .filter((d) => d.method === null)
                        .map((d) => d.lab)
                        .join(", ")}: — (honest null)`
                    : null}
                </span>
              </dd>
            </div>

            {/* TAT 93% — Synevo 1 zi, Sante 14 zile */}
            <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Timp rezultat
              </dt>
              <dd className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {tatValues.length > 0
                    ? tatValues
                        .map((d) => `${d.lab}: ${d.turnaround}`)
                        .join(" · ")
                    : "—"}
                </span>
                <span className="text-muted-foreground text-xs">
                  93% acoperire overall · Synevo 1 zi · Sante 14 zile lucrătoare
                  (honest per-offering)
                  {data.some((d) => d.turnaround === null)
                    ? ` · ${data
                        .filter((d) => d.turnaround === null)
                        .map((d) => d.lab)
                        .join(", ")}: —`
                    : null}
                </span>
              </dd>
            </div>

            {/* Collection protocol 53% */}
            <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Pregătire
              </dt>
              <dd className="flex flex-col gap-1 text-sm">
                {protocolValues.length > 0 ? (
                  <>
                    <span className="font-medium">
                      {protocolValues[0].collection_protocol}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {protocolValues
                        .map((d) => `${d.lab}: ${d.collection_protocol}`)
                        .join(" · ")}
                      {data.filter((d) => d.collection_protocol === null)
                        .length > 0
                        ? ` · ${data
                            .filter((d) => d.collection_protocol === null)
                            .map((d) => d.lab)
                            .join(", ")}: Nespecifică`
                        : null}{" "}
                      · 53% au protocol, rest Nespecifică (honest)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Nespecifică</span>
                    <span className="text-muted-foreground text-xs">
                      53% acoperire în sursă — niciun protocol listat pentru
                      acest test.
                    </span>
                  </>
                )}
              </dd>
            </div>

            {/* Reference ranges 6.9% — hide if missing, honest null */}
            {hasRefs ? (
              <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
                <dt className="font-medium text-muted-foreground text-sm">
                  Intervale de referință
                </dt>
                <dd className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">
                    {refRanges
                      .map((r) => `${r.range} ${r.unit ?? ""}`.trim())
                      .join(" · ")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Sursă:{" "}
                    {data.find((d) => d.reference_ranges.length > 0)?.lab ??
                      "Synevo"}{" "}
                    · 36% Synevo au intervale, 2,6% Sante — rest null honest,
                    afișăm doar când există.
                  </span>
                </dd>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
                <dt className="font-medium text-muted-foreground text-sm">
                  Intervale de referință
                </dt>
                <dd className="text-muted-foreground text-xs">
                  Indisponibil — 6,9% acoperire în sursă, niciun interval listat
                  pentru acest test. Afișăm intervalul sursă pe buletin când
                  există.
                </dd>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-medium text-muted-foreground text-sm">
                Acoperire
              </dt>
              <dd className="text-muted-foreground text-xs">
                {available.length}/{data.length} parteneri cu date · onest per
                vendor_fees specimen/method/TAT.
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 text-muted-foreground text-xs">
        <Separator />
        <p>
          Produsul nu este B12 activă (holotranscobalamină), MMA sau
          homocisteină. Date oneste din vendor_offerings snapshot — nu inventăm
          Sante 2,6% ref ranges.
        </p>
      </div>
    </div>
  );
}
