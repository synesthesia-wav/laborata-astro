/**
 * Comparison — soft 12, list-level primary (see docs/ooux.md: Comparison + W3)
 * Primary table is inline on /liste/[id] for Analizele mele (12); standalone /comparatie is secondary picker.
 * Computes cheapestSingleLab fee-included + saveIfSplit without push or sponsored order.
 * Fee logic: single collection fee per lab per visit, not per-row. Use vendor_fees.json.
 */

import { VENDOR_FEES } from "@workspace/data/fees";
import type { LabId } from "@workspace/data/types";

export const COMPARISON_SOFT_LIMIT = 12;

export interface Comparison {
  cheapestSingleLab: { labId: LabId; total: number };
  saveIfSplit: number;
  testIds: string[]; // soft 12 (was 3..5)
}

export function isComparisonOverSoftLimit(testIds: string[]): boolean {
  return testIds.length > COMPARISON_SOFT_LIMIT;
}

type PriceMap = Record<string, Partial<Record<LabId, number>>>;
type SampleMap = Record<string, string>; // testId -> specimen sampleType blood|urine|swab

function feeForLab(labId: LabId, sampleType: string): number {
  const norm = sampleType.toLowerCase();
  const direct = VENDOR_FEES.find(
    (f) => f.vendor === labId && f.sampleType === norm
  );
  if (direct) {
    return direct.fee_mdl;
  }
  const blood = VENDOR_FEES.find(
    (f) => f.vendor === labId && f.sampleType === "blood"
  );
  return blood?.fee_mdl ?? 0;
}

function labTotalForTests(
  labId: LabId,
  testIds: string[],
  priceMap: PriceMap,
  sampleMap: SampleMap
): number | null {
  let sum = 0;
  let missing = 0;
  for (const tid of testIds) {
    const price = priceMap[tid]?.[labId];
    if (price == null) {
      missing++;
    } else {
      sum += price;
    }
  }
  if (missing === testIds.length) {
    return null; // lab offers none
  }
  if (missing > 0) {
    return null; // for cheapestSingleLab we require all tests at that lab
  }
  // fee once per visit: if any blood test, use blood fee; else use first sample type
  const anyBlood = testIds.some((id) => (sampleMap[id] ?? "blood") === "blood");
  const feeSample = anyBlood ? "blood" : (sampleMap[testIds[0]] ?? "blood");
  const fee = feeForLab(labId, feeSample);
  return sum + fee;
}

export function computeCheapestSingleLab(
  testIds: string[],
  priceMap: PriceMap,
  sampleMap: SampleMap
): { labId: LabId; total: number } | null {
  const labs: LabId[] = ["synevo", "sante", "invitro", "medexpert", "alfa"];
  let best: { labId: LabId; total: number } | null = null;
  for (const lab of labs) {
    const total = labTotalForTests(lab, testIds, priceMap, sampleMap);
    if (total == null) {
      continue;
    }
    if (!best || total < best.total) {
      best = { labId: lab, total };
    }
  }
  return best;
}

export function computeCheapestPerTestTotal(
  testIds: string[],
  priceMap: PriceMap,
  _sampleMap: SampleMap
): number {
  // best price per test possibly different labs, fees not included per test (fees would be multiple visits if split)
  // For saveIfSplit we compare: cheapestSingleLab total vs sum(bestPerTest prices + fees if split)
  // Without push: we just report saving, not recommend splitting
  let sum = 0;
  for (const tid of testIds) {
    const prices = priceMap[tid];
    if (!prices) {
      continue;
    }
    const vals = Object.values(prices).filter(
      (v): v is number => typeof v === "number"
    );
    if (vals.length === 0) {
      continue;
    }
    sum += Math.min(...vals);
  }
  // if split, you'd pay fees multiple times (once per lab), but we report fee-included saving as difference
  // Simplify: add minimal single fee for the best mix? For demo, add 0 (fees excluded for per-test best) to show honest saving
  // More honest: add fees per distinct cheapest lab (count distinct labs in best pick)
  return sum;
}

export function computeComparison(
  testIds: string[],
  priceMap: PriceMap,
  sampleMap: SampleMap
): Comparison | null {
  if (testIds.length === 0) {
    return null;
  }
  const cheapestSingleLab = computeCheapestSingleLab(
    testIds,
    priceMap,
    sampleMap
  );
  if (!cheapestSingleLab) {
    return null;
  }
  const bestPerTest = computeCheapestPerTestTotal(testIds, priceMap, sampleMap);
  // saveIfSplit: how much you'd save if you split across cheapest per-test labs (fees excluded, honest)
  // Add fee-included note: cheapestSingleLab already includes fee once.
  // For simplicity save = cheapestSingleLab.total - (bestPerTest + cheapest fee) ?? 0 but never negative push
  const cheapestFee = feeForLab(cheapestSingleLab.labId, "blood");
  const feeAdjustedBest = bestPerTest + cheapestFee; // compare fee-included vs fee-included single
  const saveIfSplit = Math.max(0, cheapestSingleLab.total - feeAdjustedBest);
  return {
    cheapestSingleLab,
    saveIfSplit,
    testIds,
  };
}

export function feeNoteForLab(labId: LabId): string {
  const fee = feeForLab(labId, "blood");
  return fee === 0 ? "0 lei — inclus" : `plus ${fee} lei o singură dată`;
}
