import { useState } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Input,
  ScrollView,
  Label,
  Sheet,
} from '@my/ui';
import { X, Save } from '@tamagui/lucide-icons';
import { workoutService } from '../services/workoutService';
import { FilterDropdown } from './FilterDropdown';
import type { Exercise } from '../types';

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (exercise: Exercise) => void;
}

interface CreateExerciseForm {
  name: string;
  muscle: string; // Single muscle selection - can be empty now
  equipment: string; // Changed to single selection string
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
}

const MUSCLE_OPTIONS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
];

const EQUIPMENT_OPTIONS = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'resistance-band',
  'medicine-ball',
];

const CATEGORY_OPTIONS: Array<CreateExerciseForm['category']> = [
  'strength',
  'cardio',
  'flexibility',
  'balance',
  'sports',
];

export function CreateExerciseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateExerciseModalProps) {
  const [form, setForm] = useState<CreateExerciseForm>({
    name: '',
    muscle: 'all',
    equipment: 'all',
    category: 'strength',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = <K extends keyof CreateExerciseForm>(
    key: K,
    value: CreateExerciseForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear name error when user starts typing
    if (key === 'name' && showNameError) {
      setShowNameError(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      muscle: 'all',
      equipment: 'all',
      category: 'strength',
    });
    setShowNameError(false);
    setError(null);
    setIsSaving(false);
    onClose();
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setShowNameError(true);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const newExercise = await workoutService.createCustomExercise({
        name: form.name.trim(),
        category: form.category,
        equipment: form.equipment === 'all' ? ['bodyweight'] : [form.equipment],
        primaryMuscles: form.muscle === 'all' ? [] : [form.muscle],
        secondaryMuscles: [],
        difficulty: 'beginner',
        isCustom: true,
      });

      // Call success callback with the new exercise
      onSuccess?.(newExercise);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create exercise'
      );
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleClose}
      modal
      snapPointsMode="percent"
      snapPoints={[85]}
      dismissOnSnapToBottom={false}
      disableDrag={true}
    >
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.5)" />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        paddingBottom="$4"
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$4"
            paddingBottom="$3"
            borderBottomWidth={1}
            borderBottomColor="$gray4"
          >
            <Text fontSize="$6" fontWeight="600">
              Create Exercise
            </Text>
            <Button
              size="$3"
              chromeless
              onPress={handleClose}
              icon={<X size={20} />}
              accessibilityLabel="Close modal"
            />
          </XStack>

          {/* Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack padding="$4" space="$4">
              {/* Name */}
              <YStack space="$2">
                <Label fontSize="$4" fontWeight="500">
                  Exercise Name *
                  {showNameError && (
                    <Text fontSize="$3" color="$red9">
                      {' '}
                      Required
                    </Text>
                  )}
                </Label>
                <Input
                  placeholder="e.g., Barbell Bench Press"
                  value={form.name}
                  onChangeText={(text) => updateForm('name', text)}
                  accessibilityLabel="Exercise name"
                  borderColor={showNameError ? '$red6' : '$gray6'}
                  borderWidth={showNameError ? 2 : 1}
                  textAlignVertical="center"
                  paddingVertical="$3"
                />
              </YStack>

              {/* Category */}
              <YStack space="$2">
                <Label fontSize="$4" fontWeight="500">
                  Category
                </Label>
                <FilterDropdown
                  placeholder="Category"
                  options={CATEGORY_OPTIONS}
                  value={form.category}
                  onValueChange={(value) =>
                    updateForm(
                      'category',
                      value as
                        | 'strength'
                        | 'cardio'
                        | 'flexibility'
                        | 'balance'
                        | 'sports'
                    )
                  }
                  accessibilityLabel="Select category"
                />
              </YStack>

              {/* Muscle Group */}
              <YStack space="$2">
                <Label fontSize="$4" fontWeight="500">
                  Primary Muscle Group
                </Label>
                <FilterDropdown
                  placeholder="Muscle Group"
                  options={MUSCLE_OPTIONS}
                  value={form.muscle}
                  onValueChange={(value) => updateForm('muscle', value)}
                  accessibilityLabel="Select muscle group"
                />
              </YStack>

              {/* Equipment */}
              <YStack space="$2">
                <Label fontSize="$4" fontWeight="500">
                  Equipment
                </Label>
                <FilterDropdown
                  placeholder="Equipment"
                  options={EQUIPMENT_OPTIONS}
                  value={form.equipment}
                  onValueChange={(value) => updateForm('equipment', value)}
                  accessibilityLabel="Select equipment"
                />
              </YStack>

              {/* Help Text */}
              <Card
                backgroundColor="$blue1"
                borderColor="$blue4"
                borderWidth={1}
                padding="$3"
                borderRadius="$4"
                marginTop="$4"
              >
                <Text fontSize="$3" color="$blue11">
                  Custom exercises are saved to your personal library.
                </Text>
              </Card>
            </YStack>
          </ScrollView>

          {/* Footer CTA */}
          <XStack
            padding="$4"
            paddingBottom="$6"
            backgroundColor="$background"
            borderTopWidth={1}
            borderTopColor="$gray4"
          >
            <Button
              flex={1}
              size="$4"
              backgroundColor="$green9"
              onPress={handleSave}
              disabled={isSaving}
              icon={<Save size={16} />}
              accessibilityLabel="Save exercise"
            >
              {isSaving ? 'Creating...' : 'Create Exercise'}
            </Button>
          </XStack>

          {/* Error Display */}
          {error && (
            <Card
              margin="$4"
              backgroundColor="$red2"
              borderColor="$red6"
              borderWidth={1}
              padding="$3"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$red11" flex={1}>
                  {error}
                </Text>
                <Button
                  size="$2"
                  chromeless
                  onPress={() => setError(null)}
                  icon={<X size={16} />}
                />
              </XStack>
            </Card>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
