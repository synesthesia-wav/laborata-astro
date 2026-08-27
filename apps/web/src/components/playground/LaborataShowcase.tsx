import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";

/* Laborata — spacious calm, light only, 390px frames.
   Uses only semantic tokens (bg-card, text-muted-foreground, border, etc.)
   No arbitrary Tailwind colors. Each frame has unique id for a11y isolation. */

function StateFrame({
  id,
  title,
  description,
  width,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
      data-state-frame={id}
      id={id}
      style={width ? { maxWidth: width, width: "100%" } : undefined}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-heading font-medium text-sm tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        )}
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {id}
        </span>
      </div>
      <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
        {children}
      </div>
    </section>
  );
}

export function LaborataShowcase() {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Header for section */}
      <div className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-sm">
          Laborata — Home (spacious calm, light only, 390px)
        </h2>
        <p className="max-w-3xl text-muted-foreground text-xs leading-relaxed">
          Three mobile takes from Paper, rebuilt with real shadcn parts
          (@workspace/ui), semantic tokens only, gap-based layout. Each frame
          has a unique{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
            id
          </code>{" "}
          and is clamped to 390px. Light only as requested — no dark.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        {/* Home A — Quiet doorway */}
        <StateFrame
          description="Quiet doorway — big headline, one search, vertical list. Most open, for someone in a hurry."
          id="laborata-home-a-quiet"
          title="Home A — Quiet doorway (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-foreground font-bold text-background text-xs">
                  L
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs tracking-tight">
                    laborata
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Moldova • comparație onestă
                  </span>
                </div>
              </div>
              <Badge className="text-[11px]" variant="outline">
                RO • EN
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-muted px-2.5 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                <span className="size-1.5 rounded-full bg-primary" /> 5
                laboratoare • un adevăr
              </div>
              <h3 className="font-bold font-heading text-[28px] leading-[28px] tracking-tight">
                Găsește analizele{" "}
                <span className="font-medium text-primary italic">
                  potrivite,
                </span>{" "}
                la prețul corect.
              </h3>
              <p className="text-muted-foreground text-sm leading-5">
                Comparație onestă între Synevo, Invitro, Sante, MedExpert și
                Alfa — cu toate taxele la vedere.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
                <span className="pl-1 text-muted-foreground">⌕</span>
                <label className="sr-only" htmlFor="laborata-home-a-search">
                  Caută analize
                </label>
                <Input
                  aria-label="Caută analize"
                  className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  id="laborata-home-a-search"
                  placeholder="Caută: TSH, Vitamina D, Hemoleucogramă"
                />
                <Button aria-label="Caută" size="icon-sm">
                  ＋
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
                  Încearcă
                </span>
                <Badge variant="secondary">tsh</Badge>
                <Badge variant="outline">feritină</Badge>
                <Badge variant="outline">vitamina d</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
                  Lista ta • 3 analize
                </span>
                <Button size="xs" variant="secondary">
                  Vezi compararea →
                </Button>
              </div>
              <Card className="min-w-0">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                      TSH
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        TSH — Hormon tireotrop
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        Sânge • de la 92 lei
                      </p>
                    </div>
                  </div>
                  <Button
                    aria-label="Elimină TSH din listă"
                    size="icon-xs"
                    variant="outline"
                  >
                    ×
                  </Button>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                      VD
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        Vitamina D (25-OH)
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        Sânge • de la 195 lei
                      </p>
                    </div>
                  </div>
                  <Button
                    aria-label="Elimină Vitamina D din listă"
                    size="icon-xs"
                    variant="outline"
                  >
                    ×
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                Compară prețuri{" "}
                <span className="text-xs opacity-70">• 3 analize</span>
              </Button>
              <Button aria-label="Favorite" size="icon" variant="outline">
                ♡
              </Button>
            </div>
          </div>
        </StateFrame>

        {/* Home B — Shelves */}
        <StateFrame
          description="Shelves — small hero, horizontal test and bundle shelves you can slide. More to browse."
          id="laborata-home-b-shelves"
          title="Home B — Shelves (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold font-heading text-[22px] leading-6 tracking-tight">
                Comparație onestă{" "}
                <span className="font-medium text-primary italic">
                  între 5 laboratoare.
                </span>
              </h3>
              <p className="text-muted-foreground text-xs leading-4">
                Caută în română, cu sau fără diacritice — vezi prețul corect, cu
                taxa de recoltare la vedere.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
              <span className="pl-1 text-muted-foreground">⌕</span>
              <label className="sr-only" htmlFor="laborata-home-b-search">
                Caută analize
              </label>
              <Input
                aria-label="Caută analize"
                className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                id="laborata-home-b-search"
                placeholder="Caută: TSH, Vitamina D"
              />
              <Button size="sm">Caută</Button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <Badge>Toate • 1 522</Badge>
              <Badge className="shrink-0" variant="outline">
                Sânge
              </Badge>
              <Badge className="shrink-0" variant="outline">
                Profil tiroidian
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">Analize frecvente</span>
                <span className="font-medium text-primary text-xs">
                  Vezi toate →
                </span>
              </div>
              <div className="grid grid-cols-[168px_168px_168px] gap-3 overflow-x-auto pb-1">
                <Card className="min-w-0">
                  <CardHeader className="pb-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                      TSH
                    </div>
                    <CardTitle className="text-sm">TSH</CardTitle>
                    <CardDescription>Hormon tireotrop • Sânge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-sm">
                      92 lei{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        de la
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      5 lab • în stoc
                    </p>
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader className="pb-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                      VD
                    </div>
                    <CardTitle className="text-sm">Vitamina D 25-OH</CardTitle>
                    <CardDescription>Sânge • cu explicație</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-sm">
                      195 lei{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        de la
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Recomandat iarna
                    </p>
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader className="pb-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                      HEM
                    </div>
                    <CardTitle className="text-sm">Hemoleucogramă</CardTitle>
                    <CardDescription>Sânge • completă</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-sm">
                      85 lei{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        de la
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">Rapid • azi</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">
                  Pachete — ce conțin, pe scurt
                </span>
                <span className="font-medium text-primary text-xs">
                  Toate →
                </span>
              </div>
              <div className="grid grid-cols-[192px_192px] gap-3 overflow-x-auto pb-1">
                <Card className="min-w-0">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="text-[11px]" variant="secondary">
                        4 analize
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        de la 420 lei
                      </span>
                    </div>
                    <CardTitle className="text-sm leading-tight">
                      Profil tiroidian
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      TSH, T3 liber, T4 liber, Anti-TPO — glanda tiroidă.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        ✓
                      </span>{" "}
                      Acoperit la 3 din 5 lab
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-0 bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="text-[11px]" variant="outline">
                        4 analize
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        de la 180 lei
                      </span>
                    </div>
                    <CardTitle className="text-sm leading-tight">
                      Lipidogramă
                    </CardTitle>
                    <CardDescription>
                      Colesterol total, HDL, LDL, Trigliceride.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-muted-foreground text-xs">
                      • 5 lab • explicat
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </StateFrame>

        {/* Home C — Concern row */}
        <StateFrame
          description="Concern row + steady watcher — scrollable concerns, one-line explainer above bundles, list remembers when price was seen."
          id="laborata-home-c-concern"
          title="Home C — Concern row (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold font-heading text-[24px] leading-6 tracking-tight">
                Un loc calm{" "}
                <span className="font-medium text-primary italic">
                  pentru întrebări despre sănătate.
                </span>
              </h3>
              <p className="text-muted-foreground text-xs leading-4">
                Alege după îngrijorare sau caută direct — vezi același nume
                peste tot, cu taxe la vedere și un rând scurt care explică.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
              <span className="pl-1 text-muted-foreground">⌕</span>
              <label className="sr-only" htmlFor="laborata-home-c-search">
                Caută analize
              </label>
              <Input
                aria-label="Caută analize"
                className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                id="laborata-home-c-search"
                placeholder="Caută: tsh, hemoglobina, glicemie"
              />
              <Button aria-label="Adaugă" size="icon-sm">
                ＋
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <Badge>Toate îngrijorările</Badge>
                <Badge className="shrink-0" variant="outline">
                  Energie și somn
                </Badge>
                <Badge className="shrink-0" variant="outline">
                  Inimă
                </Badge>
                <Badge className="shrink-0" variant="outline">
                  Hormoni
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  ✓
                </span>{" "}
                Începe cu o îngrijorare — vezi testele potrivite în cuvinte
                simple, nu coduri.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">
                  Pentru tine, azi — 3 de văzut
                </span>
                <span className="text-muted-foreground text-xs">
                  Cu explicație
                </span>
              </div>
              <div className="grid grid-cols-[172px_172px] gap-3 overflow-x-auto pb-1">
                <Card className="min-w-0 bg-muted">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-card font-bold text-xs">
                        TSH
                      </div>
                      <Badge className="text-[10px]" variant="secondary">
                        Tiroida • des
                      </Badge>
                    </div>
                    <CardTitle className="text-sm">TSH</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs leading-4">
                      Hormonul care pornește tiroida. Oboseală, frig, creștere
                      în greutate.
                    </p>
                    <p className="font-bold text-sm">
                      92 lei{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        de la • 5 lab
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-muted font-bold text-xs">
                        VD
                      </div>
                      <Badge className="text-[10px]" variant="outline">
                        Oase
                      </Badge>
                    </div>
                    <CardTitle className="text-sm">Vitamina D 25-OH</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs leading-4">
                      Rezervele de vitamina D. Iarna, oboseală prelungită.
                    </p>
                    <p className="font-bold text-sm">
                      195 lei{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        de la
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">
                  Pachete — cu un rând care explică
                </span>
                <span className="text-muted-foreground text-xs">
                  Pentru urmărit în timp
                </span>
              </div>
              <div className="grid grid-cols-[200px_200px] gap-3 overflow-x-auto pb-1">
                <Card className="min-w-0 bg-muted">
                  <CardHeader>
                    <Badge className="w-fit text-[10px]">
                      Tiroida • 4 teste
                    </Badge>
                    <CardTitle className="text-sm">Profil tiroidian</CardTitle>
                    <CardDescription className="line-clamp-3">
                      Țiroida: cum pornește și cum se apără. Include TSH, T3
                      liber, T4 liber, Anti-TPO. Acoperit la 3 din 5 lab.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-sm">de la 420 lei</p>
                    <span className="font-medium text-primary text-xs">
                      Vezi ce e înăuntru →
                    </span>
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader>
                    <Badge className="w-fit text-[10px]" variant="outline">
                      Metabolic • 4 teste
                    </Badge>
                    <CardTitle className="text-sm">Lipidogramă</CardTitle>
                    <CardDescription>
                      Colesterol total, HDL, LDL, Trigliceride — inimă și
                      metabolism, pe înțeles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-sm">de la 180 lei</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </StateFrame>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-sm">
          Laborata — Test detail (spacious calm, light only, 390px)
        </h2>
        <p className="max-w-3xl text-muted-foreground text-xs leading-relaxed">
          Same three voices for a single test (TSH). Price as headline, fees
          shown once, explanation as gentle companion for the steady watcher.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        {/* Test A */}
        <StateFrame
          description="Quiet doorway — big readable title, honest table, fee explained once."
          id="laborata-test-a-quiet"
          title="Test A — Quiet (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <Button size="xs" variant="outline">
                ← Înapoi
              </Button>
              <div className="flex gap-1.5">
                <Button aria-label="Favorite" size="icon-xs" variant="outline">
                  ♡
                </Button>
                <Button aria-label="Distribuie" size="icon-xs">
                  ↗
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className="w-fit text-[11px]" variant="secondary">
                Sânge • TSH • 5 lab
              </Badge>
              <h3 className="font-bold font-heading text-[22px] leading-5 tracking-tight">
                TSH{" "}
                <span className="font-normal text-base text-muted-foreground">
                  — Hormon tireotrop
                </span>
              </h3>
              <p className="text-muted-foreground text-xs leading-4">
                Hormonul care pornește tiroida. Util când te simți obosit, ți-e
                frig sau iei în greutate inexplicabil. Proba:{" "}
                <span className="font-medium text-foreground">
                  Sânge venos, à jeun nu este obligatoriu.
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  Preț onest • cu taxe
                </span>
                <span className="text-muted-foreground text-xs">văzut azi</span>
              </div>
              <Card className="border-primary/20 bg-muted">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-card font-bold text-xs">
                      SA
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sante</p>
                      <p className="text-muted-foreground text-xs">
                        92 lei + 0 lei recoltare • Botanica
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">92 lei</p>
                    <Badge className="text-[11px]" variant="secondary">
                      cel mai mic
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                      SY
                    </div>
                    <span className="text-sm">Synevo</span>
                  </div>
                  <span className="font-semibold text-sm">105 lei</span>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                      IV
                    </div>
                    <span className="text-sm">Invitro</span>
                    <span className="text-muted-foreground text-xs">
                      +30 lei recoltare
                    </span>
                  </div>
                  <span className="font-semibold text-sm">140 lei</span>
                </CardContent>
              </Card>
            </div>
            <div className="rounded-xl border bg-muted/50 p-3 text-muted-foreground text-xs leading-4">
              Taxa de recoltare se plătește o dată per vizită — nu per analiză.
              Aici: Sânge venos, 0–30 lei după laborator.
            </div>
            <Button>
              Adaugă în Analizele mele{" "}
              <span className="text-xs opacity-70">• 3 acum</span>
            </Button>
          </div>
        </StateFrame>

        {/* Test B */}
        <StateFrame
          description="Shelves — summary top, compact rows, split CTAs."
          id="laborata-test-b-shelves"
          title="Test B — Shelves (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Badge className="w-fit" variant="secondary">
                Sânge • văzut azi
              </Badge>
              <h3 className="font-bold font-heading text-xl tracking-tight">
                TSH{" "}
                <span className="font-normal text-muted-foreground">
                  — tireotrop
                </span>
              </h3>
              <p className="text-muted-foreground text-xs leading-4">
                Tiroida: pornește și reglează. Sânge venos. Fără à jeun
                obligatoriu.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Card className="bg-muted">
                <CardHeader className="pb-2">
                  <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                    Cel mai mic • azi
                  </p>
                  <p className="font-bold text-xl">92 lei</p>
                  <p className="text-muted-foreground text-xs">
                    Sante • 0 lei recoltare
                  </p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                    Interval
                  </p>
                  <p className="font-bold text-sm">92 — 140 lei</p>
                  <p className="text-muted-foreground text-xs">
                    5 lab • taxe incluse
                  </p>
                </CardHeader>
              </Card>
            </div>
            <div className="flex flex-col gap-1.5">
              <Card className="bg-muted">
                <CardContent className="flex items-center justify-between gap-3 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-card font-bold text-xs">
                      SA
                    </div>
                    <span className="font-medium text-sm">Sante</span>
                  </div>
                  <span className="font-bold text-primary text-sm">92 lei</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                      SY
                    </div>
                    <span className="text-sm">Synevo</span>
                  </div>
                  <span className="font-semibold text-sm">105 lei</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                      IV
                    </div>
                    <span className="text-sm">Invitro</span>
                    <span className="text-muted-foreground text-xs">
                      +30 lei
                    </span>
                  </div>
                  <span className="font-semibold text-sm">140 lei</span>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Adaugă</Button>
              <Button className="flex-1" variant="outline">
                Vezi pe hartă
              </Button>
            </div>
          </div>
        </StateFrame>

        {/* Test C */}
        <StateFrame
          description="With explanation — steady watcher companion, guide link, list memory."
          id="laborata-test-c-explainer"
          title="Test C — With explainer (390px)"
          width="390px"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Cu explicație</Badge>
                <span className="text-muted-foreground text-xs">
                  Sânge • văzut acum 2 zile
                </span>
              </div>
              <h3 className="font-bold font-heading text-xl tracking-tight">
                TSH{" "}
                <span className="font-normal text-muted-foreground">
                  — tireotrop
                </span>{" "}
                <Badge
                  className="ml-1 align-middle text-[11px]"
                  variant="secondary"
                >
                  în lista ta
                </Badge>
              </h3>
              <div className="rounded-xl border bg-muted p-3 text-xs leading-4">
                Hormonul care pornește tiroida. Când te simți obosit, ți-e frig,
                iei în greutate.{" "}
                <span className="text-muted-foreground">
                  Proba: Sânge venos. Fără à jeun obligatoriu. Vezi ghidul scurt
                  jos.
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  Preț • cu taxe, onest
                </span>
                <Badge className="text-[11px]" variant="secondary">
                  92 lei • cel mai mic
                </Badge>
              </div>
              <Card className="bg-muted">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-card font-bold text-xs">
                      SA
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sante • Botanica</p>
                      <p className="text-muted-foreground text-xs">
                        92 + 0 lei recoltare • deschis 07:30–14:00
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-sm">92 lei</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                      SY
                    </div>
                    <span className="text-sm">Synevo</span>
                  </div>
                  <span className="font-semibold text-sm">105 lei</span>
                </CardContent>
              </Card>
              <div className="rounded-xl border bg-muted/50 p-3">
                <p className="font-semibold text-xs">
                  Ce urmărește TSH, pe scurt
                </p>
                <p className="text-muted-foreground text-xs leading-4">
                  TSH arată cum pornește tiroida. Dacă TSH este mare și T4 liber
                  mic, tiroida lucrează încet.{" "}
                  <span className="font-medium text-primary">
                    Profil tiroidian — 4 teste, ce e înăuntru →
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Adaugă • deja în listă ✓</Button>
              <Button className="flex-1" variant="outline">
                Trimite link
              </Button>
            </div>
            <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <span className="flex size-4 items-center justify-center rounded-full border text-[10px]">
                ↗
              </span>{" "}
              Linkul se deschide fără cont • prețuri văzute azi
            </p>
          </div>
        </StateFrame>
      </div>
    </div>
  );
}
