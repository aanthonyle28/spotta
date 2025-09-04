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

## Form Design Patterns

### Enhanced Input Fields
Modern form inputs with improved visual hierarchy and user experience.

```tsx
{/* Form section with proper spacing */}
<YStack space="$4">
  {/* Input with inline status indicator */}
  <YStack space="$2.5">
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontSize="$4" fontWeight="600" color="$gray12">
        Field Label
      </Text>
      <Text fontSize="$2" fontWeight="500" color={hasError ? '$red10' : 'white'}>
        Required
      </Text>
    </XStack>
    <Input
      fontSize="$4"
      paddingHorizontal="$3.5"
      paddingVertical="$2.5"
      borderRadius="$2"
      borderWidth={1}
      borderColor={hasError ? '$red6' : '$gray4'}
      backgroundColor={hasError ? '$red1' : '$gray1'}
      focusStyle={{
        borderColor: hasError ? '$red8' : '$gray6',
        backgroundColor: hasError ? '$red2' : '$gray1',
      }}
      placeholderTextColor="$gray9"
    />
    {/* Inline error with icon */}
    {hasError && (
      <XStack space="$2" alignItems="center">
        <Text fontSize="$2" fontWeight="500" color="$red10">⚠</Text>
        <Text fontSize="$3" color="$red10">Error message</Text>
      </XStack>
    )}
  </YStack>
</YStack>
```

**Features**:
- Status indicators (Required/Optional) 
- Inline error states with icons
- Consistent focus states (gray, not blue)
- Proper padding for text alignment
- Character counts for text areas

### Mixed Layout Sections
Combining padded content with edge-to-edge sections for visual hierarchy.

```tsx
<ScrollView>
  {/* Padded form section */}
  <YStack padding="$4" space="$4">
    {/* Form inputs and content */}
    
    {/* Section header breaks out */}
    <YStack space="$3">
      <XStack
        backgroundColor="$gray2"
        paddingHorizontal="$4"
        paddingVertical="$3"
        marginHorizontal="$-4"  // Break out of padding
      >
        <Text fontSize="$5" fontWeight="600">Section Title</Text>
        <Button>Action</Button>
      </XStack>
    </YStack>
  </YStack>
  
  {/* Edge-to-edge content section */}
  <YStack marginHorizontal="$-4">
    {/* List items with internal padding */}
    <XStack paddingHorizontal="$4" paddingVertical="$4">
      {/* Content aligns with form above */}
    </XStack>
  </YStack>
</ScrollView>
```

**Use cases**: Edit forms, settings screens, any mixed content layouts

## Advanced Patterns & Future Enhancements

### Enhanced Template Editing Patterns
Advanced UX patterns for complex editing interfaces that maintain design system consistency.

#### Template Identity Card Pattern
Consolidated form sections with improved visual hierarchy and user guidance.

```tsx
{/* Enhanced card pattern for form grouping */}
<Card 
  padding="$4" 
  backgroundColor="$gray1" 
  marginHorizontal="$4"
  borderRadius="$4"
  borderWidth={1}
  borderColor="$gray3"
>
  <YStack space="$4">
    {/* Section explanation */}
    <YStack space="$2">
      <Text fontSize="$5" fontWeight="600" color="$gray12">
        Section Title
      </Text>
      <Text fontSize="$3" color="$gray10" lineHeight="$1">
        Clear explanation of what this section does
      </Text>
    </YStack>
    
    {/* Form fields with enhanced states */}
    <YStack space="$4">
      {/* Enhanced input pattern */}
    </YStack>
  </YStack>
</Card>
```

#### Exercise Management Hub Pattern
Intelligent content sections that adapt based on data state and user context.

```tsx
{/* Smart header with contextual statistics */}
<XStack
  backgroundColor="$blue2"
  paddingHorizontal="$4"
  paddingVertical="$4"
  justifyContent="space-between"
  borderBottomWidth={1}
  borderBottomColor="$blue3"
>
  <YStack space="$1">
    <Text fontSize="$5" fontWeight="600" color="$blue12">
      Content Type
    </Text>
    {/* Dynamic stats based on content */}
    <XStack space="$4" alignItems="center">
      <XStack space="$1" alignItems="center">
        <Target size={14} color="$blue11" />
        <Text fontSize="$3" color="$blue11">
          {count} items
        </Text>
      </XStack>
      <XStack space="$1" alignItems="center">
        <Clock size={14} color="$blue11" />
        <Text fontSize="$3" color="$blue11">
          ~{estimatedTime} min
        </Text>
      </XStack>
    </XStack>
  </YStack>
  
  <Button
    size="$3"
    backgroundColor="$blue9"
    icon={<Plus size={16} color="white" />}
    borderRadius="$3"
  >
    Add
  </Button>
</XStack>
```

#### Enhanced List Items with Inline Editing
Progressive disclosure pattern for complex list items with editing capabilities.

```tsx
{/* Expandable list item with edit states */}
<Card
  padding="$0"
  marginHorizontal="$4"
  marginVertical="$2"
  borderRadius="$4"
  backgroundColor={isEditing ? "$blue2" : "$background"}
  borderWidth={1}
  borderColor={isEditing ? "$blue6" : "$gray3"}
>
  <XStack padding="$4">
    {/* Optional drag handle */}
    <YStack paddingRight="$3" justifyContent="center">
      <Button size="$2" chromeless padding="$1">
        <GripVertical size={16} color="$gray8" />
      </Button>
    </YStack>
    
    <YStack flex={1} space="$3">
      {/* Header with actions */}
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} space="$1">
          <Text fontSize="$4" fontWeight="600" color="$gray12">
            Primary Content
          </Text>
          <Text fontSize="$2" color="$gray10">
            Category/Type
          </Text>
        </YStack>
        
        {/* Context-sensitive action buttons */}
        <XStack space="$1">
          {isEditing ? (
            <>
              <Button size="$2" backgroundColor="$green9">
                <Check size={14} color="white" />
              </Button>
              <Button size="$2" variant="outlined">
                <X size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button size="$2" chromeless>
                <Edit3 size={14} color="$gray10" />
              </Button>
              <Button size="$2" chromeless>
                <Trash2 size={14} color="$red10" />
              </Button>
            </>
          )}
        </XStack>
      </XStack>
      
      {/* Conditional content based on edit state */}
      {isEditing ? (
        <InlineEditForm />
      ) : (
        <ContentDisplay />
      )}
    </YStack>
  </XStack>
</Card>
```

#### Floating Action Button Pattern
Context-aware floating actions that enhance discoverability without cluttering the interface.

```tsx
{/* Smart FAB that appears/hides based on context */}
<YStack
  position="absolute"
  bottom={24}
  right={24}
  zIndex={1000}
  alignItems="center"
  space="$2"
>
  <Button
    circular
    size="$4"
    backgroundColor="$blue9"
    shadowColor="$shadowColor"
    shadowOffset={{ width: 0, height: 4 }}
    shadowOpacity={0.3}
    shadowRadius={8}
    elevation={6}
  >
    <Plus size={24} color="white" />
  </Button>
  
  {/* Optional label */}
  <Text
    fontSize="$2"
    color="$gray11"
    backgroundColor="$background"
    paddingHorizontal="$2"
    paddingVertical="$1"
    borderRadius="$2"
    shadowOpacity={0.1}
  >
    Action Label
  </Text>
</YStack>
```

### UX Enhancement Principles

#### Progressive Disclosure
- **Basic view**: Essential information visible
- **Expanded view**: Detailed controls available on demand
- **Edit mode**: Focused editing interface with clear save/cancel actions

#### Contextual Actions
- **Smart visibility**: Actions appear when and where needed
- **State-aware**: Different actions based on content state
- **Thumb-friendly**: Important actions within reach zones

#### Feedback Systems
- **Immediate validation**: Real-time form feedback
- **Visual confirmations**: Clear state changes and progress indicators
- **Error recovery**: Clear error states with actionable solutions

## Examples in Codebase

- **Edit Template Screen** (`apps/mobile/app/edit-template/[id].tsx`) - Enhanced form design, mixed layout sections, progressive disclosure patterns
- **Template Preview Screen** (`apps/mobile/app/template/[id].tsx`) - Full implementation of design system
- **CollapsibleExerciseCard** (`src/features/workout/components/`) - Clean list item pattern with state management
- **CustomHeader** - Dynamic header pattern with contextual actions

## Future Enhancement Roadmap

### Planned Improvements
- **Drag & Drop**: Native gesture-based reordering for lists
- **Inline Editing**: Progressive disclosure for complex form items
- **Smart Actions**: Context-aware floating action buttons
- **Micro-interactions**: Subtle animations for state changes
- **Gesture Support**: Swipe actions for common list operations

### Implementation Notes
- Maintain backward compatibility with existing patterns
- Test new patterns on real devices for accessibility
- Document component APIs for team adoption
- Consider performance impact of enhanced interactions

---

*For questions or design system updates, refer to this document and maintain consistency across all mobile screens.*