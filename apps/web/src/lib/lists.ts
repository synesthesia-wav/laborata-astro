/**
 * Lists — soft 12 (see docs/ooux.md: List + docs/plan-herdr-wiring.md W3)
 * - id: ulid
 * - name: Analizele mele / Mama — control anual
 * - items: TestId[] soft 12 (was ≤10)
 * - sharedToken: base64(JSON) <2k, anonToken: localStorage (no account, claim later additive)
 * - 13th item non-blocking warning, no hard throw
 */

export const LIST_SOFT_LIMIT = 12;
const SHARE_TOKEN_LIMIT = 2000;

export interface ListItem {
  testId: string;
}

export interface List {
  createdAt: string;
  id: string;
  items: string[]; // TestId[] — soft 12
  name: string;
  owner: string; // anonToken localStorage, later User claim additive
  pinnedBranchId?: string;
  sharedToken?: string;
}

export type SharePayload = Pick<
  List,
  "id" | "name" | "items" | "pinnedBranchId"
> & {
  v: 1;
};

function randomUlid(): string {
  // Crockford base32 ulid-ish without dep: time + random, not strictly monotonic but unique enough
  const time = Date.now().toString(32).padStart(10, "0");
  const rand = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 32).toString(32)
  ).join("");
  return `${time}${rand}`.toUpperCase();
}

export function createListId(): string {
  // prefer crypto.randomUUID if ulid not installed, keep ulid style for spec
  try {
    // simple ulid
    return randomUlid();
  } catch {
    return `01${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
}

export function getOrCreateAnonToken(): string {
  if (typeof window === "undefined") {
    return "anon-server";
  }
  const key = "laborata:anonToken";
  let t = window.localStorage.getItem(key);
  if (!t) {
    t = `anon_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(key, t);
  }
  return t;
}

export function createList(name = "Analizele mele", owner?: string): List {
  return {
    createdAt: new Date().toISOString(),
    id: createListId(),
    items: [],
    name,
    owner: owner ?? getOrCreateAnonToken(),
  };
}

export function createPresetLists(owner?: string): List[] {
  const anon = owner ?? getOrCreateAnonToken();
  return [
    { ...createList("Analizele mele", anon) },
    { ...createList("Mama — control anual", anon) },
  ];
}

export function canAddToList(list: Pick<List, "items">): {
  allowed: boolean;
  warning?: string;
} {
  if (list.items.length < LIST_SOFT_LIMIT) {
    return { allowed: true };
  }
  if (list.items.length === LIST_SOFT_LIMIT) {
    return {
      allowed: true,
      warning:
        "List mare — compararea a 13+ teste poate fi lungă, împarte în două?",
    };
  }
  return {
    allowed: true,
    warning: "List mare — compararea poate fi lungă, împarte în două?",
  };
}

export function isListOverSoftLimit(list: Pick<List, "items">): boolean {
  return list.items.length > LIST_SOFT_LIMIT;
}

export function addToList(
  list: List,
  testId: string
): List & { warning?: string } {
  if (list.items.includes(testId)) {
    return list;
  }
  const { warning } = canAddToList(list);
  return { ...list, items: [...list.items, testId], warning } as List & {
    warning?: string;
  };
}

export function removeFromList(list: List, testId: string): List {
  return { ...list, items: list.items.filter((id) => id !== testId) };
}

export function renameList(list: List, name: string): List {
  return { ...list, name: name.trim() || list.name };
}

export function encodeShareToken(list: List): string {
  const payload: SharePayload = {
    id: list.id,
    items: list.items,
    name: list.name,
    pinnedBranchId: list.pinnedBranchId,
    v: 1,
  };
  const json = JSON.stringify(payload);
  // base64url without pad, <2k check
  const b64 =
    typeof Buffer === "undefined"
      ? btoa(json)
      : Buffer.from(json, "utf8").toString("base64url");
  if (b64.length > SHARE_TOKEN_LIMIT) {
    throw new Error(
      `Share token too large (${b64.length} > ${SHARE_TOKEN_LIMIT}) — split list`
    );
  }
  return b64;
}

export function decodeShareToken(token: string): SharePayload | null {
  try {
    const json =
      typeof Buffer === "undefined"
        ? atob(token)
        : Buffer.from(token, "base64url").toString("utf8");
    const p = JSON.parse(json) as SharePayload;
    if (!(p.id && Array.isArray(p.items))) {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function shareUrlFor(list: List, origin = ""): string {
  const token = encodeShareToken(list);
  const base =
    origin || (typeof window === "undefined" ? "" : window.location.origin);
  return `${base}/liste/${list.id}?share=${encodeURIComponent(token)}`;
}

export function isShareTokenOverLimit(token: string): boolean {
  return token.length > SHARE_TOKEN_LIMIT;
}
