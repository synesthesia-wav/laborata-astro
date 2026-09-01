import fees from "../data/vendor_fees.json" with { type: "json" };
import type { VendorFee } from "./types.js";

export const VENDOR_FEES: VendorFee[] = fees as VendorFee[];

export function feeFor(
  vendor: VendorFee["vendor"],
  sampleType: string
): VendorFee | undefined {
  const norm = sampleType.toLowerCase();
  // exact match first
  let f = VENDOR_FEES.find((x) => x.vendor === vendor && x.sampleType === norm);
  if (f) {
    return f;
  }
  // blood fallback for unknown
  if (norm !== "blood") {
    f = VENDOR_FEES.find(
      (x) => x.vendor === vendor && x.sampleType === "blood"
    );
  }
  return f;
}
