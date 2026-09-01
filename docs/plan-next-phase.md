# Plan — Next Phase: From 80% Wiring to Shippable MVP

> Status at 2026-09-01 23:56 UTC: `W1 data-wiring` and `W2 pdp-fix` are **done and rigorous**, `W3 ia-search` **lost its showcase blocks in a file collision**, `W4 qa-guard` **baselined**. Build passes (`1138 pages`, `typecheck 0 errors`, `shadscan 51≥43`), but git is dirty (`33 M + 22 ?? untracked`) and `docs/ooux.md` still says `37 arch / MKT_*` vs truth `58 arch / slug`.

---

## 1) Thinking: What work should be done? (first principles)

**Job to be done is not “finish Herdr tickets” — it’s `where should I go and how much will I pay, fees included, in <30s on phone, without opening another tab`.** That cuts the work to 4 checkable walks (05-mvp-scope.md):

1. **Home → Search → Test page → Add to list → Compare → Map** (paper in hand)
2. **Bundle → Understand N-of-M → Add all/one-by-one → List** (doctor)
3. **Map → Filter lab×sample×street → Open now / phone → Share** (family keeper)
4. **Share link → opens on another phone with no account, same prices + branch**

If a file doesn’t serve one of those walks, don’t touch it. Booking, yearly membership, care-team chat, heavy personalization are explicitly *not* now.

Derived from evidence (`scrape-autoresearch/CONTEXT.md` 417/7033, `canonical-graph.json` spec `canonical-v4-tuple-dedupe-correct`):

- **Truth we must surface:** 417 comparison market (384 singles + 33 panel archetypes) + fees `synevo 30 / invitro 30 / sante 0 / medexpert 0 / alfa 25` single-line + TAT `93%` + specimen `91%` + method `69%` + hemoleucograma 3 archetypes. Show honest `—`/`0 lei — inclus`, never invent Sante 2.6% protocol or 6.9% ref ranges.
- **What we have vs need:** PDP + types + search.json (3.9M) + branches 145 + lists/comparison *libs* are done. Missing are the *pages* that let a user walk: `/analize` index, `/harta`, `/liste/*`, `/comparatie`, `/profil/[slug]`, `/laboratoare/*` — and the *showcase states* for W3 that proved they work at 320px + light.

---

## 2) Gap analysis (reproducible, not guessed)

| Area | Done | Gap (reproducible) | Risk if not fixed |
|---|---|---|---|
| **Data truth** | `packages/data/data/*` vendored + `validate.mjs ALL PASS 417/7033 UNIQUE quorum≥2 3 hemo 145` + `manifest.json` SHA256 + `search.json` valid JSON (exit 0, 4.5M) | `docs/ooux.md` still `37 arch, MKT_1234, open Q4` vs `58 arch, slug not MKT_*`, `docs/context` stale | Docs lie → next agent re-asks quorum |
| **PDP** | `price-comparison` 5-lab single fee + `product-header` 175 lei + `product-specs` honest nulls + `produs→301` + `analize/[slug]`+`tests/[slug]` MedicalTest JSON-LD + showcase PDP 21 states (15 pc-* + 6 header/specs) | None blocking | — |
| **Home** | `catalog-shelf` → real `TESTS`, `labs-teaser` → real 145, `hero-search` diacritics fold, `bundles-shelf` exists | `bundles-shelf` still hard-coded 2, not 33 panel archetypes; `index.astro` still `Map 12 mock` copy | Bundles not honest |
| **Search** | libs + `search.json` built, `foldDiacritics` proven `feritina→Feritină` | `search.json` 3.9M client download too large, no `MiniSearch` client instantiation, no `/analize` results page with `Concern×Lab×Sample` chips + empty `Kindly widen` | Search walk dead-ends on home → `?query=` 404 |
| **Lists/Comparison** | `lib/lists.ts` soft12 ulid base64<2k + `lib/comparison.ts` fee-included | **SHOWCASE COLLISION**: `ia-search` added `showcase-list-*`+`showcase-compare-*`+`showcase-branches` at 18:48, overwritten by `pdp-fix` 571-line showcase at 18:51 → grep now `0 showcase-list / 0 showcase-compare`. No `/liste`, `/liste/[id]`, `/comparatie` pages, no `/harta` map, no `/profil/[slug]` N-of-M table | OOUX Table `List` + `Comparison` + `Lab+Branch` + `Bundle` fail |
| **IA sitemap** | 1138 pages built (380 analize + 380 tests + 381 produs) | `analize` count is 380 not 417 — indicates 37 catalog_only or arch with non-ascii slug encoding loss (e.g. `arch-llm-*` long slugs truncated by `getStaticPaths`?). Must verify 417 vs 380 delta = 37 catalog_only correct? Actually comparison is 417, but analize built 380 → missing 37 panel archetypes (expected if quorum 0 filtered). Need to confirm intentional. | SEO long-tail 7033 not emitted (intentional day-one per MVP? 05-mvp-scope says 2 shelves only, but OOUX says 7033 catalog for SEO) |
| **Hygiene** | `typecheck 0 errors 1 hint`, `build Complete`, `shadscan 51` | `git` 22 untracked + 33 modified not staged, `ultracite 120 errors` (noJsxPropsBind/noLeakedRender), `rawTarget` hint, turbo cache hid duplicate render (friction 20260901184723 pending) | Pre-commit `ultracite fix+shadscan --fail-under 43` will stage-fix tracked only, leaving untracked not committed → preview will be stale |
| **Herdr** | 4 tabs created via `pane split --current --no-focus` | Collision happened because W2 and W3 both edited `showcase.astro` without ownership lock / worktree. Coordinator `wB:pG` was `working` (orchestrator itself doing work, not idle) | Next run will repeat unless ownership is explicit |

---

## 3) Plan: 3 phases, file-ownership, Herdr without collisions

**Principle:** One file, one owner at a time. Next run uses **git worktrees or sequential phases**, not parallel edits to `showcase.astro`. Each phase is a single PR (frontend/backend split per AGENTS.md) with checklist + `showcase` proof.

### Phase A — Stabilize & Commit (1 Pi, 2h, blocks B)
*Goal: get current 80% onto `main` clean so next agents start from reproducible state.*

**Owner: `stabilize` (single Pi, wB:tH or new tab, cwd `laborata-astro`, branch `feat/data-ooux-types+pdp-truth`)**
- 1. `git add` 22 untracked: `packages/data/**`, `apps/web/src/components/product/**`, `apps/web/src/lib/**`, `apps/web/src/layouts/Layout.astro`, `apps/web/src/pages/{analize,tests,produs}`, `packages/ui/src/components/{alert,input-group,table,toggle*}`, `scripts/*.mjs`, `apps/web/public/search.json` (or decide to gitignore dist/search.json and generate at build). Keep `packages/data/data/search.json` (source) but gitignore `apps/web/dist/**`.
- 2. Resolve showcase collision: re-apply W3 blocks from `herdr agent read ia-search` snapshot (lines 410-445) *below* W2’s PDP section, keep `idSuffix` unique (`showcase-list-*`, `showcase-compare-*`, `showcase-branches`). Verify `grep -c showcase-` goes from 15 → ~25. Do not edit inside W2’s PDP block.
- 3. Docs sync: update `docs/ooux.md` → `58 arch (30 quorum+3 hemo, 36 market, 22 catalog_only quorum0 honest)`, `id: slug (not MKT_*)`, `comparison 417 / catalog 7033`, close Q4 as `quorum≥2 for market, quorum 0 → catalog_only`. Update `docs/plan-herdr-wiring.md` “Done”.
- 4. Hygiene: `bun x ultracite fix` (stage_fixed true) + fix `rawTarget` unused (remove or use for redirect), `bun run typecheck --force` (no cache), `bun run build`, `node packages/data/data/validate.mjs`, `node_modules/.bin/shadscan --json` (assert ≥43). Commit via `pi skill shadscan-pre-commit` (establish baseline before commit, then `--fail-under 43` at commit).
- 5. Push, open PR `feat(data-ooux-types+pdp-truth)` labelled `backend+frontend`? Split if needed: `feat(data-…)` first, then `feat(web-pdp-truth)` stacked — but Phase A is allowed as one because it’s “wire truth” per Matt Dailey 81-84: backend verifiable by tests, frontend needs preview. Prefer 1 PR with `backend` label + preview for PDP.
- **Exit:** `main` has `417/7033` truth, PDP honest, showcase PDP+List/Compare matrix, `main` typecheck/build/shadscan green.

### Phase B — IA Routes (2 Pis sequentially, not parallel on showcase)
*Goal: make the 4 walks click-through on preview.*

**B1: `harta` + `laboratoare` (Pi `ia-map`, owns `apps/web/src/pages/{harta.astro,laboratoare/**}` + `components/home/labs-teaser` + `lib/branches` helper)**
- Build `harta.astro` (map+list, filter `lab×sample×streetKey botanica/centru/riscani`, count `12 branches match`, `Open now / Opens at 8:00`, phone, sampleTypes, geo `lat/lng`, hoursNote, `kindly widen` empty). Use `BRANCHES` real hours `["07:30-15:00"] / ["08:00-11:30","12:30-16:00"]`. Map can be list+static embed first (no heavy map lib day one).
- `laboratoare/index.astro` + `[lab].astro` branch list.
- Showcase already has `showcase-branches` — verify at 320px.
- PR `feat(web-harta)`.

**B2: `liste` + `comparatie` + `profil` + `analize/index` (Pi `ia-lists`, owns `apps/web/src/pages/{liste/**,comparatie.astro,profil/[slug].astro,analize/index.astro}` + `components/home/*` search wiring)**
- Depends on B1 merge (so showcase not collided). Re-uses `lib/lists.ts` + `lib/comparison.ts` already vendored — now wire pages: `/liste` (empty/one/many 12/13 soft warning `List mare…împarte în două?` non-blocking), `/liste/[id]` inline comparison + share `?share=token` → decodes on another phone with no account, `/comparatie` standalone picker, `/profil/[slug]` N-of-M `Sante 4/4 etc Not yet sold…` + `watcher+whoFor+readNext`, `/analize` browse + typeahead + `Concern×Lab×Sample` chips + empty kindly.
- Wire `HeroSearch` → `MiniSearch` client on `search.json` (consider building smaller `search-light.json` for home: only 417 comparison, not 7033, to cut 3.9M to ~300k). Add `dist/search.json` fetch + `foldDiacritics` matching already proven.
- Showcase `showcase-list-*` + `showcase-compare-*` proof at 320px + lg, `overflow-x-auto sticky Test col` for 12 tests 60 cells.
- PR `feat(web-ia-lists-profil)`.
- **Constraint:** Each B owns `showcase.astro` *section*, not whole file — append below previous section, or use `git worktree` per feature branch to avoid overwrite.

### Phase C — Polish & Ship (1 Pi `qa-polish`, overlaps B review)
- Home bundles: switch `bundles-shelf` from 2 hard-coded to real 33 panel archetypes (query `PANEL_COMPARISON`), keep 2 as preview if 33 too heavy.
- Performance: lazy `search.json` (dynamic import, or build `search-light.json` 417 only for home, full 7033 stays for `/analize` SEO sitemap). Check `apps/web/dist/search.json` not double-committed.
- A11y: `Card` `role` + `aria-live` for lists, keyboard for filters, `hours` table per Mito 490 Post.
- SEO: sitemap.xml + oldSlugs 301 already via `produs→analize`, verify `MedicalTest` on *every* `analize` + `tests` (currently only B12 has long description fallback — generalize via `getById` name_ro).
- Dark mode skip if unsupported (per AGENTS), but verify `light ✓` + `320px verificat` badges.
- Final QA: `showcase` matrix all states side-by-side per AGENTS Goal loop: `no data / one / many, loading Skeleton / error Alert+retry / disabled / permission-denied, long/unbreakable, missing image, large 1.250.000, N-of-M 0/4, 320px+lg light` — record only reproducible failures, fix one at a time, rerender same failing state, verify no regressions.
- Shadscan preview: `shadscan --check-ui <preview-url> --route / --route /showcase --route /analize/vitamina-b12 --route /harta` per AGENTS Frontend preview rule.

---

## 4) Herdr orchestration — do not repeat collision

- **One coordinator, N workers, file locks:** Coordinator `wB:pG` stays `idle` (not working) — only does `herdr agent prompt` + `herdr agent read`. Workers own disjoint globs (announce in prompt). Next run: `stabilize` alone first, then B1 *then* B2 sequentially on same file (`showcase.astro`).
- **Prefer worktrees for parallel showcase edits:** `herdr worktree create --workspace wB --branch feat/ia-lists` gives isolated `showcase.astro`. Or simpler: sequential.
- **Commands:**
  ```bash
  herdr tab create --workspace wB --label stabilize --cwd $PWD --no-focus
  herdr agent start stabilize --kind pi --pane <p>
  herdr agent prompt stabilize "Owns docs/ooux.md + git add untracked + re-merge showcase W3 blocks…" --wait
  # after merge: B1, then B2 — each appends its showcase section, never rewrites whole file
  ```
- **Proactive checks each worker must run before `done`:** `bun run typecheck --force`, `bun run build`, `node packages/data/data/validate.mjs`, `shadscan --json ≥43`, `grep -c showcase-*`, open `showcase` at 320px (via `bun run dev:app` + browser).

---

## 5) Done when (checkable, per AGENTS Goal)

- [ ] Every applicable state rendered in `showcase.astro` with unique `idSuffix`, no duplicate ARIA, at 320px+lg light
- [ ] `analize/[slug]` + `tests/[slug]` same entity, `oldSlugs 301`, `lang ro/en`, `MedicalTest` JSON-LD, `sitemap.xml` includes 417 + 7033 catalog (or 417 with 7033 as `noindex` long-tail)
- [ ] `harta` 145 branches filter `lab×sample×street` + `12 branches match` + `Open now` + `kindly widen` when no match
- [ ] `liste` soft 12 + `?share=` opens on another phone with no account, `comparatie` `cheapestSingleLab fee-included` + `saveIfSplit` without push, `overflow-x-auto sticky`
- [ ] `profil/[slug]` N-of-M honest `Not yet sold…`
- [ ] Search `tsh / feritina (without diacritics) / glicemie≡glucoza` finds `417` market, empty kindly, `SearchIsland` via `dist/search.json`
- [ ] `bun run typecheck` 0 errors, `bun run build` 1138 pages (417 analize + 417 tests + …), `shadscan --json ≥43`, `ultracite fix` then `check` ≤3 warnings, friction log for papercuts, preview deploy + `shadscan --check-ui` green

---

## 6) What we will NOT do now (to avoid scope creep)

Booking inside site (stays `hello@laborata.md` dashed card), yearly membership/care-team chat, heavy personalization, offline diary, heavy accounts — per 05-mvp-scope.md.

---

*Next command for you: approve Phase A stabilize → I spin one Pi `stabilize` now (no new parallel tabs until A merges).*
