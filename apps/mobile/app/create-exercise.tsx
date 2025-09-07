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
} from '@my/ui';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Save } from '@tamagui/lucide-icons';
import { workoutService } from '../src/features/workout/services/workoutService';
import { FilterDropdown } from '../src/features/workout/components/FilterDropdown';

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

export default function CreateExerciseScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<CreateExerciseForm>({
    name: '',
    muscle: 'all',
    equipment: 'all',
    category: 'strength',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

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

      await workoutService.createCustomExercise({
        name: form.name.trim(),
        category: form.category,
        equipment: form.equipment === 'all' ? ['bodyweight'] : [form.equipment],
        primaryMuscles: form.muscle === 'all' ? [] : [form.muscle],
        secondaryMuscles: [],
        difficulty: 'beginner',
        isCustom: true,
      });

      // Navigate back to AddExercises with new exercise pre-selected
      router.back();
    } catch {
      // Handle error silently or with toast notification
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Custom Header */}
        <YStack
          paddingTop={insets.top - 40}
          paddingHorizontal="$4"
          paddingBottom="$2"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$gray4"
        >
          <XStack alignItems="center" minHeight={44}>
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<ChevronLeft size={20} />}
              accessibilityLabel="Go back"
            />
            <Text fontSize="$6" fontWeight="600" marginLeft="$3">
              Create Exercise
            </Text>
            <XStack flex={1} justifyContent="flex-end">
              <Button
                size="$3"
                backgroundColor="$green9"
                onPress={handleSave}
                disabled={isSaving}
                icon={<Save size={16} />}
                accessibilityLabel="Save exercise"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </XStack>
          </XStack>
        </YStack>

        <ScrollView>
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
      </YStack>
    </SafeAreaView>
  );
}
