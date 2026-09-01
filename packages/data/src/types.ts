/** OOUX v2 — Laborata market (canonical-v4-tuple-dedupe-correct) — see CONTEXT.md + docs/ooux.md */
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type LabId = "synevo" | "invitro" | "sante" | "medexpert" | "alfa";

export interface Lab {
  id: LabId;
  name: "Synevo" | "Invitro" | "Sante" | "MedExpert" | "Alfa";
  renar: boolean;
}

export const LABS: readonly Lab[] = [
  { id: "synevo", name: "Synevo", renar: true },
  { id: "invitro", name: "Invitro", renar: true },
  { id: "sante", name: "Sante", renar: true },
  { id: "medexpert", name: "MedExpert", renar: false },
  { id: "alfa", name: "Alfa", renar: false },
] as const;

// Branch — exactly as ooux.md (hours Record<Weekday, string[]|null>)
export interface Branch {
  address: string;
  city: string;
  geo: { lat: number; lng: number };
  hours: Record<Weekday, string[] | null>; // null=Closed, ["07:30-15:00"] or ["08:00-11:30","12:30-16:00"] RO
  hoursNote?: string;
  id: string;
  labId: LabId;
  phone: string;
  sampleTypes: string[];
  streetKey: string;
}

// Provenance — matches CONTEXT.md canonical_item + panel archetype
export type ProvenanceEvent =
  | "minted_by_llm"
  | "split_from"
  | "merged_from"
  | "archetype"
  | "archetype_quorum";

export interface Provenance {
  event: ProvenanceEvent;
  quorum?: number;
  timestamp?: string;
  total?: number;
  ts?: string;
  variant?: string;
}

// Reference range — per offering
export interface ReferenceRange {
  analyte: string;
  range: string;
  unit: string | null;
}

// Vendor fee — per sampleType (honest fees, synevo swab 50 is placeholder verify)
export interface VendorFee {
  fee_mdl: number;
  location: string | null;
  notes: string;
  sampleType: string; // blood | swab | other
  sourceUrl: string;
  vendor: LabId;
}

// VendorItem — per-lab raw offer with enrichment from extract-v4
export interface VendorItem {
  branchIds: string[]; // empty = all branches of lab
  code?: string | null; // vendor code e.g., "CH01", "CEG1142"
  collection_protocol: string | null; // 53% present, else null (honest)
  lastSeen: string; // ISO date
  method: string | null; // clia | immunoturbidimetry | pcr | null
  offering_key: string;
  price_mdl: number;
  raw_name: string;
  reference_ranges: ReferenceRange[]; // empty if none (honest)
  sourceUrl: string;
  specimen: string | null; // blood | urine | swab | etc, null when missing (honest)
  testId: string; // canonical id (slug)
  turnaround: string | null; // "1 zi" | "14 zile lucrătoare" | null when missing (MedExpert)
  turnaround_max_days: number | null;
  turnaround_min_days: number | null;
  variant: string | null; // "24-ore" | "cantitativ" | null
  vendor: LabId;
}

// Canonical item — neutral test (single analyte or panel archetype)
// id is slug (not forced MKT_ prefix), tuple_key is deterministic analyte|fraction|specimen|ig|method|variant
export type CanonicalType = "single" | "compound" | "panel_archetype";
export type CanonicalRole = "comparison" | "catalog" | "catalog_only";

export interface CanonicalItem {
  concernIds?: string[];
  id: string; // slug, e.g., "feritina", "tsh", "arch-hemoleucograma-5-diff"
  member_count?: number;
  name_en?: string;
  // panel archetype additional
  name_ro?: string;
  oldSlugs?: string[];
  oneSentenceWatcher?: string;
  panel?: string[] | null;
  provenance: Provenance[];
  quorum_size?: number;
  referenceComponentIds?: string[];
  role: CanonicalRole;
  sampleType?: string;
  slug_en?: string;
  // legacy display compat for W1→W2 transition (optional until showcase updated)
  slug_ro?: string;
  total_comps?: number;
  tuple_key: string; // analyte|fraction|specimen|ig|method|variant
  type: CanonicalType;
  vendor_count: number;
  vendors: LabId[];
}

// Backwards compat alias — Test is CanonicalItem
export type Test = CanonicalItem;

// Bundle — panel archetype (quorum≥2 for market, but some catalog_only have quorum 0)
export interface Bundle {
  id: string; // arch-*
  name_en?: string;
  name_ro: string;
  provenance: Provenance[];
  quorum_size: number;
  referenceComponentIds: string[];
  role: CanonicalRole;
  total_comps: number;
  tuple_key: string;
  type: "panel_archetype";
  vendor_count: number;
  vendors: LabId[];
}

// Price (+ Fee) — single honest line (Q3 locked: first option)
export interface Price {
  amount: number;
  fee: 30 | 0 | 25 | 50 | 75 | 20 | number; // allow honest fees; common 30|0 but also 25 Alfa, 75 swab
  feeNote: "plus 30 lei o singură dată" | "0 lei — inclus" | string;
  priceAsOf: string;
}

// List — named, shareable, no account now; light account later (Q5) — soft 12
export interface List {
  createdAt: string;
  id: string; // ulid
  items: string[]; // Test ids (slugs) soft 12 (was ≤10)
  name: string;
  owner: string; // anonToken localStorage, later User claim additive
  pinnedBranchId?: Branch["id"];
  sharedToken?: string; // base64(JSON) <2k, later ulid indirection
}

// Comparison — derived from List — soft 12, list-level primary
export interface Comparison {
  cheapestSingleLab: { labId: LabId; total: number };
  saveIfSplit: number;
  testIds: string[]; // soft 12 (was 3..5)
}

export interface Concern {
  id: string;
  name: string;
}

// Search doc — for MiniSearch diacritics-insensitive (tsh→TSH, feritina→Feritină, glicemie≡glucoza merged)
export interface SearchDoc {
  id: string;
  role: CanonicalRole;
  slug: string;
  // display
  title: string;
  tuple_key: string;
  type: CanonicalType;
  vendor_count: number;
}

// Manifest — SHA256 for vendored JSON
export interface DataManifest {
  files: Record<string, string>;
  generated_at: string;
}
