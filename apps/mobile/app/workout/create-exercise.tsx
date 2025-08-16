import { useState } from 'react';
import { 
  YStack, 
  XStack, 
  H2, 
  Text, 
  Button, 
  Card, 
  Input,
  TextArea,
  ScrollView,
  Label,
  Checkbox
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Save } from '@tamagui/lucide-icons';
import { workoutService } from '../../src/features/workout/services/workoutService';
import type { Exercise } from '../../src/features/workout/types';

interface CreateExerciseForm {
  name: string;
  muscle: string; // Single muscle selection
  equipment: string[];
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
}

const MUSCLE_OPTIONS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'quads', 'hamstrings', 'glutes', 'calves'
];

const EQUIPMENT_OPTIONS = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 
  'kettlebell', 'resistance-band', 'medicine-ball'
];

const CATEGORY_OPTIONS: Array<CreateExerciseForm['category']> = [
  'strength', 'cardio', 'flexibility', 'balance', 'sports'
];

export default function CreateExerciseScreen() {
  const [form, setForm] = useState<CreateExerciseForm>({
    name: '',
    muscle: '',
    equipment: [],
    category: 'strength'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = <K extends keyof CreateExerciseForm>(
    key: K,
    value: CreateExerciseForm[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleEquipment = (value: string) => {
    setForm(prev => {
      const current = prev.equipment;
      const newArray = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, equipment: newArray };
    });
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Exercise name is required';
    if (!form.muscle) return 'Muscle group is required';
    if (form.equipment.length === 0) return 'At least one equipment type is required';
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const newExercise = await workoutService.createCustomExercise({
        name: form.name.trim(),
        category: form.category,
        equipment: form.equipment,
        primaryMuscles: [form.muscle], // Convert single muscle to array
        secondaryMuscles: [], // No secondary muscles
        difficulty: 'beginner', // Default difficulty
        isCustom: true
      });

      // Navigate back to AddExercises with new exercise pre-selected
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise');
      setIsSaving(false);
    }
  };

  const renderCheckboxList = (
    options: string[],
    selected: string[],
    onToggle: (value: string) => void,
    label: string
  ) => (
    <YStack space="$2">
      <Label fontSize="$4" fontWeight="500">{label}</Label>
      <YStack space="$2" backgroundColor="$gray1" padding="$3" borderRadius="$3">
        {options.map(option => (
          <XStack
            key={option}
            alignItems="center"
            space="$2"
            padding="$2"
            borderRadius="$2"
            backgroundColor={selected.includes(option) ? "$blue2" : "transparent"}
            pressStyle={{ backgroundColor: "$gray2" }}
            onPress={() => onToggle(option)}
          >
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
            >
              <Checkbox.Indicator />
            </Checkbox>
            <Text flex={1} textTransform="capitalize">
              {option.replace('-', ' ')}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );

  const renderRadioList = <T extends string>(
    options: T[],
    selected: T,
    onSelect: (value: T) => void,
    label: string
  ) => (
    <YStack space="$2">
      <Label fontSize="$4" fontWeight="500">{label}</Label>
      <YStack space="$2" backgroundColor="$gray1" padding="$3" borderRadius="$3">
        {options.map(option => (
          <XStack
            key={option}
            alignItems="center"
            space="$2"
            padding="$2"
            borderRadius="$2"
            backgroundColor={selected === option ? "$blue2" : "transparent"}
            pressStyle={{ backgroundColor: "$gray2" }}
            onPress={() => onSelect(option)}
          >
            <XStack
              width={20}
              height={20}
              borderRadius={10}
              borderWidth={2}
              borderColor={selected === option ? "$blue9" : "$gray6"}
              backgroundColor={selected === option ? "$blue9" : "transparent"}
              justifyContent="center"
              alignItems="center"
            >
              {selected === option && (
                <XStack
                  width={8}
                  height={8}
                  borderRadius={4}
                  backgroundColor="white"
                />
              )}
            </XStack>
            <Text flex={1} textTransform="capitalize">
              {option}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Header Actions */}
        <XStack padding="$4" justifyContent="flex-end">
          <Button
            size="$3"
            onPress={handleSave}
            disabled={isSaving}
            icon={<Save size={16} />}
            backgroundColor="$green9"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </XStack>

        <ScrollView>
          <YStack padding="$4" space="$4">
            {/* Name */}
            <YStack space="$2">
              <Label fontSize="$4" fontWeight="500">Exercise Name *</Label>
              <Input
                placeholder="e.g., Barbell Bench Press"
                value={form.name}
                onChangeText={(text) => updateForm('name', text)}
                accessibilityLabel="Exercise name"
              />
            </YStack>

            {/* Category */}
            {renderRadioList(
              CATEGORY_OPTIONS,
              form.category,
              (value) => updateForm('category', value),
              'Category *'
            )}

            {/* Muscle Group (Single Selection) */}
            {renderRadioList(
              MUSCLE_OPTIONS,
              form.muscle,
              (value) => updateForm('muscle', value),
              'Primary Muscle Group *'
            )}

            {/* Equipment */}
            {renderCheckboxList(
              EQUIPMENT_OPTIONS,
              form.equipment,
              toggleEquipment,
              'Equipment Required *'
            )}

            {/* Error Display */}
            {error && (
              <Card backgroundColor="$red2" borderColor="$red6" borderWidth={1} padding="$3">
                <Text color="$red11">{error}</Text>
              </Card>
            )}

            {/* Form Validation Help */}
            <Card backgroundColor="$blue1" borderColor="$blue6" borderWidth={1} padding="$3">
              <Text fontSize="$3" color="$blue11">
                * Required fields. Your custom exercise will be saved to your personal library.
              </Text>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}