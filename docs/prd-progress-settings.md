# PRD — Progress + Settings (4‑Phase)

**Filename:** `/docs/screens/prd-progress-settings.md`  
**Status:** Draft 2025-08-16 • Owner: Anthony (UX) • Dev Leads: FE—TBD · BE—TBD

---

## 1) Overview

Provide a calm, private‑first space to see weekly consistency and strength trends, celebrate PRs, manage progress photos, and adjust core settings (units, privacy, rest, health sync, reminders, account).

## 2) Goals & Success Metrics

- ≥60% of WAU view **Progress** at least once per week by week 4.
- ≥35% add ≥1 **Progress Photo** within 30 days.
- ≥25% use **Compare** in Photos monthly.
- ≥50% set **Rest Timer** preferences by week 2.

## 3) Primary Users & JTBD

- **Lifter:** _When I check in, I want to instantly see if I’m on track this week and whether I’m getting stronger._
- **Privacy‑minded user:** _When I add photos, I want them private by default with faces blurred and EXIF removed._

## 4) User Stories (AC‑ready)

1. **See weekly hero**
   - **Given** I open **Progress**, **when** data loads, **then** I see **Consistency** (`done/goal` with state) and **Strength Level** (`ratio = e1RM ÷ BW`, with `nextTierAt` hint).
2. **View trends & PRs**
   - **Given** I scroll, **when** I reach **Strength Trends (12w)**, **then** I see a sparkline with `Top lift`/`Big 3` toggle; **when** I view **Recent PRs**, **then** the list shows last 3–5 PR events with `e1RM` badges.
3. **Manage photos**
   - **Given** I tap **Add**, **when** I capture/import, **then** a processed (face‑blurred, EXIF‑stripped) thumbnail appears; **when** I tap **Compare**, **then** I can pick two photos and see a 2‑up compare view.
4. **Adjust settings**
   - **Given** I tap the gear, **when** I change **Units**, **Privacy**, **Rest Timer**, **Health Sync**, **Reminders**, or **Account & Profile**, **then** values persist and affect future workouts.

## 5) Core Flows

- Open → Hydrate hero + cards → (optional) Open Settings → Save → Return.
- Add Photo → Upload → Processing → Thumbnail appears.
- PR detection occurs at set insert time; shows on next load.

## 6) Functional Requirements

- **FR‑1** Route `/progress` with header (title, gear) and week subhead.
- **FR‑2** Two hero chips: **Consistency** (`done/goal`, state `On track | 1 left | Missed`) and **Strength Level** (`ratio`, `nextTierAt`, `i` tooltip).
- **FR‑3** Cards: **This Week**, **Strength Trends (12w)**, **Recent PRs**, **Progress Photos**, **Body Metrics** (conditional).
- **FR‑4** **SettingsSheet** (90% height) with sections: Units, Privacy, Rest Timer, Health Sync, Reminders, Account & Profile, Data.
- **FR‑5** Photos private‑first; processed variants (face blur, EXIF‑stripped); never shared externally by default.
- **FR‑6** Tooltip for Strength explains e1RM; exposes “Change top lift” action.
- **FR‑7** Accessibility summaries for charts; Reduced Motion respected.

## 7) Data & Constraints

- Entities: `user_preferences` (JSONB), `progress_trends` (weekly e1RM rollups), `pr_events`, `photos`, plus read of `workout_sessions/*` for hero consistency.
- Privacy: photos stored in private bucket; processed variants for UI; preferences scoping by `auth.uid()`.
- Timezone: user/club tz determines the “Week of …” window.

## 8) Phased Acceptance Criteria (the 4 gates)

- **Gate 1 — Front‑End ready (stubbed data):**
  - Progress renders hero chips and all cards with mocked data; SettingsSheet opens and updates local state; a11y labels and chart summaries present.
- **Gate 2 — Back‑End ready (contract green):**
  - RPCs for hero hydration and rollups (`detect_pr_on_set_insert`, `rollup_trends_nightly`, `hydrate_progress_hero`) implemented; preferences table & RLS in place; photos pipeline working on sample files.
- **Gate 3 — Integrated (end‑to‑end):**
  - Hero, trends, PRs, and photos load from server; settings persist; errors for 401/403/5xx handled gracefully.
- **Gate 4 — Polish (ship‑ready):**
  - Micro‑confetti on first PR per week; localization for strings; analytics events firing; logs/alerts configured.

## 9) API Contract Links

- `/api/openapi.yaml#/paths/~1rpc~1hydrate_progress_hero` (POST)
- `/api/openapi.yaml#/paths/~1progress_trends` (GET)
- `/api/openapi.yaml#/paths/~1pr_events` (GET)
- `/api/openapi.yaml#/paths/~1photos` (POST, GET)
- `/api/openapi.yaml#/paths/~1user_preferences` (PATCH)

## 10) Non‑Functional Requirements

- Availability 99.9% read. P95 hero hydrate ≤ 250 ms; photos upload ≤ 10 MB with resumable protocol.
- Security: strict RLS; photo URLs signed & short‑lived; health sync opt‑in only.

## 11) Open Questions

- Allow bodyweight entry in Progress or only via Health? **Owner:** PM.
- Which thresholds define “Strength tiers” for the ratio hint? **Owner:** Science.
- Do we support photo folders/tags at MVP? **Owner:** UX.
