# PRD — Workout (Start • Add Exercises • Logging) (4‑Phase)

**Filename:** `/docs/screens/prd-workout.md`  
**Status:** Draft 2025-08-16 • Owner: Anthony (UX) • Dev Leads: FE—TBD · BE—TBD

---

## 1) Overview

Enable users to start a workout in 1–2 taps, log sets quickly one‑handed, and manage rest per‑exercise or session‑wide. The screen is the system’s production engine: it feeds Clubs (shares, consistency) and Progress (PR detection, trends).

## 2) Goals & Success Metrics

- Median **time_to_first_set** ≤ 30s for new users.
- ≥80% of sessions started from **Start Empty** or **Start (template)**.
- Session **finish_rate** ≥ 70%.
- **rest_apply_to_all** usage ≥ 25% within first 3 sessions.
- Scrolling smooth at 60fps (virtualized list; only one expanded card).

## 3) Primary Users & JTBD

- **Lifter:** _When I’m in the gym, I want to log sets fast without typing so I can stay focused and accurate._
- **Coach (read‑only here):** _When I share routines, I want lifters to start the correct template quickly._

## 4) User Stories (AC‑ready)

1. **Start empty & add exercises**
   - **Given** I’m on **Workout** root, **when** I tap **Start empty** then select exercises and confirm, **then** I’m taken to **Logging** with those exercises preloaded.
2. **Complete a set and rest**
   - **Given** I’m on an active exercise, **when** I tap **✓ Complete**, **then** a rest timer starts with the preset; I can **−15/+15/Skip** and change presets (this, all, remember).
3. **Replace or add exercises mid‑session**
   - **Given** a session is active, **when** I add or replace an exercise, **then** the list updates without losing other logged data.
4. **Finish or discard**
   - **Given** I’m done, **when** I tap **Finish workout**, **then** totals compute and the session closes; **when** I discard, **then** I must confirm and lose logged sets (explicit count shown).
5. **Active session banner**
   - **Given** I leave Logging, **when** a session is active, **then** a banner appears above the tab bar; tapping returns to Logging.

## 5) Core Flows

- Start Empty → AddExercises → Logging → Complete sets (rest starts) → Finish.
- Template → Preview → Start → Logging.
- Replace exercise path; Cancel/Discard path; Offline queue for set mutations.

## 6) Functional Requirements

- **FR‑1** Routes: `/workout`, `/workout/template/:id`, `/workout/add`, `/workout/create-exercise`, `/workout/logging/:sessionId`; deep links `spotta://workout` and `spotta://session/:id`.
- **FR‑2** Logging shows one **Active** exercise at a time; others collapsed; custom steppers for Weight/Reps with long‑press acceleration.
- **FR‑3** **RestPresetSheet** provides `60/90/120/Custom`; apply to this, all, or persist for exercise.
- **FR‑4** RestBar (sticky) starts automatically on set complete; shows countdown and controls.
- **FR‑5** Add/Replace exercises supported during session.
- **FR‑6** Single active session per user enforced; conflict prompts on 409.
- **FR‑7** Accessibility: roles/labels for steppers; live announcements for rest start.
- **FR‑8** Performance budgets: Start → AddExercises ≤ 200 ms; Add → Logging ≤ 300 ms.
- **FR‑9** Global **ActiveSessionBanner** visible outside Logging.
- **FR‑10** Analytics events for funnel (start → first_set → 3_sets → finish).

## 7) Data & Constraints

- Entities: `exercises`, `user_exercises`, `routines`, `routine_exercises`, `sessions`, `session_exercises`, `session_sets`, `rest_presets`.
- Business rules: one active session per user; `total_volume = Σ(weight×reps)` computed on finish; PR/job signals emitted post‑finish.
- RLS: user can CRUD own sessions and custom exercises; read global exercises.

## 8) Phased Acceptance Criteria (the 4 gates)

- **Gate 1 — Front‑End ready (stubbed data):**
  - All routes render with mocked states; steppers, RestBar, and sheets function locally; component tests pass.
- **Gate 2 — Back‑End ready (contract green):**
  - Tables, RLS, and endpoints implemented; volume calc unit tests; preset merge logic unit tests; OpenAPI examples provided.
- **Gate 3 — Integrated (end‑to‑end):**
  - Start → first set → RestBar → Finish works across iOS/Android; error paths (401/403/404/409/5xx) verified; offline queue for set upserts.
- **Gate 4 — Polish (ship‑ready):**
  - A11y/perf audits pass; i18n strings complete; analytics firing; rollout guard `logging_v2` ready; rollback plan documented.

## 9) API Contract Links

- `/api/openapi.yaml#/paths/~1exercises` (GET, POST)
- `/api/openapi.yaml#/paths/~1sessions` (POST, GET by id, finish, discard)
- `/api/openapi.yaml#/paths/~1sessions~1{id}~1exercises` (POST, PUT)
- `/api/openapi.yaml#/paths/~1sessions~1{id}~1sets` (POST batch) and `/complete-set` (POST)
- `/api/openapi.yaml#/paths/~1sessions~1{id}~1rest-preset` (POST)

## 10) Non‑Functional Requirements

- Availability 99.9% for session CRUD; P95 set‑save ≤ 150 ms; UI jank < 1% frames > 16 ms.
- Security: RLS on all `session_*`; rate‑limit `POST /sessions/*` (≤5/min). Observability events: `set_completed`, `session_finished`.

## 11) Open Questions

- Finish button placement (header vs sticky bottom) across platforms. **Owner:** UX.
- Persist **weight increment step** per exercise vs global per user. **Owner:** BE.
- Default unit for e1RM/volume in logs if units change mid‑session. **Owner:** PM.
