# Spotta Mobile Design System

**Status:** Active  
**Owner:** Design Team  
**Scope:** Mobile (Expo) | UI Components | Design Patterns  
**Version:** 1.0

## Overview

Clean, content-first design system optimized for mobile fitness apps. Emphasizes readability, accessibility, and efficient information hierarchy.

## Core Principles

1. **Content First** - Remove visual noise, focus on information
2. **Edge-to-Edge** - Use full screen width for content sections
3. **Clear Hierarchy** - Typography and color create obvious information levels
4. **Minimal Backgrounds** - Clean white/subtle gray, avoid zebra striping
5. **Consistent Spacing** - Use design tokens for predictable rhythm
6. **Accessible Color** - Sufficient contrast, meaningful color usage
7. **Mobile Optimized** - Touch-friendly, thumb-reachable actions

## Layout Patterns

### Full-Width Content Sections
Break out of container padding for edge-to-edge content that spans the full screen width.

```tsx
{/* Break out of container padding */}
<YStack marginHorizontal="$-4">
  {/* Content spans full screen width */}
  <XStack paddingHorizontal="$4" paddingVertical="$4">
    {/* Content with proper internal padding */}
  </XStack>
</YStack>
```

**Use cases**: Exercise lists, settings sections, any content that benefits from full-width presentation

### Section Headers with Background
Gray background headers that visually separate content sections.

```tsx
<XStack
  justifyContent="space-between"
  alignItems="center"
  backgroundColor="$gray2"
  paddingHorizontal="$4"
  paddingVertical="$3"
  marginHorizontal="$-4"
>
  <Text fontSize="$5" fontWeight="600">Section Title</Text>
  <Text fontSize="$3" color="$gray10">Count/Status</Text>
</XStack>
```

**Use cases**: List headers, content category separators, section titles

### Sticky Bottom Actions
Primary actions that remain accessible during scroll, with proper safe area handling.

```tsx
<YStack
  paddingHorizontal="$4"
  paddingVertical="$3"
  paddingBottom="$6"
  backgroundColor="black"
  borderTopWidth={1}
  borderTopColor="$gray4"
>
  <Button size="$4" backgroundColor="$green9">
    Primary Action
  </Button>
</YStack>
```

**Use cases**: Start workout, save changes, confirm actions, any primary CTA

## Content Patterns

### Inline Metrics with Icons
Compact, scannable metrics display with color-coded icons for quick recognition.

```tsx
<XStack space="$4" alignItems="center" flexWrap="wrap">
  <XStack space="$2" alignItems="center">
    <Clock size={16} color="$blue9" />
    <Text fontSize="$4" fontWeight="600">
      {duration} min
    </Text>
  </XStack>
  
  <XStack space="$2" alignItems="center">
    <Target size={16} color="$green9" />
    <Text fontSize="$4" fontWeight="600">
      {count} exercises
    </Text>
  </XStack>
</XStack>
```

**Icon colors**:
- `$blue9` - Time, duration
- `$green9` - Count, quantity
- `$orange9` - Status, level indicators

### Clean List Items
Minimal list items with clear hierarchy and optional category tags.

```tsx
<XStack
  alignItems="center"
  paddingHorizontal="$4"
  paddingVertical="$4"
  borderBottomWidth={isLast ? 0 : 1}
  borderBottomColor="$gray3"
>
  <YStack flex={1} space="$2">
    {/* Primary content */}
    <Text fontSize="$5" fontWeight="600" color="$gray12">
      Primary Text
    </Text>
    
    {/* Secondary details */}
    <XStack space="$3" alignItems="center" flexWrap="wrap">
      <Text fontSize="$3" fontWeight="600" color="$blue10">
        Highlighted Info
      </Text>
      <Text fontSize="$3" color="$gray11">
        × Secondary Info
      </Text>
      <Text fontSize="$3" color="$gray11">
        @ Additional Info
      </Text>
    </XStack>
    
    {/* Category pills */}
    <XStack space="$2" flexWrap="wrap">
      {items.slice(0, 3).map(item => (
        <Text
          key={item}
          fontSize="$2"
          color="$gray11"
          backgroundColor="$gray3"
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
          borderRadius="$4"
          fontWeight="500"
        >
          {item}
        </Text>
      ))}
      {items.length > 3 && (
        <Text
          fontSize="$2"
          color="$gray10"
          backgroundColor="$gray2"
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
          borderRadius="$4"
          fontWeight="500"
        >
          +{items.length - 3}
        </Text>
      )}
    </XStack>
  </YStack>
</XStack>
```

**Visual hierarchy**:
- Primary text: Large, bold, dark gray
- Highlighted details: Blue accent color
- Supporting details: Medium gray
- Category pills: Light gray backgrounds, max 3 visible + overflow indicator

## Typography Scale

| Token | Size | Usage |
|-------|------|-------|
| `$5` | Large | Primary headings, main content titles |
| `$4` | Medium | Secondary text, metrics, important details |
| `$3` | Standard | Supporting text, descriptions, metadata |
| `$2` | Small | Pills, tags, micro-copy, overflow indicators |

## Color System

### Text Colors
- `$gray12` - Primary text, highest contrast
- `$gray11` - Secondary text, readable
- `$gray10` - Supporting text, icons, metadata

### Interactive Colors
- `$blue9` / `$blue10` - Brand accent, interactive elements
- `$green9` - Primary actions, success states, CTAs
- `$orange9` / `$orange10` - Warning, status indicators

### Background Colors
- `$background` - Default screen background (white/system)
- `$gray1` - Subtle content backgrounds
- `$gray2` - Section headers, subtle emphasis
- `$gray3` - Pills, tags, subtle containers
- `black` - High contrast backgrounds, safe areas

### Borders & Separators
- `$gray3` - Subtle separators, list dividers
- `$gray4` - Stronger borders, section separations

## Spacing System

| Token | Usage |
|-------|-------|
| `$1.5` | Tight pill padding |
| `$2` - `$2.5` | Component internal spacing, pill padding |
| `$3` | Standard spacing, section gaps |
| `$4` | Screen padding, comfortable spacing |
| `$6` | Safe area padding, extended spacing |

## Screen Structure Template

Standard layout structure for consistent screen organization:

```tsx
<SafeAreaView style={{ flex: 1 }}>
  <YStack flex={1}>
    {/* Dynamic header with context-specific title */}
    <CustomHeader
      title={dynamicTitle}
      leftAction={<BackButton />}
      rightAction={<ActionButton />}
    />
    
    {/* Scrollable content */}
    <ScrollView flex={1}>
      <YStack padding="$4" space="$4">
        {/* Screen-specific content with container padding */}
        {/* Inline metrics, descriptions, forms */}
      </YStack>
      
      {/* Full-width sections break out of padding */}
      <YStack marginHorizontal="$-4">
        {/* Section headers with gray backgrounds */}
        {/* List items, data tables */}
      </YStack>
    </ScrollView>
    
    {/* Sticky actions outside scroll area */}
    <YStack
      backgroundColor="black"
      paddingHorizontal="$4"
      paddingVertical="$3"
      paddingBottom="$6"
      borderTopWidth={1}
      borderTopColor="$gray4"
    >
      <Button size="$4" backgroundColor="$green9">
        Primary Action
      </Button>
    </YStack>
  </YStack>
</SafeAreaView>
```

## Interactive Elements

### Button Standards
- **Primary buttons**: `$green9` background, `$4` size, white text
- **Secondary buttons**: Chromeless, appropriate color for context
- **Touch targets**: Minimum 44px height and width
- **Icons**: 16px-20px sizes with proper color coordination

### List Interactions
- **Borders**: Subtle `$gray3` separators, no background alternation
- **Spacing**: `$4` horizontal and vertical padding for comfortable touch
- **States**: Subtle press states, no complex hover effects

## Component Usage Guidelines

### When to Use Full-Width
✅ **Use full-width for**:
- Exercise lists and data tables
- Settings sections
- Content that benefits from maximum horizontal space

❌ **Don't use full-width for**:
- Form inputs (keep in padded container)
- Single metrics or status indicators
- Content that needs breathing room

### Section Header Guidelines
✅ **Use gray section headers for**:
- List categories (Exercises, Settings, etc.)
- Content type separation
- Visual content organization

❌ **Avoid gray headers for**:
- Single items or short lists
- Already visually separated content
- Form section titles

### Sticky Button Best Practices
✅ **Use sticky buttons for**:
- Primary screen actions (Start, Save, Continue)
- Actions that should always be accessible
- Long content that requires scrolling

❌ **Don't use sticky buttons for**:
- Secondary actions
- Destructive actions without confirmation
- Screens with minimal content

## Accessibility Requirements

- **Touch targets**: Minimum 44×44px for all interactive elements
- **Color contrast**: Meet WCAG AA standards for all text
- **Labels**: Descriptive `accessibilityLabel` for all buttons
- **Navigation**: Logical focus order and screen reader support
- **Dynamic type**: Support iOS Dynamic Type where applicable

## Implementation Notes

### Tamagui Integration
- Use design tokens consistently (`$4`, `$gray10`, etc.)
- Leverage Tamagui's responsive design features
- Maintain component composability and reusability

### Performance Considerations
- Use `FlatList` for long lists with proper `keyExtractor`
- Implement `React.memo` for expensive list items
- Avoid inline object creation in render loops
- Use `useMemo` for complex calculations

### Testing Strategy
- Visual regression testing for design consistency
- Accessibility testing with screen readers
- Touch target size verification on real devices
- Performance testing with realistic data volumes

## Examples in Codebase

- **Template Preview Screen** (`apps/mobile/app/template/[id].tsx`) - Full implementation of design system
- **CollapsibleExerciseCard** (`src/features/workout/components/`) - Clean list item pattern
- **CustomHeader** - Dynamic header pattern

---

*For questions or design system updates, refer to this document and maintain consistency across all mobile screens.*