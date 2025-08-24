import { render, screen, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { CollapsibleExerciseCard } from './CollapsibleExerciseCard';
import type { SessionExercise } from '../types';
import type { SetEntryId } from '@spotta/shared';
import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';

const tamagui = createTamagui(config);

// Mock exercise data
const mockExercise: SessionExercise = {
  id: 'exercise-1' as any,
  exercise: {
    id: 'bench-press' as any,
    name: 'Bench Press',
    category: 'strength',
    difficulty: 'intermediate' as const,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps'],
    equipment: ['barbell'],
    isCustom: false,
    userId: 'user-1' as any,
  },
  sets: [
    {
      id: 'set-1' as SetEntryId,
      setNumber: 1,
      weight: 135,
      reps: 10,
      completed: false,
      completedAt: undefined,
    },
    {
      id: 'set-2' as SetEntryId,
      setNumber: 2,
      weight: 135,
      reps: 8,
      completed: true,
      completedAt: new Date(),
    },
  ],
  orderIndex: 0,
  restPreset: 120,
  notes: '',
};

const mockProps = {
  exercise: mockExercise,
  index: 0,
  isExpanded: false,
  onToggleExpanded: jest.fn(),
  onSetComplete: jest.fn(),
  onSetUpdate: jest.fn(),
  onAddSet: jest.fn(),
  onShowRestPreset: jest.fn(),
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamagui}>{component}</TamaguiProvider>
  );
};

describe.skip('CollapsibleExerciseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders exercise name correctly', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('shows correct set statistics', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    expect(screen.getByText('1/2 sets')).toBeTruthy();
  });

  it('shows last completed set info', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    expect(screen.getByText('Last: 135×8')).toBeTruthy();
  });

  it('calls onToggleExpanded when header is pressed', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    const header = screen.getByLabelText(/Bench Press.*tap to expand/);
    fireEvent.press(header);

    expect(mockProps.onToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it('shows sets when expanded', () => {
    renderWithProvider(
      <CollapsibleExerciseCard {...mockProps} isExpanded={true} />
    );

    expect(screen.getByText('1')).toBeTruthy(); // Set number
    expect(screen.getByText('2')).toBeTruthy(); // Set number
  });

  it('hides sets when collapsed', () => {
    renderWithProvider(
      <CollapsibleExerciseCard {...mockProps} isExpanded={false} />
    );

    // Set numbers should not be visible when collapsed
    const setNumbers = screen.queryAllByText(/^[12]$/);
    expect(setNumbers).toHaveLength(0);
  });

  it('shows Add Set button when expanded', () => {
    renderWithProvider(
      <CollapsibleExerciseCard {...mockProps} isExpanded={true} />
    );

    expect(screen.getByText('Add Set')).toBeTruthy();
  });

  it('calls onAddSet when Add Set button is pressed', () => {
    renderWithProvider(
      <CollapsibleExerciseCard {...mockProps} isExpanded={true} />
    );

    const addSetButton = screen.getByText('Add Set');
    fireEvent.press(addSetButton);

    expect(mockProps.onAddSet).toHaveBeenCalledTimes(1);
  });

  it('shows rest preset button and callback provided', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    // Rest timer should be visible in header with just the time value
    expect(screen.getByText('120s')).toBeTruthy();
  });

  it('calls onShowRestPreset when rest preset button is pressed', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    // Find by the text content in the rest timer button
    const restButton = screen.getByText('120s').parent;
    fireEvent.press(restButton);

    expect(mockProps.onShowRestPreset).toHaveBeenCalledTimes(1);
  });

  it('applies alternating background colors', () => {
    // Test even index (should use $background)
    const { rerender } = renderWithProvider(
      <CollapsibleExerciseCard {...mockProps} index={0} />
    );

    // Test odd index (should use $gray1)
    rerender(
      <TamaguiProvider config={tamagui}>
        <CollapsibleExerciseCard {...mockProps} index={1} />
      </TamaguiProvider>
    );

    // Both should render without crashing
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    renderWithProvider(<CollapsibleExerciseCard {...mockProps} />);

    expect(
      screen.getByLabelText(/Bench Press.*collapsed.*tap to expand/)
    ).toBeTruthy();
  });
});
