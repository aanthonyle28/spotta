# Logging Screen Redesign

**Status:** Released  
**Owner:** Claude Code  
**Scope:** Mobile (Expo) | UI  
**Links:** logging screen redesign implementation

## 1. Purpose & KPIs

Redesign the workout logging screen to improve user experience with better metrics display, simplified set logging, and reorganized layout for mobile usage.

## 2. User Stories & Non-Goals

### User Stories

- As a user, I want to see the current date and workout timer prominently displayed
- As a user, I want to log sets without being forced to enter weight/reps data
- As a user, I want easy access to rest timer settings at both template and exercise levels
- As a user, I want the add exercise and cancel buttons within the scrollable content

### Non-Goals

- Changes to data models or backend logic
- Modifications to existing workout state management

## 3. UX Spec (screens/states/a11y)

### Navigation

- Route: `/logging/[sessionId]`
- Entry: From workout template selection or active session
- Exit: Finish workout → workout tab, Cancel → workout tab

### UI States

- **Loading**: Loading spinner while fetching session data
- **Active Session**: Main logging interface with exercises
- **No Session**: Error state redirects to workout tab
- **Finishing**: Disabled finish button during save

### Components & Layout

#### Header Section (`logging/[sessionId].tsx:299-361`)

```tsx
// Title row: Session name + Finish button
<XStack justifyContent="space-between">
  <YStack>
    <Text fontSize="$5">{session.name}</Text>
    <Text fontSize="$4" color="$gray11">{formattedDate}</Text>
  </YStack>
  <Button backgroundColor="$green9">Finish</Button>
</XStack>

// Metrics row: Timer, Volume, Exercise count + Rest timer button
<XStack justifyContent="space-between">
  <XStack space="$3">
    <Clock + Timer />
    <Trophy + Volume />
    <Dumbbell + Exercise count />
  </XStack>
  <Button backgroundColor="$gray3">Rest: 90s</Button>
</XStack>
```

#### Exercise Cards (`CollapsibleExerciseCard.tsx`)

```tsx
// Header: Exercise name, sets progress, rest timer
<XStack justifyContent="space-between">
  <YStack>
    <Text>{exercise.name}</Text>
    <XStack>
      <Text>
        {completedSets}/{totalSets} sets
      </Text>
      <Button backgroundColor="$gray3">
        <Clock size={12} />
        <Text>{restPreset}s</Text>
      </Button>
    </XStack>
  </YStack>
  <ChevronDown />
</XStack>

// Expandable sets with weight/reps steppers and checkboxes
```

#### Scrollable Content Area

- Exercise cards (collapsible)
- Add Exercise button
- Cancel workout button

### Events

- **onToggleExpanded**: Expand/collapse exercise sets
- **onSetComplete**: Mark set as complete (no validation)
- **onSetUpdate**: Update weight/reps values
- **onAddSet**: Add new set to exercise
- **onShowRestPreset**: Open rest timer settings modal
- **onFinishWorkout**: Complete session with confirmation
- **onDiscardWorkout**: Cancel session with confirmation

### Accessibility

- All buttons have `accessibilityLabel`
- Exercise headers have `accessibilityRole="button"`
- Rest timer buttons properly labeled for screen readers
- Maintain 44×44 hit targets for all interactive elements

## 4. Data & Contracts

### Read Models (FE Consumes)

```tsx
// Session stats (real-time calculated)
interface SessionStats {
  duration: string; // "12:34" format
  volume: number; // total weight × reps
  exerciseCount: number; // number of exercises
  formattedDate: string; // "Aug, 21 2025" format
  sets: number; // completed sets count
}

// Exercise data structure
interface SessionExercise {
  id: string;
  exercise: { name: string };
  sets: SetData[];
  restPreset: number; // seconds
}

interface SetData {
  id: SetEntryId;
  setNumber: number;
  weight?: number;
  reps?: number;
  completed: boolean;
  completedAt?: Date;
}
```

### Write Commands (FE Sends)

```tsx
// Set operations
actions.completeSet(setData: SetData)
actions.updateSet(exerciseId, setId, updates: Partial<SetData>)
actions.addSet(exerciseId: string)

// Session operations
actions.finishSession()
actions.discardSession()

// Rest timer operations
actions.startRestTimer(seconds: number, exerciseId: string)
actions.skipRest()
```

### Error States

- Session not found → redirect to workout tab
- Set operation failures → console error, no UI feedback
- Network errors → handled by underlying workout state

## 5. Realtime & Offline

- Real-time timer updates every second using `setInterval`
- Session stats recalculated on every state change via `useMemo`
- No additional realtime subscriptions required
- Offline support handled by existing workout state management

## 6. Analytics & Experimentation

No analytics changes required for this UI redesign.

## 7. Test Plan

### Unit Tests

- Session stats calculation accuracy
- Date formatting correctness
- Timer formatting (mm:ss)
- Exercise expansion state management

### Integration Tests

- Set completion without validation
- Rest timer modal z-index fix
- Button interactions and state updates
- Navigation flows (finish/cancel)

### Manual Testing

- Header metrics display correctly
- Real-time timer updates
- Exercise cards expand/collapse
- Set checkboxes work without weight/reps
- Rest timer buttons open modal above screen
- Scrollable content includes all buttons
- Finish/cancel confirmations work

## 8. Risks & Mitigations

### Risks

- **Modal z-index issues**: Rest timer modal could appear behind logging screen
- **Performance**: Real-time timer updates could cause excessive re-renders
- **Accessibility**: Complex nested layout could break screen reader navigation

### Mitigations

- **Portal wrapper**: Use Tamagui Portal with explicit z-index values
- **Memoization**: Use `useMemo` for expensive calculations, `useCallback` for handlers
- **Accessibility testing**: Verify focus order and screen reader compatibility

## 9. Changelog (auto)

- 2025-08-22 — feat: redesign logging screen header with date, timer, and metrics — [implementation]
- 2025-08-22 — feat: add rest timer buttons to template and exercise levels — [implementation]
- 2025-08-22 — fix: remove set completion validation to allow flexible logging — [implementation]
- 2025-08-22 — feat: move action buttons to scrollable content area — [implementation]
- 2025-08-22 — fix: rest timer modal z-index with Portal wrapper — [implementation]
