"use client";

import { PANEL_COMPARISON } from "@workspace/data/canonical";
import type { CanonicalItem } from "@workspace/data/types";
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

interface Coverage {
  covered: number;
  lab: string;
  missing?: string[];
  notSold?: boolean;
  total: number;
}

interface Panel {
  coverage: Coverage[];
  id: string;
  members: string[];
  name: string;
  readNext: string;
  slug: string;
  watcher: string;
  whoFor: string;
}

function getPanelMeta(
  item: CanonicalItem
): Pick<Panel, "watcher" | "whoFor" | "readNext"> {
  const id = item.id;
  if (id.includes("tiroid")) {
    return {
      watcher: "Thyroid health — TSH + free hormones + autoimmunity",
      whoFor: "Often for fatigue, nodules, monitoring",
      readNext: "If routine check, TSH alone is often enough.",
    };
  }
  if (id.includes("ionograma")) {
    return {
      watcher: "Electrolytes — mineral balance & hydration",
      whoFor: "Often for kidney, heart, hydration monitoring",
      readNext: "Basic ionogram covers Na/K/Cl; extended adds Ca, Mg, P, Fe.",
    };
  }
  if (id === "arch-albumina") {
    return {
      watcher: "Proteins & reserves — albumin & total protein",
      whoFor: "Often for nutrition, liver, kidney checks",
      readNext:
        "Albumin reflects reserves; pairing with total protein adds context.",
    };
  }
  if (id === "arch-ca-125+he4") {
    return {
      watcher: "Ovarian risk — CA-125 + HE4",
      whoFor: "Often for ovarian monitoring, ROMA screening",
      readNext: "HE4 complements CA-125; ROMA index needs both markers.",
    };
  }
  return {
    watcher: "Panel coverage — market archetype",
    whoFor: "Often for broad screening — compare labs plainly",
    readNext: "Honest gaps shown; not all labs sell every bundle.",
  };
}

function toPanel(item: CanonicalItem): Panel {
  const members = item.referenceComponentIds ?? [];
  const total = members.length > 0 ? members.length : (item.member_count ?? 4);
  const labs: Array<{ label: string; id: string }> = [
    { label: "Sante", id: "sante" },
    { label: "Synevo", id: "synevo" },
    { label: "Invitro", id: "invitro" },
    { label: "Alfa", id: "alfa" },
  ];
  const coverage: Coverage[] = labs.map(({ label, id }) => {
    const hasLab = item.vendors.includes(
      id as CanonicalItem["vendors"][number]
    );
    if (hasLab) {
      return { lab: label, covered: total, total };
    }
    return { lab: label, covered: 0, total, notSold: true };
  });
  const meta = getPanelMeta(item);
  return {
    coverage,
    id: item.id,
    members: members.length > 0 ? members : [item.name_ro ?? item.id],
    name: item.name_ro ?? item.name_en ?? item.id,
    readNext: meta.readNext,
    slug: item.slug_ro ?? item.id,
    watcher: meta.watcher,
    whoFor: meta.whoFor,
  };
}

function getCuratedPanels(): Panel[] {
  const quorumPanels = PANEL_COMPARISON.filter(
    (p) => (p.quorum_size ?? 0) >= 2
  );
  const tiroidian = quorumPanels.find((p) => p.id.includes("tiroid"));
  const lipid = quorumPanels.find((p) => p.id.includes("lipid"));
  let selected: CanonicalItem[];
  if (tiroidian && lipid) {
    selected = [tiroidian, lipid];
  } else {
    selected = quorumPanels.slice(0, 2);
  }
  return selected.map(toPanel);
}

const DEFAULT_BUNDLES: Panel[] = getCuratedPanels();

interface Props {
  bundles?: Panel[];
  idSuffix?: string;
}

export function BundlesShelf({
  bundles = DEFAULT_BUNDLES,
  idSuffix = "home-bundles",
}: Props) {
  return (
    <div
      className="flex min-w-0 flex-col gap-4"
      id={`bundles-shelf-${idSuffix}`}
    >
      <div className="flex flex-col gap-1">
        <h2
          className="font-heading font-semibold text-xl tracking-tight"
          id={`bundles-heading-${idSuffix}`}
        >
          Bundles — ready packs
        </h2>
        <p className="text-muted-foreground text-sm">
          See what is inside, plainly. Honest gaps, not invented.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {bundles.map((b) => (
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
              <CardTitle className="text-balance break-words text-base">
                {b.name}
              </CardTitle>
              <CardDescription className="break-words leading-relaxed">
                {b.members.join(" · ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5">
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
                <p className="break-words text-xs leading-relaxed">
                  <span className="font-medium">Watches:</span> {b.watcher}
                </p>
                <p className="break-words text-muted-foreground text-xs leading-relaxed">
                  <span className="font-medium text-foreground">For:</span>{" "}
                  {b.whoFor}
                </p>
                <p className="break-words text-muted-foreground text-xs leading-relaxed">
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
                          c.notSold
                            ? "bg-muted/10"
                            : c.covered === c.total
                              ? "bg-primary/5"
                              : undefined
                        }
                        key={c.lab}
                      >
                        <TableCell className="px-3 font-medium">
                          {c.lab}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge
                            className={
                              c.notSold
                                ? "bg-muted text-muted-foreground"
                                : undefined
                            }
                            variant={
                              c.notSold
                                ? "outline"
                                : c.covered === c.total
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {c.covered}/{c.total}
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words px-3 text-muted-foreground text-xs">
                          {c.notSold
                            ? "Not yet sold as a bundle here"
                            : c.missing?.join(", ") || "—"}
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

export type { Coverage, Panel };
