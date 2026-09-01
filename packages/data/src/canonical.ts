import graph from "../data/canonical-graph.json" with { type: "json" };
import type { CanonicalItem, CanonicalRole } from "./types.js";

interface GraphFile {
  catalog_count: number;
  comparison_count: number;
  generated_at: string;
  items: CanonicalItem[];
  spec_version: string;
}

const g = graph as unknown as GraphFile;

export const SPEC_VERSION = g.spec_version;
export const GENERATED_AT = g.generated_at;

export const ALL_ITEMS: CanonicalItem[] = g.items;

// Truth: catalog_count === items.length === 7033 (417 comparison + 6616 catalog_only).
// Historical 7450 claim was inaccurate — do not invent 7450, keep 7033 as written in canonical-graph.json.
// CATALOG_ITEMS is the full catalog (comparison + catalog_only) for /analize and /tests routing;
// COMPARISON_ITEMS is the 417 subset for hero-search / showcase fast path.
export const COMPARISON_ITEMS: CanonicalItem[] = g.items.filter(
  (i) => i.role === "comparison"
);
export const CATALOG_ITEMS: CanonicalItem[] = g.items;

export const SINGLE_COMPARISON: CanonicalItem[] = COMPARISON_ITEMS.filter(
  (i) => i.type === "single"
);
export const PANEL_COMPARISON: CanonicalItem[] = COMPARISON_ITEMS.filter(
  (i) => i.type === "panel_archetype"
);

// Backwards compat aliases for older consumers (MOCK_TESTS → real TESTS)
export const TESTS = COMPARISON_ITEMS;
export const CATALOG = CATALOG_ITEMS;

export function getById(id: string): CanonicalItem | undefined {
  return g.items.find((i) => i.id === id);
}

export function getByTupleKey(tupleKey: string): CanonicalItem | undefined {
  return g.items.find((i) => i.tuple_key === tupleKey);
}

export function isComparisonRole(role: string): role is CanonicalRole {
  return role === "comparison";
}
