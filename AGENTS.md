# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.

---

Import only from @workspace/ui.
Prefer composition over new markup.
Use semantic tokens only.
Every interactive surface needs loading / empty / error / disabled considerations.
Required states must appear in "apps/web/src/pages/showcase.astro" (local dev may use "apps/ui-playground" as alias if present).
Never override component colors with arbitrary Tailwind values.

---

## Frog — friction log

- Log papercuts and friction (tooling, docs, APIs, tests, conventions) as you hit them with `bunx frog log`.
- Do not add global, system, or internal friction.
- Run `bunx frog list` first to see what is already known.

Friction entries live in `.agents/friction-log/<id>/friction.md` + `artifacts/` and are reported as GitHub issues via the `Friction Log` workflow (`wevm/frog/reconcile@v1`). See `.agents/friction-log/README.md`.

---

## Shadscan

Before creating any commit, use $shadscan-pre-commit. Establish the current score when work begins, run Shadscan immediately before each commit, and do not commit if the score is unassessed or below the task floor.

Baseline: run `node_modules/.bin/shadscan --json` to get the top-level `score`. Floor defaults to that baseline; never lower it without explicit user override. Use the local binary (`node_modules/.bin/shadscan`) — not `bunx` with a moving tag — to avoid `minimumReleaseAge` drift. The pre-commit hook enforces `--fail-under <baseline>` (`lefthook.yml` / `.git/hooks/pre-commit`).

## Goal — component stress without Codex

When hardening a component (the `design_tools/codex-tip.txt` `/goal` loop, adapted for Pi/OpenCode):

1. **Inspect only this component.** Read its actual props, slots, states, data sources, and call sites. Select only the stress cases that apply — do not pad the matrix.
2. **Build the test page in `apps/web/src/pages/showcase.astro`.** Import the *real* component with project fonts/tokens/layout (via `@workspace/ui/globals.css`). Render every required state side-by-side in one pass on the single showcase grid (`apps/web/src/pages/showcase.astro` — local dev may use `apps/ui-playground` as alias if present): no data / one / many, loading Skeleton / error Alert + retry / disabled / permission-denied, normal / very long / unbreakable text, missing image, very large number, incomplete data, 320px + supported breakpoints, light+dark (skip dark if unsupported). Do not rebuild a lookalike or connect to production data.
3. **Isolate instances:** Give each rendered instance a unique `id` suffix so duplicate ARIA `id`s / focus traps do not contaminate the check (one real mount vs many side-by-side artifacts).
4. **Record only reproducible failures.** Open the page, list problems you can actually see. Do not predict from code or report taste as bug.
5. **Fix only confirmed problems, one at a time.** After each fix rerender the *same* failing state and verify: content no longer overflows/disappears, primary actions still work, keyboard/focus not regressed, already-passing states not broken. Do not redesign the component, change its public API, or touch outside the test page.
6. **Return:** states tested, before/after screenshots, fixes, still-unresolved items, test+build results. Done when every applicable state has been rendered, every confirmed problem fixed+retested, existing tests pass, build succeeds, and `node_modules/.bin/shadscan --json` score is ≥ task floor.

## Frontend / Backend split — preview deploys (Ref #5)

From `design_tools/matt-dailey-how-i-design-with-ai.md:81-84`: for any feature touching both frontend and backend, separate the PRs. Backend is verifiable with tests; frontend requires human verification via preview deploys. Also: iterate design in a design tool / `/showcase` first — never in the product (`:52-54` prototype gravity), separate views and logic into reusable components (`:68`), and remove agent litter (`:38-41`).

This repo:

- **Backend** = data pipeline (`packages/data`, `scripts/`, generated `dist/*.json`, event log). Verification = `bun run typecheck` + unit/integration tests on `normalize`/`cluster`/replay — no preview needed. PR label `backend`.
- **Frontend** = `apps/web` + `packages/ui` + `packages/blocks` + `apps/ui-playground` (`/showcase`). Verification = **Vercel preview deploy** per PR (Astro 7.2.7 `output: static`) + `node_modules/.bin/shadscan --check-ui <preview-url> --route /` + `shadscan --check-ui <preview-url> --route /showcase` + manual 320px/desktop check on the preview link. Every component must first be added to `apps/web/src/pages/showcase.astro` matrix (or `apps/ui-playground/src/pages/index.astro` alias) before wiring to `apps/web`.
- **PR rule:** Never mix data-generation changes with visual changes in one PR. If both are needed, open `feat(data-…)` and `feat(web-…)` stacked on the same branch but reviewed/deployed separately. `lefthook.yml` `pre-commit: ultracite fix + shadscan --fail-under 43` and `pre-push: typecheck` plus CI (`shadscan.yml` + future `preview.yml` with `shadscan --check-ui`) enforce the gate.
- **Design iteration:** Use `apps/web/src/pages/showcase.astro` (or `apps/ui-playground` alias, or Figma) for 3–4 variants before touching `apps/web` product routes — do not graft directly onto the real page.
