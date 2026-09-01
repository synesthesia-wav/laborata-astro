"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

const BUNDLES = [
  {
    coverage: [
      { covered: 4, lab: "Sante", total: 4 },
      { covered: 4, lab: "Synevo", total: 4 },
      { covered: 3, lab: "Invitro", missing: ["Anti-TPO"], total: 4 },
      { covered: 0, lab: "Alfa", notSold: true, total: 4 },
    ],
    id: "arch-tiroidian",
    members: ["TSH", "T3 free", "T4 free", "Anti-TPO"],
    name: "Thyroid profile",
    readNext: "If routine check, TSH alone is often enough.",
    slug: "profil-tiroidian",
    watcher: "Thyroid health",
    whoFor: "Often for fatigue, nodules, monitoring",
  },
  {
    coverage: [
      { covered: 4, lab: "Sante", total: 4 },
      { covered: 4, lab: "Synevo", total: 4 },
      { covered: 4, lab: "Invitro", total: 4 },
      { covered: 0, lab: "Alfa", notSold: true, total: 4 },
    ],
    id: "arch-lipid",
    members: ["Total cholesterol", "HDL", "LDL", "Triglycerides"],
    name: "Lipid panel",
    readNext: "LDL is calculated; 9–12h fasting helps but not always required.",
    slug: "lipidograma",
    watcher: "Blood fats — cardiovascular risk",
    whoFor: "Often for annual check, diet, hypertension",
  },
] as const;

export function BundlesShelf() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-semibold text-xl tracking-tight">
          Bundles — ready packs
        </h2>
        <p className="text-muted-foreground text-sm">
          See what is inside, plainly. Honest gaps, not invented.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {BUNDLES.map((b) => (
          <Card className="flex flex-col overflow-hidden p-0" key={b.id}>
            <CardHeader className="gap-3 px-5 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  Bundle • {b.members.length} tests
                </Badge>
                <Badge
                  className="font-mono text-[10px] tracking-widest"
                  variant="outline"
                >
                  SYSTEM • {b.id.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-balance text-base">{b.name}</CardTitle>
              <CardDescription className="leading-relaxed">
                {b.members.join(" · ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5">
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
                <p className="text-xs leading-relaxed">
                  <span className="font-medium">Watches:</span> {b.watcher}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <span className="font-medium text-foreground">For:</span>{" "}
                  {b.whoFor}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {b.readNext}
                </p>
              </div>
              <Separator />
              <div className="-mx-5 min-w-0 overflow-x-auto px-5">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="px-3">Lab</TableHead>
                      <TableHead className="px-3">Coverage</TableHead>
                      <TableHead className="px-3">Missing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b.coverage.map((c) => (
                      <TableRow
                        className={
                          c.covered === c.total ? "bg-primary/5" : undefined
                        }
                        key={c.lab}
                      >
                        <TableCell className="px-3 font-medium">
                          {c.lab}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge
                            variant={
                              c.covered === c.total ? "secondary" : "outline"
                            }
                          >
                            {c.covered}/{c.total}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 text-muted-foreground text-xs">
                          {(c as any).notSold
                            ? "Not yet sold as a bundle here"
                            : (c as any).missing?.join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
