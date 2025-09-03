import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { FinishWorkoutModal } from './FinishWorkoutModal';
import type { ActiveSession } from '../types';
import type {
  WorkoutId,
  ExerciseId,
  SetEntryId,
  TemplateId,
} from '@spotta/shared';
// Test utilities available for future improvements
// import { createTestActiveSession, createTestIds } from '../services/testUtils';

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock all Tamagui components
jest.mock('tamagui', () => {
  const React = require('react');

  // Create a basic mock component factory that returns a proper React element
  const createMockComponent =
    (name: string) =>
    ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      React.createElement('div', { 'data-testid': name, ...props }, children);

  // Mock Sheet with sub-components
  const MockSheet = createMockComponent('Sheet');
  MockSheet.Overlay = createMockComponent('Sheet.Overlay');
  MockSheet.Frame = createMockComponent('Sheet.Frame');

  // Mock Select with sub-components
  const MockSelect = createMockComponent('Select');
  MockSelect.Trigger = createMockComponent('Select.Trigger');
  MockSelect.Value = createMockComponent('Select.Value');
  MockSelect.Content = createMockComponent('Select.Content');
  MockSelect.Viewport = createMockComponent('Select.Viewport');
  MockSelect.Group = createMockComponent('Select.Group');
  MockSelect.Label = createMockComponent('Select.Label');
  MockSelect.Item = createMockComponent('Select.Item');
  MockSelect.ItemText = createMockComponent('Select.ItemText');
  MockSelect.ScrollUpButton = createMockComponent('Select.ScrollUpButton');
  MockSelect.ScrollDownButton = createMockComponent('Select.ScrollDownButton');

  return {
    Sheet: MockSheet,
    YStack: createMockComponent('YStack'),
    XStack: createMockComponent('XStack'),
    H4: createMockComponent('H4'),
    Button: createMockComponent('Button'),
    Text: createMockComponent('Text'),
    Card: createMockComponent('Card'),
    Input: createMockComponent('Input'),
    Select: MockSelect,
    Adapt: ({ children }: { children?: React.ReactNode }) => children,
    ScrollView: createMockComponent('ScrollView'),
  };
});

const mockSession: ActiveSession = {
  id: 'workout-1' as WorkoutId,
  name: 'Push Day',
  startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  exercises: [
    {
      id: 'exercise-1' as ExerciseId,
      exercise: {
        id: 'exercise-1' as ExerciseId,
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
          reps: 10,
          completed: true,
        },
        {
          id: 'set-2' as SetEntryId,
          setNumber: 2,
          weight: 135,
          reps: 8,
          completed: true,
        },
      ],
      orderIndex: 0,
      restPreset: 180,
    },
  ],
  currentExerciseIndex: 0,
  totalVolume: 2565, // (135 * 10) + (135 * 8)
  duration: 1800, // 30 minutes
  templateId: 'template-1' as TemplateId,
  templateRestTime: 120,
  customizedExercises: new Set(),
};

describe('FinishWorkoutModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workout summary correctly', () => {
    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByLabelText('Complete workout')).toBeTruthy();
    // Look for these individual text elements which appear in the test output
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('2430')).toBeTruthy();
    expect(screen.getByText('lbs')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('exercises')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('sets')).toBeTruthy();
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('handles image selection', async () => {
    const mockImagePicker = require('expo-image-picker');
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const choosePhotoButton = screen.getByText('Choose Photo');
    fireEvent.press(choosePhotoButton);

    await waitFor(() => {
      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    });
  });

  it('handles description input', () => {
    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const descriptionInput = screen.getByLabelText('Workout description');
    fireEvent.changeText(descriptionInput, 'Great workout today!');

    expect(descriptionInput.props.value).toBe('Great workout today!');
  });

  it('handles template update toggle', () => {
    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const updateTemplateButton = screen.getByLabelText(
      'Update template with changes'
    );

    // Initially Keep Original should be selected
    fireEvent.press(updateTemplateButton);

    // Should show update template feedback - check exact text from output
    expect(
      screen.getByText(
        'Template will be updated with any exercise changes you made'
      )
    ).toBeTruthy();
  });

  it('calls onComplete with correct data', async () => {
    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const completeButton = screen.getByLabelText('Complete workout');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        image: undefined,
        description: undefined,
        clubId: undefined,
        updateTemplate: false,
        saveAsTemplate: false,
        templateName: undefined,
      });
    });
  });

  it('shows template section only when session has templateId', () => {
    const sessionWithoutTemplate = { ...mockSession, templateId: undefined };

    render(
      <FinishWorkoutModal
        isOpen={true}
        session={sessionWithoutTemplate}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.queryByText(/Template/)).toBeNull();
    expect(screen.queryByLabelText('Update template with changes')).toBeNull();
  });

  it('handles modal close', () => {
    render(
      <FinishWorkoutModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
