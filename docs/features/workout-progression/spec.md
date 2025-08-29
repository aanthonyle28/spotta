# Workout Progression & Previous Exercise Data

**Status:** Released  
**Owner:** AI Assistant  
**Scope:** Mobile (Expo) | UI | Data Services  
**Links:** PR (pending), Feature Request, Test Plan

## 1. Purpose & KPIs

Enable users to track their workout progression by displaying previous exercise performance and providing intelligent suggestions for weight/rep progression using double-progression methodology.

**KPIs:**
- Increased user workout completion rates
- Better progression tracking accuracy
- Reduced time spent deciding on weight/rep values
- Improved user workout consistency

## 2. User Stories & Non-Goals

### User Stories
- **US-1:** As a user, I want to see what weight and reps I used last time for the same exercise and set number
- **US-2:** As a user, I want suggested weight/rep values based on my previous performance
- **US-3:** As a user, I want to complete sets with one click using suggested values
- **US-4:** As a user, I want to easily adjust weight using smart rounding (nearest 5 lbs)
- **US-5:** As a user, I want to edit my sets even after marking them complete

### Non-Goals
- Multi-session progression tracking
- Exercise-specific rep ranges
- Advanced periodization
- Social comparison features

## 3. UX Spec (screens/states/a11y)

### Visual Layout
```
prev   135    8    
SET    WEIGHT REPS  ✓
1    [137.5][8 ]  [ ]  → Empty state with placeholders

prev   135    8     [Light Blue Overlay]
SET    WEIGHT REPS  ✓ [Light Blue Overlay] 
1    [137.5][8 ]  [✓]  → Completed state (still editable)
```

### UI States
- **Loading:** Fetching previous exercise data
- **Empty:** No previous data available (shows "—")
- **Populated:** Previous data displayed with suggestions
- **Completed:** Light blue overlay, checkmark filled
- **Error:** Graceful fallback to no suggestions

### Accessibility
- Previous data clearly labeled as "prev"
- Completion buttons have descriptive labels
- Weight/rep inputs remain accessible after completion
- Smart rounding provides predictable increment behavior

## 4. Data & Contracts (tables/RLS/Zod/Edge)

### Data Models

```typescript
interface PreviousSetData {
  setNumber: number;
  weight?: number;
  reps?: number;
  workoutId: WorkoutId;
  completedAt: Date;
}

interface ProgressionSuggestion {
  weight?: number;
  reps?: number;
  reasoning: 'increase_weight' | 'add_reps' | 'decrease_weight' | 'maintain';
}
```

### Service Methods

```typescript
// WorkoutService additions
async getPreviousSetData(exerciseId: ExerciseId, setNumber: number): Promise<PreviousSetData | null>
async getProgressionSuggestion(exerciseId: ExerciseId, setNumber: number): Promise<ProgressionSuggestion | null>
```

### Database Query Pattern
```sql
SELECT weight, reps, set_number 
FROM set_entries se
JOIN workouts w ON se.workout_id = w.id  
WHERE se.exercise_id = ? 
  AND se.set_number = ?
  AND se.completed = true 
  AND w.completed_at IS NOT NULL
  AND w.user_id = ?
ORDER BY w.completed_at DESC 
LIMIT 1
```

## 5. Realtime & Offline

### Realtime
- Previous data is fetched when exercise is expanded
- No real-time updates needed (historical data)
- Suggestions calculated client-side

### Offline
- Previous data cached in memory during session
- Graceful degradation when offline (no suggestions)
- Mock data available for development/testing

## 6. Analytics & Experimentation

### Events
- `progression_suggestion_used` - User completes set with suggested values
- `progression_suggestion_modified` - User modifies suggested values
- `previous_data_viewed` - User expands exercise (sees previous data)
- `smart_rounding_used` - User uses +/- buttons with rounding

### Properties
- Exercise type
- Suggestion reasoning (increase_weight, add_reps, etc.)
- Weight difference from previous
- Rep difference from previous

## 7. Test Plan

### Unit Tests
- ✅ Progression suggestion logic (all scenarios)
- ✅ Previous set data retrieval
- ✅ Weight rounding logic
- ✅ Edge cases (no previous data, zero values)

### Integration Tests
- ✅ Set completion with placeholder values
- ✅ Header metrics updating correctly
- ✅ UI state changes (completed overlay)

### Manual Testing
- [ ] Exercise expansion shows previous data
- [ ] Placeholder values appear in inputs
- [ ] Smart rounding works (32.5 → 35, 30 → 25)
- [ ] One-click completion with suggestions
- [ ] Post-completion editing enabled
- [ ] Light blue overlay appears
- [ ] Header metrics update correctly

## 8. Risks & Mitigations

### Risks
- **Performance:** Fetching previous data for multiple exercises
- **Data accuracy:** Ensuring suggestions are based on correct previous data
- **User confusion:** New UI elements need clear labeling

### Mitigations
- Lazy loading (only when exercise expanded)
- Comprehensive error handling and fallbacks
- Clear visual hierarchy (prev data above sets)
- User testing and iteration

## 9. Changelog (auto)

- **2024-01-XX** — Mobile UI — Implemented previous exercise data display and double-progression suggestions — [PR #XXX]
- **2024-01-XX** — Mobile UI — Added smart weight rounding and post-completion editing — [PR #XXX]
- **2024-01-XX** — Mobile UI — Fixed header metrics updating with placeholder values — [PR #XXX]
- **2024-01-XX** — Services — Added progression logic and previous data retrieval methods — [commit abc123]
- **2024-01-XX** — Testing — Added comprehensive test coverage for progression features — [commit def456]

## 10. Component Architecture

### Key Components
- `CollapsibleExerciseCard` - Main container, fetches previous data
- `WeightRepsStepper` - Enhanced with placeholder values and smart rounding
- `workoutService` - New methods for progression logic

### Data Flow
1. User expands exercise
2. `useEffect` fetches previous data and suggestions
3. Data populates placeholders and previous row
4. User interacts (complete, edit, increment)
5. Updates propagate to header metrics

### Props & State
```typescript
// CollapsibleExerciseCard additions
const [previousData, setPreviousData] = useState<Record<number, PreviousSetData | null>>({});
const [suggestions, setSuggestions] = useState<Record<number, ProgressionSuggestion | null>>({});

// WeightRepsStepper additions  
suggestedWeight?: number;
suggestedReps?: number;
```

## 11. Performance Considerations

- Previous data fetched only on exercise expansion
- Suggestions calculated client-side (no server calls)
- Memoized components prevent unnecessary re-renders
- Mock data structure optimized for lookups

## 12. Future Enhancements

- Exercise-specific rep ranges and increments
- Historical progression graphs
- Auto-progression based on completion patterns
- Integration with workout templates
- Advanced periodization patterns