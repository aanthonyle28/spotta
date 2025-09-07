# Spotta Mobile Design System

**Status:** Active  
**Owner:** Design Team  
**Scope:** Mobile (Expo) | UI Components | Design Patterns  
**Version:** 2.0 - Poppins Typography

## Overview

Modern, fitness-focused design system built on Poppins typography with consistent spacing, dark theme optimization, and clear component hierarchy. Emphasizes readability, accessibility, and mobile-first interactions.

## Core Principles

1. **Typography First** - Poppins font family creates consistent, readable hierarchy
2. **Dark Theme Native** - Optimized for dark backgrounds with high contrast
3. **Component Consistency** - Custom UI package ensures uniform styling
4. **Clear Hierarchy** - Typography scales and weights create obvious information levels
5. **Mobile Optimized** - Touch-friendly, thumb-reachable actions
6. **Brand Consistency** - Spotta color palette throughout all interactions
7. **Accessible by Default** - Proper contrast ratios and touch targets

## Typography System

### Font Family
All text uses **Poppins** font family with specific weights for different hierarchy levels.

### Heading Scale
```tsx
// H1 - Page titles, major sections
<H1>Workout</H1>
// → 48px, Bold (700), Poppins

// H2 - Section titles 
<H2>Templates</H2>
// → 24px, SemiBold (600), Poppins

// H3 - Card titles, subsections
<H3>Push Day</H3>
// → 16px, Medium (500), Poppins
```

### Text Components
```tsx
// Body text, descriptions
<Text>Regular content text</Text>
// → Poppins Regular (400)

// Buttons automatically use Poppins
<Button>Start Workout</Button>
// → Poppins Medium (500)

// Inputs use Poppins
<Input placeholder="Template name" />
// → Poppins Regular (400)
```

### Usage Guidelines
- **H1**: Page titles, main screen headers
- **H2**: Section dividers like "Templates", "Discover"  
- **H3**: Card titles like template names, exercise names
- **Text**: All body content, descriptions, metadata
- **Button**: All interactive elements automatically styled

## Color System

### Brand Colors
```tsx
// Spotta brand colors (from constants/colors.ts)
const SPOTTA_COLORS = {
  purple: '#9956D4',  // Primary actions (Start Empty)
  blue: '#219BD8',    // Secondary actions (Start buttons)
  background: '#0D0D0D',     // Main background
  cardBackground: '#202122',  // Card backgrounds
  browseExercises: '#152D39', // Browse tiles
  findTemplates: '#2D1F38',   // Template tiles
}
```

### Text Colors (Dark Theme)
```tsx
// High contrast white text on dark backgrounds
<Text color="white">Primary content</Text>

// Tamagui grays for hierarchy
<Text color="$gray10">Secondary text</Text>
<Text color="$gray11">Supporting text</Text>
```

### Interactive Colors
- **Primary Actions**: `SPOTTA_COLORS.purple` (`#9956D4`)
- **Secondary Actions**: `SPOTTA_COLORS.blue` (`#219BD8`) 
- **Success**: `$green9` for confirmations
- **Destructive**: `$red10` for delete actions

## Layout Patterns

### Screen Structure
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: SPOTTA_COLORS.background }}>
  <ScrollView>
    <YStack flex={1} padding="$4" space="$4" backgroundColor={SPOTTA_COLORS.background}>
      <H1 color="white">Screen Title</H1>
      
      {/* Section with H2 title */}
      <YStack space="$3">
        <H2 color="white">Section Title</H2>
        {/* Section content */}
      </YStack>
    </YStack>
  </ScrollView>
</SafeAreaView>
```

### Card Components
```tsx
// Template card with H3 title
<Card
  padding="$4"
  backgroundColor="$gray2"
  width={280}
>
  <YStack space="$3">
    <H3>{template.title}</H3>
    <Text color="$gray10">{template.exercises.length} exercises</Text>
    <Button backgroundColor={SPOTTA_COLORS.blue}>
      Start
    </Button>
  </YStack>
</Card>
```

### Tile Components
```tsx
// Browse tiles with H3-sized titles
<Card
  padding="$4"
  backgroundColor={SPOTTA_COLORS.browseExercises}
  height="$12"
>
  <YStack space="$2">
    <Text fontSize={16} fontWeight="600" color="white">
      Browse Exercises
    </Text>
    <Text fontSize="$3" color="white" opacity={0.8}>
      Explore our exercise library
    </Text>
  </YStack>
</Card>
```

## Component Architecture

### Custom UI Package
All components are imported from `@my/ui` instead of `tamagui` directly:

```tsx
// ✅ Use custom UI components
import { YStack, H1, H2, H3, Text, Button, Card } from '@my/ui';

// ❌ Don't import from tamagui directly
import { YStack, H1, Text } from 'tamagui';
```

### Component Styling
Custom components automatically apply Poppins and proper sizing:

```tsx
// H1 component (packages/ui/src/components.tsx)
export const H1 = styled(TamaguiH1, {
  fontFamily: 'Poppins',
  fontSize: 48,
  fontWeight: 'bold',
});

// H2 component
export const H2 = styled(TamaguiH2, {
  fontFamily: 'Poppins',
  fontSize: 24,
  fontWeight: '600', // SemiBold
});

// H3 component
export const H3 = styled(TamaguiH3, {
  fontFamily: 'Poppins',
  fontSize: 16,
  fontWeight: '500', // Medium
});
```

## Dark Theme Design

### Background Strategy
- **Main Background**: `SPOTTA_COLORS.background` (`#0D0D0D`)
- **Card Backgrounds**: `$gray2` for subtle elevation
- **Safe Areas**: Explicit background color on all screens

### Text Contrast
- **Primary Text**: `color="white"` for maximum contrast
- **Secondary Text**: `color="$gray10"` for readable hierarchy
- **Interactive Text**: Brand colors on dark backgrounds

### Visual Hierarchy
```tsx
// Example hierarchy in dark theme
<YStack space="$4" backgroundColor={SPOTTA_COLORS.background}>
  <H1 color="white">Main Title</H1>           {/* 48px, Bold, White */}
  <H2 color="white">Section Title</H2>        {/* 24px, SemiBold, White */}
  <H3>Card Title</H3>                         {/* 16px, Medium, Default */}
  <Text color="$gray10">Supporting text</Text> {/* Default size, Gray */}
</YStack>
```

## Interactive Elements

### Button Standards
```tsx
// Primary action buttons
<Button backgroundColor={SPOTTA_COLORS.purple}>
  Start Empty Workout
</Button>

// Secondary action buttons  
<Button backgroundColor={SPOTTA_COLORS.blue}>
  Start Template
</Button>

// Utility buttons
<Button chromeless>
  <MoreHorizontal size={16} color="$gray10" />
</Button>
```

### Touch Targets
- **Minimum Size**: 44×44px for all interactive elements
- **Button Padding**: Use Tamagui size tokens (`$2`, `$3`, `$4`)
- **Icon Sizes**: 16px-24px depending on context

## Spacing System

### Standard Spacing
```tsx
// Screen padding
<YStack padding="$4" space="$4">

// Component spacing
<YStack space="$3">  // Related items
<YStack space="$2">  // Tight groupings
<XStack space="$1">  // Icon + text pairs
```

### Responsive Spacing
- **Screen edges**: `padding="$4"` (16px)
- **Section gaps**: `space="$4"` (16px) 
- **Component groups**: `space="$3"` (12px)
- **Related items**: `space="$2"` (8px)

## Implementation Guidelines

### Font Loading
Fonts are loaded in `app/_layout.tsx`:
```tsx
const [fontsLoaded] = useFonts({
  'Poppins': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
});
```

### Component Creation
When creating new components, always:
1. Import from `@my/ui`
2. Use semantic heading levels (H1 > H2 > H3)
3. Apply proper color contrast for dark theme
4. Use Spotta brand colors for interactive elements

### Migration Checklist
- ✅ Replace all `tamagui` imports with `@my/ui`
- ✅ Update H3 section titles to H2
- ✅ Use brand colors instead of default Tamagui colors
- ✅ Ensure dark theme compatibility
- ✅ Test font rendering on physical devices

## Accessibility Requirements

### Typography Accessibility
- **Dynamic Type**: Fonts scale with iOS/Android system settings
- **Contrast**: White text on dark backgrounds meets WCAG AA
- **Hierarchy**: Clear visual hierarchy through size and weight

### Interactive Accessibility
- **Touch Targets**: Minimum 44×44px
- **Labels**: Descriptive `accessibilityLabel` for all buttons
- **Focus**: Logical tab order and screen reader support
- **States**: Clear visual feedback for all interactive states

## Performance Considerations

### Font Performance
- **Font Loading**: Fonts load during splash screen
- **Fallbacks**: System fonts as fallback if Poppins fails
- **Caching**: Fonts cached after first load

### Component Performance
- **Memoization**: Use `React.memo` for list items
- **Reusability**: Custom UI components reduce bundle size
- **Tree Shaking**: Only import needed components

## Examples in Codebase

### Screen Structure
- **Workout Screen** (`app/(tabs)/workout.tsx`) - H1 page title, H2 section titles
- **Template Cards** (`src/features/workout/components/RoutineCarousel.tsx`) - H3 card titles
- **Browse Tiles** (`src/features/workout/components/BrowseExercisesTile.tsx`) - Tile styling

### Component Usage
```tsx
// Correct usage example
import { YStack, H1, H2, H3, Text, Button } from '@my/ui';

export default function ExampleScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SPOTTA_COLORS.background }}>
      <YStack padding="$4" space="$4">
        <H1 color="white">Screen Title</H1>
        
        <YStack space="$3">
          <H2 color="white">Section</H2>
          <Card padding="$4" backgroundColor="$gray2">
            <H3>Card Title</H3>
            <Text color="$gray10">Description text</Text>
            <Button backgroundColor={SPOTTA_COLORS.blue}>Action</Button>
          </Card>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
```

## Design System Maintenance

### Version Control
- **Current Version**: 2.0 (Poppins Typography)
- **Previous Version**: 1.0 (Inter Typography)
- **Migration**: Complete across all components

### Component Updates
- **UI Package**: Central source of truth in `packages/ui/`
- **Consistency**: All styling changes made in UI package
- **Testing**: Visual regression tests for component changes

### Future Enhancements
- **Light Theme**: Add light theme support while maintaining hierarchy
- **Additional Weights**: Add more Poppins weights as needed
- **Responsive Typography**: Scale based on device size
- **Animation**: Add subtle transitions for better UX

---

*This design system documentation reflects the current Poppins-based implementation. All new components should follow these patterns for consistency.*