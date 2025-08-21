# Spotta AI Coding Guidelines (CLAUDE.md)

Guidance for AI coding agents (and humans) working in this repository.

## 0 — Purpose

Rules to ensure maintainability, safety, and velocity.  
**MUST** rules are CI-enforced; **SHOULD** rules are strongly recommended.

### Stack assumptions

- **Mobile:** React Native (Expo SDK 53, RN 0.79) · Expo Router (on React Navigation)
- **UI:** Tamagui (tokens/variants) · minimal inline styles
- **Data:** Supabase (Postgres + RLS + Realtime) · Edge Functions (Deno)
- **Lang/Tooling:** TypeScript 5.8 · Biome (primary) · ESLint (fallback) · Prettier · Turbo · npm workspaces
- **Tests:** Jest + @testing-library/react-native (mobile) · Vitest (shared/functions optional) · Detox E2E

### Project structure

Monorepo with app-first + shared packages:

```
apps/
  mobile/                  # Expo app
    app/                   # Expo Router (file-based)
    src/
      features/
        <feature>/
          components/
          hooks/
          screens/
          services/        # data access + Zod schemas
          state/           # react-query caches, local stores
          types.ts
      providers/           # theme, query client, auth
      utils/
packages/
  ui/                      # Tamagui components (tokens/variants)
  shared/                  # types, brand, zod schemas, utils
  api-schema/              # zod contracts for Edge funcs
supabase/
  migrations/
  functions/               # Deno Edge Functions (+ tests)
  storage/
docs/
  features/<slug>/spec.md  # Feature specs (see §15)
```

---

## 1 — Before Coding

- **BP-1 (MUST)** Ask clarifying questions for ambiguous tickets.
- **BP-2 (SHOULD)** Draft and confirm an approach for non-trivial work (data flow, UI states, error cases).
- **BP-3 (SHOULD)** If ≥2 viable approaches, list crisp pros/cons; pick the lowest-risk option matching existing patterns.
- **BP-4 (SHOULD)** Identify boundaries: **feature UI**, **domain logic**, **data access**.

---

## 2 — While Coding

- **C-1 (MUST)** TDD for pure logic/utilities: scaffold → failing test → implement.
- **C-2 (MUST)** Use domain vocabulary for names (see §12).
- **C-3 (SHOULD NOT)** Introduce classes when small composable functions/hooks suffice.
- **C-4 (SHOULD)** Keep functions pure; isolate I/O (Supabase, device APIs) at edges.
- **C-5 (MUST)** Prefer branded ID types:
  ```ts
  // packages/shared/types/brand.ts
  export type Brand<T, B> = T & { __brand: B };
  export type UserId = Brand<string, 'UserId'>; // ✅
  // type UserId = string                        // ❌
  ```
- **C-6 (MUST)** Use `import type { … }` for type-only imports.
- **C-7 (SHOULD)** Self-document via naming/structure; comments only for invariants, caveats, and “why”.
- **C-8 (SHOULD)** Default to `type`; use `interface` only if merging/readability clearly wins.
- **C-9 (SHOULD NOT)** Extract helpers unless reused, unlock testing of opaque logic, or meaningfully clarify code.
- **C-10 (MUST)** Mobile perf hygiene:
  - Memoize lists/cards (`React.memo`, `useCallback`, `useMemo` judiciously).
  - Use `FlatList` with stable `keyExtractor`; add `getItemLayout` when feasible.
  - Avoid recreating inline objects/styles in render loops.
- **C-11 (MUST)** Accessibility: meaningful `accessibilityLabel`, logical focus order, 44×44 hit targets, dynamic type where appropriate.

---

## 3 — Testing

- **T-1 (MUST)** Co-locate unit tests as `*.spec.ts(x)` next to source.
- **T-2 (MUST)** Separate pure unit tests from DB/IO-touching integration tests.
- **T-3 (MUST)** For user flows, use `@testing-library/react-native` with user-visible assertions.
- **T-4 (SHOULD)** Detox E2E for critical paths (auth, start workout, log set, club message, sync offline→online).
- **T-5 (SHOULD)** Prefer integration over heavy mocking; stub only external boundaries (e.g., Expo modules).
- **T-6 (SHOULD)** Single strong assertion when possible:
  ```ts
  expect(result).toEqual([{ id: 's1', reps: 5, weight: 100 }]); // ✅
  ```
- **T-7 (SHOULD)** Property-based tests (`fast-check`) for algorithmic logic (PR points, ladders).
- **T-8 (MUST)** Don’t test what TypeScript already guarantees.

**Mobile test config (from repo):**

- Jest + RTL configured; setup at `apps/mobile/jest-setup.ts`.
- Run single file: `npm test -- <file>` or `npm run test` (root).
- Mobile watch/coverage: `apps/mobile`: `npm run test:watch`, `npm run test:coverage`.

---

## 4 — Data / Supabase

- **D-1 (MUST)** Use generated DB types (no hand-typed row shapes):
  ```bash
  supabase gen types typescript --project-id <id> > packages/shared/db.types.ts
  ```
- **D-2 (MUST)** Enforce **RLS**; assume untrusted client. All queries must pass RLS policies.
- **D-3 (SHOULD)** Validate inputs/outputs with **Zod** at module boundaries (UI↔service, service↔Supabase, Edge↔client).
- **D-4 (SHOULD)** Use **Edge Functions** for multi-row mutations, secrets, or private logic.
- **D-5 (MUST)** Realtime: subscribe narrowly (channel per club/workout), debounce optimistic updates, deterministic merges.
- **D-6 (SHOULD)** Large media via Storage; keep rows lightweight (refs + metadata).

---

## 5 — Mobile Organization & Navigation

- **O-1 (MUST)** Feature folders under `apps/mobile/src/features/<feature>/` (see structure in §0).
- **O-2 (SHOULD)** Shared code in `packages/shared` only if used by ≥2 packages.
- **O-3 (MUST)** Tamagui: use tokens/variants/`styled()` over ad-hoc styles.
- **O-4 (SHOULD)** With Expo Router, pass IDs via route params; fetch inside the screen or feature service.

---

## 6 — Tooling Gates (CI)

- **G-1 (MUST)** **Biome** lint + format check clean (primary). ESLint as fallback.
- **G-2 (MUST)** `npm run ci:all` passes (typecheck, lint, format check, tests).
- **G-3 (MUST)** `expo-doctor` has no critical warnings on mobile.
- **G-4 (MUST)** No `console.log` in app code (Biome `noConsoleLog: "error"`). Use a leveled logger; strip in prod.
- **G-5 (SHOULD)** Detox E2E green for changed flows before release.
- **G-6 (MUST)** Images within budget; use `expo-image` with caching.

**Root commands (from repo):**

- `npm run mobile` — start dev server
- `npm run ios` / `npm run android` — run simulators
- `npm run typecheck` · `npm run lint` · `npm run test` · `npm run format`
- `npm run ci:all` — full CI (typecheck, lint, format check, tests)

**Mobile app (apps/mobile):**

- `npm run test:watch` · `npm run test:coverage`
- `npm run prebuild` — generate native code for dev builds

**Environment:**

- Node.js ≥ 18, npm ≥ 8
- TypeScript strict mode enabled

---

## 7 — Git & Branching

- **GH-1 (MUST)** Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT)** Mention specific AI tools in commit messages.
- **GH-3 (MUST)** Short-lived branches (`feat/<area>-<summary>`, `fix/...`, `chore/...`, `refactor/...`); rebase on `main` before merge; prefer **squash**.
- **GH-4 (SHOULD)** PR template: context → approach → screenshots → test notes → risk/rollback.

---

## 8 — Security & Secrets

- **S-1 (MUST)** No secrets in code. Use Expo `app.config.*` + EAS secrets; read via `expo-constants`.
- **S-2 (MUST)** Never rely on client auth alone. Use RLS + Edge for sensitive flows.
- **S-3 (SHOULD)** Minimize PII; encrypt at rest if sensitive; set Storage bucket policies.
- **S-4 (SHOULD)** Crash/analytics behind consent (Sentry + PostHog/Amplitude); exclude PII.

---

## 9 — Writing Functions: Checklist

1. Readable end-to-end without comments?
2. Reasonable cyclomatic complexity? Flatten where possible.
3. Would a standard DS/algorithm simplify it?
4. Any unused params? Remove.
5. Can casts move to edges/args?
6. Testable without mocking core device/DB? If not, move logic outward (or to Edge).
7. Hidden dependencies? Factor into args.
8. Brainstorm 3 better names; choose the most domain-aligned.

> **Do not** extract a new function unless reused, it unlocks testing of opaque logic, or it clearly improves readability.

---

## 10 — Writing Tests: Checklist

1. Parameterize inputs; avoid magic literals.
2. No trivial asserts.
3. Test name states exactly what the final `expect` verifies.
4. Compare results to precomputed expectations or domain properties, not implementation echoes.
5. Apply same lint/type/style rules as prod.
6. Prefer invariants/properties (idempotence, round-trip, ordering) where useful (use `fast-check`).
7. Group by `describe(functionName, ...)`.
8. Use `expect.any(...)` for variable params.
9. Prefer strong assertions (`toEqual`) over loose ones.
10. Cover edge cases, realistic input, unexpected input, and boundaries.
11. Don’t re-test what the type checker guarantees.

---

## 11 — Release hygiene (mobile)

- Increment version + build numbers; maintain a human CHANGELOG.
- Smoke test on device (iOS + Android) before `eas submit`.
- Verify RLS and Storage rules in staging prior to prod.
- Rollback plan: keep previous release on EAS; feature-flag risky changes.

---

## 12 — Domain vocabulary

Use these names consistently:

- **User**, **Profile**
- **Workout**, **SetEntry**, **Template**
- **Exercise**, **Equipment**, **MuscleGroup**
- **Club**, **Message**, **Pact** (accountability), **Ladder** (friendly comp), **PRPoint**
- **ProgressPhoto**, **Measurement**

> Use branded `*Id` types for all primary keys (e.g., `WorkoutId`, `ClubId`).

---

## 13 — Shortcuts (quick commands)

### QNEW

```
Understand all BEST PRACTICES listed in CLAUDE.md.
Your code SHOULD ALWAYS follow these best practices.
```

### QPLAN

```
Analyze similar parts of the codebase and determine whether your plan:
- is consistent with rest of codebase
- introduces minimal changes
- reuses existing code
- use context7 MCP for latest documentation
```

### QCODE

```
Implement your plan and make sure your new tests pass.
Always run tests to ensure you didn't break anything else.
Always run `npm run format` to ensure standard formatting.
Always run `npm run typecheck && npm run lint` to ensure types and lint pass.
- use context7 MCP for latest documentation
```

### QFRONT

```
You are a FRONTEND senior software engineer.
Front-end only (UI-first). Build visuals + interactions against mocks.

Checklist:
- Scaffold/modify screens/components in apps/mobile using Tamagui + Expo Router
- Create/extend Zod schemas for expected data in feature services (mock layer)
- Stub network via MSW or simple mock services; no real Supabase writes
- Add component/hook tests with @testing-library/react-native (a11y, loading/error/empty)
- Perf basics: FlatList keyExtractor/getItemLayout where useful; avoid inline object recreation
- Run: npm run format, typecheck, lint, test (mobile), expo-doctor
- Update docs via QDOC
```

### QBACK

```
You are a BACKEND senior software engineer.
Back-end only (data/contracts). Build migrations, RLS, and Edge functions.

Checklist:
- Design/implement Supabase migrations; update RLS (least privilege)
- Generate types: supabase gen types → packages/shared/db.types.ts
- Define/validate contracts in packages/api-schema (Zod) and shared types
- Implement/modify Edge Functions for multi-row/secret logic
- Write integration tests for functions and RLS; unit-test pure logic with Vitest/Jest
- Security pass via QSEC (solo checklist)
- Run: npm run format, typecheck, lint, test
- Update docs via QDOC
```

### QINTEGRATE

```
You are a FULLSTACK senior software engineer.
Wire UI to real back-end. Replace mocks, handle errors/offline, prove the flow.

Checklist:
- Replace mock services with real Supabase/Edge calls in feature services
- Use React Query for server cache; keep local stores for ephemeral UI only
- Add optimistic updates and offline queue (MMKV/SQLite) where applicable
- Map errors to user-safe messages; add retry/empty/error UI
- Add component/integration tests; add critical Detox E2E for the flow
- Verify env vars/EAS secrets; smoke test on device (iOS/Android)
- Run: npm run format, typecheck, lint, test, expo-doctor
- Update docs via QDOC; run QSEC if §16.1 areas changed
```

### QPOLISH (optional)

```
Final pass for UX/perf/compliance.

Checklist:
- A11y QA (labels, focus order, hit areas ≥44, dynamic type)
- Visual polish (tokens/variants), copy tweaks, skeletons/shimmers
- Perf: memoization, list virtualization, remove unnecessary re-renders
- Analytics events/properties (no PII), Sentry breadcrumbs, feature flags
- Verify version bump + CHANGELOG; release readiness
```

### QCHECK

```
You are a SKEPTICAL senior software engineer.
For every MAJOR code change (skip minor changes):

1. CLAUDE.md Writing Functions checklist.
2. CLAUDE.md Writing Tests checklist.
3. CLAUDE.md Implementation Best Practices.
```

### QCHECKF

```
For every MAJOR function added/edited (skip minor changes):

1. CLAUDE.md Writing Functions checklist.
```

### QCHECKT

```
For every MAJOR test added/edited (skip minor changes):

1. CLAUDE.md Writing Tests checklist.
```

### QUX

```
Act as a human UX tester of the implemented feature.
Output a prioritized list of scenarios to test.
```

### QGIT

```
Add all changes, create a commit, and push to remote.

Commit message checklist:
- Use Conventional Commits format (feat, fix, chore, docs, style, refactor, perf, test, build, ci)
- Do not refer to AI tools
- Structure:
<type>[optional scope]: <description>
[optional body]
[optional footer(s)]
- Use BREAKING CHANGE footer when applicable
```

### QDOC

```
Create or update docs for this change:
- Ensure docs/features/<slug>/spec.md exists
- Append a Changelog entry summarizing scope, risk, and links
- Flag any missing sections (Data & Contracts, RLS, Test Plan)
```

### QSEC

```
Run the Security Review checklist on this PR:
- Identify which §16.1 triggers apply
- List risks + mitigations
- Confirm Solo Security Reviewer checklist is complete
```

### QDOCF

```
Document or update front-end for this screen:
- Capture navigation, UI states, events, and components
- Record information architecture (routes, props, state, data needs)
- Define read models (what FE consumes) and write commands (what FE sends)
- Provide sample payloads + error states
- Update docs as code changes; flag missing contracts
```

---

## 14 — Documentation Scribe (auto-docs)

Guarantee every new feature has a living spec; major changes auto-append to its changelog.

**Where docs live**

```
docs/features/<slug>/
  spec.md
  assets/
```

- Slug = kebab-case from PR title or `feat/<slug>` branch.

**Feature spec template**

```md
# <Feature Name>

**Status:** Draft | In Progress | Released  
**Owner:** <name or @handle>  
**Scope:** Mobile (Expo) | Edge Function | Supabase | UI | Analytics  
**Links:** PR #, Figma, Issue, Test Plan, Flag key

## 1. Purpose & KPIs

## 2. User Stories & Non-Goals

## 3. UX Spec (screens/states/a11y)

## 4. Data & Contracts (tables/RLS/Zod/Edge)

## 5. Realtime & Offline

## 6. Analytics & Experimentation

## 7. Test Plan

## 8. Risks & Mitigations

## 9. Changelog (auto)

- <YYYY-MM-DD> — <scope> — <summary> — [commit/PR]
```

**Automation rules**

- **Create spec if missing** when:
  - PR has `feat:` title or `feature` label, or
  - Branch matches `feat/*`.
- **Append to changelog** when:
  - PR contains `feat:`, `refactor!:`, or `BREAKING CHANGE`, or
  - Files touched include:
    - `supabase/migrations/**`
    - `supabase/functions/**`
    - `packages/api-schema/**`
    - `apps/mobile/src/features/**`

**Scripts**

```json
{
  "scripts": {
    "scribe:new": "node scripts/scribe.js new",
    "scribe:update": "node scripts/scribe.js update",
    "scribe:check": "node scripts/scribe.js check"
  }
}
```

**CI outline**

1. On PR events and `main` pushes, run `node scripts/scribe.js update --pr $PR_NUMBER`.
2. Commit with `docs: scribe update for <slug>`.
3. If new spec created, comment link on PR.

---

## 15 — Security Review (solo)

Explicit security pass for auth, data access, secrets, and PII-touching changes.

### 15.1 Triggers (REQUIRED review when any apply)

- RLS or `supabase/migrations/**`
- New/edited Edge Functions (`supabase/functions/**`)
- Auth changes (sign-in, tokens, session storage)
- Client-side storage of sensitive data (keychain/keystore, SQLite, files)
- File uploads / Storage policies or validation
- New third-party SDKs handling user data/payments
- Realtime channels with user-scoped access

### 15.2 Solo Security Reviewer

You (repo owner) act as Security Reviewer. Do not merge until this checklist is complete.

**PR checklist**

- [ ] RLS reviewed (least-privilege, policies tested)
- [ ] Auth/session storage safe; no tokens in logs; sensitive in secure storage
- [ ] Inputs/outputs validated at boundaries with Zod; extra props rejected
- [ ] Secrets via EAS/Env; none in code
- [ ] Storage policies scoped; uploads validated (type/size); signed URLs expire
- [ ] Realtime channels scoped; server-side filters enforced
- [ ] Edge Functions rate-limited; errors non-revealing
- [ ] Analytics/logs exclude PII unless consented
- [ ] New deps audited (risk noted or suppression justified)

**Notes**

- Test RLS with a **non-owner** user.
- Prefer moving sensitive multi-row logic to **Edge Functions**.
- Keep a quick **threat model** in the feature spec’s Risks section.

**Release gate (solo)**

- CI fails if `scribe:check` detects missing feature spec for new features or if lint/type/tests fail.

---

## 16 — Development notes (from repo)

- Use absolute imports within features where configured.
- Memoize components when helpful for perf.
- New utilities/components should include tests and maintain coverage.
- Local Supabase development uses default ports: API (54321), DB (54322), Studio (54323).
- Supabase config in `supabase/config.toml`.

---

## 17 — Domain terms (quick reference)

- **Workout:** session of exercises; **SetEntry:** one set record; **Template:** reusable plan.
- **Club:** group/accountability; **Message:** chat message; **Pact:** accountability agreement.
- **Ladder:** friendly competition ranking; **PRPoint:** points for personal records.
- **ProgressPhoto**, **Measurement**: progress tracking artifacts.

---

**EOF**
