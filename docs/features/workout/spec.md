# Workout Feature

**Status:** In Progress  
**Owner:** Claude  
**Scope:** Mobile (Expo) | UI | Mock Services  
**Links:** QFRONT Implementation

## 1. Purpose & KPIs
- Problem statement: Enable users to start a workout in 1–2 taps, log sets quickly one‑handed, and manage rest per‑exercise or session‑wide
- Target outcomes: 
  - Median time_to_first_set ≤ 30s for new users
  - ≥80% of sessions started from Start Empty or Start (template)
  - Session finish_rate ≥ 70%

## 2. User Stories & Non-Goals
- **Story**: As a lifter, when I'm in the gym, I want to log sets fast without typing so I can stay focused and accurate
- **Non-goals**: Real-time collaboration, complex exercise programming

## 3. UX Spec
- **Main Screen**: Start quick workout, browse templates, recent workouts with active session banner
- **Logging Screen**: One active exercise at a time, collapsible cards, custom steppers for Weight/Reps
- **Rest Timer**: Sticky bar with countdown, -15/+15/Skip controls
- **States**: Loading, error, empty, active session, completed session

## 4. Data & Contracts
- **Types**: ActiveSession, SessionExercise, SetData, Exercise, Template
- **Mock Services**: workoutService with simulated network delays
- **Zod Schemas**: Complete validation for all workout data structures
- **Storage**: In-memory during Phase 1, local state persistence

## 5. Realtime & Offline
- **Phase 1**: Local state only, no real-time features
- **Future**: Optimistic updates, offline queue for set mutations

## 6. Analytics & Experimentation
- **Events**: workout_started, first_set_completed, three_sets_completed, workout_finished
- **Properties**: session_id, exercise_count, total_volume, duration

## 7. Test Plan
- **Unit Tests**: Components (ExerciseCard, WeightRepsStepper, RestBar), Hooks (useWorkoutState, useRestTimer)
- **Integration**: Full workout flow from start to finish
- **Accessibility**: VoiceOver labels, touch targets ≥44px

## 8. Risks & Mitigations
- **Performance**: Memoized components, stable style objects, virtualization ready
- **UX**: Simple stepper controls, clear visual feedback for completed sets
- **Navigation**: Proper routing with Expo Router, deep link support

## 9. Changelog (auto-appended by Scribe)
- 2025-01-XX — Mobile — QFRONT Phase 1 implementation completed — [workout-frontend]
  - ✅ Core UI components: ExerciseCard, WeightRepsStepper, RestBar
  - ✅ Navigation: Workout main screen, Logging screen with routing
  - ✅ State management: useWorkoutState hook with React built-ins
  - ✅ Mock services: Complete workout flow with simulated API
  - ✅ Performance: Memoized components, optimized re-renders
  - ✅ Testing: Component and hook tests with React Testing Library
  - ✅ Types: Comprehensive TypeScript interfaces and Zod schemas