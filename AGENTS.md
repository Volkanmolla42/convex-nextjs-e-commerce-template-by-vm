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
- Do not run skill workflows, MCP tools or commands for simple tasks.
- Do not run MCP retrieval/search tools for simple tasks when the target file is already known.
- Use skills or MCP tools only when discovery, cross-file analysis, or unclear file ownership is required.

---

# 2. Pre-Execution Task Declaration (MANDATORY)

Before writing any code, declare tasks.

## Single Task

```
1: Task one description
```

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

- Do not run `bun run lint` for simple, low-risk, single-file visual or text-only edits.
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

- Always use `bun`
- Never use `npm` or `pnpm`

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

This document defines non-negotiable system behavior.
<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app:{04-glossary.mdx}|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,public-static-pages.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-params.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
