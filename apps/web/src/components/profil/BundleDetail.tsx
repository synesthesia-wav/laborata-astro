"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { addToList, createList, getOrCreateAnonToken } from "../../lib/lists";

interface Props {
  id: string;
  memberCount?: number;
  name: string;
  quorumSize: number;
  referenceComponentIds: string[];
  totalComps?: number;
  vendorCount: number;
  vendors: string[];
}

const WATCHER_MAP: Record<
  string,
  { watcher: string; whoFor: string; readNext: string }
> = {
  "arch-albumina": {
    readNext: "Check feritina + B12 together for context.",
    watcher: "Iron stores + transport",
    whoFor: "Fatigue, nutrition check",
  },
  "arch-ca-125+he4": {
    readNext: "Not diagnostic alone — see gynaecologist.",
    watcher: "Ovarian risk markers",
    whoFor: "Monitoring per doctor",
  },
  "arch-hemoleucograma-5-diff": {
    readNext: "5-diff helps differentiate infection vs anemia.",
    watcher: "Blood cells full picture",
    whoFor: "Annual control, anemia",
  },
  "arch-hemoleucograma-cu-reticulocite": {
    readNext: "Retic count shows marrow response.",
    watcher: "Red cell production",
    whoFor: "Anemia workup",
  },
};

const LABS = ["sante", "synevo", "invitro", "medexpert", "alfa"] as const;

export function BundleDetail({
  id,
  name,
  referenceComponentIds,
  vendors,
  quorumSize,
  totalComps,
  memberCount,
  vendorCount,
}: Props) {
  const total = referenceComponentIds.length;
  const watcherInfo = WATCHER_MAP[id] ?? {
    readNext: "Ask doctor which components you need — we show honest coverage.",
    watcher: `${name.replace("Archetype ", "")} — panel watcher`,
    whoFor: "Per-doctor recommendation",
  };

  const handleAddAll = () => {
    const anon = getOrCreateAnonToken();
    const raw = window.localStorage.getItem("laborata:lists");
    let lists: ReturnType<typeof createList>[] = [];
    try {
      lists = raw ? JSON.parse(raw) : [];
    } catch {
      lists = [];
    }
    if (lists.length === 0) {
      lists = [createList("Analizele mele", anon)];
    }
    let target = lists[0];
    for (const tid of referenceComponentIds) {
      const updated = addToList(
        target as unknown as Parameters<typeof addToList>[0],
        tid
      );
      target = updated as unknown as typeof target;
    }
    lists[0] = target;
    window.localStorage.setItem("laborata:lists", JSON.stringify(lists));
    window.location.href = `/liste/${lists[0].id}`;
  };

  const handleAddOne = (testId: string) => {
    const anon = getOrCreateAnonToken();
    const raw = window.localStorage.getItem("laborata:lists");
    let lists: ReturnType<typeof createList>[] = [];
    try {
      lists = raw ? JSON.parse(raw) : [];
    } catch {
      lists = [];
    }
    if (lists.length === 0) {
      lists = [createList("Analizele mele", anon)];
    }
    const target = lists[0];
    const updated = addToList(
      target as unknown as Parameters<typeof addToList>[0],
      testId
    );
    lists[0] = updated as unknown as (typeof lists)[0];
    window.localStorage.setItem("laborata:lists", JSON.stringify(lists));
    // stay on page, give feedback
    const el = document.getElementById(`added-${testId}`);
    if (el) {
      el.textContent = "Added ✓";
      setTimeout(() => (el.textContent = "Adaugă"), 1500);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Bundle • {total} tests</Badge>
            <Badge
              className="font-mono text-[10px] tracking-widest"
              variant="outline"
            >
              SYSTEM • {id.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              quorum {quorumSize}/{totalComps ?? total}
            </Badge>
          </div>
          <CardTitle className="text-balance text-xl">{name}</CardTitle>
          <CardDescription>{referenceComponentIds.join(" · ")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <p className="text-xs leading-relaxed">
              <span className="font-medium">Watches:</span>{" "}
              {watcherInfo.watcher}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <span className="font-medium text-foreground">For:</span>{" "}
              {watcherInfo.whoFor}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {watcherInfo.readNext}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddAll} size="sm">
              Add all {total} → List
            </Button>
            <Button
              onClick={() => (window.location.href = "/liste")}
              size="sm"
              variant="outline"
            >
              Vezi liste
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {vendorCount} labs • quorum {quorumSize}/{totalComps ?? total}{" "}
            honest • member_count {memberCount ?? total} • Not yet sold here
            never invent.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">
            Acoperire N-of-M per laborator
          </CardTitle>
          <CardDescription>
            Sante 4/4 etc — Not yet sold here if 0/{total}. Use
            quorum_size/total_comps honest.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-3">Lab</TableHead>
                <TableHead className="px-3">Coverage</TableHead>
                <TableHead className="px-3">Missing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LABS.map((lab) => {
                const has = vendors.includes(lab);
                const covered = has ? quorumSize : 0;
                const missingCount = total - covered;
                const notSold = !has;
                return (
                  <TableRow
                    className={
                      has && covered === total ? "bg-primary/5" : undefined
                    }
                    key={lab}
                  >
                    <TableCell className="px-3 font-medium capitalize">
                      {lab}
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge
                        variant={
                          has && covered === total ? "secondary" : "outline"
                        }
                      >
                        {covered}/{total}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 text-muted-foreground text-xs">
                      {notSold
                        ? "Not yet sold as a bundle here"
                        : missingCount === 0
                          ? "—"
                          : `${missingCount} missing (quorum honest)`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Componente — one-by-one</CardTitle>
          <CardDescription>
            Add all or one-by-one via lists (soft 12)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {referenceComponentIds.map((cid) => (
            <div
              className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              key={cid}
            >
              <a
                className="min-w-0 flex-1 truncate break-all font-medium font-mono text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                href={`/analize/${cid}`}
              >
                {cid}
              </a>
              <Button
                className="h-7 text-xs"
                id={`added-${cid}`}
                onClick={() => handleAddOne(cid)}
                size="sm"
                variant="outline"
              >
                Adaugă
              </Button>
            </div>
          ))}
          <Separator />
          <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
            <span>quorum_size: {quorumSize}</span>
            <span>• total_comps: {totalComps ?? "n/a"}</span>
            <span>• vendors: {vendors.join(", ") || "none"}</span>
            <span>• member_count: {memberCount ?? total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
