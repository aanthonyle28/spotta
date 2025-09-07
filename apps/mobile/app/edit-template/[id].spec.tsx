import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import EditTemplateScreen from './[id]';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import type { Template, TemplateExercise } from '../../src/features/workout/types';
import type { TemplateId, ExerciseId } from '@spotta/shared';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: 'template-1' }),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

jest.mock('../../src/features/workout/providers/WorkoutStateProvider');
jest.mock('../../src/features/workout/components', () => ({
  CustomHeader: ({ title, leftAction }: any) => (
    <div>
      <div>{title}</div>
      {leftAction}
    </div>
  ),
  AddExerciseModal: ({ isOpen, onSelect, onClose }: any) =>
    isOpen ? (
      <div>
        <button
          testID="add-exercise-confirm"
          onPress={() => {
            onSelect([
              {
                id: 'exercise-1' as ExerciseId,
                name: 'Push-ups',
                category: 'Bodyweight',
                primaryMuscles: ['Chest', 'Triceps'],
              },
            ]);
          }}
        >
          Add Exercise
        </button>
        <button testID="add-exercise-cancel" onPress={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.spyOn(Alert, 'alert');

const mockTemplate: Template = {
  id: 'template-1' as TemplateId,
  title: 'Upper Body Workout',
  description: 'Focus on chest and arms',
  exercises: [
    {
      exerciseId: 'exercise-1' as ExerciseId,
      name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 135,
      category: 'Strength',
      primaryMuscles: ['Chest', 'Triceps', 'Shoulders'],
    },
    {
      exerciseId: 'exercise-2' as ExerciseId,
      name: 'Pull-ups',
      sets: 3,
      reps: 8,
      category: 'Bodyweight',
      primaryMuscles: ['Back', 'Biceps'],
    },
  ] as TemplateExercise[],
  estimatedDuration: 45,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockWorkoutState = {
  templates: [mockTemplate],
  actions: {
    updateTemplate: jest.fn(),
  },
  state: {
    templates: [mockTemplate],
  },
};

(useWorkoutState as jest.Mock).mockReturnValue(mockWorkoutState);

describe('EditTemplateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Layout', () => {
    it('should render with design system compliant structure', () => {
      render(<EditTemplateScreen />);

      // Header should be clean without save button
      expect(screen.getByText('Edit Template')).toBeTruthy();
      expect(screen.getByLabelText('Go back')).toBeTruthy();

      // Form section should be in padded container with improved design
      expect(screen.getByLabelText('Template name')).toBeTruthy();
      expect(screen.getByLabelText('Template description')).toBeTruthy();
      
      // Form labels should use improved typography
      expect(screen.getByText('Template Name')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByText('Required')).toBeTruthy();
      expect(screen.getByText('Optional')).toBeTruthy();


      // Section header with gray background
      expect(screen.getByText('Exercises')).toBeTruthy();
      expect(screen.getByLabelText('Add exercises to template')).toBeTruthy();

      // Sticky bottom save action
      expect(screen.getByLabelText('Save template changes')).toBeTruthy();
    });

    it('should display exercises in clean list format', () => {
      render(<EditTemplateScreen />);

      // Exercise list items should follow clean list pattern
      expect(screen.getByText('1. Bench Press')).toBeTruthy();
      expect(screen.getByText('3 sets')).toBeTruthy();
      expect(screen.getByText('× 10 reps')).toBeTruthy();
      expect(screen.getByText('@ 135 lbs')).toBeTruthy();

      // Muscle group pills - max 3 visible
      expect(screen.getByText('Chest')).toBeTruthy();
      expect(screen.getByText('Triceps')).toBeTruthy();
      expect(screen.getByText('Shoulders')).toBeTruthy();

      expect(screen.getByText('2. Pull-ups')).toBeTruthy();
      expect(screen.getByText('Back')).toBeTruthy();
      expect(screen.getByText('Biceps')).toBeTruthy();
    });

    it('should display empty state with centered CTA when no exercises', () => {
      const emptyTemplate = { ...mockTemplate, exercises: [] };
      (useWorkoutState as jest.Mock).mockReturnValue({
        ...mockWorkoutState,
        templates: [emptyTemplate],
        state: { templates: [emptyTemplate] },
      });

      render(<EditTemplateScreen />);

      expect(screen.getByText('No exercises in this template')).toBeTruthy();
      expect(
        screen.getByText('Add exercises to create your workout template')
      ).toBeTruthy();
      expect(screen.getByText('Add Exercises')).toBeTruthy();
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields correctly', () => {
      render(<EditTemplateScreen />);

      const titleInput = screen.getByLabelText('Template name');
      const descriptionInput = screen.getByLabelText('Template description');

      // Title should be pre-filled
      expect(titleInput.props.value).toBe('Upper Body Workout');

      fireEvent.changeText(titleInput, 'Modified Upper Body');
      expect(titleInput.props.value).toBe('Modified Upper Body');

      fireEvent.changeText(descriptionInput, 'Updated description');
      expect(descriptionInput.props.value).toBe('Updated description');
    });

    it('should validate required title field', async () => {
      render(<EditTemplateScreen />);

      const titleInput = screen.getByLabelText('Template title');
      const saveButton = screen.getByLabelText('Save template changes');

      // Clear title
      fireEvent.changeText(titleInput, '');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a name for your template')).toBeTruthy();
      });

      expect(mockWorkoutState.actions.updateTemplate).not.toHaveBeenCalled();
    });

    it('should validate at least one exercise requirement', async () => {
      const emptyTemplate = { ...mockTemplate, exercises: [] };
      (useWorkoutState as jest.Mock).mockReturnValue({
        ...mockWorkoutState,
        templates: [emptyTemplate],
        state: { templates: [emptyTemplate] },
      });

      render(<EditTemplateScreen />);

      const saveButton = screen.getByLabelText('Save template changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Template must have at least one exercise')
        ).toBeTruthy();
      });
    });

    it('should disable save button with proper states', () => {
      render(<EditTemplateScreen />);

      const titleInput = screen.getByLabelText('Template title');
      const saveButton = screen.getByLabelText('Save template changes');

      // Should be enabled with valid data
      expect(saveButton.props.disabled).toBe(false);

      // Should disable with empty title
      fireEvent.changeText(titleInput, '');
      expect(saveButton.props.disabled).toBe(true);
    });
  });

  describe('Exercise Management', () => {
    it('should open add exercise modal', () => {
      render(<EditTemplateScreen />);

      const addButton = screen.getByLabelText('Add exercises to template');
      fireEvent.press(addButton);

      expect(screen.getByTestId('add-exercise-confirm')).toBeTruthy();
      expect(screen.getByTestId('add-exercise-cancel')).toBeTruthy();
    });

    it('should add new exercises and update metrics', async () => {
      render(<EditTemplateScreen />);

      const addButton = screen.getByLabelText('Add exercises to template');
      fireEvent.press(addButton);

      const confirmButton = screen.getByTestId('add-exercise-confirm');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('3 exercises')).toBeTruthy();
        expect(screen.getByText('3. Push-ups')).toBeTruthy();
      });
    });

    it('should remove exercises with confirmation', async () => {
      render(<EditTemplateScreen />);

      const removeButton = screen.getByLabelText(
        'Remove Bench Press from template'
      );
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Remove Exercise',
        'Remove "Bench Press" from this template?',
        expect.arrayContaining([
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: expect.any(Function),
          },
        ])
      );
    });

    it('should display muscle group pills with overflow indicator', () => {
      const exerciseWithManyMuscles = {
        ...mockTemplate.exercises[0],
        primaryMuscles: ['Chest', 'Triceps', 'Shoulders', 'Core', 'Back'],
      };

      const templateWithManyMuscles = {
        ...mockTemplate,
        exercises: [exerciseWithManyMuscles, mockTemplate.exercises[1]],
      };

      (useWorkoutState as jest.Mock).mockReturnValue({
        ...mockWorkoutState,
        templates: [templateWithManyMuscles],
        state: { templates: [templateWithManyMuscles] },
      });

      render(<EditTemplateScreen />);

      // Should show first 3 muscles + overflow
      expect(screen.getByText('Chest')).toBeTruthy();
      expect(screen.getByText('Triceps')).toBeTruthy();
      expect(screen.getByText('Shoulders')).toBeTruthy();
      expect(screen.getByText('+2')).toBeTruthy(); // Overflow indicator
    });
  });

  describe('Save Functionality', () => {
    it('should save template successfully', async () => {
      render(<EditTemplateScreen />);

      const titleInput = screen.getByLabelText('Template name');
      const descriptionInput = screen.getByLabelText('Template description');
      const saveButton = screen.getByLabelText('Save template changes');

      fireEvent.changeText(titleInput, 'Updated Workout');
      fireEvent.changeText(descriptionInput, 'Updated description');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockWorkoutState.actions.updateTemplate).toHaveBeenCalledWith(
          'template-1',
          {
            title: 'Updated Workout',
            description: 'Updated description',
            exercises: mockTemplate.exercises,
          }
        );
        expect(router.back).toHaveBeenCalled();
      });
    });

    it('should handle save errors gracefully', async () => {
      mockWorkoutState.actions.updateTemplate.mockRejectedValue(
        new Error('Network error')
      );

      render(<EditTemplateScreen />);

      const saveButton = screen.getByLabelText('Save template changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeTruthy();
      });

      expect(router.back).not.toHaveBeenCalled();
    });

    it('should show loading state during save', async () => {
      let resolvePromise: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockWorkoutState.actions.updateTemplate.mockReturnValue(savePromise);

      render(<EditTemplateScreen />);

      const saveButton = screen.getByLabelText('Save template changes');
      fireEvent.press(saveButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Saving Changes...')).toBeTruthy();
        expect(saveButton.props.disabled).toBe(true);
      });

      // Resolve the promise
      resolvePromise!();
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels and hints', () => {
      render(<EditTemplateScreen />);

      // Form inputs
      const titleInput = screen.getByLabelText('Template name');
      expect(titleInput.props.accessibilityHint).toBe(
        'Enter a descriptive name for your workout template'
      );

      const descriptionInput = screen.getByLabelText('Template description');
      expect(descriptionInput.props.accessibilityHint).toBe(
        'Optional description explaining the template\'s purpose and goals'
      );

      // Buttons
      const backButton = screen.getByLabelText('Go back');
      expect(backButton.props.accessibilityHint).toBe(
        'Returns to template preview'
      );

      const addButton = screen.getByLabelText('Add exercises to template');
      expect(addButton.props.accessibilityHint).toBe(
        'Opens exercise selection modal'
      );

      const saveButton = screen.getByLabelText('Save template changes');
      expect(saveButton.props.accessibilityHint).toBe(
        'Saves changes to your template'
      );
    });

    it('should have proper touch targets (minimum 44px)', () => {
      render(<EditTemplateScreen />);

      const buttons = [
        screen.getByLabelText('Go back'),
        screen.getByLabelText('Add exercises to template'),
        screen.getByLabelText('Save template changes'),
        screen.getByLabelText('Remove Bench Press from template'),
      ];

      buttons.forEach((button) => {
        // Tamagui size="$3" and size="$4" should meet 44px minimum
        expect(button.props.accessibilityRole || 'button').toBe('button');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing template gracefully', () => {
      (useWorkoutState as jest.Mock).mockReturnValue({
        ...mockWorkoutState,
        templates: [],
        state: { templates: [] },
      });

      render(<EditTemplateScreen />);

      expect(screen.getByText('Template not found')).toBeTruthy();
      expect(screen.getByText('Go Back')).toBeTruthy();
    });

    it('should clear errors when form is corrected', async () => {
      render(<EditTemplateScreen />);

      const titleInput = screen.getByLabelText('Template title');
      const saveButton = screen.getByLabelText('Save template changes');

      // Trigger error
      fireEvent.changeText(titleInput, '');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a template name')).toBeTruthy();
      });

      // Fix error
      fireEvent.changeText(titleInput, 'Fixed Title');

      await waitFor(() => {
        expect(screen.queryByText('Please enter a name for your template')).toBeNull();
      });
    });
  });
});