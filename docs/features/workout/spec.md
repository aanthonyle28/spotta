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

**Route**: `/workout/add?mode=empty|append|template&targetExerciseId=string`

**Navigation & Header**:

- Custom header with left-aligned back arrow and title "Add Exercises"
- Right-aligned green "Create +" button for adding new exercises
- Header height optimized for better visual hierarchy
- No native Expo Router header (disabled for full custom control)
- **Modal Presentation**: Screen opens as modal instead of fullscreen for better UX

**Information Architecture**:

```tsx
// Props from route params
mode: 'append' | 'empty' | 'template'
targetExerciseId?: string

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

4. **Footer CTA**
   - Conditional display when exercises selected
   - Green button matching app theme
   - Dynamic text based on mode and selection count

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

### Main Workout Screen (`/(tabs)/workout`)

**Route**: `/(tabs)/workout`

**Navigation & Header**:
- Simple H1 heading "Workout"
- No custom header, uses standard tab navigation

**Information Architecture**:

```tsx
// State management
const { state, actions } = useWorkoutState();
const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

// Key state
templates: Template[]           // Available workout templates
activeSession: ActiveSession   // Current workout session (if any)
isLoading: boolean             // Loading states
error: string | null           // Error display
```

**UI Components & Layout**:

1. **Start Empty Button**
   - Primary CTA for starting quick workouts
   - Green button with prominent styling
   - Routes to `/workout/add?mode=empty`

2. **Templates Section**
   - Header row with "Templates" title and reorder icon (ArrowUpDown)
   - Horizontal scrolling carousel of template cards
   - "New Template" card at the end for creating templates

3. **Template Cards (RoutineCard)**
   - **Layout**: Title, exercise info row, Start button at bottom
   - **Title**: Template name with horizontal 3-dots menu (MoreHorizontal)
   - **Exercise Info**: "X exercises" • "X days ago" (if used before)
   - **Start Button**: Blue button with Play icon at card bottom
   - **3-Dots Menu**: Edit, Duplicate, Share, Delete options with icons
   - **Conditional Display**: Last workout date only shows if template was used

4. **Browse Sections**
   - **Browse Exercises**: Tile with Search icon, routes to exercise library
   - **Browse Templates**: Tile with BookOpen icon, for community templates

5. **Reorder Templates Modal**
   - Sheet modal with template list
   - Up/down arrow controls for reordering
   - GripVertical icon visual indicator
   - Save/Cancel actions

**Template Card Visual Design**:
```
┌─────────────────────────────────┐
│ Template Name            ⋯      │ ← Title + 3-dots menu
│                                 │
│ 4 exercises • 3 days ago        │ ← Exercise count + last used
│                                 │
│ [▶ Start]                       │ ← Start button at bottom
└─────────────────────────────────┘
```

**Dropdown Menu Design**:
- **Portal Pattern**: Renders outside card hierarchy to avoid clipping
- **Global State**: Single `activeMenuId` manages which menu is open
- **Positioning**: Fixed position below carousel area (top: 100px, right: 80px)
- **Overlay**: Full-screen dimmed background for tap-outside-to-close
- **Menu Items**: Edit (Edit3), Duplicate (Copy), Share (Share2), Delete (Trash2)

**Data Flow**:

```tsx
// Read models (what UI consumes)
type Template = {
  id: TemplateId;
  title: string;
  exercises: TemplateExercise[];
  lastCompleted?: Date;      // For "X days ago" display
  estimatedDuration: number; // Removed from UI but kept in data
  difficulty: string;
  isPublic: boolean;
  userId: UserId;
};

// Write commands (what UI sends)
type StartTemplateCommand = {
  templateId: TemplateId;
};

type TemplateActionCommand = {
  type: 'EDIT' | 'DELETE' | 'DUPLICATE' | 'SHARE';
  templateId: TemplateId;
};

type ReorderTemplatesCommand = {
  type: 'REORDER_TEMPLATES';
  newOrder: Template[];
};
```

**UI States**:
- **Loading**: Skeleton or loading states during template fetch
- **Empty Templates**: "Create your first template" card when no templates
- **Menu Open**: Dimmed background with dropdown menu visible
- **Reorder Modal**: Sheet modal with draggable template list
- **Error**: Error card with dismiss action

**Accessibility**:
- 44px minimum touch targets for all interactive elements
- Proper accessibility labels for 3-dots menu ("Template options")
- Screen reader support for template cards and menu actions
- Keyboard navigation support for modal and dropdown

### Other Screens

- **Logging Screen**: One active exercise at a time, collapsible cards, custom steppers for Weight/Reps
- **Rest Timer**: Sticky bar with countdown, -15/+15/Skip controls

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

- 2025-08-21 — Mobile — Main workout screen redesign and template management — [main-workout-redesign]
  - ✅ Template card redesign: Removed duration, added last workout info with "X days ago"
  - ✅ Enhanced spacing: Increased gap between title and exercise info, proper visual hierarchy
  - ✅ 3-dots menu system: Horizontal menu with Edit, Duplicate, Share, Delete actions with icons
  - ✅ Portal dropdown pattern: Global menu state with full-screen overlay for proper UX
  - ✅ Browse Templates tile: New component for discovering community templates
  - ✅ Template reordering: Modal with up/down arrows for reordering templates
  - ✅ Reorder UI: Templates title row with ArrowUpDown icon, Sheet modal with save/cancel
  - ✅ Visual polish: Removed icons from exercise count and days ago for cleaner design
  - ✅ Menu positioning: Fixed positioning to avoid clipping, proper tap-outside handling
  - ✅ Accessibility: All interactions meet 44px touch targets, proper labels throughout

- 2025-01-XX — Mobile — QFRONT Phase 1 implementation completed — [workout-frontend]
  - ✅ Core UI components: ExerciseCard, WeightRepsStepper, RestBar
  - ✅ Navigation: Workout main screen, Logging screen with routing
  - ✅ State management: useWorkoutState hook with React built-ins
  - ✅ Mock services: Complete workout flow with simulated API
  - ✅ Performance: Memoized components, optimized re-renders
  - ✅ Testing: Component and hook tests with React Testing Library
  - ✅ Types: Comprehensive TypeScript interfaces and Zod schemas
