How might I use the auto research function to improve my LLM coding agent at UI and UX design? Especially at designing with shadcn UI. I, for example, want to recreate an existing web app, say MitoHealth, pixel perfect, locally. It has browser tools and visual modality but doesn't one shot it.

**Adapt an AutoResearch-style loop (the Karpathy-inspired propose → evaluate → keep/discard ratchet) to systematically improve your LLM coding agent’s UI/UX capabilities, with a strong focus on shadcn/ui, and to drive iterative pixel-perfect recreation of sites like MitoHealth.** One-shot generation almost never succeeds on real production UIs because of accumulated micro-decisions around spacing, tokens, composition, responsiveness, states, and subtle visual hierarchy; the loop turns that into measurable, monotonic progress.

MitoHealth (mitohealth.com) is a clean, modern preventive-health marketplace and membership product with transparent pricing, lab panels, clinician-reviewed insights, and a membership dashboard. Reviews highlight its aesthetic, intuitive UI. Public signals point to a contemporary stack (React-related, possibly Framer for marketing surfaces historically, with clean SaaS patterns). Recreating it locally with shadcn/ui means mapping its design language onto Tailwind + Radix primitives rather than pixel-matching every proprietary detail.

### Core AutoResearch Pattern Applied to the Agent and to Recreation

The original AutoResearch loop edits code (or a skill/prompt file), runs a fixed evaluation, keeps the change only if a metric improves, and uses git as memory. Community adaptations apply the same ratchet to skills, prompts, rules, or any measurable goal.

**Two complementary loops work well here:**

1. **Meta-loop on the agent itself** (improve its long-term UI/UX competence).  
	Target artifacts: system prompts, Cursor/Claude rules, skill files (e.g., a shadcn-ui.md or ui-recreation.md), component libraries, or evaluation harnesses.  
	Metric examples:
	- Visual similarity score (pixel diff, structural layout diff, or perceptual metrics) on a held-out set of pages/sections.
		- Number of iterations needed to reach a threshold (e..g., <3% pixel mismatch or a human/VLM “looks production-ready” score).
		- Composition quality (how often it correctly uses existing shadcn components vs. inventing custom markup).
		- Token efficiency or adherence to design-token rules.  
		Evaluation can be automated with browser tools + visual modality + deterministic diff tools, then optionally judged by a VLM.
2. **Task loop on a concrete recreation** (e.g., MitoHealth).  
	The agent captures the target, plans sections, generates with shadcn, builds, screenshots, diffs, repairs the worst mismatch, and repeats. Git commits only improvements. This is how “doesn’t one-shot” becomes reliable overnight or over many short runs.

Both benefit from your existing browser tools (DOM inspection, computed styles, screenshots, network) and visual modality.

### Improving the Agent for shadcn/ui Specifically

shadcn/ui is particularly agent-friendly: it is open code (you own the components), composition-first, uses semantic Tailwind tokens (bg-primary, text-muted-foreground), and ships with explicit AI-oriented guidance and rules.

**Recommended research directions to encode into skills/rules via the auto-research loop:**

- Prefer composition over reinvention. Search registries first (npx shadcn@latest search / docs), then compose (e.g., dashboard = Sidebar + Card + Table + Chart; settings = Tabs + Card + form controls).
- Use built-in variants and sizes before custom classes.
- Semantic colors and design tokens only; never hard-code bg-blue-500 or arbitrary values outside explicit experiments.
- Layout with flex/grid + gap-\* (avoid space-x/y-\*); size-\* for equal dimensions; truncate shorthand.
- Proper component structure: items inside Groups, overlays with Titles, Avatar always with Fallback, Skeleton for loading, Separator instead of raw borders, etc.
- Theme via CSS variables / @theme (Tailwind v4 patterns) so light/dark and brand changes propagate.
- Accessibility and Radix primitives stay intact; do not strip them.

**How to run the meta-loop:**

- Create a baseline skill/rule file that encodes the above + a recreation protocol.
- Spawn parallel research agents (domain expert on shadcn docs + examples, competitive analyst on other agent rules/prompts for UI, gap analyst for common failure modes like spacing drift or missing responsive breakpoints, tech scout for Tailwind v4 / new shadcn components).
- Propose one focused change (e.g., “add explicit rule: always extract design tokens via getComputedStyle before generating”).
- Evaluate by running the agent on a fixed set of recreation tasks (or a synthetic suite of common SaaS patterns) and measuring the metrics above.
- Keep only if the metric improves; log everything; discard via git revert.
- Over iterations the skill becomes a high-quality, battle-tested “UI recreation + shadcn” skill that your coding agent loads by default.

You can also auto-research improvements to the evaluation harness itself (better diff tooling, better prompts for the visual modality judge, automated accessibility checks).

### Concrete Workflow for Pixel-Perfect Local Recreation of MitoHealth (or Similar)

Because one-shot fails, structure the agent’s process as an explicit multi-phase loop that itself can be auto-researched:

1. **Capture phase (use browser tools aggressively)**
	- Navigate key pages (home/shop, product detail, membership, how-it-works, dashboard if accessible, mobile viewports).
		- Extract design system: colors, typography scale, spacing rhythm, border radii, shadows, breakpoints, CSS variables via computed styles and stylesheets. Tools such as designlang-style extractors or custom Playwright scripts that dump tokens + component candidates are highly effective.
		- Screenshots at multiple viewports + key interaction states (hover, open modals, filled forms).
		- Accessibility tree + simplified DOM skeleton for structure (far more token-efficient than raw HTML).
		- Note any Framer/ proprietary patterns and map them to equivalent shadcn + Tailwind compositions.
2. **Planning phase**
	- Decompose into sections/components (nav, hero, product grid/cards, pricing/membership toggle, FAQ, footer, etc.).
		- Map each to shadcn primitives + custom blocks. Prefer existing components; create thin wrappers only when needed.
		- Decide token mapping (e.g., primary color → --primary, spacing scale → Tailwind steps or custom theme).
3. **Generation + build**
	- Scaffold with Next.js / Vite + Tailwind + shadcn CLI.
		- Generate section by section or page by page, using the extracted tokens and rules.
		- Keep components pure and composable.
4. **Evaluate + repair loop (the heart of AutoResearch)**
	- Build and serve locally.
		- Capture screenshots of the recreation at identical viewports.
		- Deterministic visual/layout diffs (pixel heatmap, structural region comparison, color/token mismatch reports). Tools in this space (one-shot-ui style extract-compare-fix loops, design-diff style matchPercent + bounds, or custom Playwright + image-diff + VLM) give the agent concrete, ranked fixes rather than vague “make it closer.”
		- Visual modality can score high-level fidelity, hierarchy, and “does this feel like the original brand?” while deterministic tools handle measurable deltas.
		- Agent proposes a focused fix (e.g., adjust gap on a specific card grid, fix a token, correct a breakpoint), applies it, rebuilds, re-scores. Keep only improvements.
		- Stop conditions: pixel mismatch under a threshold, layout score above X, or human review of residuals. Report irreducible differences (e.g., proprietary animations, exact font rendering, third-party widgets).
5. **Polish & edge cases**
	- Interactions, loading states, empty states, error states, dark mode if present, responsive behavior, accessibility.
		- Content can be mocked or partially static; the goal is visual + structural fidelity, not full backend parity.
		- For dynamic elements (personalized panels, AI chat), recreate the chrome and representative states.

**Why this beats pure one-shot + visual feedback:** The agent gets a clear, numerical (or ranked) signal and is forced into small, reversible changes. Memory of what worked/failed accumulates in git and logs. Parallel worktrees or multiple agents can attack different sections.

### Practical Implementation Tips and Nuances

- **Harness**: Use Claude Code, Cursor agent mode, or similar with full filesystem + browser tools + git. Encode the loop in a program.md / skill / CLAUDE.md style instruction set so the agent stays in the ratchet.
- **Metrics that work**: Combination of deterministic (pixel % mismatch after alignment, bounding-box diffs, token-value equality) + structural (component tree similarity) + optional VLM judgment. Pure vision without measurement tends to oscillate.
- **shadcn advantages for agents**: Because components are source, the agent can read, edit, and extend them directly. Official skills/rules already encode many “do this / don’t do that” patterns—seed your research with those.
- **Edge cases & limitations**:
	- Highly animated or canvas-heavy sections may not clone perfectly; report the ceiling early.
		- Fonts, sub-pixel rendering, and anti-aliasing create an irreducible floor (~1–3% mismatch).
		- Login-walled or heavily personalized areas require careful mocking or public marketing surfaces only.
		- Over-fitting to one site can make the agent less general; keep a diverse evaluation suite.
		- Cost/latency of many visual evaluations—batch or use cheaper deterministic stages first.
- **Extensions**: Once the skill is strong, auto-research can also generate better design-token extractors, Storybook stories for isolated components, visual regression CI gates, or even a library of “Mito-like” health-SaaS blocks.

### Expected Outcome

After a series of auto-research runs you should have:

- A hardened skill/rule set that makes the agent far better at shadcn composition, token discipline, and structured recreation.
- A repeatable process that can take a live URL (or set of screenshots + extracted tokens) and converge to a high-fidelity local clone over multiple measured iterations instead of hoping for a perfect first pass.
- Transferable improvements: the same loop works for other design systems or for generating original UIs that follow the same quality bar.

Start small: pick one high-visibility MitoHealth section (e.g., the shop/tests grid or membership pricing), encode a minimal recreation protocol + evaluation metric, run a short overnight or multi-hour loop, inspect the kept diffs, then expand the skill and the target surface. The ratchet does the rest.

What about just creating production-ready UX and UI with shadcn from the ground up? How might I attain this objective not necessarily by replicating an existing web app.

**Creating production-ready UX and UI with shadcn/ui from the ground up** is a stronger long-term objective than pure replication. It forces the agent (and you) to reason about user goals, information architecture, interaction design, accessibility, responsiveness, performance, and maintainability instead of merely matching pixels. The same AutoResearch-style ratchet—propose a focused change, evaluate against clear metrics, keep only improvements—works extremely well here, but the evaluation targets shift from “visual match to reference” to “quality against a production checklist and real usage signals.”

### 1\. Start with Foundations, Not Pages

Production quality is almost entirely determined upstream of individual screens.

**Design system & tokens first**  
Define a constrained set of design tokens before writing feature code:

- Color (primary, secondary, muted, destructive, success, etc.) mapped to shadcn’s CSS variables / Tailwind theme.
- Typography scale, font families, weights, line heights.
- Spacing and sizing scale (prefer Tailwind’s default or a tight custom scale).
- Border radii, shadows, motion durations/easings.
- Breakpoints and container strategies.
- Semantic naming only (bg-primary, text-muted-foreground, border-border). Never hard-code raw colors or arbitrary values in components.

shadcn/ui is deliberately built for this: you own the component source, the theming layer is CSS variables, and the official guidance emphasizes semantic tokens and composition. Encode these constraints as hard rules in the agent’s skill/system prompt so every generated component respects them.

**Component architecture layers**

- **Primitives** (components/ui/\*): the shadcn components themselves (Button, Card, Dialog, etc.). Prefer the official ones; only extend when necessary.
- **Design-system / pattern layer**: thin, opinionated wrappers or composed blocks that encode your product’s visual language (e.g., PrimaryButton, StatCard, SectionHeader, EmptyState).
- **Feature / page layer**: business-logic-aware compositions that consume the layers above.

This hierarchy keeps consistency high and makes later global changes (rebrand, dark-mode refinements, density adjustments) cheap.

**UX principles to encode as agent rules**

- Clarity and hierarchy over decoration.
- Progressive disclosure and clear primary actions.
- Consistent interaction patterns (same component for the same job).
- Accessibility first (keyboard, screen readers, contrast, focus management—Radix already provides a strong base).
- Responsive by default (mobile-first or content-first layouts).
- Loading, empty, error, and success states for every data-driven surface.
- Performance awareness (avoid layout thrashing, lazy-load heavy sections, sensible image handling).

### 2\. Workflow for Ground-Up Creation with an LLM Agent

Treat the agent as a junior-to-mid designer + senior implementer that needs strong scaffolding and iterative feedback.

**Phase A – Research & strategy (agent-assisted)**

- Clarify user personas, jobs-to-be-done, and key flows.
- Have the agent research comparable products (via browser tools) for patterns, not for pixel copying—e.g., “analyze navigation density, form patterns, and empty states on three high-quality health or SaaS dashboards.”
- Produce a lightweight UX brief: information architecture, key user journeys, success metrics, accessibility requirements, content tone.
- Decide core flows and the minimum viable set of screens/components.

**Phase B – Design system bootstrap**

- Initialize a Next.js (or Vite) + Tailwind + shadcn project.
- Install the needed primitives via the CLI.
- Generate or hand-craft the token layer and a small set of design-system components.
- Create a living style guide / Storybook (or simple MDX pages) that the agent can reference and that can later serve as an evaluation target.

**Phase C – Iterative screen & flow construction**  
Work flow-by-flow or section-by-section rather than entire multi-page apps in one shot:

1. Agent proposes structure and component composition from the brief + design system.
2. Generates code that strictly uses the established primitives and tokens.
3. You (or automated checks) review for UX soundness, accessibility, and consistency.
4. Agent refines based on feedback.
5. Visual modality + browser tools are used for layout, spacing, and state verification.

**Phase D – Production hardening**

- Accessibility audits (axe-core, keyboard testing, screen-reader checks).
- Responsive verification across breakpoints.
- Loading / error / empty states.
- Performance (Lighthouse, bundle analysis, Core Web Vitals awareness).
- Content and microcopy review.
- Dark mode and high-contrast support if required.
- Documentation and Storybook coverage for reusable pieces.

### 3\. Applying the AutoResearch Ratchet

Replace “match the reference screenshot” with production-oriented metrics:

**Possible evaluation signals**

- Deterministic: axe-core violations = 0, contrast ratios, layout stability, Lighthouse scores above thresholds, TypeScript/ESLint cleanliness, correct use of design tokens (no arbitrary values).
- Structural: does the component tree follow the three-layer architecture? Are loading/empty/error states present?
- Visual/perceptual (via visual modality + screenshots): hierarchy clarity, spacing rhythm consistency, visual weight of primary actions, density appropriateness.
- Human or VLM judgment against a checklist: “Would a senior product designer approve this for production?” “Does this feel coherent with the rest of the system?”
- Usage proxies (later): task completion rates, time-on-task, error rates in usability tests, or analytics once live.

**Loop structure**

- Baseline a page or component set.
- Agent proposes one focused improvement (better empty state, tighter spacing scale adherence, improved form validation UX, reduced cognitive load in a dashboard, etc.).
- Rebuild, run the evaluation suite, keep only if the composite score improves.
- Log the experiment; use git as the permanent memory of successful changes.
- Periodically run meta-research on the skill/rules themselves (add new failure modes discovered during evaluation, strengthen token discipline, improve prompts for better hierarchy decisions).

This turns “the agent sometimes produces nice UIs” into a steadily improving system that internalizes production standards.

### 4\. Practical Techniques That Raise Quality Quickly

- **Force composition over invention**. Explicit rule: “Before writing custom markup, search existing shadcn components and our design-system layer. Prefer composition.”
- **Require states**. Every data surface must ship with skeleton/loading, empty, error, and success variants.
- **Token linting**. Add simple static checks or agent self-review that flags raw colors, magic numbers, or non-semantic classes.
- **Storybook or isolated previews** as the primary review surface—agents (and humans) reason better about components in isolation.
- **Browser tools for real verification**: render the page, inspect computed styles against the token set, take screenshots at multiple viewports, exercise keyboard navigation.
- **Visual modality for higher-order critique**: “Assess visual hierarchy, primary action clarity, and overall density. Suggest concrete improvements that stay within the design system.”
- **Content-first thinking**. Have the agent write realistic microcopy and empty-state messages early; poor content often reveals UX problems.
- **Progressive complexity**. Start with a single high-value flow (e.g., onboarding or core dashboard), make it production-ready, then expand. Avoid boiling the ocean.

### 5\. Common Pitfalls and How the Loop Helps

- Over-decorating or inconsistent density → metric that penalizes deviation from the spacing/typography scale.
- Missing edge states → checklist item that must score 100%.
- Accessibility regressions → hard gate with axe + manual keyboard checks.
- “Looks good in light mode only” → require dual-theme evaluation.
- Agent invents new visual language instead of extending the system → strict composition and token rules + penalty for new arbitrary values.
- One-shot optimism → the ratchet forces small, measurable steps.

### 6\. Measuring “Production-Ready”

A practical definition you can encode:

- Zero critical accessibility violations.
- Responsive and usable from ~320px to large desktop.
- All interactive elements have clear affordances, focus styles, and loading/disabled states.
- Visual and interaction consistency with the established design system (token adherence > 95–98%).
- Performance budgets met (or consciously justified exceptions).
- Code is typed, lint-clean, and follows the component layering.
- A senior designer or product person would ship it without major rework.
- Documented and previewable in isolation.

You can start with a weighted score across these dimensions and let the AutoResearch loop optimize against it.

### Getting Started Concretely

1. Bootstrap a clean shadcn project and lock in tokens + a handful of design-system components.
2. Write a strong skill/rule file that encodes architecture, token discipline, required states, and accessibility.
3. Pick one real user flow and have the agent implement it under the rules.
4. Build a minimal evaluation harness (browser screenshots + axe + token checks + visual critique).
5. Run short AutoResearch loops to improve both the flow and the skill file itself.
6. Expand outward, always evaluating against the growing design system.

This approach yields UIs that are not only visually polished but coherent, accessible, maintainable, and genuinely production-ready—qualities that pure replication rarely teaches. The agent becomes progressively better at the harder parts of product design because the feedback loop rewards exactly those qualities.

Building a component library with Storybook

**Building a component library with Storybook** is one of the highest-leverage steps for achieving production-ready UX/UI with shadcn/ui from the ground up. It turns isolated components into a living design system: the single source of truth for visuals, behavior, documentation, accessibility, and visual regression testing. Your LLM coding agent becomes dramatically more effective when it can generate against, review in, and improve this catalog.

### Why Storybook + shadcn/ui Works Extremely Well

shadcn/ui gives you owned, composable, accessible primitives (Radix under the hood + Tailwind). Storybook provides the workshop, documentation, interactive controls, multi-state coverage, and testing surface. Together they support the three-layer architecture:

- **Primitives** (components/ui/\*) — the shadcn components themselves.
- **Design-system / pattern layer** — opinionated wrappers and composed blocks that encode your product’s visual language and UX patterns.
- **Feature layer** — domain-specific compositions (used more sparingly in the pure library).

Storybook makes the first two layers visible, reviewable, and testable in isolation. It also serves as the ideal evaluation target for AutoResearch-style loops: the agent can generate or refine a component + its stories, then measure accessibility, visual consistency, token adherence, and documentation quality.

### Recommended Project Structure

```markdown
src/
├── components/
│   ├── ui/              # shadcn primitives (Button, Card, Dialog…)
│   ├── blocks/          # composed, reusable patterns (StatCard, EmptyState, SectionHeader…)
│   └── icons/
├── lib/                 # utilities, cn(), theme helpers
├── styles/              # globals.css with CSS variables / Tailwind theme
└── stories/             # or co-located *.stories.tsx next to components
.storybook/
├── main.ts
├── preview.ts           # import global CSS, theme decorator, a11y, etc.
└── ...
```

Co-locate stories with components when possible (Button.tsx + Button.stories.tsx). This keeps the agent’s context tight and makes maintenance easier.

### Setup Steps (Modern Stack)

1. **Bootstrap the app** with Vite or Next.js + Tailwind + TypeScript, then initialize shadcn (npx shadcn@latest init). Choose CSS variables for theming.
2. **Add Storybook**:
	```markdown
	npx storybook@latest init
	```
	(Storybook 8/9/10-era setups work well; current versions emphasize ESM, better testing integration, and lighter installs.)
3. **Wire Tailwind / shadcn styles into Storybook**  
	In.storybook/preview.ts (or.js):
	```markdown
	import '../src/styles/globals.css'; // or index.css / tailwind entry
	```
	This is the most common missing step. Without it, components render unstyled.
4. **Essential addons**:
	- @storybook/addon-a11y — axe-core based accessibility checks (run on every story).
		- @storybook/addon-themes or a custom decorator for light/dark mode (critical with shadcn’s CSS-variable theming).
		- Controls, Actions, Viewport, Docs (usually included).
		- Optional but high-value: Chromatic / visual testing addon for regression baselines, interaction testing, measure/outline tools.
5. **Theme / dark-mode support**  
	Use a decorator that toggles the dark class (or data-mode) on the document or a wrapper, matching how your app applies next-themes or equivalent. Provide a toolbar toggle so reviewers can switch themes instantly.

### Writing High-Quality Stories

For every component (especially design-system ones), cover:

- **Default / primary usage**
- **All variants and sizes** (via Controls or explicit stories)
- **States**: hover, focus, active, disabled, loading, error
- **Composition examples** (how it is meant to be used with other components)
- **Edge cases**: long text, empty content, extreme viewport sizes
- **Dark mode** (or a theme matrix)
- **Accessibility notes** in the Docs page

Use CSF3 (Component Story Format) with typed Meta and StoryObj. Leverage args and argTypes so the Controls panel becomes interactive documentation. For complex components (Data Table patterns, forms, dialogs), add interaction tests that click, type, and assert.

Example pattern for a Button:

```markdown
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { /* variant, size, etc. */ },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Button', variant: 'default' } };
export const Loading: Story = { args: { children: 'Saving…', disabled: true /* or loading prop */ } };
// … more variants, dark-mode decorator examples, etc.
```

Require stories for every public design-system component. Treat missing stories as a quality gate.

### Integrating with Your LLM Coding Agent + AutoResearch

Storybook becomes both the development surface and the evaluation harness:

- **Generation rule**: When the agent creates or extends a component, it must also produce (or update) the corresponding stories covering variants, states, and docs.
- **Evaluation metrics** for the ratchet loop:
	- Zero critical a11y violations (via the a11y addon or axe in CI).
		- Visual consistency (token adherence, spacing rhythm) — screenshot stories and compare, or use Chromatic baselines.
		- Completeness: required states present, Controls work, Docs page has description + examples.
		- Theme coverage (light + dark render correctly).
		- No arbitrary values outside the design-token set.
- **Agent workflow**:
	1. Agent reads existing stories + component source for context.
		2. Proposes a focused improvement (better empty state, tighter focus styles, new variant, improved docs).
		3. Updates component + stories.
		4. You (or automated checks) run Storybook, a11y, and visual tests.
		5. Keep only if metrics improve; discard otherwise.
- **Visual modality + browser tools**: Point the agent at the Storybook iframe or published static build to inspect rendered output, measure spacing, or critique hierarchy.
- Later, publish the Storybook (Chromatic, static site, or internal) so the whole team—and future agent runs—share the same source of truth.

### Production-Ready Practices

- **Documentation**: Enable autodocs + write clear descriptions, usage guidelines, and do/don’t examples. This becomes the living style guide.
- **Visual regression**: Chromatic (or equivalent) turns every story into a baseline. Catch unintended changes on PRs.
- **Accessibility as a gate**: Fail CI or the AutoResearch evaluation if critical axe violations appear.
- **Responsive & viewport testing**: Use the Viewport addon and explicit stories for mobile/desktop.
- **Performance awareness**: Avoid heavy side-effects in stories; keep them pure.
- **Versioning & publishing**: If the library is shared across apps, treat it as a proper package (or monorepo package) with Storybook as the public face.
- **Token & theme centralization**: All stories inherit the same CSS variables so a single theme change propagates everywhere.

### Common Pitfalls and How to Avoid Them

- Forgetting to import global CSS → unstyled components.
- Stories only covering the happy path → force state coverage in rules.
- Treating Storybook as an afterthought → generate stories in the same PR/agent turn as the component.
- Overly complex stories that import app-level providers unnecessarily → keep providers lightweight or mock them.
- Ignoring dark mode → make theme switching a first-class toolbar control.
- Letting the agent invent new visual language → strict rules that new components must compose existing primitives and stay inside the token set.

### Getting Started Path

1. Initialize shadcn + Storybook in a clean project and confirm styles + theming work.
2. Add the a11y and themes addons; write stories for the core primitives you installed.
3. Codify story requirements and quality metrics into your agent’s skill/rules.
4. Build your first design-system blocks (e.g., a proper EmptyState, StatCard, FormField pattern) with full story coverage.
5. Wire a minimal AutoResearch loop that improves one component + its stories against the metrics.
6. Expand the catalog, then use the Storybook as the reference surface whenever the agent builds new product UI.

Once this library exists and is enforced, your agent’s ground-up work becomes consistently higher quality: it has a concrete, reviewable, testable catalog to extend rather than inventing from scratch each time. Storybook turns “production-ready” from a subjective judgment into a set of measurable, automatable properties.

So it seems like you have to front load as many decisions as you can and bring the foundation close to determinism in order to make the LLM agent succeed

**Yes.** That insight is exactly right, and it is one of the most important practical lessons for getting reliable results from current LLM coding agents on UI/UX work (and many other complex generative tasks).

### Why Front-Loading Decisions and Constraining the Space Matters

LLM agents are extremely capable pattern-matchers and synthesizers, but they are not strong long-horizon planners or consistent enforcers of subtle constraints when the search space is wide open. When you ask an agent to “build a production-ready dashboard with shadcn,” it faces thousands of micro-decisions:

- Which tokens / colors / spacing values?
- Which component composition vs. custom markup?
- What states to include (loading, empty, error, disabled, focus…)?
- How dense should the layout be?
- Accessibility details, responsive behavior, dark-mode handling, etc.

Each of those decisions compounds. Small inconsistencies or omissions accumulate into something that feels “almost right but not production.” One-shot or lightly guided generation therefore fails more often than it succeeds on real product surfaces.

By **front-loading decisions** you shrink the remaining search space and turn many of those micro-choices into constraints the agent can simply obey. The closer the foundation is to deterministic (or at least highly constrained and measurable), the more the agent’s remaining work becomes local optimization and composition rather than open-ended invention.

### What “Close to Determinism” Looks Like in Practice

From the approaches we discussed:

- **Design tokens and theme** fixed first (CSS variables, Tailwind theme, semantic names only). Arbitrary values become forbidden or heavily penalized.
- **Component architecture layers** declared (primitives → design-system/patterns → features). The agent is told to compose, not reinvent.
- **Explicit rules / skill files** that encode shadcn best practices, required states, accessibility expectations, composition guidelines, and “never do X.”
- **Storybook (or equivalent) as the living catalog and evaluation surface.** Every public component has stories covering variants and states; the agent must update them in the same turn.
- **Clear, preferably automated evaluation metrics** (a11y violations = 0, token adherence, visual consistency checks, presence of required states, etc.). The AutoResearch-style keep/discard loop only accepts improvements against those metrics.
- **Scaffolding and project conventions** already in place (folder structure, naming, providers, theming setup).

Once those pieces exist, the agent’s job on a new screen becomes much more deterministic: “Extend the existing design system according to these rules, cover these states, and make the metrics pass.” Success rate rises sharply.

### Nuances and Limits

It is not pure determinism, and you should not try to make it so:

- Some creative or product-judgment decisions still belong to humans (or higher-level product briefs). Over-constraining can produce bland or rigid UIs.
- The foundation itself can (and should) evolve via the same AutoResearch loops—improving the skill file, adding new patterns to the library, tightening metrics—so the “deterministic” baseline improves over time.
- Different domains need different amounts of constraint. A simple marketing page needs less front-loading than a dense, accessible, multi-state admin interface.
- Evaluation quality matters as much as the constraints. Weak or purely subjective metrics still let the agent drift.

The goal is a **high-signal, low-entropy environment** in which the agent’s strengths (fast generation, pattern application, local refinement) dominate and its weaknesses (inconsistency across many free variables, weak global coherence) are minimized.

### Broader Implications

This pattern generalizes far beyond UI:

- Strong type systems, linters, and architectural boundaries.
- Test suites and property-based checks that act as the evaluation oracle.
- Domain-specific languages or constrained intermediate representations.
- Detailed skills/rules + tool use that force the agent to ground itself in reality (browser inspection, computed styles, Storybook rendering, etc.).

In short: **treat the agent as a powerful but fallible executor inside a carefully designed search space, not as an autonomous architect of the entire space.** Front-load the architectural, aesthetic, accessibility, and quality decisions into tokens, components, rules, stories, and metrics. Then let the iterative, measured loop refine the remaining degrees of freedom.

When you do that, the same agent that previously “didn’t one-shot it” starts producing coherent, production-viable results far more consistently—and the AutoResearch ratchet can keep raising the floor.

What's a state machine and how might we use it or something adjacent to it in this process of designing ground up with all our magents?

**A state machine** (more precisely a finite-state machine, or FSM) is a mathematical model of computation that describes a system as a finite set of **states**, a set of **events** (or inputs) that can occur, and a set of **transitions** that move the system from one state to another when a particular event happens in a particular state. It may also carry **context** (data) and **actions** (side effects) that run on entry, exit, or during a transition.

### Core Concepts

- **States**: Discrete modes the system can be in (e.g., idle, loading, success, error, submitting).
- **Events / Triggers**: Things that happen (user clicks “Submit”, network response arrives, timer fires, validation fails).
- **Transitions**: Rules of the form “When in state *S* and event *E* occurs (and optional guard condition is true), go to state *T* and optionally run these actions.”
- **Context**: Mutable data that travels with the machine (form values, error messages, retry count, etc.).
- **Guards / Conditions**: Boolean checks that decide whether a transition is allowed.
- **Actions / Effects**: Code that runs on transitions or on entering/exiting a state (API calls, analytics, focus management).
- **Hierarchical / Parallel states** (in richer formalisms such as statecharts): Nested machines or concurrent regions so complex behavior stays manageable.

The classic slogan is: **make impossible states impossible**. Instead of a tangle of booleans (isLoading &&!isError && hasSubmitted &&!isRetrying), you enumerate only the legal combinations and the legal ways to move between them. This eliminates entire classes of bugs and makes the behavior explicit, visualizable, and testable.

In UI work the most common library in the React/TypeScript ecosystem is **XState** (especially v5 with its actor model). Simpler cases can be handled with a typed reducer + useReducer or even a discriminated-union state + useState. Adjacent ideas include statecharts (Harel), hierarchical state machines, behavior trees, and finite-state transducers.

### Why State Machines Fit the “Front-Load Decisions + Move Toward Determinism” Approach

You already observed that LLM agents succeed more reliably when the foundation is constrained and measurable. State machines are one of the strongest tools for doing exactly that on the **behavioral** axis (complementing the visual/token/component constraints we discussed earlier).

- They force you (or the agent) to **enumerate every meaningful state and transition up front**.
- They turn “what should the UI do in this situation?” into a finite, inspectable graph instead of ad-hoc conditionals.
- They give a clear evaluation surface: does the generated code respect the machine? Are all states reachable? Are there dead ends or impossible combinations?
- They compose cleanly with the layered design system (a Button can expose a small machine for its own loading/success/error lifecycle; a multi-step form or wizard can be a larger machine that orchestrates several components).
- They are visualizable (XState has excellent diagram tools), which helps both humans and agents reason about the design.

### How to Use Them (or Adjacent Techniques) in Ground-Up Design with Agents

**1\. Model critical flows as machines during the foundation phase**

Before (or while) generating screens, have the agent (or a specialist research agent) produce an explicit state machine for every non-trivial interaction:

- Authentication / onboarding
- Multi-step forms or wizards
- Async data-fetching surfaces (idle → loading → success | error → retry)
- Complex components (modals with confirmation, stateful buttons, drawers with unsaved changes, etc.)
- Overall application or page-level navigation logic that has meaningful modes

The machine becomes part of the design system contract, just like tokens and Storybook stories.

**2\. Make the machine the source of truth for the agent**

- Agent first emits or refines the machine definition (XState config, or a simpler typed reducer).
- Then it generates the React components that *consume* the machine (via useMachine or equivalent) and map states to shadcn UI (different visuals, disabled states, loading spinners, error messages, etc.).
- Storybook stories can be generated per state or per interesting path, making every legal state visible and testable in isolation.
- AutoResearch-style loops can treat “machine + component + stories respect the declared transitions and cover all states” as a hard metric.

**3\. Adjacent / lighter-weight alternatives that still give most of the benefit**

- **Discriminated-union state + reducer**: Excellent for many UI cases and easier for agents to generate correctly.
- **Explicit state enums + transition tables** documented in the skill/rules file.
- **XState only for the complex orchestration**; simpler local UI state stays in React.
- **Schema-driven or JSON-described flows** that an agent can both generate and later execute against.
- **Behavior trees or goal-oriented planners** for higher-level agent orchestration (the multi-agent process itself can be modeled with state machines).

**4\. Concrete integration points with the rest of the process**

- **Design-system layer**: Ship a few well-tested stateful primitives (e.g., a StatefulButton that already contains its own small machine for idle/loading/success/error). Agents compose these rather than reinventing loading logic.
- **Storybook**: Every major state of the machine becomes a story (or a story with controls that send events). Visual + a11y checks run per state.
- **Evaluation / AutoResearch metrics**:
	- All declared states are reachable and have corresponding UI.
		- No boolean-flag soup in the generated code.
		- Guards and actions are pure or clearly side-effecting.
		- Machine can be visualized and matches the product intent.
- **Multi-agent workflow**: One agent specializes in extracting/refining the state machine from a product brief or user journey; another implements the UI against it; a third reviews for completeness and edge cases.
- **Documentation**: The machine diagram + the Storybook become living behavioral documentation that both humans and future agent runs can reference.

**5\. Practical starting points**

- Begin with the highest-risk or highest-complexity flows (anything with async work, multi-step processes, or many interacting flags).
- Require the agent to output the machine *before* or *alongside* the visual components.
- Keep machines as pure and declarative as possible so they remain easy to test and to improve via the keep/discard loop.
- Visualize early (XState visualizer or even a simple Mermaid diagram generated by the agent). Product and design stakeholders can review the graph long before pixels are polished.

### Benefits Specific to Agent-Driven Ground-Up Work

- Dramatically reduces the “boolean soup” and race-condition bugs that agents otherwise introduce.
- Gives the agent a finite, explicit target instead of an open-ended “make it work.”
- Makes evaluation far more objective (“does this transition exist?” is easier to check than “does the UX feel right?”).
- Composes with the rest of the determinism strategy: tokens + component layers + required states + state machines + Storybook coverage + metrics.
- Scales to multi-agent setups—the machines themselves can become the shared language or memory between specialist agents.

### Caveats

- Not every piece of UI needs a full state machine; over-using them adds ceremony. Reserve them for behavior that has real modes and transitions.
- Agents can still generate incorrect or overly complex machines; the evaluation loop and human review of the graph remain important.
- Hierarchical/parallel machines are powerful but have a steeper learning curve for both humans and agents—start simple.

In short, state machines (and their lighter cousins) are a powerful way to **front-load behavioral decisions** and push another large part of the design space toward determinism. When combined with the token system, component layers, Storybook, and measured AutoResearch loops you already have, they give your agents a much clearer, more reliable substrate on which to build production-ready UI from the ground up. The result is software whose visual design *and* interaction logic are both explicit, reviewable, and iteratively improvable.

What about graphs?

**Graphs** are a natural and powerful next layer on top of (and alongside) state machines for making ground-up UI design more deterministic and agent-friendly.

### What a Graph Is (in this context)

A graph is a collection of **nodes** (entities) connected by **edges** (relationships). In software and design work the most useful variants are:

- **Directed graphs** — edges have direction (A → B).
- **Labeled / typed graphs** — nodes and edges carry types and properties (e.g., “Button component”, “uses token”, “transitions on SUBMIT”).
- **Hierarchical or nested graphs** — nodes can themselves contain graphs.
- **Knowledge graphs** — rich semantic networks of concepts, constraints, and relationships.
- **Scene / layout graphs** — hierarchical description of visual structure (parent-child, layout constraints, styles).
- **State graphs** — exactly what finite state machines are: nodes = states, edges = transitions.

State machines are a specialized, highly constrained form of directed graph. Moving to more general graphs lets you model richer structure while keeping the same benefits of explicitness, enumerability, and evaluability.

### Why Graphs Help Agents Succeed

The core problem we keep returning to is that open-ended generation creates too many free variables. Graphs give you another way to **front-load structure**:

- You (or a specialist agent) first produce or refine an explicit graph that captures the important relationships.
- Subsequent generation, composition, and evaluation are constrained to respect that graph.
- The graph itself becomes a measurable artifact: agents can validate connectivity, detect missing nodes/edges, check consistency against the design system, and improve the graph via AutoResearch-style loops.

This is the same “constrain the search space + make evaluation objective” pattern applied to structure and relationships rather than just tokens or local component states.

### Concrete Ways to Use Graphs in the Process

**1\. Component & Design-System Dependency Graphs**  
Nodes = components / blocks / tokens / patterns.  
Edges = “uses”, “extends”, “composes”, “themed-by”, “requires-state-machine”.

- Agents must respect existing nodes when generating new UI.
- Storybook and the component library become a navigable graph.
- Evaluation: no orphan components, no cycles that break layering, token usage is traceable.

**2\. User Journey / Flow Graphs (beyond single state machines)**  
Nodes = screens, steps, or major modes.  
Edges = user actions or system events that move between them.

- Higher-level than a single form’s state machine; captures the product’s overall navigation and task flows.
- Agents generate pages or features only for nodes that exist in the approved journey graph.
- Multi-agent setups: one agent maintains the journey graph, others implement individual nodes against it.

**3\. Layout / Scene Graphs**  
A hierarchical graph describing the visual tree: containers, flex/grid relationships, constraints, and which design-system components occupy each slot.

- Forces the agent to decide structure before pixels.
- Can be validated against spacing tokens, responsive breakpoints, and accessibility tree expectations.
- Useful intermediate representation between a product brief and final shadcn/Tailwind code.

**4\. Knowledge Graph of the Design System**  
Nodes = tokens, components, patterns, accessibility rules, content guidelines, anti-patterns.  
Edges = relationships and constraints (“primary button must use primary color token”, “every form field requires error state”, etc.).

- The agent queries or is given a subgraph relevant to the current task instead of relying solely on long prompts.
- AutoResearch can add or refine nodes/edges as new patterns prove valuable.

**5\. State Graphs (the connection back to state machines)**  
Every non-trivial interactive piece still gets its own state machine (a focused directed graph). Larger flows become graphs *of* machines or hierarchical statecharts. The overall application behavior can be viewed as a graph of these machines.

**6\. Agent Orchestration Graphs**  
The multi-agent process itself can be modeled as a graph (or state machine of agents): research agent → architecture agent → implementation agent → evaluation agent, with clear hand-off edges and shared memory (the design-system graph, journey graph, etc.).

### How This Fits the Existing Foundation

- **Tokens + component layers** supply the node vocabulary.
- **State machines** supply the behavioral edges for interactive pieces.
- **Storybook** makes many of the nodes and their states visible and testable.
- **Graphs** supply the global structure and relationships that keep everything coherent.
- **AutoResearch loops** can now operate on the graphs themselves: propose a new edge or node, evaluate consistency/completeness/impact, keep or discard.

Agents become much more reliable when their job is “extend this graph while obeying these constraints and improving these metrics” rather than “invent a complete UI from a vague description.”

### Practical Starting Points

- Begin with the two highest-value graphs: (1) the design-system dependency graph and (2) the primary user-journey graph.
- Represent them in a simple, agent-readable format (JSON, YAML, or a lightweight graph library). Mermaid or similar can be generated for human review.
- Require agents to declare which existing nodes they are using or extending before writing new component code.
- Add graph-level checks to the evaluation suite (connectivity, required states present, no forbidden edges, etc.).
- Visualize early—humans and agents both reason better when the structure is drawn.

### Adjacent and Related Ideas

- Scene graphs from graphics / design tools.
- Knowledge graphs for retrieval-augmented generation of UI.
- Graph neural nets or simpler graph algorithms for analysis (rarely needed early).
- Design-State Graphs or similar structured intermediate representations that some research systems use to keep multi-agent design coherent.

**In short**: graphs let you make the *relationships and structure* of the design as explicit and constrained as you have already made the tokens, components, and local behavioral states. State machines handle the “what happens inside this interactive piece”; broader graphs handle “how do all the pieces and flows relate.” Together they push still more of the design space toward determinism, giving your agents clearer targets and stronger evaluation signals when building production-ready UI from the ground up.

Explore decision trees

**Decision trees** are another powerful structure for making ground-up UI design more deterministic and agent-friendly. They complement state machines and graphs by focusing on **choice points and conditional logic** rather than ongoing modes or arbitrary relationships.

### What a Decision Tree Is

A decision tree is a hierarchical, tree-shaped model of decisions and their possible consequences.

- **Root**: the starting question or condition.
- **Internal nodes**: decision points (questions, conditions, or tests).
- **Branches**: the possible answers or outcomes of that decision (usually mutually exclusive).
- **Leaves**: the final actions, recommendations, states, or UI configurations that result from following a path.

Unlike a general graph, a tree has no cycles and typically a single path from root to any leaf. This makes them especially good for:

- Classification (“which component / pattern / layout should we use?”)
- Rule-based logic (“given these user attributes and context, which empty state or form variant applies?”)
- Explicit, auditable decision processes
- Guiding both humans and agents through a constrained sequence of choices

Classic examples outside UI include medical diagnosis trees, business rule engines, and simple expert systems. In code they often appear as nested if/else or switch statements, or as explicit data structures that can be traversed or visualized.

### Decision Trees vs State Machines vs Graphs

| Aspect | Decision Tree | State Machine | General Graph |
| --- | --- | --- | --- |
| Structure | Hierarchical, acyclic | Directed, can have cycles | Arbitrary nodes + edges |
| Primary focus | Sequences of choices → outcome | Ongoing modes + transitions | Relationships & structure |
| Time dimension | Usually one-shot or staged decisions | Continuous behavior over time | Static or dynamic relationships |
| Best for | “Which X given these conditions?” | “What modes can this thing be in?” | “How do these things connect?” |
| Cycles | None | Common (and useful) | Allowed |
| Typical UI use | Variant selection, content rules, routing logic | Form lifecycles, async flows, interactive components | Component dependencies, journeys, layout |

They are complementary, not competitors. A decision tree can *choose* which state machine to instantiate, or decide the initial state and configuration of a machine. A graph can contain decision trees as node properties or edge labels. Agents can generate or traverse any of them.

### How Decision Trees Fit the “Front-Load + Constrain” Strategy

The same principle applies: the more decisions you enumerate and structure in advance, the fewer free variables the LLM agent has left, and the easier it becomes to evaluate whether the generated UI is correct.

Decision trees excel at making **conditional product and design logic** explicit:

- Which empty state, error message, or illustration to show based on user type, data emptiness reason, and permissions.
- Which form fields, validation rules, or layout density to use based on context (mobile vs desktop, new vs returning user, risk level, etc.).
- Component or pattern selection (“if the content is a list of metrics → StatCard grid; if it is a long hierarchical dataset → Data Table with expansion; if it is a simple yes/no → Toggle or Radio Group”).
- Accessibility or progressive-enhancement choices.
- Content tone or microcopy selection.
- Routing or feature-flag decisions that affect UI.

By turning these into explicit trees (or sets of trees), you convert vague “use good judgment” instructions into traversable, testable, and improvable artifacts.

### Practical Ways to Use Them with Agents

**1\. Design-system decision trees**  
Encode rules for when to use which component or composition.  
Example (simplified):

```markdown
Is the action primary and destructive?
├─ Yes → Destructive Button (with confirmation dialog)
└─ No
   ├─ Needs loading feedback? → Stateful Button
   └─ Otherwise → standard Button variant based on hierarchy
```

Agents must consult (or generate against) these trees instead of inventing ad-hoc choices.

**2\. Contextual UI configuration trees**  
Given user attributes, data state, device, and permissions, decide the exact configuration of a screen or component (which sections appear, which states are possible, density, etc.). The output of the tree can feed directly into props, which state machine to use, or which Storybook story variant to target.

**3\. Content and microcopy trees**  
Decide tone, length, and specific messaging based on error type, user expertise, or journey stage. This keeps generated text coherent with the product voice.

**4\. Evaluation and critique trees**  
A meta-tree the evaluation agent (or AutoResearch judge) walks:  
“Does this component have all required states?” → “Are tokens respected?” → “Is accessibility coverage present?” → score or reject.  
This turns subjective review into a more structured process.

**5\. Agent reasoning trees**  
Force the coding or design agent to externalize its decisions as a tree before (or while) generating code. The tree becomes both documentation and a checkpoint: “Show me the decision path that led to this layout.”

**6\. Hybrid with state machines**

- Decision tree selects or configures the machine.
- Decision tree runs at specific states (e.g., on entering an “error” state, a tree decides which recovery options and messaging to present).
- Parallel: a state machine handles temporal behavior while decision trees handle static configuration.

### Representation and Tooling

- **Data**: JSON/YAML trees, or libraries that support decision-tree structures.
- **Code**: Typed recursive structures, or simply well-structured conditionals that an agent is required to keep aligned with a documented tree.
- **Visualization**: Mermaid, Graphviz, or dedicated decision-tree renderers—very helpful for human review and for giving agents a clear target.
- **Execution**: Agents (or runtime code) can walk the tree given a context object and emit the leaf decision.
- **Learning / improvement**: AutoResearch loops can propose new branches, prune rarely used ones, or adjust conditions based on evaluation metrics or real usage data.

### Benefits and Limits in the Agent-Driven Process

**Strengths**

- Extremely explicit and auditable.
- Easy for both humans and LLMs to generate, read, and critique.
- Natural fit for “given these inputs, produce this UI configuration.”
- Reduces hallucination of inappropriate patterns or components.
- Composes cleanly with tokens, component layers, Storybook variants, and state machines.

**Limits**

- Can become large and brittle if every minor variation gets its own branch—prefer shallow, high-signal trees.
- Not ideal for continuous or cyclic behavior (use state machines there).
- Overly rigid trees can produce mechanical UIs; leave some aesthetic judgment to higher-level guidance or human review.
- Maintenance cost: trees need to evolve with the product, so treat them as first-class artifacts under the same keep/discard discipline.

### Suggested Integration Path

1. Identify the highest-churn or highest-risk decision points in your UI (component selection, empty/error states, form configuration, responsive behavior).
2. Have a specialist agent (or you) draft initial decision trees for those points and store them alongside the design system.
3. Update agent skills/rules: “Before generating UI for X, walk or respect the relevant decision tree and record the path taken.”
4. Generate Storybook stories that correspond to important leaves of the trees.
5. Add tree-consistency checks to the evaluation metrics used by AutoResearch loops.
6. Periodically let the research loop propose refinements to the trees themselves.

**In combination with the earlier pieces**, decision trees give you a clean way to front-load *conditional* design and product logic. Tokens and components constrain the visual vocabulary; state machines constrain temporal behavior; graphs constrain relationships and structure; decision trees constrain “which option under which conditions.” Together they push a large fraction of the design space toward explicit, measurable, agent-navigable form—exactly the conditions under which current LLM agents produce far more reliable, production-ready results from the ground up.

Explore Random Forests For UI

**Random Forests** are an ensemble machine-learning method built from many decision trees. Exploring them in the context of ground-up, agent-driven UI design opens both literal (ML) and metaphorical (process) applications. They sit naturally on top of the decision-tree ideas we just covered and can further improve robustness when pure determinism is either impossible or undesirable.

### Quick Technical Recap

A **Random Forest** trains a large number of decision trees on different random subsets of the training data and (usually) random subsets of the features. At prediction time:

- For classification, each tree votes; the majority wins.
- For regression, the trees’ numeric outputs are averaged.

Key properties that matter for UI work:

- **Reduces variance** — individual trees overfit easily; the ensemble is far more stable.
- **Handles non-linear interactions** and mixed feature types well.
- **Provides feature importance** — you can see which inputs most influence the decision.
- **Naturally probabilistic** — you get not just a prediction but a measure of agreement among the trees (confidence / uncertainty).
- **Parallelizable** and relatively robust to noisy or incomplete data.

In short, where a single decision tree gives one crisp path, a Random Forest gives a *distribution* of opinions and a more reliable final answer.

### 1\. Literal Use: Machine-Learning Models for UI Decisions

You can train actual Random Forest (or modern equivalents such as gradient-boosted trees) models on data and use them as decision engines inside or alongside the design system.

**Possible prediction targets in UI/UX**

- Which component or pattern to recommend given context (user segment, device, data shape, task type).
- Optimal layout density, information hierarchy, or number of primary actions.
- Likelihood that a particular empty state, error message, or onboarding step will succeed.
- Predicted accessibility friction or cognitive load for a proposed configuration.
- Personalization: which variant of a screen or flow a given user is most likely to complete successfully.
- A/B or multi-armed-bandit style outcomes (though specialized methods often outperform plain Random Forests here).
- Risk of visual or interaction regressions when changing tokens or components.

**How this fits the agent workflow**

- The model becomes another constrained oracle the agent must consult or whose outputs it must respect.
- Feature vectors can be built from the same structured artifacts you already maintain: design-system graph nodes, user-journey position, state-machine current state, decision-tree path so far, device/viewport, etc.
- Agents can be required to log the model’s prediction + confidence alongside the generated UI, making the decision auditable.
- AutoResearch loops can treat model accuracy or calibration as an additional metric and periodically retrain or fine-tune the forest on new labeled examples (successful vs. failed designs, usability test results, production analytics).

**Data sources**

- Historical design decisions that were accepted/rejected.
- Usability test outcomes, analytics (completion rates, error rates, time-on-task).
- Synthetic data generated by agents under controlled conditions.
- Human preference labels or pairwise comparisons of UI variants.

**Practical notes**

- Start small: a forest that only predicts “which empty-state pattern” or “button hierarchy level” is already useful and easy to evaluate.
- Prefer models that expose feature importance and per-tree votes so agents and humans can understand *why* a recommendation was made.
- Keep the model’s output as advice or a soft constraint rather than an absolute dictator unless you have high-quality, representative data.
- Modern alternatives (XGBoost, LightGBM, CatBoost, or even small neural nets) often outperform classic Random Forests, but the ensemble intuition remains the same.

### 2\. Metaphorical / Process Use: Ensemble Reasoning for Agents

Even without training a statistical model, you can copy the *Random Forest algorithm* as a process pattern for multi-agent or multi-hypothesis UI design.

**Ensemble of decision paths**

- Instead of one agent walking one decision tree, spawn several agents (or one agent with different temperature / prompt seeds / tool subsets) that each produce a decision path or UI configuration.
- Aggregate by majority vote, weighted vote, or a learned meta-model.
- High agreement → high confidence; low agreement → flag for human review or further research.

**Ensemble of critique agents**

- Multiple specialized critics (accessibility, visual hierarchy, token adherence, state completeness, performance, content tone) each score or accept/reject a candidate.
- Final keep/discard decision in the AutoResearch loop requires a quorum or weighted consensus—exactly analogous to tree voting.

**Benefits that mirror Random Forests**

- Lower variance: one idiosyncratic agent decision is less likely to dominate.
- Better handling of uncertainty: you surface disagreement instead of hallucinating certainty.
- Feature/decision importance emerges naturally (“most critics flagged the missing error state”).
- Robustness to noisy or incomplete context.

This approach is especially useful early in a design system’s life when you lack enough labeled data for a real ML model but still want ensemble reliability.

### 3\. Hybrid Patterns

- Train a lightweight Random Forest on the outcomes of previous agent ensembles (which configurations survived human or metric review). The model then becomes a fast prior that future agents can query.
- Use the forest’s feature-importance ranking to decide which parts of the design system or which decision trees deserve the most AutoResearch attention.
- Combine with state machines: the forest predicts the most likely next state or the best configuration parameters for a machine; the machine then executes the temporal behavior deterministically.
- Combine with graphs: node or edge attributes can include forest predictions (e.g., “predicted success probability of this journey step”).

### 4\. Where Random Forests Add the Most Value (and Where They Don’t)

**High value**

- Personalization and adaptive interfaces.
- Choosing among many plausible design-system variants under rich context.
- Predicting outcomes (completion, satisfaction, accessibility risk) when you have historical or experimental data.
- Making multi-agent critique more robust.
- Surfacing uncertainty so the overall system knows when to ask for human input.

**Lower value or risky**

- Purely aesthetic or brand-new visual invention (trees and forests are better at selection/classification than open-ended generation).
- Situations with almost no data — a hand-authored decision tree or explicit rules will be more transparent and controllable.
- Real-time, ultra-low-latency decisions on the client (a forest can be compiled or approximated, but simpler rules are often preferable).
- Replacing the core determinism strategy. Forests should sit *on top of* tokens, components, state machines, and graphs, not instead of them.

### Integration Recommendations

1. Keep the existing foundation (tokens, component layers, Storybook, state machines, explicit decision trees, graphs) as the hard constraints.
2. Layer Random Forest-style ensembling or actual models as a *soft*, data-driven recommendation and uncertainty signal.
3. Expose predictions + confidence + feature contributions to both agents and humans.
4. Make model or ensemble performance part of the AutoResearch evaluation suite so the recommendation quality itself improves over time.
5. Start with process-level ensembling (multiple agents / multiple critique paths) before investing in trained models; the data you collect will later train better forests.

**Bottom line**: Random Forests (both the statistical method and the ensemble idea) give you a principled way to handle the remaining uncertainty and variance that pure determinism cannot eliminate. They turn collections of decision trees—or collections of agent reasoners—into more stable, confidence-aware decision engines. Used on top of the constrained foundation you are building, they help agents produce UI that is not only consistent with the design system but also more likely to succeed for real users under varying conditions.

Investigate Bayesian Optimization for UI

**Bayesian Optimization (BO)** is a sample-efficient, sequential method for optimizing expensive, noisy, black-box objective functions. It is particularly well-suited to UI/UX design problems where each evaluation is costly (user studies, designer time, full agent generation + evaluation cycles, or real-user metrics) and the design space is continuous or mixed.

### Core Idea

BO maintains a **probabilistic surrogate model** (most commonly a Gaussian Process) of the unknown objective $f(\mathbf{x})$. The surrogate gives both a predicted mean and uncertainty at every point in the design space. An **acquisition function** (Expected Improvement, Upper Confidence Bound, Entropy Search, etc.) then selects the next point to evaluate by balancing:

- **Exploitation** — sampling where the predicted value is high.
- **Exploration** — sampling where uncertainty is high.

After each evaluation the surrogate is updated and the process repeats. Because it models uncertainty explicitly, BO typically finds good solutions with far fewer evaluations than grid search, random search, or naïve evolutionary methods.

### Established Uses in UI / Interaction Design

Research in HCI has applied BO extensively:

- **Interface feature optimization** — tuning visual and interaction parameters (sizes, spacings, timings, gains, etc.) against objective measures such as task time or subjective preference.
- **Preferential / pairwise Bayesian Optimization** — designers or users simply choose which of two (or more) designs they prefer; the optimizer learns a latent utility function.
- **Multi-objective BO (MOBO)** — simultaneously optimizing several criteria (usability, aesthetics, cognitive load, trust, performance) and returning a Pareto front.
- **Human-in-the-loop (HITL) and cooperative systems** — the optimizer suggests candidates while the designer retains agency, intervenes via natural language or direct manipulation, or works asynchronously with the optimizer.
- **Crowdsourced refinement** — using many cheap user evaluations to drive the loop.
- **Cost-aware BO** — factoring in the real cost of building or testing a prototype (tweak vs. swap vs. create).
- **Adaptive and personalized interfaces** — optimizing parameters for individual users or user models.

These approaches treat UI design as a structured search problem over a parameter space while respecting the noisy, expensive nature of human feedback.

### How BO Fits the Ground-Up, Agent-Driven Process

Your existing foundation (tokens, component layers, Storybook, state machines, graphs, decision trees, ensemble critique) already shrinks and structures the search space. Bayesian Optimization sits on top of that foundation as an intelligent search / experimentation engine.

**1\. Optimizing continuous or mixed design parameters inside the design system**

Even with a constrained system you still have tunable knobs:

- Spacing scale multipliers, density variants, border radii, motion durations.
- Layout proportions, information density, number of primary actions.
- Thresholds inside decision trees or configuration parameters of state machines.
- Prompt or temperature settings that affect how agents generate variants.

BO can search these knobs against metrics you already care about (a11y scores, visual consistency, predicted or measured task success, designer preference, Lighthouse scores, etc.).

**2\. Driving the AutoResearch / keep-discard loop more intelligently**

Instead of random or purely heuristic proposals, BO can suggest the next UI configuration or agent skill change that is expected to improve the composite evaluation metric most efficiently. The surrogate model learns which regions of the (now constrained) design space are promising.

**3\. Multi-objective and preferential settings**

- Optimize simultaneously for accessibility, performance, aesthetic consistency, and estimated user success → Pareto set of candidates for human or agent review.
- Preferential BO: the evaluation agent (or a human) only needs to say “A is better than B”; no numeric scores required.

**4\. Human + agent + BO cooperation**

Recent systems combine BO with LLMs so a designer (or a high-level agent) can intervene in natural language (“focus more on mobile density”, “avoid anything that feels clinical”). The LLM helps interpret the request and bias the acquisition function or candidate selection while BO still provides the sample-efficient backbone.

**5\. Personalization and adaptive UI**

Once you have user-level or segment-level data, BO (or a contextual bandit / Gaussian-process variant) can optimize interface parameters per user or cohort while still respecting the global design-system constraints.

**6\. Meta-optimization of the agent system itself**

BO can tune higher-level hyperparameters of the multi-agent process: number of parallel critics, weighting of metrics, temperature schedules, which decision trees or graph subgraphs to emphasize, etc.

### Practical Integration Pattern

1. **Define a bounded, meaningful parameter space** derived from your tokens, component variants, state-machine configurations, and decision-tree leaves. Keep dimensionality moderate (BO works best in relatively low dimensions or with good structure).
2. **Choose an objective (or objectives)** that can be evaluated automatically where possible (Storybook + a11y + token checks + visual metrics) and with humans or preferential feedback where necessary.
3. **Wrap the evaluation** so each “experiment” is: generate or configure UI according to the suggested parameters → render in Storybook or a test harness → compute metrics / collect preference → return the score(s) to the BO loop.
4. **Run the sequential loop**, optionally in batch mode or with cost-aware acquisition if evaluations differ in expense.
5. **Surface the surrogate and uncertainty** to agents and humans so they understand *why* a region is being explored and how confident the model is.
6. **Feed successful configurations back** into the design system (new approved variants, updated decision trees, new Storybook stories) so the constrained foundation itself improves.

### Strengths Relative to Earlier Tools

- **Decision trees / Random Forests** — good for classification and fast prediction once trained; BO is better for sequential, expensive search when you do not yet have large labeled datasets.
- **State machines & graphs** — describe structure and behavior; BO searches *parameters* of those structures or chooses among configurations.
- **Pure agent AutoResearch** — agents propose changes; BO can decide *which* region of the proposal space is most worth evaluating next, reducing wasted generations.
- **Ensembles** — BO’s uncertainty estimates complement ensemble disagreement as a signal of when to explore versus exploit.

### Limitations and Caveats

- **Dimensionality** — classical Gaussian-process BO degrades in very high dimensions; use additive kernels, random embeddings, or trust-region methods, or keep the searchable parameters tightly scoped by the design system.
- **Discrete / combinatorial spaces** — many UI choices are categorical; need mixed-variable BO or careful encoding.
- **Cold start** — needs a few initial random or space-filling evaluations.
- **Objective design** — garbage-in-garbage-out; the metrics must actually capture what “better UI” means.
- **Agency** — pure optimizer-led loops can reduce designer/agent sense of control; cooperative or “BO-as-assistant” patterns mitigate this.
- **Computational overhead** — surrogate fitting is cheap compared with UI evaluation, but not free if you run many parallel loops.

### Suggested Starting Points

- Pick one high-value, low-dimensional subspace (e.g., spacing/density parameters of a core card or form pattern, or the configuration knobs of a stateful button / empty-state decision tree).
- Instrument evaluation so it is mostly automatic via Storybook + existing metrics.
- Run a small BO loop (10–30 evaluations) and inspect both the best points and the uncertainty surface.
- Later expand to preferential feedback, multi-objective, or natural-language intervention.
- Consider libraries such as BoTorch, Ax, or specialized HCI-oriented BO tooling; many research prototypes already exist for design optimization.

**In summary**: Bayesian Optimization supplies a principled, uncertainty-aware way to search the remaining continuous or mixed parameters *inside* the constrained foundation you are building. It turns expensive UI evaluations into an efficient sequential experiment, complements decision trees and ensembles, and can sit inside or alongside your multi-agent AutoResearch loops. Used carefully, it helps agents and humans discover high-performing configurations faster while still respecting the determinism and structure that make reliable generation possible in the first place.

Gradient boosting

**Gradient Boosting** (and its modern implementations—XGBoost, LightGBM, CatBoost, etc.) is a powerful ensemble technique that builds a strong predictive model by sequentially adding weak learners (usually shallow decision trees). Each new tree is trained to correct the residual errors of the current ensemble, guided by gradient descent on a chosen loss function.

It sits in the same family as Random Forests but differs in important ways: Random Forests train trees independently in parallel and average them (bagging); Gradient Boosting trains trees sequentially and focuses on the hardest remaining errors (boosting). The result is often higher accuracy, especially on structured/tabular data, at the cost of being more sensitive to hyperparameters and more prone to overfitting if not regularized.

### Core Mechanics (Briefly)

1. Start with a simple base model (often the mean or a constant).
2. Compute the negative gradient of the loss with respect to the current predictions (the “pseudo-residuals”).
3. Fit a new weak tree to those residuals.
4. Add a scaled version of the new tree to the ensemble.
5. Repeat until a stopping criterion is met.

Modern variants add regularization, column/row subsampling, histogram-based splitting, ordered boosting (CatBoost), and excellent handling of categorical features. They also provide fast prediction, built-in feature importance, and support for ranking, multi-class, and custom losses.

### Relevance to Ground-Up, Agent-Driven UI Design

Gradient Boosting is particularly useful once you have (or can generate) structured tabular data about designs, users, or evaluation outcomes. It complements the deterministic foundation (tokens, components, state machines, graphs, decision trees) and the other techniques we have discussed.

#### 1\. High-Accuracy Prediction of UI Outcomes

Train models to predict:

- Task success probability, completion time, or error rate for a given configuration.
- User preference or aesthetic scores.
- Accessibility risk or cognitive-load proxies.
- Which design-system variant (or decision-tree leaf) will perform best under a given context (device, user segment, data shape, journey stage).
- Likelihood that a generated UI will pass your AutoResearch evaluation metrics.

Because boosting focuses on residual errors, it often outperforms a single decision tree or even a Random Forest when the relationships are complex and you have enough labeled examples.

#### 2\. Feature Importance and Insight

Gradient-boosted models yield clear feature-importance rankings (gain, split count, SHAP values, etc.). This is extremely valuable:

- Discover which design parameters, context variables, or agent decisions most influence success.
- Feed those insights back into the design system—tighten decision trees, adjust token ranges, or prioritize which parts of the graph or state machines need more coverage.
- Help agents and humans understand *why* certain configurations succeed or fail.

#### 3\. Ranking and Preference Learning

Many UI problems are ranking problems (“which of these five variants is best?”). Gradient boosting has strong ranking objectives (LambdaMART-style, pairwise, listwise). You can train on pairwise preference data from designers, users, or evaluation agents and then use the model to rank new candidates quickly.

#### 4\. Integration with the Existing Stack

- **On top of decision trees**: A boosted ensemble of trees is a natural evolution of the explicit decision trees you already maintain. The explicit trees remain the interpretable, deterministic core; the boosted model acts as a high-accuracy, data-driven advisor or soft constraint.
- **With Random Forests**: Forests give robust, low-variance baselines and good uncertainty estimates via tree disagreement. Gradient boosting often gives higher peak accuracy. You can use both (or stack them).
- **With Bayesian Optimization**: BO is excellent for sequential, expensive search when data is scarce. Once you have accumulated evaluations, a gradient-boosted model can serve as a fast surrogate or as a way to warm-start / constrain the BO search space. Conversely, BO can tune the hyperparameters of the boosting model itself.
- **With agents and AutoResearch**:
	- Agents propose or generate UI configurations.
		- The boosted model scores or ranks them before expensive full evaluation.
		- Only high-scoring candidates proceed to Storybook rendering, a11y checks, visual metrics, or human review.
		- Successful/failed outcomes are logged and periodically used to retrain the model, creating a closed improvement loop.
- **With graphs and state machines**: Features derived from the current node in a journey graph, the active state of a machine, or graph-derived statistics become powerful inputs to the model.

#### 5\. Personalization and Adaptive Interfaces

Once you have per-user or per-segment data, gradient boosting (especially with categorical feature support) is a strong choice for predicting the best configuration for a given user while still respecting global design-system constraints.

### Practical Workflow Suggestions

1. **Start collecting structured data early**  
	Every AutoResearch trial, Storybook evaluation, usability test, or production analytics event should log a feature vector (design parameters, context, agent decisions) + outcome labels.
2. **Begin with a simple baseline**  
	A well-regularized LightGBM or XGBoost model on a modest dataset already provides value as a ranking/filtering layer.
3. **Use SHAP or similar for explanations**  
	Require agents to surface the top contributing features when they act on a model prediction. This keeps the system inspectable.
4. **Treat the model as advisory, not absolute**  
	Hard constraints (tokens, required states, accessibility gates, graph consistency) stay deterministic. The boosted model influences prioritization, ranking, and soft recommendations.
5. **Close the loop**  
	Periodically retrain on new data. Use the model’s error analysis to discover missing decision-tree branches, under-covered states, or weak areas of the design system.
6. **Hyperparameter and architecture search**  
	Bayesian Optimization or even simple grid/random search can tune the boosting model; the same infrastructure you use for UI parameters can optimize the meta-model.

### Strengths and Limitations in This Context

**Strengths**

- State-of-the-art accuracy on tabular design/outcome data.
- Excellent feature importance and explainability tooling.
- Fast inference once trained—suitable for ranking many agent-generated candidates.
- Handles mixed continuous/categorical features well (especially CatBoost).
- Natural fit for ranking and preference data common in design review.

**Limitations**

- Needs a reasonable amount of labeled data; pure cold-start is better served by explicit decision trees, rules, or Bayesian Optimization.
- Sequential training makes it harder to parallelize than Random Forests.
- Can overfit if regularization and early stopping are neglected.
- Less naturally probabilistic than Gaussian-process BO (though calibration and quantile regression variants exist).
- Not a replacement for the structural constraints (state machines, graphs, tokens); it works best *on top of* them.

### Comparison Snapshot

| Technique | Best when… | Data need | Interpretability | Sequential search | Peak accuracy on tabular |
| --- | --- | --- | --- | --- | --- |
| Decision Tree | Explicit rules, full transparency | Low | Highest | No | Lower |
| Random Forest | Robustness, uncertainty via votes | Medium | High | No | High |
| Gradient Boosting | Highest accuracy, ranking, importance | Medium–High | High (with SHAP) | No | Very High |
| Bayesian Optimization | Expensive evaluations, few trials | Very Low | Medium | Yes | N/A (search method) |

**Bottom line**: Gradient Boosting gives you a high-performance, explainable predictive layer that learns from the outcomes of your constrained, agent-driven design process. It turns accumulated evaluation data into better ranking, better prioritization, and clearer insights about which design decisions matter most—while leaving the hard determinism of tokens, components, state machines, and graphs intact. Used this way, it strengthens the overall system’s ability to produce production-ready UI efficiently and reliably.

So it seems that user stories and flows docs first? But what's upstream? How do you arrive or iterate towards those? And how do you know when it's done? How do you leverage LLMs at that or prior steps?

**Yes — user stories and flow documentation are important, but they are not the true starting point.** They sit in the middle of a larger chain. Treating them as the first artifact usually produces brittle or incomplete foundations because the harder upstream questions have not been answered (or even asked) with enough rigor.

### The Real Upstream Layers

A practical order that works well with both humans and LLM agents looks roughly like this:

1. **Problem / Opportunity space**  
	What real human or business pain exists? What evidence do we have? What constraints (technical, regulatory, market, brand) already exist?
2. **Vision, goals, and success criteria**  
	What does “done” and “successful” look like at the product level? What metrics or qualitative outcomes matter? What are the non-negotiables?
3. **Users, contexts, and jobs-to-be-done**  
	Who is this for (and who is it *not* for)? In what situations do they encounter the problem? What are they trying to achieve, and what does progress look like for them?
4. **Principles and constraints**  
	Design principles, accessibility baselines, brand/voice rules, technical constraints, ethical boundaries, performance budgets, etc. These become the hard rails for everything downstream.
5. **Information architecture and high-level conceptual model**  
	What are the core objects, relationships, and mental models? How should the domain be carved up?
6. **Only then: user journeys, flows, and stories**  
	Now the stories and flows have something solid to stand on. They become concrete expressions of the upstream decisions rather than the primary source of truth.
7. **UI-level artifacts** (the territory we have been discussing): tokens, component library, state machines, decision trees, graphs, Storybook, evaluation metrics, etc.

Skipping or rushing layers 1–5 is the most common reason later agent-generated UI feels coherent locally but incoherent or incomplete globally.

### How You Arrive at and Iterate Toward the Upstream Artifacts

This is rarely a clean waterfall. It is an iterative discovery loop that mixes research, synthesis, and progressive formalization.

**Common inputs**

- Stakeholder interviews and existing strategy documents
- User research (interviews, observation, support tickets, analytics, sales calls)
- Competitive and analogous product analysis
- Domain expertise and regulatory requirements
- Technical reality (what the current stack or data model can support)
- Business constraints and opportunities

**Synthesis activities**

- Affinity mapping / clustering of pains and opportunities
- Drafting and refining problem statements
- Creating provisional personas or, better, job stories / situation-based descriptions
- Defining success metrics and leading indicators
- Writing design principles and “we will / we won’t” statements
- Sketching conceptual models and high-level IA
- Running lightweight experiments or prototype tests to falsify assumptions

**Iteration style** Treat every upstream artifact as a hypothesis. Keep them living documents. New research, failed experiments, or shifts in strategy should trigger updates. The goal is not perfect documents on day one; it is *sufficiently clear and stable* constraints that downstream work (stories, flows, and eventually agent-driven UI) can proceed without constant foundational rework.

### How You Know When It Is “Done Enough”

There is no absolute finish line, only diminishing returns and readiness criteria. Useful signals:

- You can state the core problem and target users in a few crisp sentences that multiple stakeholders agree on.
- Success criteria are specific enough that you could later judge whether the product moved the needle.
- Design principles and hard constraints are explicit and have already ruled out some tempting but wrong directions.
- The conceptual model and high-level IA feel stable enough that major objects and relationships are unlikely to be renamed or restructured every week.
- You can write a small set of high-value user journeys/stories that feel grounded rather than invented.
- Further research is producing mostly confirmatory or marginal insights rather than fundamental surprises.
- The team (and the agents) can answer “why are we building this?” and “what does good look like?” without long debates.

A practical test: hand the current upstream package to a strong LLM agent (or a new team member) and ask it to generate candidate flows or stories. If the outputs are mostly on-target and the gaps are clear and addressable, you are probably ready to move downstream. If the agent keeps inventing contradictory goals or user needs, the upstream layer is still too vague.

### Leveraging LLMs at and Before the User-Story Stage

LLMs are extremely useful here when given the right role and constraints. They are less reliable as the primary source of truth and more reliable as accelerators, synthesizers, critics, and formalizers.

**High-leverage uses**

- **Research synthesis**: Feed interview notes, support tickets, analytics summaries, or competitive teardowns and ask for clustered insights, tension maps, or draft problem statements. Always verify against primary sources.
- **Hypothesis generation**: “Given this evidence, what are the strongest alternative problem framings or user segments we might be missing?”
- **Drafting and refinement**: Turn rough notes into clear problem statements, design principles, job stories, or success metrics, then critique them for vagueness, internal contradiction, or missing edge cases.
- **Competitive and analogous analysis**: Rapid structured comparison of how other products solve adjacent problems, with explicit extraction of patterns and anti-patterns.
- **Conceptual model exploration**: Propose candidate domain objects and relationships; generate alternative IA sketches; stress-test them with “what happens if…” scenarios.
- **Gap and risk detection**: “What important user situations or failure modes are not yet covered by these principles and journeys?”
- **Multi-agent critique**: One agent drafts, another attacks assumptions, a third checks alignment with stated business goals or accessibility principles.
- **Formalization for downstream agents**: Convert the upstream decisions into structured artifacts (JSON/YAML principles, constraint lists, evaluation rubrics) that later coding and design agents can load as hard context.

**Lower-leverage or risky uses**

- Asking an LLM to invent the core problem or primary users from almost no evidence.
- Treating a single long generated document as finished strategy.
- Skipping primary research because “the model already knows.”

**Practical pattern**  
Maintain a living “strategy context” package (problem, goals, users/jobs, principles, constraints, conceptual model). Use LLMs heavily to draft, expand, critique, and reformat it. Keep humans responsible for the final judgment calls and for grounding everything in real evidence. Once the package is stable enough, it becomes the highest-priority context injected into every subsequent agent (story writing, flow design, component work, evaluation).

### Closing the Loop

Upstream artifacts should not be frozen forever. As you build UI, run evaluations, and observe real usage, feed the learning back:

- New failure modes → new principles or constraints.
- Unexpected user behavior → refined jobs or segments.
- Metrics that do not move → revisited success criteria.

The same AutoResearch-style keep/discard discipline can eventually apply to the strategy layer itself, though the evaluation signals are slower and more qualitative.

**Summary**  
User stories and flows are necessary but mid-stream. Upstream of them sit problem definition, goals, users/jobs, principles, and conceptual models. You reach those through iterative research + synthesis, using evidence as the ground truth and LLMs as powerful assistants for synthesis, drafting, critique, and formalization. You know you are ready to move on when the upstream package is clear enough, stable enough, and constraining enough that downstream work (including agent-generated UI) stays coherent. The more rigorously you front-load and maintain that layer, the more deterministic and successful everything that follows becomes.

Explore LLM multi-agent critique patterns

**LLM multi-agent critique patterns** are structured ways of using multiple specialized (or diverse) language-model agents to evaluate, challenge, improve, or gate the output of other agents or of a primary generator. Instead of relying on a single model’s self-critique, the system deliberately introduces multiple perspectives, disagreement, and aggregation so that errors, omissions, and shallow reasoning are more likely to surface.

In the ground-up UI design process we have been discussing, critique agents become a core part of the evaluation layer that sits on top of the deterministic foundation (tokens, components, Storybook, state machines, graphs, decision trees, metrics). They help turn “does this look okay?” into a more reliable, multi-dimensional judgment.

### Why Critique Needs Multiple Agents

A single LLM asked to “review this UI” or “critique this flow” tends to:

- Be overly agreeable or overly harsh depending on prompt framing.
- Miss entire categories of issues (accessibility one run, visual hierarchy the next).
- Rationalize its own earlier generation if it is both generator and critic.
- Collapse to generic advice.

Multi-agent critique counters these failure modes by enforcing role separation, forced disagreement, and structured aggregation.

### Core Patterns

**1\. Specialized role critics (most practical for UI)**  
Assign distinct lenses. Each agent receives the same artifact (screen, component, flow, Storybook story, state machine, etc.) plus a focused brief:

- Accessibility critic (WCAG, keyboard, screen-reader, contrast, focus order)
- Design-system / token adherence critic
- Visual hierarchy & density critic
- Interaction & state completeness critic (loading, empty, error, disabled, edge cases)
- Content & microcopy critic (tone, clarity, inclusivity)
- Performance & technical critic (bundle impact, layout thrashing, responsive behavior)
- User-journey / job-to-be-done alignment critic
- Security / privacy / trust critic (where relevant)

Outputs are structured (severity, location, evidence, suggested fix). A later aggregator or judge synthesizes them.

**2\. Generator–Critic / Author–Reviewer loops**  
One agent proposes; one or more agents only critique. The generator then revises. This can be single-turn or multi-round. Variants include:

- Critic must find a minimum number of issues.
- Critic is forbidden from rewriting; it can only point out problems.
- Multiple sequential critique rounds with increasing strictness.

**3\. Debate / adversarial patterns**  
Two or more agents take opposing stances (“this design is production-ready” vs “it is not”) or are assigned pro/con roles on specific dimensions. A judge or voting mechanism decides. Structured disagreement (requiring evidence) works better than free-form debate. Pure multi-agent debate does not always outperform a strong single-pass critic; the value comes from genuine diversity of perspective and explicit disagreement mechanisms rather than from simply adding more agents or rounds.

**4\. Hierarchical / committee patterns**

- Parallel specialists → judge/aggregator that filters noise, resolves conflicts, and produces a final verdict or ranked list of issues.
- Delegator that splits the artifact (different screens, different concern areas) and routes to appropriate critics.
- Meta-critic that evaluates the quality of the other critics’ feedback (signal-to-noise, actionability, false positives).

**5\. Self-consistency + ensemble critique**  
Multiple independent critiques (same role, different temperature or slight prompt variation) are generated and then aggregated by majority, weighted vote, or another model. This is closer to the Random-Forest-style ensembling discussed earlier.

**6\. Red-team / dissent injection**  
An explicit “catfish” or adversarial agent whose only job is to break consensus and surface minority risks. Useful against premature agreement.

### Topologies and Communication

- **Centralized**: Orchestrator calls critics, collects results, decides next action.
- **Sequential pipeline**: Generator → Critic A → Critic B → … → final gate.
- **Parallel then aggregate**: All critics run concurrently; judge merges.
- **Iterative debate**: Limited rounds of proposal ↔ critique with shared memory.
- **Graph / stateful**: Critics can read the current design-system graph, active state machine, or journey position as additional context.

Stateful orchestration (LangGraph-style or equivalent) tends to be more controllable than purely conversational multi-agent setups for production UI pipelines.

### Applying These Patterns to Your UI Process

**Upstream (strategy, principles, stories, flows)**  
Critics can attack problem statements for vagueness, check journey coverage against jobs-to-be-done, or red-team principles for internal contradictions.

**Mid-stream (component & screen generation)**  
After an agent produces a component + Storybook stories + state machine:

1. Run the specialized critic suite against the code, rendered screenshots, accessibility tree, and declared states.
2. Require evidence tied to your concrete metrics (token violations, missing states, a11y axe results, hierarchy problems).
3. Aggregator produces a structured report and a keep / revise / discard recommendation.
4. Only candidates that pass a threshold proceed; others go back for targeted revision.

**Evaluation / AutoResearch loops**  
Critique agents supply the qualitative and multi-dimensional signal that pure numeric metrics miss. Their structured output can itself become training data for later gradient-boosted or ranking models.

**Design-system maintenance**  
Critics can review proposed new tokens, components, or decision-tree branches for consistency with existing principles and graphs.

### Practical Design Choices That Matter

- **Force structured output** (JSON with severity, category, evidence, suggestion). Free-form prose is harder to aggregate and act on.
- **Ground critics in artifacts** they can actually inspect: code, Storybook stories, screenshots, computed styles, accessibility tree, state-machine definition, decision-tree path.
- **Make disagreement explicit**. Require critics to justify why they disagree with the generator or with each other.
- **Control cost and latency**. Parallel specialists + a lightweight judge is usually better than long free-form debates. Not every generation needs the full suite.
- **Calibrate and measure**. Track false-positive rates, missed issues, and whether critique actually improves final metrics. Some recent studies show that naïve multi-agent debate does not reliably beat a well-prompted single strong critic; specialization and evidence requirements matter more than agent count.
- **Preserve human (or high-level agent) oversight** on high-stakes or high-uncertainty cases. Use critique confidence / disagreement level as a signal for escalation.
- **Version the critic prompts and roles** the same way you version the design system. AutoResearch can even improve the critics themselves.

### Common Failure Modes

- Groupthink / premature consensus (all agents converge on the same shallow critique).
- Noise overload (too many low-value comments).
- Role collapse (specialists drift into general review).
- Generator ignoring critique or performing superficial fixes.
- High token cost with little quality gain.
- Critics that cannot see the actual rendered UI or accessibility tree and therefore hallucinate issues.

Mitigations include dissent agents, structured schemas, tool use (browser, Storybook, axe), confidence thresholds, and periodic human calibration of the critic suite.

### Minimal Viable Critique Setup for UI Work

1. Generator produces component / screen / flow.
2. Three to five parallel specialist critics (a11y, design-system, states/interactions, hierarchy/content).
3. Lightweight judge that deduplicates, ranks by severity, and emits a clear pass/revise/fail plus top actionable issues.
4. Optional revision loop (generator fixes only the ranked issues).
5. Final numeric + critique gate before the change is kept in the AutoResearch sense.

This pattern plugs directly into the evaluation side of the keep/discard loops, Storybook-centric workflows, and the broader determinism strategy. It turns critique from a vague “make it better” instruction into a reliable, multi-perspective, evidence-oriented control layer—exactly what is needed when LLM agents are generating production-facing UI.

Explore LangGraph stateful orchestration

**LangGraph** is a low-level orchestration framework (from the LangChain team) for building **stateful, multi-step, potentially cyclic** LLM applications and multi-agent systems. It models workflows as explicit graphs in which nodes perform work, edges define transitions (including conditional and cyclic ones), and a shared, typed state object flows through the entire execution. Persistence, human-in-the-loop interrupts, and recovery from failure are first-class.

It is especially well-suited to the kind of controlled, evaluable, multi-agent processes we have been discussing for ground-up UI design.

### Core Concepts

**State**  
You declare a schema (usually a TypedDict or Pydantic model) that represents everything the workflow needs to remember: messages, current design artifacts, critique reports, evaluation scores, flags such as approved or needs\_revision, references to Storybook stories, active state-machine definitions, etc. Nodes return partial updates; LangGraph merges them into the shared state according to reducers you define (e.g., append to a list of critiques, overwrite a score).

**Nodes**  
Ordinary Python (or JS) functions or runnable components. A node can call an LLM, invoke tools (browser, Storybook renderer, axe-core, file system), run deterministic code, or call another subgraph. Each node reads from state and writes updates back.

**Edges and conditional routing**

- Normal edges: always go from A to B.
- Conditional edges: a routing function inspects the current state and decides the next node (or set of nodes). This is how you implement “if critique severity > threshold → revise, else → accept”, “if a11y violations remain → accessibility specialist again”, etc.
- Cycles are native and intentional: generator → critics → judge → (loop back to generator or proceed).

**Checkpointers / persistence**  
After (or during) node execution the full state can be snapshotted to SQLite, Postgres, Redis, etc. This gives:

- Durability across process restarts or long-running jobs.
- Time-travel / replay.
- Human-in-the-loop: the graph can interrupt(), surface the current state for review or editing, then resume from the exact checkpoint.
- Multi-turn or multi-day workflows (e.g., a design review that waits for human feedback).

**Additional capabilities**  
Streaming of intermediate events, parallel fan-out/fan-in (via the Send API), subgraphs for modular multi-agent teams, integration with LangSmith for tracing and visualization, and production deployment options.

LangGraph is deliberately low-level: you own the control flow instead of relying on opaque agent loops. This matches the “front-load decisions and move toward determinism” philosophy.

### Why It Fits Multi-Agent Critique and UI Design Orchestration

The patterns we explored earlier map cleanly onto LangGraph:

**Specialized critique suite**

- Nodes: accessibility\_critic, design\_system\_critic, state\_completeness\_critic, hierarchy\_critic, content\_critic, etc.
- Parallel execution of the critics, results written into a shared critiques list in state.
- A judge or aggregator node that deduplicates, ranks by severity, and sets flags such as pass, revise, or reject.
- Conditional edge: if revise → route back to the generator node with the structured critique report; if pass → proceed to Storybook update / commit / next stage.

**Generator–critic loops with bounded cycles**  
State tracks revision count or remaining budget. Conditional edges prevent infinite loops and enforce escalation to a human after N failed attempts.

**Hierarchical / orchestrator-worker**  
An orchestrator node plans which screens or components need work, then uses dynamic Send to spawn worker subgraphs (each worker can itself be a small generator + critique graph). Results are collected back into the parent state.

**Human-in-the-loop gates**  
At high-stakes points (new design-system component, major flow change, final production candidate) the graph interrupts, presents the current artifact + critique summary + metrics, and waits for approval, rejection, or manual edits before resuming.

**Integration with the rest of the foundation**  
State can hold or reference:

- Current design tokens and component library version
- Active state machines and decision trees
- Graph of the design system or user journeys
- Storybook story IDs and rendered screenshots
- Numeric evaluation scores and AutoResearch experiment logs

Nodes can call deterministic tools (render Storybook, run axe, compute visual diffs, validate against tokens) so that critique is grounded rather than purely linguistic.

**AutoResearch-style keep/discard**  
The entire experiment (propose change → generate → critique → evaluate metrics → decide keep/discard) becomes a durable graph. Checkpoints give you a full audit trail of every intermediate state, which is ideal for later analysis or for training ranking/gradient-boosting models on outcomes.

### Typical Graph Shape for UI Work

```markdown
START
  → load_context (design system, principles, current stories)
  → generator (produce component / screen / flow + stories)
  → parallel_critics (fan-out)
  → aggregator / judge
  → conditional:
       - revise → generator (with critique feedback)  [cycle, with budget]
       - human_review → interrupt / wait
       - accept → update_storybook + update_metrics + END
```

Subgraphs can encapsulate “single component refinement” or “full page flow” so the top-level graph stays readable.

### Strengths for This Domain

- Explicit, inspectable control flow (the graph *is* the orchestration policy).
- Native support for the cycles that critique and refinement require.
- Durable state and human interrupts match real design processes that span hours or days.
- Easy to mix LLM nodes with deterministic tool nodes (the grounding that keeps agents honest).
- Observability: every state transition can be traced, which is invaluable when debugging why a particular UI candidate was accepted or rejected.
- Composes with the determinism strategy: the graph encodes the allowed paths; state carries the constrained artifacts; critics and metrics supply the evaluation signal.

### Limitations and Practical Considerations

- Higher conceptual overhead than a simple ReAct loop or a linear chain. Worth it once you need cycles, persistence, or multi-actor coordination; overkill for one-shot generation.
- You must design the state schema carefully. Poorly chosen reducers or overly large state objects become painful.
- Parallelism and dynamic fan-out are powerful but require thought about merging results and error handling.
- Cost and latency grow with the number of critic nodes and revision rounds; use conditional routing and early-exit logic aggressively.
- Persistence is checkpoint-based rather than a full durable-execution engine (like Temporal). For most UI design loops this is sufficient; extreme multi-day or multi-service requirements may need additional infrastructure.

### Getting Started Recommendations

1. Model a minimal vertical slice: generate one component → three specialist critics → judge → conditional revise/accept.
2. Put the important artifacts (code, story definition, critique report, scores) into typed state.
3. Add a checkpointer early so you can inspect and resume.
4. Instrument with tracing so you can see exactly which path was taken and why.
5. Gradually expand to parallel critics, human gates, and integration with Storybook / browser tools / your evaluation metrics.
6. Keep the graph itself under version control and treat changes to routing logic with the same care as changes to the design system.

**In the broader picture**, LangGraph gives you a concrete, production-capable way to implement the multi-agent critique patterns, AutoResearch loops, and staged design workflows we have discussed. It turns the abstract desire for “stateful, controllable, evaluable agent orchestration” into an explicit graph with durable state—precisely the kind of structure that helps LLM agents stay reliable when building production-ready UI from the ground up.