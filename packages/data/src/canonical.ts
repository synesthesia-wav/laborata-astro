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

export const COMPARISON_ITEMS: CanonicalItem[] = g.items.filter(
  (i) => i.role === "comparison"
);
export const CATALOG_ITEMS: CanonicalItem[] = g.items; // catalog_count is total (417+6616)

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
