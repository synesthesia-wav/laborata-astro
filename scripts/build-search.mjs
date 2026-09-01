#!/usr/bin/env node
// Build search index — diacritics-insensitive (tsh→TSH, feritina→Feritină, glicemie≡glucoza merged)
// Uses MiniSearch-style token normalization, outputs JSON for client consumption
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function foldDiacritics(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function titleFromSlug(id) {
  // slug -> human Title: "vitamina-b12" -> "Vitamina B12", "hemoleucograma-5-diff" -> "Hemoleucograma 5 Diff"
  const spaced = id.replace(/[-_]+/g, " ");
  // keep version with diacritics where known? id is ascii slug, we derive display via id
  // For search we index both slug and title folded
  return spaced
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function loadGraph() {
  const p = join(root, "packages/data/data/canonical-graph.json");
  const raw = readFileSync(p, "utf8");
  const j = JSON.parse(raw);
  return j;
}

function build() {
  const graph = loadGraph();
  const items = graph.items ?? graph; // support array form
  const docs = [];

  for (const it of items) {
    const id = it.id;
    const tuple = it.tuple_key ?? "";
    const type = it.type ?? "single";
    const role = it.role ?? "catalog_only";
    const vendor_count = it.vendor_count ?? 0;
    const title = titleFromSlug(id);
    // Search fields: title, slug, tuple_key tokens, id
    // For diacritics-insensitive, we store folded versions but also keep original title for display
    const slug = id;
    const foldedTitle = foldDiacritics(title);
    const foldedSlug = foldDiacritics(slug);
    const foldedTuple = foldDiacritics(
      tuple.replaceAll("|", " ").replaceAll("-", " ")
    );
    // Alias handling: glicemie≡glucoza already merged in graph (alias-map-combined), so single entry covers both
    // Add extra searchable terms for common aliases
    const aliases = [];
    if (foldedSlug.includes("glucoza") || foldedSlug.includes("glicemie")) {
      aliases.push("glicemie", "glucoza", "glucose");
    }
    if (foldedSlug.includes("feritina")) {
      aliases.push("feritina", "ferritin");
    }
    if (foldedSlug.includes("tsh")) {
      aliases.push("tsh", "tirotropina");
    }

    // extract sampleType from tuple (3rd field) or heuristic
    const tupleParts = tuple.split("|");
    const rawSample = (tupleParts[2] ?? "").trim() || "blood";
    const normalizedSample = (() => {
      const v = rawSample.toLowerCase();
      if (
        v.includes("blood") ||
        v.includes("sange") ||
        v.includes("ser") ||
        v.includes("plasma") ||
        v === "sange-venos-urina" ||
        v === "arch"
      ) {
        return "Sânge";
      }
      if (v.includes("urina") || v.includes("urine")) {
        return "Urină";
      }
      if (v.includes("frotiu") || v.includes("swab") || v.includes("raclaj")) {
        return "Frotiu";
      }
      if (!v) {
        return "Sânge";
      }
      return "Sânge";
    })();
    docs.push({
      aliases,
      foldedSlug,
      foldedTitle,
      foldedTuple,
      id,
      role,
      sampleType: normalizedSample,
      // client tokenizes on these
      searchText: [
        foldedTitle,
        foldedSlug,
        foldedTuple,
        ...aliases.map(foldDiacritics),
      ].join(" "),
      slug,
      title,
      tuple_key: tuple,
      type,
      vendor_count,
      vendors: it.vendors ?? [],
    });
  }

  // Output: search.json with docs + meta
  const out = {
    catalog_count: docs.length,
    comparison_count: docs.filter((d) => d.role === "comparison").length,
    count: docs.length,
    docs,
    generated_at: new Date().toISOString(),
    spec_version: graph.spec_version ?? "canonical-v4-tuple-dedupe-correct",
  };

  // Light index: 417 comparison only for home hero-search (~300k vs 3.9M)
  const lightDocs = docs.filter((d) => d.role === "comparison");
  const lightOut = {
    catalog_count: lightDocs.length,
    comparison_count: lightDocs.length,
    count: lightDocs.length,
    docs: lightDocs,
    generated_at: new Date().toISOString(),
    spec_version: graph.spec_version ?? "canonical-v4-tuple-dedupe-correct",
  };

  const outputs = [
    join(root, "packages/data/data/search.json"),
    join(root, "apps/web/public/search.json"),
    join(root, "apps/web/dist/search.json"),
  ];

  const lightOutputs = [
    join(root, "packages/data/data/search-light.json"),
    join(root, "apps/web/public/search-light.json"),
    join(root, "apps/web/dist/search-light.json"),
  ];

  for (const p of lightOutputs) {
    try {
      const dir = dirname(p);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(p, JSON.stringify(lightOut, null, 2));
      console.log(`[build-search] wrote light ${p} (${lightDocs.length} docs)`);
    } catch (e) {
      console.warn(`[build-search] skip light ${p}: ${e.message}`);
    }
  }

  for (const p of outputs) {
    try {
      const dir = dirname(p);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(p, JSON.stringify(out, null, 2));
      console.log(
        `[build-search] wrote ${p} (${docs.length} docs, ${out.comparison_count} comparison)`
      );
    } catch (e) {
      // dist may not exist before build — skip silently
      console.warn(`[build-search] skip ${p}: ${e.message}`);
    }
  }

  // Also write a minisearch-compatible simple index if minisearch is available
  // Not required for typecheck; client will instantiate MiniSearch from docs
  console.log(
    `[build-search] diacritics fold example: feritină -> ${foldDiacritics("Feritină")} (search feritina finds Feritină: ${foldDiacritics("Feritină").includes(foldDiacritics("feritina"))})`
  );
  console.log(
    `[build-search] tsh -> ${foldDiacritics("TSH")} includes tsh: ${foldDiacritics("TSH").includes("tsh")}`
  );
}

build();
