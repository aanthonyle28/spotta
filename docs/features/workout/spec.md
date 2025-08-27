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

### Add Exercises Screen (`/workout/add`)

**Route**: `/workout/add?mode=empty|append|template|replace&exerciseId=string`

**Navigation & Header**:

- Custom header with left-aligned back arrow and title "Add Exercises"
- Right-aligned green "Create +" button for adding new exercises
- Header height optimized for better visual hierarchy
- No native Expo Router header (disabled for full custom control)
- **Modal Presentation**: Screen opens as modal instead of fullscreen for better UX

**Information Architecture**:

```tsx
// Props from route params
mode: 'append' | 'empty' | 'template' | 'replace'
exerciseId?: string // Used for replace mode to identify exercise being replaced

// Local state
exercises: Exercise[]           // All available exercises
selectedExercises: Set<ExerciseId>  // User selections
searchQuery: string            // Search filter
selectedCategory: string       // Category filter ('all' | category)
selectedMuscleGroup: string    // Muscle filter ('all' | muscle)
selectedEquipment: string      // Equipment filter ('all' | equipment)
```

**UI Components & Layout**:

1. **Search Bar**
   - Full-width input with search icon
   - Placeholder: "Search exercises by name, muscle, or equipment"
   - Gray background with rounded corners
   - Reduced top spacing from header

2. **Filter Row** (3-column layout)
   - FilterDropdown components for Category, Muscle, Gear
   - Shortened placeholder text for better fit (Category, Muscle, Gear)
   - Gray borders for visual separation
   - True dropdown behavior (not modal) - opens directly below each filter
   - Tap outside to close functionality
   - Proper z-index layering to prevent overlap with other UI elements
   - Reduced spacing between search and filters

3. **Exercise List**
   - FlatList with optimized getItemLayout for performance
   - Exercise cards with selection state
   - Blue checkboxes that fill when selected
   - Card background changes when selected ($blue2)
   - **Replace Mode Behavior**: Single selection only (selecting new exercise deselects others)

4. **Footer CTA**
   - Conditional display when exercises selected
   - Green button matching app theme
   - Dynamic text based on mode and selection count
   - **Replace Mode**: "Replace Exercise" when 1 selected, "Select 1 exercise to replace" otherwise

**Accessibility**:

- Proper accessibility labels for all interactive elements
- 44px minimum touch targets
- Screen reader support for selection state
- Keyboard navigation support

**UI States**:

- **Loading**: Skeleton or spinner during exercise fetch
- **Empty Search**: "No exercises found" with clear search action
- **Error**: Error card with retry capability
- **Selection**: Visual feedback with blue theme colors

**Data Flow**:

```tsx
// Read models (what UI consumes)
type Exercise = {
  id: ExerciseId;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscles: string[];
  equipment: string[];
};

// Write commands (what UI sends)
type SelectionCommand = {
  type: 'TOGGLE_SELECTION';
  exerciseId: ExerciseId;
};

type FilterCommand = {
  type: 'SET_CATEGORY' | 'SET_MUSCLE' | 'SET_EQUIPMENT';
  value: string;
};

type StartWorkoutCommand = {
  type: 'START_WITH_EXERCISES';
  exerciseIds: ExerciseId[];
  mode: 'empty' | 'template';
};

type AppendExercisesCommand = {
  type: 'APPEND_EXERCISES';
  exerciseIds: ExerciseId[];
  mode: 'append';
};

type ReplaceExerciseCommand = {
  type: 'REPLACE_EXERCISE';
  oldExerciseId: ExerciseId;
  newExerciseId: ExerciseId;
  mode: 'replace';
};
```

**Component Architecture**:

```tsx
// FilterDropdown: Custom dropdown with relative positioning
- YStack container with position="relative"
- Button trigger with proper padding and minHeight
- Absolute positioned dropdown (top={46}) below button
- TouchableWithoutFeedback overlay for outside tap detection
- Proper z-index management (dropdown: 100, overlay: 99)

// FilterRow: Container for 3-column filter layout
- XStack with overflow="visible" and zIndex={1}
- Space between filters using space="$3"
- Proper padding and spacing for mobile touch targets
```

**Error States**:

- Network errors with retry action
- Empty exercise database
- Invalid route parameters

### Create Exercise Screen (`/workout/create-exercise`)

**Route**: `/workout/create-exercise`

**Navigation & Header**:

- Custom header with left-aligned back arrow and title "Create Exercise"
- Right-aligned green "Save" button with loading states
- Header height consistent with Add Exercises screen (44px minHeight)
- No native Expo Router header (disabled for full custom control)

**Information Architecture**:

```tsx
// Form state
interface CreateExerciseForm {
  name: string; // Required field
  muscle: string; // Optional - defaults to 'all'
  equipment: string; // Optional - defaults to 'all'
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
}

// Validation state
showNameError: boolean; // Shows red border and "Required" text
```

**UI Components & Layout**:

1. **Exercise Name Field**
   - Text input with placeholder "e.g., Barbell Bench Press"
   - Label: "Exercise Name \*" with conditional "Required" text in red
   - Red border (2px) appears when validation fails
   - Auto-clears validation state when user starts typing

2. **Category Dropdown**
   - FilterDropdown component with options: strength, cardio, flexibility, balance, sports
   - Default selection: 'strength'
   - Label: "Category" (no asterisk - optional)

3. **Primary Muscle Group Dropdown**
   - FilterDropdown component with muscle options: chest, back, shoulders, biceps, triceps, etc.
   - Default selection: 'all'
   - Label: "Primary Muscle Group" (no asterisk - optional)

4. **Equipment Dropdown**
   - FilterDropdown component with equipment options: barbell, dumbbell, cable, machine, bodyweight, etc.
   - Default selection: 'all'
   - Label: "Equipment" (no asterisk - optional)

5. **Help Text**
   - Light blue card with informational styling
   - Text: "Custom exercises are saved to your personal library."
   - Blue background ($blue1), blue border ($blue4), blue text ($blue11)
   - Margin top for visual separation

**Validation Behavior**:

- **Name field only**: Required validation
- **Visual indicators**: Red border + "Required" text appears only on save attempt with empty name
- **Auto-clear**: Validation state clears when user starts typing
- **Silent errors**: No disruptive error cards, graceful error handling

**Data Flow**:

```tsx
// Write command (what UI sends)
type CreateExerciseCommand = {
  name: string;
  category: string;
  equipment: string[]; // Converted from single selection
  primaryMuscles: string[]; // Converted from single selection
  secondaryMuscles: []; // Empty array
  difficulty: 'beginner'; // Default
  isCustom: true;
};
```

**UI States**:

- **Default**: Clean form with dropdown defaults
- **Validation Error**: Red border on name field with "Required" text
- **Saving**: Save button shows loading state with "Saving..." text
- **Success**: Navigate back to Add Exercises screen

**Accessibility**:

- All form fields have proper accessibility labels
- 44px minimum touch targets maintained
- Screen reader support for validation states
- Consistent with existing FilterDropdown accessibility patterns

### Logging Screen (`/logging/[sessionId]`)

**Route**: `/logging/[sessionId]`

**Navigation & Presentation**:

- Presented as navigation modal (`presentation: "modal"`) from root layout
- Entry: From workout template selection or active session
- Exit: Finish workout → workout tab, Cancel → workout tab

**Information Architecture**:

```tsx
// Session data (real-time calculated)
interface SessionStats {
  duration: string; // "12:34" format
  volume: number; // total weight × reps
  exerciseCount: number; // number of exercises
  formattedDate: string; // "Aug, 21 2025" format
  sets: number; // completed sets count
}

// State management
expandedExercises: Set<number>; // Which exercise cards are expanded
showRestPresetSheet: boolean; // Rest timer modal state
selectedExerciseForRest: string | null; // Context for rest settings
```

**UI Components & Layout**:

1. **Header Section** - Fixed at top with session info and controls

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

2. **Scrollable Exercise List** - Collapsible exercise cards with set logging
   - CollapsibleExerciseCard components with expansion state
   - Rest timer buttons at exercise level (small gray buttons)
   - Weight/Reps steppers for each set
   - Set completion checkboxes (no validation required)
   - **Exercise Menu System**: 3-dots menu for exercise management
     - **Remove Exercise**: Shows confirmation alert, removes exercise and recalculates session stats
     - **Replace Exercise**: Navigates to `/workout/add?mode=replace&exerciseId=X` with single-selection constraint
     - **Reorder Exercises**: Opens ExerciseReorderModal with drag-to-reorder interface
   - **Add Exercise Button**: Navigates to `/workout/add?mode=append` for adding exercises to active session
   - Cancel workout button within scrollable content

3. **Rest Timer System** - Configurable timer display options
   - **RestBar**: Traditional sticky bottom bar (legacy mode)
   - **RestTimerModal**: Enhanced compact modal with real-time countdown
   - Real-time countdown updates every 100ms for smooth animation
   - Linear progress indicator showing remaining time
   - Centered timer display with -15/+15 adjustment controls
   - Skip button for immediate rest completion
   - Non-blocking modal allows background scrolling

4. **Rest Preset Sheet** - Modal for rest timer duration configuration
   - **Portal Context**: Uses PortalProvider wrapper to render above navigation modal
   - **Quick presets**: 60s, 90s, 2min, 3min buttons for common durations
   - **Custom time input**: Numeric input for custom rest durations in seconds
   - **Apply actions**: Configure rest time for this exercise, all exercises, or remember for exercise type

5. **Exercise Reorder Modal** - Modal for reordering exercises in the session
   - **Portal Context**: Uses PortalProvider and Sheet components from Tamagui
   - **Exercise List**: Shows all exercises in current session with set counts
   - **Reorder Controls**: Up/down arrow buttons for each exercise
   - **Visual Feedback**: Disabled buttons at list boundaries (first/last positions)
   - **Actions**: Cancel (resets to original order) and Save (applies new order)

**UI States**:

- **Loading**: Loading spinner while fetching session data
- **Active Session**: Main logging interface with exercises
- **No Session**: Error state redirects to workout tab
- **Finishing**: Disabled finish button during save

**Events**:

- **onToggleExpanded**: Expand/collapse exercise sets
- **onSetComplete**: Mark set as complete (no validation)
- **onSetUpdate**: Update weight/reps values
- **onAddSet**: Add new set to exercise
- **onAppendExercises**: Add new exercises to active session (append mode)
- **onShowRestPreset**: Open rest timer settings modal
- **onFinishWorkout**: Complete session with confirmation
- **onDiscardWorkout**: Cancel session with confirmation
- **onRemoveExercise**: Remove exercise with confirmation alert
- **onReplaceExercise**: Navigate to exercise selection in replace mode
- **onReorderExercises**: Open exercise reorder modal

**Data Flow**:

```tsx
// Read models (what UI consumes)
interface SessionExercise {
  id: string;
  exercise: { name: string };
  sets: SetData[];
  restPreset: number; // seconds
}

interface RestTimerState {
  isActive: boolean;
  remainingTime: number;
  totalTime: number;
  exerciseId: ExerciseId | null;
  startedAt: Date | null;
  showAsModal: boolean;
}

interface WorkoutSettings {
  restTimerEnabled: boolean;
  defaultRestTime: number;
  showRestAsModal: boolean; // Always true for modal display
}

interface SetData {
  id: SetEntryId;
  setNumber: number;
  weight?: number;
  reps?: number;
  completed: boolean;
  completedAt?: Date;
}

// Write commands (what UI sends)
actions.completeSet(setData: SetData)
actions.updateSet(exerciseId, setId, updates: Partial<SetData>)
actions.addSet(exerciseId: string)
actions.appendExercises(exerciseIds: ExerciseId[])
actions.finishSession()
actions.discardSession()
actions.startRestTimer(seconds: number, exerciseId: string)
actions.skipRest()
actions.updateRestTimerEnabled(enabled: boolean)
actions.updateShowRestAsModal(showAsModal: boolean)
actions.removeExercise(exerciseId: ExerciseId)
actions.replaceExercise(oldExerciseId: ExerciseId, newExerciseId: ExerciseId)
actions.reorderExercises(reorderedExercises: SessionExercise[])
```

**Accessibility**:

- All buttons have `accessibilityLabel`
- Exercise headers have `accessibilityRole="button"`
- Rest timer buttons properly labeled for screen readers
- Maintain 44×44 hit targets for all interactive elements

**Technical Implementation**:

- **Modal Context**: PortalProvider wrapper required for Tamagui Sheet components within navigation modals
- **Real-time Updates**: Timer updates every second using `setInterval`
- **Performance**: Session stats recalculated via `useMemo` on state changes
- **State Management**: Local component state with useWorkoutState hook integration

### Other Screens

- **Main Screen**: Start quick workout, browse templates, recent workouts with active session banner
- **Rest Timer**: Integrated as RestBar component and RestPresetSheet modal

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

### Unit Tests

- **Components**: ExerciseCard, WeightRepsStepper, RestBar, CollapsibleExerciseCard, RestPresetSheet
- **Hooks**: useWorkoutState, useRestTimer
- **Utilities**: Session stats calculation, date/timer formatting

### Integration Tests

- **Full workout flow**: Start → add exercises → log sets → finish/cancel
- **Rest timer modal**: Rendering within navigation modal context
- **PortalProvider integration**: Tamagui Sheet components work correctly
- **Set operations**: Complete, update, add without validation requirements

### Accessibility Tests

- **VoiceOver**: All buttons and inputs properly labeled
- **Touch targets**: All interactive elements ≥44px
- **Focus order**: Logical navigation through exercise cards and modals
- **Screen reader**: Rest timer and exercise state announcements

## 8. Risks & Mitigations

### Performance

- **Real-time updates**: Use `useMemo` for expensive calculations, `useCallback` for handlers
- **List rendering**: Memoized components, stable style objects, virtualization ready
- **State management**: Optimistic updates, minimal re-renders

### UX & Interaction

- **Modal rendering**: PortalProvider wrapper for Tamagui Sheet components within navigation modals
- **Set logging**: Simple stepper controls, clear visual feedback for completed sets
- **Rest timer**: Sticky bar with intuitive controls, exercise-level customization

### Technical

- **Navigation**: Proper routing with Expo Router, deep link support
- **Modal context**: Follow Tamagui best practices for modals within navigation contexts
- **Accessibility**: Maintain focus order and screen reader compatibility across modal interactions

## 9. Changelog (auto-appended by Scribe)

- 2025-08-24 — Mobile — Exercise menu system with remove, replace, and reorder functionality — [exercise-menu-system]
  - ✅ 3-dots menu: Added MoreVertical icon and dropdown menu to CollapsibleExerciseCard with safe parent-child communication
  - ✅ Remove exercise: Confirmation alert and service method to remove exercise and recalculate session stats
  - ✅ Replace exercise: Navigation to add-exercises in replace mode with single-selection constraint and proper service integration
  - ✅ Reorder exercises: ExerciseReorderModal with up/down arrows following existing ReorderTemplatesModal pattern
  - ✅ Service methods: Added removeExercise, replaceExercise, and reorderExercises methods to workoutService with mock implementations
  - ✅ Hook integration: Extended useWorkoutState with new actions and proper state management
  - ✅ Add-exercises enhancement: Added replace mode support with single selection behavior and validation
  - ✅ Menu state management: Safe parent-child prop communication to handle menu closing on scroll and multi-menu coordination
  - ✅ Type safety: Full TypeScript support with proper action signatures in WorkoutStateProvider
  - ✅ Accessibility: Maintained 44×44 touch targets and proper accessibility labels for all menu actions
  - ✅ Error handling: Confirmation alerts for destructive actions and proper error states throughout

- 2025-08-24 — Mobile — Fixed active state banner persistence with AsyncStorage integration — [active-banner-persistence-fix]
  - ✅ Persistent storage: Added AsyncStorage dependency and StorageService for data persistence across app restarts
  - ✅ Development state fixes: Replaced in-memory developmentState with persistent storage to prevent mock session recreation
  - ✅ Hook initialization: Updated useWorkoutState to await persistent state check before creating mock sessions
  - ✅ Service layer: Created StorageService following existing patterns with async methods and error handling
  - ✅ Type safety: Full TypeScript support with proper error handling throughout storage operations
  - ✅ Session lifecycle: Both finishSession and discardSession now properly mark completion in persistent storage
  - ✅ Error resilience: Graceful fallback behavior when storage operations fail
  - ✅ Architecture consistency: Maintains existing React Context + hooks pattern with service layer
  - ✅ Foundation: Establishes persistent storage foundation for future features requiring data persistence

- 2025-08-22 — Mobile — Enhanced rest timer modal with user controls — [rest-timer-modal-enhancement]
  - ✅ RestTimerModal component: Compact, non-blocking bottom modal with real-time countdown
  - ✅ Real-time updates: Smooth countdown with 100ms intervals and linear progress indicator
  - ✅ Enhanced controls: Centered timer display with -15/+15 adjustment and Skip functionality
  - ✅ Non-modal behavior: Users can scroll and interact with background while timer is active
  - ✅ Simplified settings: RestPresetSheet focused on duration configuration only
  - ✅ Progress animation: Linear progress bar showing remaining time without precision errors
  - ✅ Accessibility: Maintained proper touch targets and button sizing for mobile use
  - ✅ Clean UI: Removed rounded corners and swipe handle for streamlined appearance

- 2025-08-22 — Mobile — Append exercises functionality with optimistic updates — [append-exercises-feature]
  - ✅ Optimistic updates: Exercises appear immediately on logging screen when added
  - ✅ useWorkoutState integration: Added `appendExercises` method with error handling
  - ✅ Service layer: Extended workoutService with `appendExercises` mock implementation
  - ✅ Add mode fix: Fixed append mode in Add Exercises screen to call proper action
  - ✅ State management: Proper exercise ordering with `orderIndex` calculation
  - ✅ Error recovery: Rollback state on service failures with user-facing error messages
  - ✅ Type safety: Full TypeScript support with branded ExerciseId types
  - ✅ Performance: Immediate UI feedback with background sync following TanStack Query patterns
  - ✅ Documentation: Updated workout spec with append exercises data flow and events

- 2025-08-20 — Mobile — Create Exercise screen redesign and Add Exercises modal conversion — [create-exercise-redesign]
  - ✅ Header redesign: Back arrow (left) + left-aligned title + Save button (right) matching Add Exercises pattern
  - ✅ Modal presentation: Add Exercises screen now opens as modal instead of fullscreen
  - ✅ Form simplification: Replaced radio buttons and checkboxes with FilterDropdown components
  - ✅ Validation streamlining: Only Exercise Name required, with red border and "Required" text indicators
  - ✅ Optional fields: Category, Muscle Group, Equipment now optional with 'all' defaults
  - ✅ Help text styling: Blue informational card with proper spacing and visual hierarchy
  - ✅ Error handling: Silent error handling without disruptive error cards
  - ✅ Component reuse: Leveraged existing FilterDropdown for consistency with Add Exercises
  - ✅ Accessibility: Maintained 44px touch targets and proper labels throughout

- 2025-08-20 — Mobile — Add Exercises screen true dropdown implementation — [true-dropdown-filters]
  - ✅ True dropdown behavior: Replaced Sheet modals with custom relative-positioned dropdowns
  - ✅ Custom FilterDropdown: Built dropdown using YStack containers with absolute positioning
  - ✅ Proper alignment: Dropdown appears directly below tapped filter button
  - ✅ Layout hierarchy: Fixed z-index layering to prevent UI element overlap
  - ✅ Outside tap detection: TouchableWithoutFeedback overlay for proper UX
  - ✅ Component positioning: Used top={46} pixel positioning for accurate placement
  - ✅ Container overflow: Added overflow="visible" to FilterRow for dropdown visibility
  - ✅ Spacing optimization: Proper spacing between filters and results summary

- 2025-08-20 — Mobile — Add Exercises screen UI redesign completed — [add-exercises-redesign]
  - ✅ Custom header: Disabled native header, implemented custom with proper spacing
  - ✅ Header layout: Left-aligned back arrow and title, right-aligned green "Create +" button
  - ✅ Search improvements: Reduced top spacing from header for better flow
  - ✅ Filter redesign: 3-column FilterRow with shortened placeholders (Category, Muscle, Gear)
  - ✅ Filter styling: Added gray borders, reduced spacing between search and filters
  - ✅ Component architecture: FilterDropdown and FilterRow components with proper props
  - ✅ Accessibility: Maintained proper labels and touch targets throughout redesign

- 2025-08-22 — Mobile — Logging screen rest timer modal fix — [rest-timer-modal-fix]
  - ✅ Modal context: Added PortalProvider wrapper to logging screen for proper Tamagui Sheet rendering
  - ✅ Navigation modal support: Fixed rest timer modal visibility within navigation modal context
  - ✅ Documentation: Merged logging screen specs into main workout feature documentation
  - ✅ Technical implementation: Follow Tamagui best practices for modals within navigation boundaries

- 2025-08-25 — Mobile — Rest timer settings logic complete redesign — [rest-timer-settings-fix]
  - ✅ Template-level timer: Added separate `templateRestTime` to ActiveSession for independent template timer management
  - ✅ Timer isolation: Exercise-specific timer changes no longer affect template timer input or UI display
  - ✅ Template inheritance: Templates with varied rest times (30s-180s) properly transfer to session exercises
  - ✅ UI clarity: Template timer header shows actual value ("Rest: 90s") instead of generic "Template" text
  - ✅ RestPresetSheet fixes: Template-level settings use actual template timer value, not arbitrary default
  - ✅ Double timer start fix: Removed duplicate timer initialization from logging screen to prevent conflicts
  - ✅ Template changes: When user changes template timer, updates both template-level and all exercise timers
  - ✅ Data flow: Template → Session rest time inheritance with proper fallback values (90s default)
  - ✅ Type safety: Updated ActiveSession interface, mock data, and all test fixtures with templateRestTime
  - ✅ State management: Added updateTemplateRestTime action to useWorkoutState with proper isolation
  - ✅ Modal accuracy: Rest timer modal now displays correct exercise-specific timer after set completion
  - ✅ User control: Clear separation between template-level controls and individual exercise customization

- 2025-08-27 — Mobile — Rest timer modal state synchronization fixes — [rest-timer-modal-sync]
  - ✅ RestPresetSheet display fix: Implemented memoized `currentRestTime` calculation to eliminate race conditions between `selectedExerciseForRest` state updates and modal display
  - ✅ Exercise-specific values: Fixed modal showing incorrect rest times when switching between exercises due to React state batching timing issues
  - ✅ Template isolation: Ensured template-level rest timer changes don't affect individual exercise modal displays
  - ✅ Duplicate set keys fix: Added counter and random suffix to set ID generation (`createMockSet`) to prevent React key conflicts and checkbox connection issues
  - ✅ Rest countdown accuracy: Verified RestTimerModal uses correct exercise-specific `restPreset` values from service layer (`exercise?.restPreset || 120`)
  - ✅ State memoization: Added `useMemo` for both `currentRestTime` and `selectedExerciseName` calculations with proper dependency arrays
  - ✅ Checkbox isolation: Fixed second exercise checkboxes incorrectly connecting to first exercise due to duplicate set IDs
  - ✅ Set creation reliability: Enhanced set ID uniqueness in both `mockData.ts` and `useWorkoutState.ts` to prevent duplicate key warnings
  - ✅ Modal consistency: RestPresetSheet now reliably shows exercise-specific values without requiring multiple attempts
  - ✅ Performance optimization: Maintained React performance with proper memoization while fixing state synchronization issues

- 2025-08-24 — UI Navigation Fix — Fixed ActiveSessionBanner navigation race condition causing banner to disappear immediately when tapping to go to logging screen. Enhanced banner visibility logic with loading state check and improved session validation logging. — [banner-navigation-fix]

- 2025-01-XX — Mobile — QFRONT Phase 1 implementation completed — [workout-frontend]
  - ✅ Core UI components: ExerciseCard, WeightRepsStepper, RestBar, CollapsibleExerciseCard, RestPresetSheet
  - ✅ Navigation: Workout main screen, Logging screen with modal presentation and routing
  - ✅ State management: useWorkoutState hook with React built-ins, rest timer integration
  - ✅ Mock services: Complete workout flow with simulated API, set operations without validation
  - ✅ Performance: Memoized components, optimized re-renders, real-time stats calculation
  - ✅ Testing: Component and hook tests with React Testing Library, accessibility compliance
  - ✅ Types: Comprehensive TypeScript interfaces and Zod schemas for all workout data
