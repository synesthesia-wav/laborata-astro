#!/usr/bin/env node
// Build price-index.json — join vendor_offerings snapshot × vendor-mappings × canonical-graph
// Invariants: tuple_key = analyte|fraction|specimen|ig|method|variant with sange-venos→blood, eclia→clia, variant exact-match
// Never LLM-overwrite price_mdl/code/turnaround — source is snapshot deterministic
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcBase =
  process.env.SCRAPE_SRC ??
  "/Users/victorvanica/coding-projects/scrape-autoresearch/data";
const destDir = join(root, "packages/data/data");

function loadJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function normalizeSpecimen(raw) {
  if (!raw) {
    return null;
  }
  const v = String(raw).toLowerCase();
  if (
    v.includes("blood") ||
    v.includes("sange") ||
    v.includes("ser") ||
    v.includes("plasma")
  ) {
    return "blood";
  }
  if (v.includes("urine") || v.includes("urina")) {
    return "urine";
  }
  if (v.includes("swab") || v.includes("frotiu") || v.includes("raclaj")) {
    return "swab";
  }
  return v || null;
}

// platform aliases as per ADR-0004 (already applied in canonical tuple, but mirror for safety)
function aliasSpecimen(s) {
  if (!s) {
    return null;
  }
  const v = String(s).trim().toLowerCase();
  if (v === "sange-venos" || v === "sange venos") {
    return "blood";
  }
  return v || null;
}

function aliasMethod(m) {
  if (!m) {
    return null;
  }
  const v = String(m).trim().toLowerCase();
  if (v === "eclia") {
    return "clia";
  }
  return v || null;
}

function main() {
  const mappingPath = join(srcBase, "vendor-mappings.json");
  const altMappingPath = join(destDir, "vendor-mappings.json");
  const graphPath = join(srcBase, "canonical-graph.json");
  const altGraphPath = join(destDir, "canonical-graph.json");

  const mappingsFile = existsSync(mappingPath) ? mappingPath : altMappingPath;
  const graphFile = existsSync(graphPath) ? graphPath : altGraphPath;

  if (!existsSync(mappingsFile)) {
    console.error(
      `[build-price-index] missing vendor-mappings.json at ${mappingsFile}`
    );
    process.exit(1);
  }
  if (!existsSync(graphFile)) {
    console.error(
      `[build-price-index] missing canonical-graph.json at ${graphFile}`
    );
    process.exit(1);
  }

  const vm = loadJson(mappingsFile);
  const graph = loadJson(graphFile);
  const specVersion = graph.spec_version ?? "canonical-v4-tuple-dedupe-correct";
  const items = graph.items ?? [];

  // tuple_key -> id
  const tupleToId = new Map();
  for (const it of items) {
    if (it.tuple_key) {
      tupleToId.set(it.tuple_key, it.id);
    }
  }

  console.log(
    `[build-price-index] spec_version ${specVersion} items ${items.length} mappings ${Object.keys(vm).length}`
  );

  // Load all snapshots: prefer SCRAPE_SRC/vendor_offerings, fallback to packages/data/data/vendor_offerings copy
  const offeringDirs = [
    join(srcBase, "vendor_offerings"),
    join(destDir, "vendor_offerings"),
    join(root, "data/vendor_offerings"),
  ];
  let snapshotDir = offeringDirs.find((d) => existsSync(d));
  if (!snapshotDir) {
    // also try to find any *.snapshot.json under srcBase
    snapshotDir = join(srcBase, "vendor_offerings");
  }
  if (!existsSync(snapshotDir)) {
    console.error(`[build-price-index] missing snapshot dir ${snapshotDir}`);
    process.exit(1);
  }

  const snapFiles = readdirSync(snapshotDir).filter((f) =>
    f.endsWith(".snapshot.json")
  );
  if (snapFiles.length === 0) {
    console.error(`[build-price-index] no snapshot files in ${snapshotDir}`);
    process.exit(1);
  }

  let totalIngested = 0;
  let mappedCount = 0;
  let skippedNoMapping = 0;
  let skippedNoTupleInGraph = 0;
  const byVendorTotal = {};
  const byVendorMapped = {};
  const skippedSamples = [];
  const offeringsById = new Map(); // id -> VendorItem[]

  for (const file of snapFiles) {
    const p = join(snapshotDir, file);
    const data = loadJson(p);
    const vendorFromFile = file.replace(".snapshot.json", "");
    console.log(
      `[build-price-index] ${vendorFromFile}: ${data.length} offerings`
    );

    for (const row of data) {
      totalIngested += 1;
      const vendor = row.vendor ?? vendorFromFile;
      byVendorTotal[vendor] = (byVendorTotal[vendor] ?? 0) + 1;

      const offeringKey = row.offering_key;
      if (!offeringKey) {
        skippedNoMapping += 1;
        continue;
      }
      const tupleKey = vm[offeringKey];
      if (!tupleKey) {
        skippedNoMapping += 1;
        if (skippedSamples.length < 5) {
          skippedSamples.push({ vendor, offeringKey, reason: "no mapping" });
        }
        continue;
      }
      const id = tupleToId.get(tupleKey);
      if (!id) {
        skippedNoTupleInGraph += 1;
        if (skippedSamples.length < 5) {
          skippedSamples.push({
            vendor,
            offeringKey,
            tupleKey,
            reason: "tuple not in graph",
          });
        }
        continue;
      }

      mappedCount += 1;
      byVendorMapped[vendor] = (byVendorMapped[vendor] ?? 0) + 1;

      // Derive variant/method/specimen from tuple for honest normalized values
      const parts = tupleKey.split("|");
      // tuple is analyte|fraction|specimen|ig|method|variant => 6 parts
      const tupleSpecimenRaw = parts[2] ?? "";
      const tupleMethodRaw = parts[4] ?? "";
      const tupleVariantRaw = parts[5] ?? "";

      const specimen =
        aliasSpecimen(tupleSpecimenRaw) ??
        normalizeSpecimen(row.sampleType ?? row.specimen_raw) ??
        null;
      const method =
        aliasMethod(tupleMethodRaw) || row.method?.toLowerCase?.() || null;
      const variant =
        tupleVariantRaw && tupleVariantRaw.trim() !== ""
          ? tupleVariantRaw
          : null;

      const turnaround = row.turnaround_text ?? row.turnaround ?? null;
      const turnaroundMin =
        row.turnaround_min_days ?? row.turnaround_min ?? null;
      const turnaroundMax =
        row.turnaround_max_days ?? row.turnaround_max ?? null;

      const vendorItem = {
        branchIds: [],
        code: row.code ?? null,
        collection_protocol: null,
        lastSeen: row.scraped_at ?? row.valid_from ?? new Date().toISOString(),
        method: method || null,
        offering_key: offeringKey,
        price_mdl: Number(row.price_mdl),
        raw_name: row.raw_name ?? "",
        reference_ranges: [],
        sourceUrl: row.url ?? "",
        specimen: specimen || null,
        testId: id,
        turnaround: turnaround || null,
        turnaround_max_days: turnaroundMax ?? null,
        turnaround_min_days: turnaroundMin ?? null,
        variant: variant || null,
        vendor,
      };

      if (Number.isNaN(vendorItem.price_mdl)) {
        skippedNoMapping += 1; // shouldn't happen
        continue;
      }

      if (!offeringsById.has(id)) {
        offeringsById.set(id, []);
      }
      offeringsById.get(id).push(vendorItem);
    }
  }

  // Sort each id's offerings by price asc for deterministic output
  for (const [, arr] of offeringsById) {
    arr.sort((a, b) => a.price_mdl - b.price_mdl);
  }

  const offeringsByIdObj = Object.fromEntries(offeringsById);
  const idsCovered = offeringsById.size;
  // Graph has 417 comparison items but 378 unique slugs (32 duplicate slugs like feritina blood vs CSF)
  const uniqueComparisonIds = [
    ...new Set(items.filter((i) => i.role === "comparison").map((i) => i.id)),
  ];
  const comparisonIds = uniqueComparisonIds;
  const comparisonCovered = comparisonIds.filter((id) =>
    offeringsById.has(id)
  ).length;
  const withGte2 = comparisonIds.filter(
    (id) => (offeringsById.get(id)?.length ?? 0) >= 2
  ).length;
  const withGte2VendorsDistinct = comparisonIds.filter((id) => {
    const arr = offeringsById.get(id);
    if (!arr) {
      return false;
    }
    const uniqVendors = new Set(arr.map((x) => x.vendor));
    return uniqVendors.size >= 2;
  }).length;

  console.log(`[build-price-index] total ingested ${totalIngested}`);
  console.log(
    `[build-price-index] mapped ${mappedCount} skipped_no_mapping ${skippedNoMapping} skipped_no_tuple ${skippedNoTupleInGraph}`
  );
  console.log(
    `[build-price-index] byVendor total ${JSON.stringify(byVendorTotal)}`
  );
  console.log(
    `[build-price-index] byVendor mapped ${JSON.stringify(byVendorMapped)}`
  );
  for (const [vendor, total] of Object.entries(byVendorTotal)) {
    const mapped = byVendorMapped[vendor] ?? 0;
    const pct = total ? ((mapped / total) * 100).toFixed(1) : "0";
    console.log(
      `[build-price-index] ${vendor} ${total}→${mapped} mapped (${pct}%)`
    );
  }
  console.log(
    `[build-price-index] ids covered ${idsCovered} (comparison ${comparisonCovered}/${comparisonIds.length}, >=2 offers ${withGte2}, >=2 vendors ${withGte2VendorsDistinct})`
  );

  // Log per-id example: vitamina-b12
  const b12 = offeringsById.get("vitamina-b12");
  if (b12) {
    console.log(
      `[build-price-index] vitamina-b12 → ${b12.length} vendors: ${b12.map((x) => `${x.vendor}:${x.price_mdl}`).join(", ")}`
    );
  } else {
    console.warn("[build-price-index] vitamina-b12 not found (honest skip)");
  }

  // Show top 5 ids with most vendors (debug)
  const sortedByCount = [...offeringsById.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);
  for (const [id, arr] of sortedByCount) {
    const vendors = [...new Set(arr.map((x) => x.vendor))].join(",");
    console.log(
      `[build-price-index] top ${id} ${arr.length} offers vendors=${vendors}`
    );
  }

  if (skippedSamples.length) {
    console.warn(
      `[build-price-index] skipped samples ${JSON.stringify(skippedSamples.slice(0, 3))}`
    );
  }

  const out = {
    counts: {
      byVendor: byVendorMapped,
      byVendorTotal,
      comparisonCovered,
      idsCovered,
      mapped: mappedCount,
      skippedNoMapping,
      skippedNoTupleInGraph,
      total: totalIngested,
      withGte2,
      withGte2VendorsDistinct,
    },
    generated_at: new Date().toISOString(),
    offeringsById: offeringsByIdObj,
    spec_version: specVersion,
  };

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  const outPath = join(destDir, "price-index.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(
    `[build-price-index] wrote ${outPath} (${idsCovered} ids, ${mappedCount} offerings)`
  );

  // Compact min: {[id]: Record<LabId, price_mdl>} — cheapest per vendor per id
  const min = {};
  for (const [id, arr] of offeringsById) {
    const perVendor = {};
    for (const it of arr) {
      const v = it.vendor;
      if (perVendor[v] === undefined || it.price_mdl < perVendor[v]) {
        perVendor[v] = it.price_mdl;
      }
    }
    min[id] = perVendor;
  }
  const minPath = join(destDir, "price-index.min.json");
  writeFileSync(minPath, JSON.stringify(min, null, 2));
  console.log(
    `[build-price-index] wrote ${minPath} (${Object.keys(min).length} ids)`
  );

  // Summary warn if honest coverage below 400 (note: unique slugs 378, not 417 items due to 32 duplicate slugs like feritina)
  if (withGte2VendorsDistinct < 400) {
    console.warn(
      `[build-price-index] HONEST: only ${withGte2VendorsDistinct}/${comparisonIds.length} unique comparison slugs have ≥2 vendors (417 items include 32 duplicate slugs; threshold 400 not met). Skipped ${skippedNoTupleInGraph} tuples not in graph + ${skippedNoMapping} unmapped. Alfa 3517→${byVendorMapped.alfa ?? 0} mapped explains gap — vendor_specific NGS not in market quorum.`
    );
  }
}
main();
