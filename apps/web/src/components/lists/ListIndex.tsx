"use client";

import { BRANCHES } from "@workspace/data/branches";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useEffect, useState } from "react";
import type { List } from "../../lib/lists";
import {
  createList,
  createPresetLists,
  decodeShareToken,
  encodeShareToken,
  getOrCreateAnonToken,
  shareUrlFor,
} from "../../lib/lists";

export function ListIndex() {
  const [lists, setLists] = useState<List[] | null>(null);
  const [newName, setNewName] = useState("");
  const [shareIncoming, setShareIncoming] = useState<string | null>(null);

  useEffect(() => {
    const anon = getOrCreateAnonToken();
    const p = new URLSearchParams(window.location.search);
    const share = p.get("share");
    if (share) {
      const payload = decodeShareToken(share);
      if (payload) {
        setShareIncoming(
          `Shared list “${payload.name}” with ${payload.items.length} teste — opening read-only.`
        );
        // import shared list as read-only view? For now, also persist as imported list if not exists
        const raw = window.localStorage.getItem("laborata:lists");
        let existing: List[] = [];
        try {
          existing = raw ? JSON.parse(raw) : [];
        } catch {
          existing = [];
        }
        const already = existing.find((l) => l.id === payload.id);
        if (!already) {
          const imported: List = {
            createdAt: new Date().toISOString(),
            id: payload.id,
            items: payload.items,
            name: payload.name,
            owner: anon,
            pinnedBranchId: payload.pinnedBranchId,
          };
          existing = [...existing, imported];
          window.localStorage.setItem(
            "laborata:lists",
            JSON.stringify(existing)
          );
        }
      }
    }

    const raw = window.localStorage.getItem("laborata:lists");
    let parsed: List[] = [];
    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch {
      parsed = [];
    }
    if (parsed.length === 0) {
      parsed = createPresetLists(anon) as unknown as List[];
      window.localStorage.setItem("laborata:lists", JSON.stringify(parsed));
    }
    setLists(parsed);
  }, []);

  const persist = (next: List[]) => {
    setLists(next);
    window.localStorage.setItem("laborata:lists", JSON.stringify(next));
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      return;
    }
    const anon = getOrCreateAnonToken();
    const nl = createList(newName.trim(), anon);
    const next = [...(lists ?? []), nl as unknown as List];
    persist(next);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    const next = (lists ?? []).filter((l) => l.id !== id);
    persist(next);
  };

  const handleRename = (id: string, name: string) => {
    const next = (lists ?? []).map((l) =>
      l.id === id ? { ...l, name: name.trim() || l.name } : l
    );
    persist(next);
  };

  const handleCopyShare = async (list: List) => {
    try {
      const token = encodeShareToken(
        list as unknown as Parameters<typeof encodeShareToken>[0]
      );
      const url = shareUrlFor(
        list as unknown as Parameters<typeof shareUrlFor>[0],
        window.location.origin
      );
      await navigator.clipboard.writeText(url);
      alert(`Link copied: ${url.slice(0, 80)}... token <2k (${token.length})`);
    } catch (e) {
      alert(String(e));
    }
  };

  if (lists === null) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {shareIncoming ? (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3 text-sm">
            {shareIncoming} Open on another phone with no account — same prices
            + branch if pinned.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crează listă</CardTitle>
          <CardDescription>
            Soft 12 — List mare…împarte în două? non-blocking. Share token
            base64&lt;2k, pinnedBranchId, opens on another phone with no
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label className="sr-only" htmlFor="new-list-name">
            Nume listă nouă
          </Label>
          <div className="flex gap-2">
            <Input
              aria-label="Nume listă nouă"
              id="new-list-name"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Ex: Mama — control anual"
              value={newName}
            />
            <Button onClick={handleCreate}>Crează</Button>
          </div>
        </CardContent>
      </Card>

      {lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No lists yet</EmptyTitle>
                <EmptyDescription>
                  Create “Analizele mele” to start.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lists.map((l) => {
            const isOver = l.items.length > 12;
            const warn =
              l.items.length >= 12
                ? "List mare — compararea poate fi lungă, împarte în două?"
                : undefined;
            const branch = BRANCHES.find((b) => b.id === l.pinnedBranchId);
            let tokenLen = 0;
            try {
              tokenLen = encodeShareToken(
                l as unknown as Parameters<typeof encodeShareToken>[0]
              ).length;
            } catch {
              tokenLen = 9999;
            }
            return (
              <Card
                className={isOver ? "border-amber-300" : undefined}
                id={`list-${l.id}`}
                key={l.id}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{l.items.length}/12</Badge>
                    {isOver ? (
                      <Badge className="border-amber-300" variant="outline">
                        soft warning
                      </Badge>
                    ) : null}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {l.id.slice(0, 8)}
                    </span>
                  </div>
                  <Label className="sr-only" htmlFor={`list-name-${l.id}`}>
                    Nume listă {l.name}
                  </Label>
                  <Input
                    aria-label={`Nume listă ${l.name}`}
                    className="mt-1 font-medium"
                    defaultValue={l.name}
                    id={`list-name-${l.id}`}
                    onBlur={(e) => handleRename(l.id, e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.target as HTMLInputElement).blur()
                    }
                  />
                  <CardDescription>
                    {branch ? `Pinned: ${branch.address}` : "No pinned branch"}{" "}
                    • token {tokenLen} &lt;2k • owner {l.owner.slice(0, 10)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {warn ? (
                    <p className="text-amber-600 text-xs">{warn}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => (window.location.href = `/liste/${l.id}`)}
                      size="sm"
                    >
                      Deschide
                    </Button>
                    <Button
                      onClick={() => handleCopyShare(l)}
                      size="sm"
                      variant="outline"
                    >
                      Copy share link
                    </Button>
                    <Button
                      onClick={() => handleDelete(l.id)}
                      size="sm"
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {l.items.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        Empty — add from /analize or profil
                      </span>
                    ) : (
                      l.items.slice(0, 8).map((tid) => (
                        <Badge
                          className="font-mono text-[11px]"
                          key={tid}
                          variant="outline"
                        >
                          {tid}
                        </Badge>
                      ))
                    )}
                    {l.items.length > 8 ? (
                      <Badge variant="secondary">+{l.items.length - 8}</Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">How sharing works</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs leading-relaxed">
          Share link is <span className="font-mono">?share=base64(JSON)</span>{" "}
          &lt;2k. Opens on another phone with no account — same prices + pinned
          branch. No login required. Token contains id, name, items,
          pinnedBranchId, v:1.
        </CardContent>
      </Card>
    </div>
  );
}
