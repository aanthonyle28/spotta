import { render, fireEvent } from '@testing-library/react-native';
import { WorkoutConflictModal } from './WorkoutConflictModal';
import type { ActiveSession } from '../types';

const mockActiveSession: ActiveSession = {
  id: 'session-1' as any,
  name: 'Push Day',
  startedAt: new Date('2024-01-01T10:00:00Z'),
  exercises: [
    {
      id: 'exercise-1' as any,
      exercise: {
        id: 'exercise-1' as any,
        name: 'Bench Press',
        category: 'strength',
        equipment: ['barbell'],
        primaryMuscles: ['chest'],
        difficulty: 'intermediate',
        isCustom: false,
      },
      sets: [],
      orderIndex: 0,
      restPreset: 120,
    },
  ],
  currentExerciseIndex: 0,
  totalVolume: 0,
  duration: 0,
};

describe('WorkoutConflictModal', () => {
  const defaultProps = {
    isOpen: true,
    activeSession: mockActiveSession,
    onClose: jest.fn(),
    onResume: jest.fn(),
    onStartNew: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workout conflict modal when open', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    expect(getByText('Workout in Progress')).toBeTruthy();
    expect(getByText('You have an active workout')).toBeTruthy();
    expect(
      getByText(
        'If you start a new workout, your current workout will be discarded and all progress will be lost.'
      )
    ).toBeTruthy();
  });

  it('displays active session information', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    expect(getByText('Push Day')).toBeTruthy();
    expect(getByText('1 exercises')).toBeTruthy();
  });

  it('calls onResume and onClose when Resume button is pressed', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    fireEvent.press(getByText('Resume Workout'));

    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onStartNew and onClose when Start New button is pressed', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    fireEvent.press(getByText('Start New Workout'));

    expect(defaultProps.onStartNew).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is pressed', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    fireEvent.press(getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onResume).not.toHaveBeenCalled();
    expect(defaultProps.onStartNew).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { queryByText } = render(
      <WorkoutConflictModal {...defaultProps} isOpen={false} />
    );

    expect(queryByText('Workout in Progress')).toBeNull();
  });

  it('handles null activeSession gracefully', () => {
    const { getByText, queryByText } = render(
      <WorkoutConflictModal {...defaultProps} activeSession={null} />
    );

    expect(getByText('Workout in Progress')).toBeTruthy();
    expect(queryByText('Push Day')).toBeNull();
  });

  it('formats duration correctly for sessions less than 1 minute', () => {
    const recentSession = {
      ...mockActiveSession,
      startedAt: new Date(Date.now() - 30000), // 30 seconds ago
    };

    const { getByText } = render(
      <WorkoutConflictModal {...defaultProps} activeSession={recentSession} />
    );

    expect(getByText('<1m elapsed')).toBeTruthy();
  });

  it('formats duration correctly for sessions over 1 minute', () => {
    const olderSession = {
      ...mockActiveSession,
      startedAt: new Date(Date.now() - 150000), // 2.5 minutes ago
    };

    const { getByText } = render(
      <WorkoutConflictModal {...defaultProps} activeSession={olderSession} />
    );

    expect(getByText('2m elapsed')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(
      <WorkoutConflictModal {...defaultProps} />
    );

    expect(getByLabelText('Close modal')).toBeTruthy();
    expect(getByLabelText('Resume active workout')).toBeTruthy();
    expect(
      getByLabelText('Start new workout and discard current one')
    ).toBeTruthy();
    expect(getByLabelText('Cancel and keep current workout')).toBeTruthy();
  });

  it('shows warning with alert triangle icon', () => {
    const { getByText } = render(<WorkoutConflictModal {...defaultProps} />);

    expect(getByText('You have an active workout')).toBeTruthy();
    expect(
      getByText(
        'If you start a new workout, your current workout will be discarded and all progress will be lost.'
      )
    ).toBeTruthy();
  });
});
