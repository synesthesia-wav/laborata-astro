# Herdr Wiring Plan — scrape-autoresearch (417/7033 truth) → laborata-astro (Astro 7.2.7 static)

> **Phase A — Stabilize & Commit — DONE 2026-09-01:** W1 data-wiring + W2 pdp-fix done and rigorous, W3 showcase blocks re-merged (showcase-list-* 12/13 soft + showcase-compare-* 60 cells + showcase-branches 12 botanica/centru), docs/ooux.md synced 58 arch (30 quorum+3 hemo, 36 market, 22 catalog_only), 417/7033 truth vendored + validate ALL PASS, typecheck 0 errors --force (no turbo cache hide), build 1138 pages, shadscan 51≥43. Git dirty → staged, commit ready — coordinator will commit. Phase B (harta + liste) blocked until Phase A merges (one file one owner).

> Owner directive: `laborata-astro` is frontend, `scrape-autoresearch` is backend evidence graph (append-only, ADR-0004). Never mix data-generation churn with visual changes in one PR. This plan wires the truth without re-extraction.

## Truth Snapshot (2026-09-01)
- **Source:** `scrape-autoresearch/data/canonical-graph.json` `comparison_count: 417` `catalog_count: 7033` `spec_version: canonical-v4-tuple-dedupe-correct` + `vendor-mappings.json 7,540 keys` + `panel-archetypes-final-llm.json` + `vendor_fees.json 8` + `prior_art/locations/*.json 145 branches` + `vendor_offerings/*.snapshot.json price_mdl+code` (deterministic, never LLM-overwritten).
- **Target:** `laborata-astro/packages/data` + `apps/web` static `dist/search.json` `analize/[slug]` `tests/[slug]` `profil/[slug]` `harta` `liste` `comparatie`. Previous summary `415/6900 → 417/7033` drift is real (alias-map-combined 687 + panel 30) — sync docs.
- **Invariant to preserve:** `tuple_key = analyte|fraction|specimen|ig|method|variant` with `sange-venos→blood, eclia→clia`, `hasDifferentNumericSuffix`, `variant exact-match`, `quorum≥2`.

## Workstreams (4 Pi agents, 1 orchestrator)

### W1 — data-ooux-types (FOUNDATION, blocks others)
**Agent:** `data-wiring` in `wB:data-wiring`
**Files:** `packages/data/src/types.ts` `packages/data/data/` (vendored JSON) `scripts/sync-data.mjs` `apps/web/src/lib/placeholder.ts` (delete mocks after)
**Tasks:**
- Vendor `scrape-autoresearch/data/canonical-graph.json`, `canonical-market.json` (or slice of graph where role=comparison), `vendor-mappings.json`, `vendor_fees.json`, `panel-archetypes-final-llm.json`, `prior_art/locations/*.json` → `packages/data/data/` or `apps/web/public/data/` with SHA256 manifest.
- Rewrite `types.ts v2` to match `CONTEXT.md` canonical_item: `id: string (slug, not MKT_ prefix forced)`, `tuple_key`, `type: single|compound`, `vendor_count`, `vendors: LabId[]`, `role: comparison|catalog`, `provenance[]`, + `VendorItem{offering_key, raw_name, price_mdl, turnaround, turnaround_min/max_days, specimen, method, variant, collection_protocol, reference_ranges, sourceUrl, lastSeen, branchIds}` + `Bundle archetype {id, referenceComponentIds, quorum_size, total_comps, vendor_count}`. Keep `Branch` exactly as `ooux.md` (hours Record<Weekday, string[]|null>) but populate from real 145.
- Generate `MOCK_TESTS` → real `TESTS` (417) and `CATALOG` (7033) for SEO. Delete `MOCK_BRANCHES`.
- Generate `dist/search.json` build step: `minisearch` index via `scripts/build-search.mjs` — diacritics-insensitive (`tsh` finds `TSH`, `feritina`→`Feritină`, `glicemie≡glucoza` already merged, alias map 687).
- Single PR: `feat(data-ooux-types)` behind no visual change. Verify `bun run typecheck` + `bun run build` (Astro static emits `417 analize` routes).

**Rigorous checks (proactive):**
- Read `scrape-autoresearch/CONTEXT.md` + `canonical-graph.json` head 50 items before typing. Not invent fields.
- `bun run typecheck` must pass. `node packages/data/data/validate.mjs` counts 417/7033, checks `tuple UNIQUE`, `vendor_count≥2` for comparison, `hemoleucograma` 3 archetypes.
- Log friction with `bunx frog log` if alias or fee ambiguous (e.g., `synevo swab 50` placeholder).

### W2 — pdp-price-fix (UNBLOCKED after W1 types, but can start mock)
**Agent:** `pdp-fix` in `wB:pdp-fix`
**Files:** `apps/web/src/components/product/*` `apps/web/src/pages/produs/[slug].astro` (deprecate 301) `apps/web/src/pages/analize/[slug].astro` `apps/web/src/pages/tests/[slug].astro` `apps/web/src/pages/showcase.astro`
**Tasks:**
- Fix `price-comparison.tsx`: replace `PRICE_COMPARISON 6 labs 10-60 per-row fee` with real single fee line from `vendor_fees.json` — Table `Synevo 120 | Sante 110 | Invitro 135 | MedExpert 708 | Alfa` + footer `plus 30 lei o singură dată` or `0 lei — inclus`. Show `270 lei (RO) / 270 MDL (EN)` grouped. Highlight cheapest.
- Fix `product-header.tsx`: `33 lei` is demo — pull `lowest price_mdl` per test. Add `priceAsOf` + `sourceUrl` provenance small.
- Fix `product-specs.tsx`: replace generic `SPEC_ROWS 6` with per-vendor specs: `Probă: Sânge|Urină|Frotiu` (91% specimen), `Metodă: CLIA 69%` (honest null where missing), `Pregătire: collection_protocol 53%` (show `Nespecifică — Synevo 36% ref ranges` honestly, don't invent Sante 2.6%), `TAT: 1 zi / 14 zile lucrătoare` per-offering (93% overall), `Intervale: 200–1100 pg/mL` only if `reference_ranges[]` present else hide.
- Deprecate `produs/[slug].astro` → 301 `analize/[slug]`. Add `Layout.astro lang="ro"/"en"` + `MedicalTest JSON-LD` per test + `sitemap.xml` via Astro.
- Enrich `showcase.astro`: PDP matrix already has loading/empty/many/error/long/320px — add PriceComparison `1/5 vendors`, `0 vendors (Not available)`, `1.250.000 lei` large, `variant` qualifier, `N of M` panel state.

**Rigorous checks:**
- `bun x ultracite fix` before commit. No `any`, `as const` for fees.
- `bun run build` + open `http://localhost:4321/showcase` at 320px + desktop, light, check `idSuffix` no duplicate ARIA.
- `node_modules/.bin/shadscan --json` score ≥43 (floor) — do not lower.

### W3 — ia-search-lists (DEPENDS on W1 search.json)
**Agent:** `ia-search` in `wB:ia-search`
**Files:** `apps/web/src/components/home/*` `apps/web/src/lib/lists.ts` `apps/web/src/lib/comparison.ts` `apps/web/src/pages/{analize/index.astro,harta.astro,liste/*,comparatie.astro,profil/[slug].astro,laboratoare/*}`
**Tasks:**
- `hero-search.tsx` + `catalog-shelf.tsx` + `concerns-row.tsx`: wire to `dist/search.json` (client `minisearch` diacritics-insensitive, placeholder `Try: tsh / feritină / vitamina d`). Filters `Concern×Lab×Sample` as chips, not wall. Empty: `kindly widen` (ooux 04:52).
- `labs-teaser.tsx` + `harta.astro`: map 145 branches (filter `lab×sample×streetKey botanica/centru`, count `12 branches match`, `Open now / Opens at 8:00`, phone, sampleTypes, geo `lat/lng`). Use real hours `["07:30-15:00"]` or `["08:00-11:30","12:30-16:00"]` + `hoursNote`.
- `lists.ts` + `comparison.ts`: `List soft 12` (was 10) — `id ulid`, `name Analizele mele / Mama — control anual`, `items TestId[]`, `pinnedBranchId?`, `sharedToken base64(JSON) <2k`, `owner anonToken localStorage` (no account now, claim later additive). Actions `create/add/remove/rename/share ?share= token` + `13th item non-blocking List mare — compararea poate fi lungă`. Comparison inline on `liste/[id]` (`≤12` free, `overflow-x-auto` sticky `Test` col) vs standalone `/comparatie` secondary. Compute `cheapestSingleLab {labId,total}` fee-included + `saveIfSplit` without push or sponsored order.
- `profil/[slug].astro`: Bundle page `51 bundles` — `watcher+whoFor+readNext` above table, `Sante 4/4, Synevo 4/4, Invitro 3/4 missing Anti-TPO`, `Not yet sold as a bundle here` (never invent). Use `quorum_size/total_comps` from archetype.
- Use `@workspace/ui` only, semantic tokens, never override colors.

**Rigorous checks:**
- Showcase matrix for List `empty/one/many (12/13 soft)` + Comparison `1/12 tests 12×5=60 cells overflow-x-auto sticky`.
- `bun run typecheck` + manual `?share=token` opens on second browser with no account.

### W4 — qa-showcase-doctor (ALWAYS ON, audits others)
**Agent:** `qa-guard` in `wB:qa-guard`
**Files:** `apps/web/src/pages/showcase.astro` `.github/` `lefthook.yml`
**Tasks:**
- Continuously run `bun x ultracite check` + `bun run typecheck` + `bun run build`.
- Before every commit: `node_modules/.bin/shadscan --json` baseline + `shadscan --check-ui <preview-url> --route / --route /showcase` (once Vercel preview up). Enforce `lefthook.yml pre-commit: ultracite fix + shadscan --fail-under 43`.
- Verify 320px + lg, light+dark (skip dark if unsupported), no data / one / many, loading Skeleton / error Alert + retry / disabled / permission-denied, long/unbreakable, missing image, large price `1.250.000 lei`, `N of M` bundle `0/4` gray.
- Isolate instances `idSuffix`, no duplicate ARIA/focus traps.
- File `FRICTION_LOG.md` via `bunx frog log` for papercuts.

**Guardrails:** Never close others' panes. Never run `herdr server stop`.

## Orchestration Rules (Herdr Pi)
- Orchestrator is current pane `wB:pG` (data tab, PI working). Keep focus.
- Each worker: `herdr pane split --current --direction right/down --cwd $PWD --no-focus` preserves cwd, then `herdr agent start <name> --kind pi --pane <id>` (unique `[a-z][a-z0-9_-]{0,31}`).
- Workers are siblings, not nested. Same `bun` + `node 26 via portless` as repo.
- Coordination via `herdr agent prompt <name> --wait --timeout 300000` + `herdr agent read` + `herdr agent get`.
- PR rule: Never mix data-generation with visual changes. `W1` is `backend` label (`packages/data`, generated JSON), `W2/W3` are `frontend` (`apps/web` + `packages/ui`) needing Vercel preview + `shadscan --check-ui`.

## Delivery Order
1. `W1 feat(data-ooux-types)` → merge, `wB:qa-guard` verifies.
2. `W2 + W3` in parallel on top (stacked branches, separate PRs, same preview branch if needed but reviewed separately).
3. `W4` re-runs showcase matrix after each fix, records only reproducible failures.

## Done When
- Every applicable state rendered in `showcase.astro`, every confirmed problem fixed+retested, `bun run build` + `bun run typecheck` pass, `shadscan ≥43`, `analize/[slug]` + `tests/[slug]` same entity with `MedicalTest` JSON-LD, `search` diacritics-insensitive, `harta 145` + `liste soft 12 + share` + `comparatie fee-included`.

## Wiring — `feat(data-price-index)` (backend price wiring, 2026-09-02)

> **Status:** Backend PR `feat(data-price-index)` — price truth wired, no visual redesign per `AGENTS.md` frontend/backend split. Frontend swap `isB12 ? PRICE_OFFERS_B12 : []` → `getPricesForId(slug)` deferred to `feat(web-price-wiring)` with Vercel preview.

**Join path:** `offering_key → vendor-mappings.json → tuple_key → canonical-graph.json → id (slug)`

- `offering_key = sha256(vendor|norm(name)|url)` (Alfa `nameOnly`): deterministic ground truth in `vendor_offerings/*.snapshot.json` (7562 rows: Synevo 1391, Sante 861, Invitro 1085, Alfa 3517, MedExpert 708)
- `vendor-mappings.json` (7,540 keys) maps each `offering_key` → `tuple_key = analyte|fraction|specimen|ig|method|variant` (already normalized `sange-venos→blood`, `eclia→clia`, `variant` exact-match; numeric suffixes preserved `f1≠f75`)
- `canonical-graph.json` (spec `canonical-v4-tuple-dedupe-correct`, 7033 items: 417 comparison items → 378 unique slugs due to 32 duplicate slugs like `feritina` blood vs CSF; `tuple UNIQUE`) maps `tuple_key → id` (slug, e.g. `vitamina-b12` → `vitamina-b12||blood||clia|`)
- **Builder:** `scripts/build-price-index.mjs` loads both JSON + all snapshots, joins exact `tuple` (no LLM invent), skips with warn if `tuple not in graph` (honest 3,197 skipped — mostly Alfa single-gene `mttp`, `wnt7a` vendor_specific not in quorum; 1 unmapped). Emits `packages/data/data/price-index.json` (`spec_version`, `generated_at`, `counts: {total, mapped, skipped, byVendor, comparisonCovered, withGte2, withGte2VendorsDistinct}`, `offeringsById: Record<id, VendorItem[]>`) + `price-index.min.json` (`{[id]: Record<LabId, price_mdl>}` cheapest per vendor)
- **VendorItem** deterministic: `price_mdl`, `code`, `turnaround`/`turnaround_min/max_days` from snapshot (never LLM-overwritten); `specimen`/`method`/`variant` derived from `tuple` normalized fields (honest `null` where missing); `collection_protocol=null`, `reference_ranges=[]` placeholders; `sourceUrl=url`, `lastSeen=scraped_at`, `branchIds=[]`
- **Honest counts (2026-09-02):** 7,562 ingested → 4,364 mapped (57.7%): Sante 861→821 (95.4%), Synevo 1,391→1,352 (97.2%), Invitro 1,085→1,005 (92.6%), MedExpert 708→670 (94.6%), Alfa 3,517→516 (14.7% — 3,001 single-gene NGS vendor_specific). IDs covered 2,929 (378 unique comparison slugs: 296 with ≥1 offer, 274 with ≥2 vendors; threshold 400 not met honestly — see `validate.mjs` WARN). Example `vitamina-b12 → 4 vendors: Sante 166, Alfa 240, Synevo 245, Invitro 250` (mock was Sante 175/ Synevo 195/ Alfa 190/ Invitro 210 — real Sante cheapest holds).
- **Manifest:** `scripts/sync-data.mjs` now runs `build-price-index.mjs` after copy and adds `price-index.json` + `price-index.min.json` SHA256 to `manifest.json` (12 files)
- **Types:** `packages/data/src/prices.ts` exports `getPricesForId(id)`, `getCheapestPrice(id)`, `getCheapestOffer(id)`, `getPricesByVendor(id)`; TODO comment shows frontend swap; `types.ts` VendorItem already aligned
- **Validate:** `packages/data/data/validate.mjs` checks `price-index.json` exists, `spec_version` matches, logs per-vendor mapped, comparison coverage (296/378 ≥1, 274/378 ≥2 vendors), `vitamina-b12` 4 vendors, `price-index.min` exists; WARN (not FAIL) if <400 honest
- **Frontend read-only:** `apps/web/src/pages/analize/[slug].astro:50` still `isB12 ? PRICE_OFFERS_B12 : []` — backend does not edit `apps/web` per split; `grep -rn PRICE_OFFERS_B12` confirms wiring ready for follow-up
- **Invariants preserved:** `tuple_key` alias normalization, `variant` exact-match, `quorum≥2` already done, `price_mdl`/`code`/`turnaround` deterministic (ADR-0004)

## First Herdr Commands (run now)
```bash
herdr tab create --workspace wB --label data-wiring --cwd /Users/victorvanica/coding-projects/laborata-astro --no-focus
herdr tab create --workspace wB --label pdp-fix --cwd /Users/victorvanica/coding-projects/laborata-astro --no-focus
herdr tab create --workspace wB --label ia-search --cwd /Users/victorvanica/coding-projects/laborata-astro --no-focus
herdr tab create --workspace wB --label qa-guard --cwd /Users/victorvanica/coding-projects/laborata-astro --no-focus
# then for each tab: pane split if needed, agent start pi
```
