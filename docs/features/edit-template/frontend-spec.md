# Edit Template Screen - Frontend Specification

**Status:** Completed  
**Screen:** `/edit-template/[id]`  
**Component:** `apps/mobile/app/edit-template/[id].tsx`

## Navigation & Props

### Route Parameters
- `id: string` - Template ID to edit

### Navigation Flow
```
Template Preview → [Edit button] → Edit Template → [Save] → Template Preview
                                               → [Back] → Template Preview
```

## Screen Structure

### Layout Architecture
```
SafeAreaView
└── YStack flex={1}
    ├── CustomHeader (clean, no save button)
    ├── ScrollView (showsVerticalScrollIndicator={false})
    │   └── YStack padding="$4" space="$4"
    │       ├── Template Details Form
    │       ├── Exercise Section Header (gray bg, edge-to-edge)
    │       └── [End main container]
    │   └── Exercise List (edge-to-edge, marginHorizontal="$-4")
    └── Sticky Bottom Save Action
```

## Components & UI States

### 1. Header Component
```tsx
<CustomHeader 
  title="Edit Template"
  leftAction={<BackButton />}
  // No right action - save moved to bottom
/>
```

### 2. Form Section
```tsx
<YStack padding="$4" space="$4">
  {/* Template Name Input */}
  <YStack space="$2.5">
    <XStack justifyContent="space-between">
      <Text fontSize="$4" fontWeight="600">Template Name</Text>
      <Text fontSize="$2" color={showTitleError ? '$red10' : 'white'}>
        Required
      </Text>
    </XStack>
    <Input 
      fontSize="$4"
      paddingVertical="$2.5"
      borderRadius="$2"
      // Error states with red border/background
    />
  </YStack>

  {/* Description Input */}
  <YStack space="$2.5">
    <XStack justifyContent="space-between">
      <XStack space="$2">
        <Text fontSize="$4" fontWeight="600">Description</Text>
        {/* Character count next to label */}
        <Text fontSize="$2" color="$gray9">
          ({count}/200)
        </Text>
      </XStack>
      <Text fontSize="$2" color="$gray9">Optional</Text>
    </XStack>
    <Input 
      multiline
      minHeight={80}
      paddingVertical="$2.5"
      // Same styling as title
    />
  </YStack>
</YStack>
```

### 3. Exercise Section Header
```tsx
<XStack
  backgroundColor="$gray2"
  paddingHorizontal="$4"
  paddingVertical="$3"
  marginHorizontal="$-4"  // Break out of container
>
  <Text fontSize="$5" fontWeight="600">Exercises</Text>
  <XStack space="$3">
    <Text fontSize="$3" color="$gray10">{count} exercises</Text>
    <Button size="$3" backgroundColor="$blue9" icon={<Plus />}>
      Add
    </Button>
  </XStack>
</XStack>
```

### 4. Exercise List Items
```tsx
<YStack marginHorizontal="$-4">  // Edge-to-edge container
  {exercises.map(exercise => (
    <XStack
      paddingHorizontal="$4"      // Internal padding for alignment
      paddingVertical="$4"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$gray3"
    >
      <YStack flex={1} space="$2">
        {/* Exercise name with index */}
        <Text fontSize="$5" fontWeight="600">
          {index + 1}. {exercise.name}
        </Text>
        
        {/* Set details */}
        <XStack space="$3" flexWrap="wrap">
          <Text fontSize="$3" fontWeight="600" color="$blue10">
            {sets} sets
          </Text>
          <Text fontSize="$3" color="$gray11">× {reps} reps</Text>
          <Text fontSize="$3" color="$gray11">@ {weight} lbs</Text>
        </XStack>
        
        {/* Muscle group pills */}
        <XStack space="$2" flexWrap="wrap">
          {muscles.slice(0,3).map(muscle => (
            <Text 
              fontSize="$2"
              backgroundColor="$gray3"
              paddingHorizontal="$2.5"
              paddingVertical="$1.5"
              borderRadius="$2"
            >
              {muscle}
            </Text>
          ))}
          {/* +N overflow indicator */}
        </XStack>
      </YStack>
      
      <Button chromeless onPress={removeExercise}>
        <Text fontSize="$3" color="$red10">Remove</Text>
      </Button>
    </XStack>
  ))}
</YStack>
```

### 5. Empty State
```tsx
<YStack 
  paddingHorizontal="$4"
  paddingVertical="$8"
  alignItems="center"
  space="$4"
>
  <YStack alignItems="center" space="$3">
    <Target size={48} color="$gray8" />
    <Text fontSize="$4" fontWeight="600" textAlign="center">
      No exercises in this template
    </Text>
    <Text fontSize="$3" color="$gray10" textAlign="center">
      Add exercises to create your workout template
    </Text>
  </YStack>
  <Button size="$4" backgroundColor="$blue9" icon={<Plus />}>
    Add Exercises
  </Button>
</YStack>
```

### 6. Sticky Bottom Action
```tsx
<YStack
  paddingHorizontal="$4"
  paddingVertical="$3"
  paddingBottom="$6"
  backgroundColor="black"
  borderTopWidth={1}
  borderTopColor="$gray4"
>
  {/* Error display */}
  {error && (
    <YStack backgroundColor="$red2" borderColor="$red6" ...>
      <Text color="$red11">{error}</Text>
    </YStack>
  )}
  
  <Button 
    size="$4" 
    backgroundColor="$green9"
    disabled={isSaving || !title.trim() || exercises.length === 0}
  >
    {isSaving ? 'Saving Changes...' : 'Save Changes'}
  </Button>
</YStack>
```

## Design System Compliance

### Typography Scale
- **$5**: Exercise names, section headers
- **$4**: Form labels, primary text  
- **$3**: Supporting text, counts, set details
- **$2**: Pills, character count, micro-copy

### Color Usage
- **$gray12**: Primary text (form labels, exercise names)
- **$gray11**: Secondary text (set details, descriptions)  
- **$gray10**: Supporting text (counts, metadata)
- **$blue10**: Highlighted info (set counts)
- **$red10**: Error states, required indicators, remove actions
- **$gray2**: Section header backgrounds
- **$gray3**: Pill backgrounds, list separators

### Spacing System
- **$4**: Screen padding, section spacing
- **$3**: Internal component spacing  
- **$2.5**: Form field spacing
- **$2**: Pill spacing, tight layouts
- **$1**: Minimal separation between sections

### Interactive Elements
- **Focus States**: Subtle gray borders instead of blue
- **Touch Targets**: Minimum 44px for all buttons
- **Button Hierarchy**: 
  - Primary: `$green9` (Save)
  - Secondary: `$blue9` (Add)  
  - Destructive: `$red10` text (Remove)

## Information Architecture

### Read Models (Data Consumed)
```typescript
interface Template {
  id: TemplateId;
  title: string;
  description?: string;
  exercises: TemplateExercise[];
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateExercise {
  exerciseId: ExerciseId;
  name: string;
  sets: number;
  reps?: number;
  weight?: number;
  category: string;
  primaryMuscles: string[];
}
```

### Write Commands (Actions Sent)
```typescript
// Update template
actions.updateTemplate(templateId: TemplateId, updates: Partial<Template>)

// Remove exercise from template
removeExercise(exerciseId: ExerciseId, exerciseName: string)

// Add exercises to template  
handleExerciseSelection(exercises: Exercise[])
```

### Form State
```typescript
interface TemplateForm {
  title: string;
  description: string;
}

// Validation rules
- title: required, non-empty string
- description: optional, max 200 characters
- exercises: minimum 1 exercise required
```

## Events & Interactions

### Form Events
- **Title Change**: Real-time validation, clears error state
- **Description Change**: Character count updates, validation
- **Save**: Validates form → calls updateTemplate → navigates back
- **Back**: Navigates back (no unsaved changes warning)

### Exercise Management
- **Add Exercises**: Opens AddExerciseModal → handles selection
- **Remove Exercise**: Shows confirmation alert → removes from list
- **Exercise Reordering**: Not implemented (future enhancement)

### Error States
- **Title Required**: Red border, background, inline error message
- **No Exercises**: Error in sticky bottom area
- **Save Failures**: Error display in sticky bottom area
- **Loading States**: Disabled save button, loading text

## Sample Payloads

### Update Template Request
```typescript
{
  title: "Upper Body Strength",
  description: "Focus on chest, shoulders, and arms",
  exercises: [
    {
      exerciseId: "exercise-1",
      name: "Bench Press", 
      sets: 3,
      reps: 10,
      weight: 135,
      category: "Strength",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"]
    }
  ]
}
```

### Error Response
```typescript
{
  error: "Failed to save template changes",
  details?: string
}
```

## Accessibility Features

### Screen Reader Support
```tsx
accessibilityLabel="Template name"
accessibilityHint="Enter a descriptive name for your workout template"
accessibilityLabel="Add exercises to template"  
accessibilityHint="Opens exercise selection modal"
```

### Touch Targets
- All buttons minimum 44×44px
- Form inputs have comfortable tap areas
- Exercise list items full-width tappable

### Focus Management  
- Logical tab order: Title → Description → Add → Exercise actions → Save
- Focus indicators visible on all interactive elements
- Error messages announced to screen readers

## Performance Considerations

- **List Rendering**: Direct map() for exercise list (not FlatList for small lists)
- **Form State**: Controlled inputs with efficient state updates
- **Validation**: Real-time validation with debouncing if needed
- **Memory**: Proper cleanup of modal states and listeners

## Testing Strategy

### Component Tests
- Form validation (title required, character limits)
- Exercise management (add, remove, empty states)
- Error handling and display
- Accessibility labels and navigation

### Integration Tests
- Template loading and updating
- Exercise modal integration
- Navigation flows
- Error scenarios

### Visual Tests
- Design system compliance
- Responsive behavior
- Focus states and interactions
- Loading and error states