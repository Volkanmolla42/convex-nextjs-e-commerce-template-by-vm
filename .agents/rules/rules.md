---
trigger: always_on
---

# 0. Rule Hierarchy (Strict Authority Order)

If any rules conflict, follow this order:

1. Pre-Execution Task Declaration
2. Security Baseline
3. Architecture & Data Layer Rules
4. Performance Constraints
5. Code Quality Gate
6. Design & UI Rules
7. DOM & Tailwind Discipline
8. Routing Rules
9. Formatting Rules

No rule may be ignored.

---

# 1. Project Context & Autonomy Level

- This project currently has no active users.
- Breaking changes are allowed.
- Backward compatibility is NOT a priority.
- Optimize for clean architecture and long-term maintainability.
- You are expected to take initiative in:
  - Refactoring
  - Folder restructuring
  - Component abstraction
  - Removing dead code
- Do not ask unnecessary confirmation for safe structural improvements.
- Avoid overengineering.

Autonomy Level: HIGH  
Confirmation Required: Only for destructive data operations.

---

# 1.1 Simple Task Execution Rule (Mandatory)

- For simple, low-risk tasks (single-file text/style/layout edits), apply direct code changes immediately.
- Do not run skill workflows for simple tasks.
- Do not run MCP retrieval/search tools for simple tasks when the target file is already known.
- Use skills or MCP tools only when discovery, cross-file analysis, or unclear file ownership is required.

---

# 2. Pre-Execution Task Declaration (MANDATORY)

Before writing any code, declare tasks.

## Single Task

```
1: I am designing the homepage.
```

Then immediately begin implementation.

## Multiple Tasks

```
1: Task one description
2: Task two description
```

Rules:

- Execute strictly in order.
- Never merge tasks silently.
- Never skip declaration.
- Never start coding before declaring.
- Never partially implement a later task before completing the current one.

Highest priority rule.

---

# 3. Security Baseline (Non-Negotiable)

- Never expose secrets.
- Never hardcode API keys.
- Never trust client input.
- Always validate server-side.
- Sanitize external data.
- Prefer server-side execution for sensitive logic.
- Use least-privilege principles.
- Do not log sensitive information.
- Avoid insecure direct object references.
- Avoid unnecessary client-side data exposure.

If unsure → default to secure option.

---

# 4. Architecture & Data Layer Rules

## 4.1 Server vs Client Responsibility

Server:

- Initial data loading
- SSR optimization
- Sensitive logic
- Auth-sensitive operations

Client:

- Reactive UI
- User interaction
- Mutations
- State transitions

Never mix responsibilities.

---

# 5. Convex + Next.js Pattern

## 5.1 Server Component Pattern

- `preloadQuery(api.<file>.<queryName>, {...})`
- `preloadedQueryResult(preloaded)`

Server handles initial render.

## 5.2 Client Component Pattern

- `"use client"`
- `Preloaded<typeof api.<file>.<queryName>>`
- `usePreloadedQuery(preloaded)`

Client handles reactivity.

## 5.3 Mutations

```
const mutation = useMutation(api.<file>.<mutationName>)
void mutation({ ... })
```

Always import API from:

```
@/convex/_generated/api
```

---

# 6. Convex Action Rules

- Use `action` for public.
- Use `internalAction` for backend-only.
- Define args with `v`.
- Never use `ctx.db` directly.
- Use:
  - `ctx.runQuery`
  - `ctx.runMutation`

If using Node built-ins:

```
"use node";
```

Do not mix `"use node";` with queries/mutations in the same file.

---

# 7. Performance Constraints

- Avoid unnecessary re-renders.
- Avoid redundant data fetching.
- Minimize client bundle size.
- Lazy load when appropriate.
- Do not fetch large datasets unnecessarily.
- Prefer server rendering when possible.
- Avoid deeply nested component trees.
- Avoid prop drilling beyond 2 levels (abstract instead).
- Use memoization only when measurable benefit exists.
- Optimize before scaling, not after breaking.

Performance is proactive, not reactive.

---

# 8. Code Quality Gate

Before completing any implementation, ensure:

- No dead code.
- No unused imports.
- No console logs.
- No commented-out legacy blocks.
- No duplicated logic.
- No unclear variable names.
- No mixed responsibility components.
- No architectural shortcuts.

## 8.1 Lint Execution Discipline

- Do not run `pnpm run lint` for simple, low-risk, single-file visual or text-only edits.
- Run lint only when truly necessary, such as:
  - Multi-file refactors
  - Logic changes
  - Type/interface changes
  - Import/export restructuring
  - Build, runtime, or lint-risking updates
- If uncertain, prefer targeted checks first (file-level) before full-project lint.

Code must be:

- Predictable
- Readable
- Deterministic
- Explicit over implicit

If refactor improves clarity → refactor immediately.

---

# 9. Refactor Trigger Conditions

Immediate refactor is required if:

- A component exceeds reasonable complexity.
- Logic is repeated more than twice.
- Server and client logic are mixed.
- A file exceeds clean readability.
- Naming becomes ambiguous.
- Data flow becomes unclear.

Refactor early.  
Do not postpone technical debt.

---

# 10. Design & UI System Rules

## 10.1 Mobile-First (Mandatory)

- Always design mobile-first.
- Enhance progressively.

## 10.2 Design Language Compliance

- Follow existing spacing.
- Follow typography scale.
- Follow color system.
- Do not invent new patterns unnecessarily.

## 10.3 UI Text Minimalism (Strict)

Never add:

- Subtitles
- Descriptive helper texts
- Marketing-style filler

Example:

❌
```
<h1>Siparişlerim</h1>
<p>Sipariş geçmişinizi görüntüleyin ve takip edin.</p>
```

✅
```
<h1>Siparişlerim</h1>
```

UI must be short and functional.

## 10.4 No Hardcoded Design Values (Strict)

- Do not use arbitrary Tailwind values for routine UI styling.
- Forbidden by default:
  - `text-[...]`
  - `tracking-[...]`
  - `leading-[...]`
  - `p-[...]`, `m-[...]`, `gap-[...]`
  - Any ad-hoc pixel-based utility that bypasses the design scale
- Use Tailwind scale tokens first:
  - Typography: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`
  - Letter spacing: `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`
  - Spacing: `p-*`, `m-*`, `gap-*`

If a non-standard value is truly required:

1. Add it to the shared theme/token system first.
2. Reuse via semantic class naming.
3. Do not inline one-off raw values in component markup.

Default policy: no hardcoded visual values unless there is a documented system-level exception.

If any file violates these rules, fix it immediately without asking for confirmation, while keeping visual intent aligned with design language.

---

# 11. Component & Framework Rules

## Package Manager

- Always use `pnpm`
- Never use `npm`

## UI Components

- Always use shadcn components.
- Do not recreate primitives if shadcn has them.

## Navigation

- Always use Next.js `Link`.
- Never use `<a>` for internal routes.

---

# 12. Routing Rules

- All routes must be Turkish.
- Lowercase only.
- Meaningful slugs.

✅ `/hesabim`  
❌ `/account`

---

# 13. Typography & Headings

- Use semantic `h1–h6`.
- No inline font styling.
- No ad-hoc font overrides.
- If non-heading needs heading style → `font-heading`.

Correct:

```tsx
<h1>Hesabım</h1>
```

Incorrect:

```tsx
<h1 style={{ fontFamily: "&apos;Monesa&apos;" }}>Hesabım</h1>
```

---

# 14. Formatting Rules

- Always use `&apos;` for apostrophe.
- No unnecessary explanations between code blocks.
- Keep outputs implementation-focused.
- Avoid verbosity unless explicitly requested.

---

# 15. Structural Discipline

- No architectural shortcuts.
- No unclear abstraction layers.
- No implicit magic behavior.
- No hidden side effects.
- Explicit data flow only.
- Clear separation of concerns.
- Clarity > Cleverness.
- Maintain deterministic system behavior.

---

# 16. AI Decision-Making Protocol

When implementing:

1. Prefer secure over convenient.
2. Prefer simple over clever.
3. Prefer explicit over implicit.
4. Prefer maintainable over fast-to-write.
5. Prefer refactor over patch.
6. Prefer server authority over client trust.

If uncertain:

- Choose safest.
- Choose cleanest.
- Choose most maintainable.

Never guess silently.  
Never cut corners silently.  
Never bypass architecture rules.

---

# 17. DOM Minimalism & Structural Integrity (Strict)

## 17.1 No Unnecessary Wrapper Elements

Do NOT introduce extra containers unless they serve a clear structural purpose.

Allowed only if they:

- Create a layout boundary
- Apply required spacing separation
- Apply semantic grouping
- Are required for conditional rendering
- Are required for animation or state isolation

Otherwise → remove.

## 17.2 Flatten When Possible

Prefer shallow structure.

Avoid decorative wrappers.  
Avoid multi-level nesting without reason.

## 17.3 Avoid Double Flex Wrapping

Do not nest flex containers unless direction or alignment differs.

If parent is:

```
flex flex-col gap-6
```

Do not add another identical flex container unless structurally required.

## 17.4 Structural Review Rule

Before finalizing UI:

- Remove unnecessary wrappers.
- Collapse redundant flex containers.
- Remove layout duplication.
- Ensure minimal DOM depth.

Target:

- Shallow tree
- Clear hierarchy
- No decorative containers

---

# 18. Tailwind Utility Discipline (Strict)

This section operates under Section 10.4 (No Hardcoded Design Values).

## 18.1 Minimal Utility Principle

Use the minimum number of Tailwind classes required.

Do NOT:

- Stack redundant spacing utilities.
- Apply padding/margin to both parent and child unnecessarily.
- Add responsive variants without clear layout change.
- Combine utilities that achieve identical results.

## 18.2 Single Responsibility Styling

Parent:

- Layout (flex/grid/gap/padding)

Child:

- Content styling (text size, color, weight)

Do not distribute layout logic across deep nesting.

## 18.3 Avoid Class Explosion

If className becomes visually noisy:

- Extract component
OR
- Abstract layout wrapper
OR
- Refactor structure

## 18.4 Responsive Discipline

Only use breakpoints when layout changes.

Do NOT:

- Add breakpoints “just in case”
- Duplicate identical values across breakpoints
- Override without change

## 18.5 Spacing Consistency

Prefer:

- `gap-*` over child margins
- Parent padding over child margin
- Tailwind scale tokens only

Avoid arbitrary pixel values.

## 18.6 Refactor Trigger (Tailwind)

Refactor if:

- className becomes hard to scan
- Breakpoint duplication appears
- Same utility pattern repeated >2 times
- Layout utilities appear deep in children

## 18.7 Final Audit Before Completion

- Remove redundant utilities
- Remove unnecessary breakpoints
- Collapse repeated spacing
- Simplify class chains
- Ensure mobile-first correctness

Target:

- Clean className
- Predictable layout
- Minimal override logic
- No styling noise

---

# 19. Component Complexity Budget

- A component must remain logically readable.
- If a component:
  - Mixes layout + data + heavy logic
  - Becomes visually long and dense
  - Becomes hard to scan
  - Exceeds reasonable vertical length

→ Extract subcomponents.

Separate:

- Layout components
- Data components
- Interactive components

Keep responsibilities isolated.

---

# 20. Self-Audit Checklist (MANDATORY Before Finalizing)

Before completing any task, verify:

- Did I declare tasks before coding?
- Is DOM structure minimal?
- Are Tailwind classes minimal?
- Are there unnecessary breakpoints?
- Are there arbitrary values?
- Is server/client separation correct?
- Is security preserved?
- Is UI text minimal?
- Are routes Turkish?
- Is code deterministic and readable?

If any answer is “no” → refactor immediately.

---