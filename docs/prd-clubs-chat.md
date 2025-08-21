# PRD — Clubs Chat (4‑Phase: FE → BE → Integrate → Polish)

**Filename:** `/docs/screens/prd-clubs-chat.md`  
**Status:** Draft 2025-08-16 • Owner: Anthony (UX) • Dev Leads: FE—TBD · BE—TBD

---

## 1) Overview

Turn the club chat into an accountability-first space where members share completed workouts with one tap, react with kudos, sustain **personal weekly streaks** and a **club weekly streak**, and view a simple **consistency + PR** leaderboard. Minimal social chrome; feels like messaging.

**Value**

- Users: easy, lightweight accountability and encouragement.
- Business: higher D7/WAU retention via group engagement and streaks.

## 2) Goals & Success Metrics

- ≥60% of active members post ≥1 workout/week in a club by week 4.
- ≥40% of shared sessions receive ≥1 reaction by week 4.
- Club-week completion (all members meet goal) ≥30% of weeks by week 6.
- (Leading) Latency P95 to render chat feed ≤ 300 ms post-realtime event.

## 3) Primary Users & JTBD

- **Everyday lifter**: _When I finish a workout, I want to share it fast so my friends see I showed up and can hype me up._
- **Club organizer/coach** (optional): _When my group is lagging, I want a clean view of who’s done and who needs a nudge so we keep our streak._

## 4) User Stories (AC‑ready)

1. **Share workout from history**
   - _As a member_, I can share a past session into chat so that it counts toward my weekly progress.
   - **Given** I open the club chat, **when** I tap **Add Workout** → select a past session → **Share**, **then** a Workout activity message appears in the feed within 1s and my weekly sessions increment (idempotent per session/day).
2. **React with kudos**
   - _As a member_, I can double‑tap a message to add a Kudos reaction so that I can encourage others quickly.
   - **Given** I see an activity message, **when** I double‑tap, **then** a heart appears with light haptic and my reaction is persisted; **when** I long‑press, **then** I can choose 👍🔥💪🎉.
3. **View streak status**
   - _As a member_, I see a weekly group bar showing `completed/total` and whether we’re **On Track** or **At Risk**.
   - **Given** today is within the club week, **when** members share qualifying workouts, **then** the bar updates in realtime and the **Club Streak** badge increments on week close only if all completed.
4. **Open Leaderboard**
   - _As a member_, I can open a modal to see the weekly **Consistency** ranking with a small **PR n** pill per person.
   - **Given** the week has activity, **when** I tap **Leaderboard**, **then** I see a sorted list by `sessions desc` with ties handled by last activity time.

## 5) Core Flows

- **Happy path**: Open Chat → Add Workout → Select session → Share → Realtime message → Reactions arrive → Group bar updates → Leaderboard reflects counts.
- **Errors**: 401 (prompt login), 403 (not a member → join/leave state), 404 (session missing → toast, no count), 409 (duplicate share → message shows once, no double count), 5xx (toast + retry enqueue).

## 6) Functional Requirements

- **FR‑1** Chat route `/clubs/:id/chat` renders header (avatar/streak ring, title, leaderboard button) and **Group Streak Bar**.
- **FR‑2** Quiet‑Day banner shows if no activity today; CTA **Add Workout** opens **Share from History**.
- **FR‑3** Feed renders **ActivityMessage.Workout/PR/Msg** with reactions (double‑tap and long‑press palette).
- **FR‑4** Tapping an activity opens **Activity Details** overlay with session summary and sets table; media thumb if present.
- **FR‑5** **Share from History** lists recent sessions with filters (This Week / Last Week / Older; All | Gym | Mobility | Recovery).
- **FR‑6** Leaderboard modal shows weekly **Consistency** (sessions) with `PR n` pill; resets weekly.
- **FR‑7** Weekly progress counts only when a workout is shared to the club (idempotent per `{club_id, session_id}`).
- **FR‑8** Personal and club streaks update at week close based on club timezone and member completion.
- **FR‑9** Realtime updates for new activities and reactions; optimistic UI for reactions.
- **FR‑10** Accessibility: targets ≥44px; high contrast; reduced‑motion respected.

## 7) Data & Constraints (high level)

- Entities: `clubs`, `club_members`, `activities(kind='workout'|'pr'|'msg')`, `reactions`, `user_week_progress`, `club_week_status`, `leaderboard_weekly`.
- Privacy: only members can read club activities; reactions limited to members; deletes restricted.
- Timezone: per‑club `timezone` drives `day` and `week_start` calculations; crons run per‑club.

## 8) Phased Acceptance Criteria (the 4 gates)

- **Gate 1 — Front‑End ready (stubbed data):**
  - Chat screen renders header, streak bar, banner, feed, composer, overlays using mocked data; empty/loading/error/success states covered.
  - Double‑tap/long‑press gestures present; a11y labels and focus order defined; component tests for visible states pass.
- **Gate 2 — Back‑End ready (contract green):**
  - Tables & RLS created; RPC/cron functions implemented; sample payloads for activities and reactions documented.
  - Unit/contract tests for idempotent share, progress roll‑up, and streak close pass.
- **Gate 3 — Integrated (end‑to‑end):**
  - FE wired to BE; new activity appears within 1s; weekly counts and leaderboard update; 401/403/404/409/5xx paths verified.
  - E2E test: Share workout → Reaction → Leaderboard reflects.
- **Gate 4 — Polish (ship‑ready):**
  - Copy finalized; micro‑confetti on first PR per lift/week; performance P95 ≤ 300 ms feed append; analytics events verified; logs/alerts configured.

## 9) API Contract Links

- `/api/openapi.yaml#/paths/~1clubs~1{id}~1activities` (GET, POST)
- `/api/openapi.yaml#/paths/~1activities~1{id}~1reactions` (POST, DELETE)
- `/api/openapi.yaml#/paths/~1clubs~1{id}~1leaderboard` (GET)
- `/api/openapi.yaml#/paths/~1rpc~1hydrate_week_progress` (POST)

## 10) Non‑Functional Requirements

- Availability 99.9% for read paths. P95 realtime append ≤ 1s. FE memory ≤ 120 MB; list virtualized.
- Security: RLS by club membership; rate‑limit activity inserts; audit log for streak flips.

## 11) Open Questions

- Should non‑workout “text messages” be enabled at MVP or gated? **Owner:** UX.
- How do we treat members who join mid‑week for `total_members`? (Current plan: exclude before join.) **Owner:** BE.
- Media uploads in chat: in‑scope for MVP or later? **Owner:** PM.
