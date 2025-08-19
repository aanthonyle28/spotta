
# Spotta — Product PRD (4‑Phase: FE → BE → Integrate → Polish)
**Recommended path:** `/docs/prd-spotta.md`  
**Status:** Draft 2025-08-16 • Owner: Anthony (PM/UX) • Dev Leads: FE—TBD · BE—TBD • Mobile: iOS/Android (React Native + Expo)

---

## 1) Executive Summary
Spotta is a **workout tracker** built for **accountability via Clubs**. Users log workouts fast, share to their club with one tap, keep **personal + club streaks**, and track progress over time. MVP spans **three core surfaces**:
- **Workout** — start/continue sessions, log sets, rest timers, finish/discard.
- **Clubs Chat** — share workouts into a lightweight chat feed, react, view weekly club status and a simple consistency + PR leaderboard.
- **Progress + Settings** — weekly consistency, strength trends, PRs, private progress photos, and core preferences.

This document merges the per‑screen PRDs into a single product PRD with **shared goals, data model, contracts, NFRs, analytics, and release plan**. Individual screen PRDs remain the source of truth for screen‑level behavior.

**Screen PRDs**  
- `/docs/screens/prd-workout.md`  
- `/docs/screens/prd-clubs-chat.md`  
- `/docs/screens/prd-progress-settings.md`

---

## 2) Goals & Success Metrics (MVP → 60 days)
**Activation & Engagement**
- ≥80% of new users **start a workout** within D1.
- Median **time_to_first_set** ≤ 30s for new users.
- ≥60% of active users **join ≥1 club** by week 4.
- ≥40% of club posts receive ≥1 **reaction** by week 4.

**Retention & Outcome**
- D7 retention uplift **+20%** for users in a club vs. solo.
- ≥30% of club weeks end with **everyone meeting goal** (club streak +1).
- ≥35% of WAU view **Progress** weekly; ≥25% add a **progress photo** monthly.

**Performance**
- P95 **feed append** ≤ 300 ms after realtime event.
- P95 **set save** ≤ 150 ms; **hero hydrate** ≤ 250 ms.

---

## 3) Target Users & JTBD
- **Everyday lifter (core):** *When I finish or during a workout, I want to log and share quickly so my friends see I showed up and we keep each other consistent.*
- **Club organizer/coach (optional):** *When the group lags, I want a simple view of who’s done and who needs a nudge.*
- **Privacy‑minded user:** *When I add photos, I want them private by default and processed safely.*

---

## 4) Scope & Release Plan
**MVP (v1.0)**
- Workout logging (single active session), templates, rest presets, offline queue for set mutations.
- Clubs Chat with **share from history**, reactions, weekly group bar, consistency leaderboard.
- Progress with **Consistency** + **Strength** hero, trends (12w), PRs list, private progress photos.
- Settings: units, privacy, rest timer, health sync (stubbed), reminders (stubbed), account/profile.

**v1.1+ (candidates)**
- Media attachments in Clubs; coach notes.
- Group challenges/pacts; head‑to‑head ladders.
- Advanced photo compare (overlays, alignment), photo tags/folders.
- Health sync (Apple Health/Google Fit), reminders/push automation.
- Web read‑only portal.

---

## 5) Top‑Level Functional Requirements (cross‑screen)
**FR‑A Global Navigation & State**
- Tab routes: **Workout**, **Clubs**, **Progress** (+ deep links `spotta://workout`, `spotta://session/:id`, `spotta://clubs/:id/chat`).  
- One **Active Session** per user; global banner to resume.

**FR‑B Realtime & Idempotency**
- New activities (workout shares, reactions) arrive via realtime subscription; **idempotency keys** prevent dupes for `{club_id, session_id}`.
- Optimistic UI for reactions; server reconciliation within 1s.

**FR‑C Streaks & Weekly Cadence**
- **Personal** progress: count of shared workouts this week vs. goal.  
- **Club** streak increments only when all current members meet goal by week close (club timezone). Mid‑week joins **excluded** from denominator until next week.

**FR‑D Privacy & Photos**
- Photos stored in **private bucket** with processed variants (face blur, EXIF stripped). Default not shareable.

**FR‑E Accessibility & Internationalization**
- Touch targets ≥44px; VoiceOver/ TalkBack labels; motion‑reduced animations. i18n scaffolding with default `en-US` locale.

**FR‑F Error & Offline**
- Standard handling for 401/403/404/409/422/5xx.  
- Offline queue for **set upserts**; replay on reconnect; user feedback banners.

(Per‑screen FRs live in the referenced PRDs.)

---

## 6) Architecture Overview
**Client (RN + Expo)**
- Screens: Workout, Clubs Chat, Progress (+ modals/sheets).  
- State: RTK Query or TanStack Query for server cache; minimal local Redux/Zustand store for **active session** and **rest presets**.  
- Realtime: Supabase Realtime channels for `activities` and `reactions` per club.

**Backend (Supabase)**
- **Postgres** with RLS; **Edge Functions** for RPCs: `detect_pr_on_set_insert`, `hydrate_week_progress`, `rollup_trends_nightly`, `hydrate_progress_hero`.  
- **Storage**: `photos` private bucket + signed URLs.  
- **Schedulers**: nightly rollups; weekly streak close per club timezone (cron with `club_week_status` update).

**Observability**
- Analytics events (see §11).  
- Logs/metrics/alerts for functions and DB errors; error reporting in client.

---

## 7) Data Model (high‑level)
```sql
-- Users & Clubs
users(id, handle, tz, created_at)
clubs(id, name, tz, goal_per_week int default 3, created_at)
club_members(club_id, user_id, joined_at, role enum('member','admin'))

-- Workout logging
sessions(id, user_id, started_at, finished_at, total_volume, status enum('active','finished','discarded'))
session_exercises(id, session_id, exercise_id, order_index)
session_sets(id, session_exercise_id, weight numeric, reps int, rpe numeric null, ts timestamptz)

exercises(id, name, equipment, primary_muscle, is_global bool, owner_user_id null)
user_exercises(user_id, exercise_id) -- favorites/custom

-- Activities & Reactions (Clubs)
activities(id, club_id, user_id, kind enum('workout','pr','msg'),
           session_id null, payload jsonb, created_at, idempotency_key text unique)
reactions(id, activity_id, user_id, emoji text, created_at)

-- Weekly progress & leaderboard
user_week_progress(user_id, club_id, week_start_date, completed_count int, goal int)
club_week_status(club_id, week_start_date, completed_members int, total_members int, streak int)

-- Progress & Photos
pr_events(id, user_id, exercise_id, e1rm numeric, session_id, created_at)
progress_trends(user_id, week_start_date, top_lift_id, e1rm numeric, bodyweight numeric null)
photos(id, user_id, object_path, processed_path, taken_at, width, height, private bool default true)

-- Preferences
user_preferences(user_id primary key, units enum('lb','kg'), rest_preset int, privacy jsonb)
```

**RLS Summary**
- Users can **only** read/write their own `sessions/*`, `photos`, `user_preferences`.  
- Club reads restricted to **members**. Inserts to `activities` require membership; rate‑limited.

---

## 8) API Contract (OpenAPI paths)
- `GET/POST /exercises`
- `POST /sessions` • `GET /sessions/{id}` • `POST /sessions/{id}/finish`, `DELETE /sessions/{id}` (discard)  
- `POST /sessions/{id}/exercises` • `PUT /sessions/{id}/exercises/{id}`  
- `POST /sessions/{id}/sets` (batch) • `POST /sessions/{id}/complete-set`  
- `POST /sessions/{id}/rest-preset`
- `GET/POST /clubs/{id}/activities` • `POST/DELETE /activities/{id}/reactions`
- `GET /clubs/{id}/leaderboard`
- `POST /rpc/hydrate_week_progress` • `POST /rpc/hydrate_progress_hero`
- `GET /progress_trends` • `GET /pr_events`
- `POST /photos` • `GET /photos` • signed URL fetch
> Provide example request/response bodies in `/api/openapi.yaml`. Ensure **idempotency key** on activity share payload `{club_id, session_id}`.

**Example: POST /clubs/{{id}}/activities (kind='workout')**
```json
{
  "kind": "workout",
  "session_id": "sess_123",
  "idempotency_key": "club_42_sess_123",
  "payload": { "summary": { "exercises": 6, "sets": 18, "volume": 12450 } }
}
```

---

## 9) Core Flows (happy + key errors)
1) **Start & Log**: Home → Start empty / Template → Logging → Complete sets (RestBar) → Finish → Signals emitted (PR detection) → Share to Club (optional or from history).  
2) **Club Accountability**: Open Club → Add Workout (history) → Share → Reactions → Weekly bar updates → Leaderboard modal.  
3) **Progress Check‑in**: Open Progress → Hero (Consistency + Strength) → Trends/PRs → Add/Compare Photos → Adjust Settings.  

**Error paths**:  
- 401/403 → prompt auth / club join.  
- 404 session missing → toast; do not count.  
- 409 duplicate activity → show once; no double count.  
- 5xx → toast + retry/backoff; offline queue for set upserts.

---

## 10) Phased Acceptance Criteria (program‑level gates)
**Gate 1 — Front‑End ready (stubbed data)**  
- All tab routes and modals render with empty/loading/error/success states.  
- Gestures: double‑tap/long‑press reactions; steppers; RestBar; a11y labels verified.  
- Component/unit tests for visible states.

**Gate 2 — Back‑End ready (contract green)**  
- Schemas & RLS applied; RPCs and crons implemented.  
- OpenAPI examples committed; unit/contract tests for idempotency, rollups, streak close.

**Gate 3 — Integrated (end‑to‑end)**  
- FE wired to BE; realtime activities under 1s; weekly counts/leaderboard correct.  
- E2E: Start → first set → finish → share → reaction → Progress hero updated.  
- Error paths verified across iOS/Android.

**Gate 4 — Polish (ship‑ready)**  
- Copy/i18n finalized; a11y/perf pass; analytics events firing; logs/alerts on.  
- Release notes + **rollback plan** documented; feature flags set (see §12).

---

## 11) Analytics & Logging
**Core events**
- `app_open`, `auth_login_success`
- `workout_started`, `first_set_completed`, `three_sets_completed`, `workout_finished`, `workout_discarded`
- `activity_shared` (props: kind, club_id, session_id), `reaction_added`
- `progress_viewed`, `photo_added`, `photo_compared`
- `settings_updated` (section), `rest_preset_changed`

**Funnels & KPIs**
- Activation: `app_open → workout_started → first_set_completed → workout_finished`  
- Clubs: `activity_shared → reaction_added`  
- Retention: weekly **Progress** views; **Club** completion weeks.

**Guardrails**
- Crash‑free sessions ≥ 99.5%; error‑rate < 1% per screen.

---

## 12) Release, Flags & Rollback
**Feature flags**
- `logging_v2`, `clubs_chat_v1`, `progress_v1`, `photos_pipeline_v1`.  
- Staged rollout: 10% → 50% → 100%; monitor P95 latencies + error budgets.

**Rollback**
- Toggle flags off; revert migrations guarded by reversible scripts; preserve data via shadow tables for `activities` and `pr_events` during changes.

---

## 13) Non‑Functional Requirements (NFRs)
- **Availability:** 99.9% read paths; write paths 99.5%.
- **Performance:** P95 targets per §2; main thread long tasks < 1% frames >16ms.
- **Security/Privacy:** Strict RLS; signed URLs; photos private‑first; audit log on streak flips; rate‑limit inserts (`activities`, `sessions/*` ≤ 5/min/user).
- **Platform:** iOS 15+, Android 9+; memory ≤ 120 MB; list virtualization for feeds.
- **Compliance:** Data deletion on account delete; EXIF stripping for photos.

---

## 14) Dependencies & Risks
- **Supabase Realtime** throughput for peak club activity. Mitigation: per‑club channels + backpressure.  
- **Timezone correctness** for weekly close. Mitigation: consolidate around `club.tz`; comprehensive tests.  
- **Offline logging** complexity. Mitigation: local queue with dedup keys; conflict resolution policy.  
- **Photo pipeline** performance on low‑end devices. Mitigation: background processing + size caps.

---

## 15) References
- Screen PRDs: `/docs/screens/prd-workout.md`, `/docs/screens/prd-clubs-chat.md`, `/docs/screens/prd-progress-settings.md`
- OpenAPI: `/api/openapi.yaml` (to be generated/updated to match §8)
- Migrations & RLS: `/supabase/migrations/`

---

## 16) Open Questions (owners)
- **Coach roles & permissions** beyond member? (UX/PM)  
- **Club goal per week** default and editing rights? (PM)  
- **Photo compare enhancements** (overlays/alignment) v1.1 or later? (UX)  
- **Health sync**: which metrics in MVP if any? (PM/Eng)  
- **Leaderboard ties**: exact tiebreakers and visibility of PR pill sourcing. (PM)  
