/** Price index — backend price wiring (Phase A decoupling) */
import priceIndex from "../data/price-index.json" with { type: "json" };
import type { VendorItem } from "./types.js";

interface PriceIndexFile {
  counts: {
    byVendor: Record<string, number>;
    byVendorTotal: Record<string, number>;
    comparisonCovered: number;
    idsCovered: number;
    mapped: number;
    skippedNoMapping: number;
    skippedNoTupleInGraph: number;
    total: number;
    withGte2: number;
    withGte2VendorsDistinct: number;
  };
  generated_at: string;
  offeringsById: Record<string, VendorItem[]>;
  spec_version: string;
}

const idx = priceIndex as unknown as PriceIndexFile;

export const PRICE_SPEC_VERSION = idx.spec_version;
export const PRICE_GENERATED_AT = idx.generated_at;
export const PRICE_COUNTS = idx.counts;
export const PRICE_OFFERINGS_BY_ID = idx.offeringsById;

/**
 * Get all vendor offers for a canonical id (slug).
 * Honest: returns undefined if id has no mapped vendor offerings (skip with warn in builder).
 */
export function getPricesForId(id: string): VendorItem[] | undefined {
  const arr = idx.offeringsById[id];
  return arr ? [...arr] : undefined;
}

/** Get cheapest price (mdl) for an id, or undefined if no offers */
export function getCheapestPrice(id: string): number | undefined {
  const arr = idx.offeringsById[id];
  if (!arr || arr.length === 0) {
    return undefined;
  }
  return Math.min(...arr.map((x) => x.price_mdl));
}

/** Get cheapest VendorItem for an id */
export function getCheapestOffer(id: string): VendorItem | undefined {
  const arr = idx.offeringsById[id];
  if (!arr || arr.length === 0) {
    return undefined;
  }
  return arr.reduce((best, cur) =>
    cur.price_mdl < best.price_mdl ? cur : best
  );
}

/** Get prices grouped by vendor map for an id */
export function getPricesByVendor(
  id: string
): Partial<Record<VendorItem["vendor"], VendorItem>> | undefined {
  const arr = idx.offeringsById[id];
  if (!arr) {
    return undefined;
  }
  const map: Partial<Record<VendorItem["vendor"], VendorItem>> = {};
  for (const it of arr) {
    const cur = map[it.vendor];
    if (!cur || it.price_mdl < cur.price_mdl) {
      map[it.vendor] = it;
    }
  }
  return map;
}

// TODO (frontend PR feat(web-price-wiring)): replace mock in analize/[slug].astro
//   const priceOffers = isB12 ? PRICE_OFFERS_B12 : [];
// with:
//   import { getPricesForId } from "@workspace/data/prices";
//   const raw = getPricesForId(slug);
//   const priceOffers = (raw ?? []).map(o => ({ lab: labName(o.vendor), price_mdl: o.price_mdl, vendor: o.vendor, variant: o.variant }))
// Keep backend PR feat(data-price-index) verifiable by tests, no visual redesign per AGENTS.md frontend/backend split.

export function labName(vendor: VendorItem["vendor"]): string {
  const map: Record<string, string> = {
    alfa: "Alfa",
    invitro: "Invitro",
    medexpert: "MedExpert",
    sante: "Sante",
    synevo: "Synevo",
  };
  return map[vendor] ?? vendor;
}
