# Workout Finish Modal

**Status:** Released  
**Owner:** Claude  
**Scope:** Mobile (Expo) | UI | Services  
**Links:** FinishWorkoutModal component, finishWorkoutService

## 1. Purpose & KPIs

- **Problem statement**: Users need a comprehensive way to complete workouts with sharing, template updates, and progress documentation
- **Target outcomes**:
  - 100% of sessions use finish modal (replacing simple Alert)
  - ≥60% of finished workouts include descriptions or photos
  - ≥30% of template-based workouts update templates with session changes

## 2. User Stories & Non-Goals

- **Story**: As a user completing a workout, I want to review my session, optionally share progress with my groups, and decide whether to update my template with any changes I made
- **Non-goals**: Advanced photo editing, complex social features, real-time workout streaming

## 3. UX Spec (screens/states/a11y)

### FinishWorkoutModal Component

**Route**: Triggered from `/logging/[sessionId]` when user taps "Finish" button

**Navigation & Presentation**:

- Fullscreen modal (`snapPoints={[100]}`) for complete content visibility
- Sheet overlay with dismiss protection (disableDrag)
- Close button in header returns to logging screen without completing workout

**Information Architecture**:

```tsx
// Props
interface FinishWorkoutModalProps {
  isOpen: boolean;
  session: ActiveSession;
  onClose: () => void;
  onComplete: (data: FinishWorkoutData) => Promise<void>;
}

// State
selectedImage?: string        // URI from camera/library
description: string          // Optional workout notes
selectedClubId?: string      // Group to share with
updateTemplate: boolean      // Whether to update source template
saveAsTemplate: boolean      // Whether to save empty workout as new template
templateName: string         // Name for new template (when saveAsTemplate=true)
isCompleting: boolean        // Loading state for completion
```

**UI States**:

1. **Loading**: "Completing..." state during workflow processing
2. **Image Selection**:
   - Empty: Shows "Take Photo" and "Choose Photo" buttons
   - Selected: Shows image preview with "Change Photo" and "Remove" options
3. **Template Section**: 
   - Update Template: Only visible when `session.templateId` exists (template-based workouts)
   - Save as Template: Only visible when `!session.templateId` and workout has exercises (empty workouts)
4. **Error Handling**: Alert dialogs for image picker failures

**Accessibility**:

- All buttons ≥44x44 touch targets
- Descriptive `accessibilityLabel` for all interactive elements
- Keyboard navigation support with `returnKeyType="done"`
- Screen reader friendly with semantic structure

## 4. Data & Contracts (tables/RLS/Zod/Edge)

### Read Models (Frontend Consumes)

```tsx
// Workout Summary (calculated from session)
interface WorkoutSummary {
  duration: string; // "HH:MM" format
  volume: number; // Total weight lifted (lbs)
  exerciseCount: number; // Number of exercises
  formattedDate: string; // "MMM DD, YYYY" format
  completedSets: number; // Count of completed sets
  exercises: string[]; // Exercise names
}

// Mock Club Data (for group selection)
interface Club {
  id: string;
  name: string;
}
```

### Write Commands (Frontend Sends)

```tsx
interface FinishWorkoutData {
  image?: string; // Local URI for upload
  description?: string; // Optional workout notes
  clubId?: string; // Club to share with
  updateTemplate: boolean; // Template update preference
  saveAsTemplate?: boolean; // Save empty workout as template
  templateName?: string; // Name for new template
}
```

### Service Layer (Mock Implementation)

```tsx
// Image Upload Service
uploadImage(imageUri: string): Promise<ImageUploadResult>

// Club Sharing Service
shareToClub(clubId: ClubId, shareData: WorkoutShareData): Promise<void>

// Template Update Service
updateTemplateFromSession(templateId: TemplateId, session: ActiveSession): Promise<Template>

// Template Creation Service
createTemplate(templateData: Omit<Template, 'id' | 'userId'>): Promise<Template>
```

## 5. Realtime & Offline

- **Image Selection**: Local file URIs cached until upload
- **Offline Handling**: Not implemented (future enhancement)
- **Template Updates**: Immediate local state updates via `useWorkoutState`

## 6. Analytics & Experimentation

**Events**:

- `workout_finish_modal_opened`
- `workout_photo_added` / `workout_photo_removed`
- `workout_shared_to_club`
- `template_updated_from_session`
- `template_created_from_session`
- `workout_completed`

**Properties**:

- `has_description: boolean`
- `has_image: boolean`
- `shared_to_club: boolean`
- `template_updated: boolean`
- `template_created: boolean`
- `template_name: string`
- `workout_duration_seconds: number`
- `total_volume_lbs: number`

## 7. Test Plan

### Component Tests (`FinishWorkoutModal.spec.tsx`)

- ✅ Renders workout summary correctly
- ✅ Handles image selection (mocked)
- ✅ Handles description input
- ✅ Handles template update toggle
- ✅ Calls onComplete with correct data
- ✅ Shows template section conditionally
- ✅ Handles modal close

### Service Tests (`finishWorkoutService.spec.ts`)

- ✅ Image upload simulation
- ✅ Club sharing simulation
- ✅ Complete workflow processing
- ✅ Error handling (mocked scenarios)

### Integration Testing

- Manual testing required for:
  - Camera permissions flow
  - Image picker UI integration
  - Modal presentation and dismissal
  - Keyboard behavior with description input

## 8. Risks & Mitigations

**Risks**:

- Camera permissions rejection on iOS/Android
- Large image file uploads affecting performance
- Template update conflicts if multiple users modify same template

**Mitigations**:

- Graceful permission handling with user-friendly messages
- Image compression (`quality: 0.8`) and size constraints
- Optimistic updates with error rollback for template modifications

## 9. Changelog

- **2025-09-02** — Mobile UI — Initial finish modal implementation with image upload, group sharing, and template updates — [feat: add finish workout modal]
- **2025-09-02** — Mobile UI — Add "Save as Template" functionality for empty workouts and fix navigation to return to workout tab — [feat: add save as template for empty workouts]
