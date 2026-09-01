---
title: 'turbo cache hides pagination duplicate render'
severity: 'minor'
---

### Expected Behavior

turbo typecheck should surface errors without needing --force.

### Current Behavior

`bun run typecheck` cached hit masked TS17001 duplicate render in pagination.tsx:61; --force revealed it.

### Possible Solution

Fix duplicate prop and make W4 use --force.

### Minimal Reproducible Example

Add duplicate render prop, run typecheck cached vs --force.

### Context

W4 baseline.
