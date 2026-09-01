import type { LabId } from "@workspace/data/types";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { PRICE_OFFERS_B12, type PriceOffer } from "./data";

interface Props {
  idSuffix?: string;
  lang?: "ro" | "en";
  loading?: boolean;
  offers?: readonly PriceOffer[];
  priceAsOf?: string;
  sampleType?: string;
}

const LAB_ORDER: readonly LabId[] = [
  "synevo",
  "sante",
  "invitro",
  "medexpert",
  "alfa",
] as const;

const LAB_LABEL: Record<LabId, string> = {
  alfa: "Alfa",
  invitro: "Invitro",
  medexpert: "MedExpert",
  sante: "Sante",
  synevo: "Synevo",
} as const;

function formatMdl(n: number): string {
  // ro-RO grouping: 1.250.000
  return new Intl.NumberFormat("ro-RO").format(n);
}

export function PriceComparison({
  loading = false,
  offers,
  lang = "ro",
  priceAsOf = "august 2026",
  idSuffix = "price",
  sampleType = "blood",
}: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const rawOffers = offers ?? PRICE_OFFERS_B12;
  const byVendor = new Map<LabId, PriceOffer>(
    rawOffers.map((o) => [o.vendor, o])
  );

  const rows: Array<{
    available: boolean;
    lab: string;
    price: number | null;
    variant: string | null;
    vendor: LabId;
  }> = LAB_ORDER.map((vendor) => {
    const o = byVendor.get(vendor);
    if (!o) {
      return {
        available: false,
        lab: LAB_LABEL[vendor],
        price: null,
        variant: null,
        vendor,
      };
    }
    return {
      available: true,
      lab: o.lab,
      price: o.price_mdl,
      variant: o.variant ?? null,
      vendor: o.vendor,
    };
  });

  const availableRows = rows.filter(
    (r) => r.available && r.price !== null
  ) as Array<
    {
      lab: string;
      price: number;
      variant: string | null;
      vendor: LabId;
    } & { available: true }
  >;

  if (availableRows.length === 0) {
    return (
      <div className="flex flex-col gap-6" id={`price-comparison-${idSuffix}`}>
        <div className="flex flex-col gap-2">
          <h2 className="text-balance font-heading font-semibold text-2xl tracking-tight">
            Cât costă testul Vitamina B12
          </h2>
          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
            Comparăm prețul Laborata (cel mai mic dintre rețelele partenere) cu
            oferte similare verificate recent. Taxa de recoltare se afișează
            separat — o plătești o singură dată per vizită.
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-base">Comparație prețuri</CardTitle>
            <CardDescription>
              Nicio ofertă disponibilă pentru acest test în acest moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div
              aria-live="polite"
              className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center"
            >
              <p className="font-medium text-sm">Not available</p>
              <p className="mx-auto mt-1 max-w-md text-muted-foreground text-xs leading-relaxed">
                Testul nu este listat momentan la cei 5 parteneri. Încearcă un
                sinonim (ex. TSH / feritină) sau revino — actualizăm zilnic din
                vendor_offerings snapshot.
              </p>
            </div>
            <div className="mt-4 border-t bg-muted/20 px-3 py-3 text-muted-foreground text-xs leading-relaxed">
              {lang === "en" ? (
                <>
                  plus 30 MDL once — collection fee paid once per visit, even
                  with multiple tests. Sante &amp; MedExpert: 0 MDL — included.
                  Source: vendor_fees.json ({sampleType}).
                </>
              ) : (
                <>
                  plus 30 lei o singură dată — taxa de recoltare se plătește o
                  singură dată per vizită, chiar dacă adaugi mai multe teste.
                  Sante și MedExpert: 0 lei — inclus. Alfa: 25 lei. Sursă:
                  vendor_fees.json ({sampleType}).
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cheapestPrice = Math.min(...availableRows.map((r) => r.price));
  const cheapestVendor = availableRows.find(
    (r) => r.price === cheapestPrice
  )?.vendor;

  const lowest = cheapestPrice;
  const badgeLabel =
    lang === "en"
      ? `From ${formatMdl(lowest)} MDL`
      : `De la ${formatMdl(lowest)} lei`;

  // 270 lei grouped example — keep honest: show MDL=lei 1:1 for MD, not invention
  const groupedNote =
    lang === "en"
      ? "270 MDL (EN) / 270 lei (RO) — grouped"
      : "270 lei (RO) / 270 MDL (EN)";

  return (
    <div className="flex flex-col gap-6" id={`price-comparison-${idSuffix}`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-balance font-heading font-semibold text-2xl tracking-tight">
          Cât costă testul Vitamina B12
        </h2>
        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Comparăm prețul Laborata (cel mai mic dintre rețelele partenere) cu
          oferte similare verificate recent. Taxa de recoltare se afișează
          separat — o plătești o singură dată per vizită, chiar dacă adaugi mai
          multe teste. {groupedNote}.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="px-5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Comparație prețuri</CardTitle>
            <Badge variant="secondary">{badgeLabel}</Badge>
            {availableRows.some((r) => r.variant) ? (
              <Badge variant="outline">variant</Badge>
            ) : null}
          </div>
          <CardDescription>
            Preț test (fără taxă). Actualizat: {priceAsOf}. 5 laboratoare
            partenere — Synevo, Sante, Invitro, MedExpert, Alfa. Taxa afișată o
            singură dată în footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-5">Laborator</TableHead>
                  <TableHead className="px-5 text-right">Preț test</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isCheapest =
                    row.available &&
                    row.price !== null &&
                    row.price === cheapestPrice &&
                    row.vendor === cheapestVendor;
                  if (!row.available || row.price === null) {
                    return (
                      <TableRow
                        aria-label={`${row.lab} indisponibil`}
                        className="bg-muted/10"
                        key={row.vendor}
                      >
                        <TableCell className="px-5">
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap text-muted-foreground">
                              {row.lab}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Indisponibil
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 text-right text-muted-foreground text-sm">
                          — <span className="text-xs">Not available</span>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow
                      className={
                        isCheapest ? "bg-primary/5 font-medium" : undefined
                      }
                      data-state={isCheapest ? "selected" : undefined}
                      key={row.vendor}
                    >
                      <TableCell className="px-5">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">
                            {row.lab}
                            {row.variant ? (
                              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none">
                                {row.variant}
                              </span>
                            ) : null}
                          </span>
                          {isCheapest ? (
                            <span className="font-normal text-primary text-xs">
                              Recomandat · cel mai mic preț
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 text-right font-medium">
                        <span className="tabular-nums">
                          {formatMdl(row.price)} {lang === "en" ? "MDL" : "lei"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="border-t bg-muted/20 px-5 py-3 text-muted-foreground text-xs leading-relaxed">
            {lang === "en" ? (
              <>
                plus 30 MDL once — collection fee paid once per visit, even if
                you add more tests. Sante &amp; MedExpert: 0 MDL — included.
                Alfa: 25 MDL once. Source: vendor_fees.json (blood) ·{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://www.invitro.md/ro/services/prelevarea-sangelui-venos"
                  rel="noopener"
                  target="_blank"
                >
                  invitro.md
                </a>{" "}
                ·{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://alfalab.md/ro/analize-medicale/P/prelevarea-sangelui-venos-25"
                  rel="noopener"
                  target="_blank"
                >
                  alfalab.md
                </a>
                .
              </>
            ) : (
              <>
                plus 30 lei o singură dată — taxa de recoltare se plătește o
                singură dată per vizită, chiar dacă adaugi mai multe teste.
                Sante și MedExpert: 0 lei — inclus. Alfa: 25 lei o singură dată.
                Sursă: vendor_fees.json (sânge venos) ·{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://www.invitro.md/ro/services/prelevarea-sangelui-venos"
                  rel="noopener"
                  target="_blank"
                >
                  invitro.md
                </a>{" "}
                ·{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://alfalab.md/ro/analize-medicale/P/prelevarea-sangelui-venos-25"
                  rel="noopener"
                  target="_blank"
                >
                  alfalab.md
                </a>{" "}
                · synevo.md (30 lei estimat).
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Sfat: adaugă MMA sau folat în aceeași comandă — plătești o singură taxă
        de recoltare. Cel mai ieftin: {LAB_LABEL[cheapestVendor ?? "sante"]} ·{" "}
        {formatMdl(cheapestPrice)} {lang === "en" ? "MDL" : "lei"}.
      </p>
    </div>
  );
}
