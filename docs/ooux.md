# OOUX — Laborata market (objects → pages)

> Derives the 7 jobs in `docs/ux-brief/01-personas-jtbd.md:81` and the walks in `04-ux-brief.md:28` into checkable objects. Complements `AGENTS.md` Frontend `apps/web` + `packages/ui` / Backend `packages/data` split, `showcase.astro:1` stress, `globals.css:81` `Inter Variable` (`preset b6adxMNpg` clean) and `portless` `web.laborata-astro.localhost`.

## 1. Objects (nouns, 8)

### Test — canonical `slug` (e.g. `vitamina-b12`, not `MKT_*`)
- **Attrs:** `id: slug` (canonical id is slug, not `MKT_1234`), `slug_ro: vitamina-b12`, `slug_en: vitamin-b12`, `oldSlugs: string[]` (301), `name_ro/name_en`, `oneSentenceWatcher` (e.g. `Iron stores`), `sampleType: Sânge|Urină|Frotiu`, `panel: string[]|null`, `provenance: {lastSeen, sourceUrl}` — comparison 417 / catalog 7033 (not 415/6900)
- **Relationships:** `1—N VendorItem`, `N—1 Concern`, `1—N Bundle`
- **States:** `empty (no vendor)`, `loading`, `error`, `disabled`, `permission-denied (none)`, `long/unbreakable`, `missing image`, `320px + lg`, `light/dark`
- **Pages:** `analize/[slug].astro` (RO) + `tests/[slug].astro` (EN) same entity; `index.astro` shelf `Analize frecvente`

### Bundle / Profile — `Profil tiroidian`, `Lipidogramă` (58 archetypes total: 30 quorum +3 hemo, 36 market, 22 catalog_only quorum0 honest; comparison 417 / catalog 7033 — not 415/6900, not 37)
- **Attrs:** `id: arch-*` (slug, e.g. `arch-albumina`), `slug`, `name`, `watcher + whoFor + readNext` (steady watcher explainer above table), `members: TestId[]` — `quorum_size` + `total_comps` honest, `vendor_count`
- **Relationships:** `N—N Test`, `N—N VendorItem` (per-lab bundle offer)
- **Actions:** `add all parts`, `add one by one`
- **Pages:** `profil/[slug].astro` — table `Sante 4/4, Synevo 4/4, Invitro 3/4 missing Anti-TPO` + `Not yet sold as a bundle here` (never invent)
- **Q4 closed — quorum≥2 for market, quorum0→catalog_only:** `quorum≥2` → `role=comparison` (market, 36 market = 30 quorum +3 hemo +3 additional quorum≥2), `quorum 0` → `catalog_only` (22 catalog_only honest null, never invent Sante 2.6% protocol). Bundle arch 37→58 total honests the 417/7033 truth.

### VendorItem — per-lab raw offer
- **Attrs:** `id`, `vendor: Synevo|Invitro|Sante|MedExpert|Alfa`, `rawName`, `price_mdl: int`, `turnaround: string`, `sourceUrl`, `lastSeen`
- **Relationships:** `N—1 Test`, `N—1 Lab`, `N—1 Branch[]` (empty = all branches of Lab)
- **Pages:** rows in `PriceComparison` `price-comparison.tsx:20`

### Price (+ Fee) — single honest line (Q3 locked: first option)
- **Attrs:** `amount: int`, `fee: 30` (`plus 30 lei o singură dată`) `| 0` (`0 lei — inclus`), `feeNote: string`, `priceAsOf`
- **Display:** *Synevo 120 lei* + single `plus 30 lei for blood draw, once` (not per-row `10–60` today `price-comparison.tsx:60` — to be fixed); `270 lei (RO) / 270 MDL (EN)` grouped.

### Lab
- **Attrs:** `id, name, logo, renar: boolean`
- **Relationships:** `1—N Branch`, `1—N VendorItem`
- **Pages:** `laboratoare/index.astro`, `laboratoare/[lab].astro`

### Branch
- **Attrs:** `id, labId, city (Chișinău), streetKey (botanica), address, hours: Record<"Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun", string[] | null> (null=Closed, ["7:00 AM-3:00 PM"] or ["8:00 AM - 11:30 AM","12:30 PM - 4:00 PM"] — Mito SF 490 Post `Hours` table), hoursNote?:string, phone, sampleTypes[], geo {lat,lng}` — 145 rows
- **Relationships:** `N—1 Lab`
- **Pages:** `harta.astro` (map + list, filter `lab×sample×street`), `laboratoare/[lab]` branch list

### List — named, shareable, no account now; light account later (Q5) — soft 12
- **Attrs:** `id: ulid, name: Analizele mele/Mama — control anual, items: TestId[] // soft 12 (was ≤10), pinnedBranchId?, createdAt, sharedToken?: base64(JSON), owner: anonToken (localStorage)`
- **Actions:** `create, add (from Search or Bundle), remove, rename, share link (?share=token), open on another phone` — `13th item` shows non-blocking `List mare — compararea poate fi lungă, împarte în două?` (no hard throw)
- **Upgrade path (Q5 — light account later, opinion: keep localStorage now, additive claim):**
  ```
  User {id, email, magicLink, lists: ListId[]}
  Claim: visiting ?share=token while logged-in → POST /claim {token} → owner anonToken → userId (no password)
  ```
  Old links stay `read-only` (no migration). `owner` stays `string` (not `userId?`) so `types.ts` needs no break.
- **Pages:** `/liste`, `/liste/[id]` (+ list-level `Compară` inline), `/comparatie` (`≤12` soft)

### Comparison — derived from List — soft 12, list-level primary
- **Attrs:** `testIds: TestId[] // soft 12 (was 3..5), cheapestSingleLab: {labId,total}, saveIfSplit: int` — `≤12` free, `overflow-x-auto` + sticky `Test` col, `O(labs×tests)` trivial. Primary is inline table on `liste/[id]` for `Analizele mele (12)`; standalone `/comparatie` is secondary picker for ad-hoc.
- **Display:** `Cheapest single-lab: Synevo 260 lei total (fees included)` + small `Save 18 lei if split — without push` (no sponsored order) — `05-mvp-scope.md:35`

### Concern
- **Attrs:** `id, name: Energy/Hormones/Gut…`
- **Relationships:** `1—N Test`
- **Pages:** `index.astro` chips + `analize/index.astro` filter

## 2. Derived pages — Object → Route

| Object(s) | Route(s) | States in `showcase.astro:1` |
|---|---|---|
| `Test` | `/` (shelves `Analize frecvente`), `/analize` (browse, typeahead, filters `Concern×Lab×Sample`), `/analize/[slug]` (`Gallery 1:1` `product-gallery.tsx:12` + `Header 33 lei` `product-header.tsx:12` + `Specs` collapsible `product-specs.tsx:16` + `PriceComparison` single fee + `FAQ` `faq.tsx:9`) | Search `empty/loading/error/disabled/long/many/320px`, PDP `missing image`, `price Large 1.250.000 lei` |
| `Bundle` | `/profil/[slug]` | `N of M` `0/4` empty gray, long member list |
| `Lab+Branch` | `/laboratoare`, `/laboratoare/[lab]`, `/harta` | Map `12 branches match`, `Open now`, `no match kindly widen` (`04:52`) |
| `List` | `/liste`, `/liste/[id]` + share `?share=token` | `empty/one/many` (12/13 soft), `disabled` (soft 12 warning), `permission-denied` (none) |
| `Comparison` | `/comparatie` + inline on `/liste/[id]` | `1/12` tests, `12×5=60` cells `overflow-x-auto` sticky, fee logic |
| All | `/showcase` matrix `idSuffix` isolated (no duplicate ARIA) | `light/dark` per `AGENTS.md` |

## 3. Slugs & i18n (Q1 locked: second choice)

- Single canonical `Test.slug_ro → analize/{slug}` (`analize` per `04:22` plain `tsh, hemoglobina, vitamina-b12`) + `slug_en → tests/{slug}` same entity.
- `oldSlugs[]` → `301` (no link loss).
- `produs/[slug].astro:1` deprecated → `301 → analize/[slug]`.
- `lang="ro"` / `lang="en"` per route (`04:80`), `sitemap.xml` + `MedicalTest` JSON-LD per test.

## 4. What stays / leaves vs current skin

- **Keep:** 5 PDP sections (`Hero`, `Specs` with `SPEC_ROWS:86` 6 rows + `Intervale 200–1100 pg/mL`, `PriceComparison`, `FAQ`, `Disclaimer`) — already normalized `S1=gap-3 S2=gap-6 S3=gap-8` + `Display 3xl` / `Body sm` (`Inter`, `rhea p-4 dense`).
- **Stripped for MVP** `05:54`: `HowItWorks`, `PlanBlock` (`Fiecare rezultat vine cu un plan`), `TrustBlock`, `TestimonialCarousel`, `ProductInterpretation`, `RelatedTests` — intentional, not debt.
- **To add:** `SearchIsland` (`minisearch` client `dist/search.json` ~1.7k docs), `BranchesMap`, `Lists` (`nanostores`).

## 5. Next step

`feat(data-ooux-types)` — `packages/data/src/types.ts v2` from this doc + `feat(web-ia-skeleton)` — `Layout.astro` + `analize/[slug]` skeleton with single fee + share token stub, all behind `showcase` stress. No backend pipeline churn now; `Q4` quorum will flip `Bundle.members` without rework.
