import { render, act } from '@testing-library/react-native';
import { ActiveSessionBanner } from './ActiveSessionBanner';
import type { ActiveSession } from '../types';
import type { WorkoutId, ExerciseId } from '@spotta/shared';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('../../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
  },
}));

// Mock formatTime
jest.mock('../../../utils/formatTime', () => ({
  formatTime: jest.fn((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }),
}));

const mockActiveSession: ActiveSession = {
  id: 'workout-123' as WorkoutId,
  name: 'Push Day',
  startedAt: new Date(Date.now() - 300000), // 5 minutes ago
  exercises: [
    {
      id: 'ex-1' as ExerciseId,
      exercise: {
        id: 'ex-1' as ExerciseId,
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
  templateRestTime: 120,
  customizedExercises: new Set(),
};

describe('ActiveSessionBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders session name and exercise count', () => {
    const { getByText } = render(
      <ActiveSessionBanner activeSession={mockActiveSession} />
    );

    expect(getByText('Push Day')).toBeTruthy();
    expect(getByText(/1 exercises/)).toBeTruthy();
  });

  it('updates duration counter in real-time', () => {
    const { getByText } = render(
      <ActiveSessionBanner activeSession={mockActiveSession} />
    );

    // Initial render should show formatted duration
    expect(getByText(/05:00/)).toBeTruthy();

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Duration should update
    expect(getByText(/05:01/)).toBeTruthy();
  });

  it('has proper accessibility label', () => {
    const { getByLabelText } = render(
      <ActiveSessionBanner activeSession={mockActiveSession} />
    );

    expect(getByLabelText('Resume active workout: Push Day')).toBeTruthy();
  });
});
