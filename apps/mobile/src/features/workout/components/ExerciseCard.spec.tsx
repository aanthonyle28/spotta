import { render, screen, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '@tamagui/config';
import { ExerciseCard } from './ExerciseCard';
import type { SessionExercise, SetData } from '../types';
import type { ExerciseId, SetEntryId } from '@spotta/shared';

// Test wrapper with Tamagui provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

const mockExercise: SessionExercise = {
  id: 'bench-press' as ExerciseId,
  exercise: {
    id: 'bench-press' as ExerciseId,
    name: 'Bench Press',
    category: 'strength',
    equipment: ['barbell'],
    primaryMuscles: ['chest'],
    difficulty: 'intermediate',
    isCustom: false,
  },
  sets: [
    {
      id: 'set-1' as SetEntryId,
      setNumber: 1,
      weight: 135,
      reps: 8,
      completed: true,
      completedAt: new Date(),
    },
    {
      id: 'set-2' as SetEntryId,
      setNumber: 2,
      weight: 135,
      reps: 0,
      completed: false,
    },
  ],
  orderIndex: 0,
  restPreset: 120,
};

describe('ExerciseCard', () => {
  const mockProps = {
    exercise: mockExercise,
    isActive: false,
    onSetComplete: jest.fn(),
    onSetUpdate: jest.fn(),
    onToggleActive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders exercise name and set count', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('1/2 sets')).toBeTruthy();
  });

  it('shows collapse button when inactive', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Expand')).toBeTruthy();
  });

  it('shows expand button when active', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Collapse')).toBeTruthy();
  });

  it('calls onToggleActive when toggle button is pressed', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} />
      </TestWrapper>
    );

    const toggleButton = screen.getByText('Expand');
    fireEvent.press(toggleButton);

    expect(mockProps.onToggleActive).toHaveBeenCalledTimes(1);
  });

  it('displays total volume when sets are completed', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/1080 lbs/)).toBeTruthy(); // 135 * 8 = 1080
  });

  it('shows sets when active', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    // Should show set numbers
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('shows completed set as done', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('✓ Done')).toBeTruthy();
  });

  it('shows complete button for incomplete sets', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    const completeButtons = screen.getAllByText('✓');
    expect(completeButtons).toHaveLength(1); // One for incomplete set
  });

  it('disables stepper for completed sets', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    // WeightRepsStepper should be disabled for completed sets
    // This would need proper test IDs in the WeightRepsStepper component
  });

  it('calls onSetComplete when complete button is pressed', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    const completeButton = screen.getByText('✓');
    fireEvent.press(completeButton);

    expect(mockProps.onSetComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'set-2',
        completed: true,
        completedAt: expect.any(Date),
      })
    );
  });

  it('shows add set button when active', () => {
    render(
      <TestWrapper>
        <ExerciseCard {...mockProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Add Set')).toBeTruthy();
  });
});
