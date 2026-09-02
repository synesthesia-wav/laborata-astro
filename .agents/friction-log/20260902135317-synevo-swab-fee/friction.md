---
title: 'synevo swab fee 50 placeholder not verified via checkout'
severity: 'minor'
---

### Expected Behavior
Synevo collection fee per sampleType should be verified via checkout/cart scrape (blood 30 lei, swab explicit). Fee used in Comparison cheapestSingleLab total.

### Current Behavior
`scrape-autoresearch/data/vendor_fees.json` has Synevo blood 30 ("Inferred from Invitro/Alfa pattern and synevo cart; actual Synevo fee not separately listed, assumed 30") and swab 50 ("Assumed for swab/secretie; Synevo does not list separately, using 50 as placeholder. Verify.") — placeholder honest but unverified. During `feat(data-price-index)` build-price-index, per-offering `price_mdl` is deterministic (not LLM), but fee is separate; swab tests (frotiu) will show placeholder 50 until verified, risking Comparison total error.

### Possible Solution
Scrape Synevo cart/checkout for swab fee similar to Invitro `prelevarea-sangelui-venos` page, or add per-lab fee verification step in `scripts/sync-data.mjs` that warns if notes contain "Assumed" / "placeholder". UI should show "fee TBD" for swab until verified.

### Minimal Reproducible Example
`cat scrape-autoresearch/data/vendor_fees.json | grep -A2 synevo` shows placeholder notes; `packages/data/data/vendor_fees.json` same. `bunx frog list` shows this papercut.

### Context
Hit while wiring `scrape-autoresearch/data/vendor_offerings/*.snapshot.json` (7562) → `laborata-astro/packages/data` price-index. Backend PR verifiable by tests, no visual redesign. Fee ambiguity does not block price-index (price_mdl honest), but blocks accurate Comparison `fee: 30|0|25|50` totals for frotiu.
