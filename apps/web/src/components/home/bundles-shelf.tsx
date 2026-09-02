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
    watcher: "Panel — comparison across labs",
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
    { label: "MedExpert", id: "medexpert" },
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
      className="flex min-w-0 flex-col gap-5"
      id={`bundles-shelf-${idSuffix}`}
    >
      <div className="flex flex-col gap-1.5">
        <h2
          className="font-heading font-semibold text-xl tracking-tight"
          id={`bundles-heading-${idSuffix}`}
        >
          Bundles — ready packs
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          See what is inside, plainly. Honest gaps, not invented.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {bundles.map((b) => (
          <Card className="flex flex-col overflow-hidden" key={b.id}>
            <CardHeader className="gap-2 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className="rounded-full px-2.5 py-0 text-[11px]"
                  variant="secondary"
                >
                  Bundle · {b.members.length} tests
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {b.coverage.filter((c) => !c.notSold).length}/5 labs sell it
                </span>
              </div>
              <CardTitle className="text-balance break-words text-[15px] leading-tight">
                {b.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 break-words text-xs leading-relaxed">
                {b.members.join(" · ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="inset-card flex flex-col gap-1.5">
                <p className="break-words text-xs leading-relaxed">
                  <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                    Watches
                  </span>{" "}
                  <span className="font-medium text-foreground">
                    {b.watcher}
                  </span>
                </p>
                <p className="break-words text-muted-foreground text-xs leading-relaxed">
                  <span className="font-medium text-foreground">For:</span>{" "}
                  {b.whoFor}
                </p>
                <p className="break-words text-muted-foreground text-xs leading-relaxed">
                  {b.readNext}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                  Coverage per lab
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {b.coverage.map((c) => (
                    <div
                      className={
                        c.notSold
                          ? "inset-card flex items-center justify-between gap-2 py-2.5 opacity-60"
                          : c.covered === c.total
                            ? "inset-card flex items-center justify-between gap-2 bg-primary/5 py-2.5 ring-1 ring-primary/15 dark:bg-primary/10"
                            : "inset-card flex items-center justify-between gap-2 py-2.5"
                      }
                      key={c.lab}
                    >
                      <span className="font-medium text-sm">{c.lab}</span>
                      <span className="flex items-center gap-2">
                        <Badge
                          className="rounded-full px-2 py-0 text-xs tabular-nums"
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
                        <span className="hidden text-muted-foreground text-xs sm:inline">
                          {c.notSold
                            ? "Not sold as bundle"
                            : c.missing?.join(", ") || "complete"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Not yet sold as a bundle here.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export type { Coverage, Panel };
