import { useState, useEffect, useMemo } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input, Label } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Target, Trash2, X } from '@tamagui/lucide-icons';
import { workoutService } from '../src/features/workout/services/workoutService';
import { useWorkoutState } from '../src/features/workout/providers/WorkoutStateProvider';
import { CustomHeader, AddExerciseModal } from '../src/features/workout/components';
import type { Exercise, Template, TemplateExercise } from '../src/features/workout/types';
import type { ExerciseId } from '@spotta/shared';

interface TemplateForm {
  title: string;
  description: string;
}

export default function CreateTemplateScreen() {
  const { exercises: exerciseIds } = useLocalSearchParams<{
    exercises?: string;
  }>();
  const { actions } = useWorkoutState();

  const [form, setForm] = useState<TemplateForm>({
    title: '',
    description: '',
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTitleError, setShowTitleError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [exerciseIds]);

  const loadExercises = async () => {
    if (!exerciseIds) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const parsedIds = JSON.parse(exerciseIds) as ExerciseId[];
      const allExercises = await workoutService.getAllExercises();
      const selectedExercises = allExercises.filter(ex => parsedIds.includes(ex.id));
      setExercises(selectedExercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = <K extends keyof TemplateForm>(
    key: K,
    value: TemplateForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'title' && showTitleError) {
      setShowTitleError(false);
    }
  };

  const removeExercise = (exerciseId: ExerciseId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const addExercises = () => {
    setShowAddExerciseModal(true);
  };

  const handleExerciseSelection = (selectedExercises: Exercise[]) => {
    // Add new exercises to existing ones, avoiding duplicates
    const currentIds = new Set(exercises.map(ex => ex.id));
    const newExercises = selectedExercises.filter(ex => !currentIds.has(ex.id));
    setExercises(prev => [...prev, ...newExercises]);
  };

  const handleSave = async () => {
    // Validation
    if (!form.title.trim()) {
      setShowTitleError(true);
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise to the template');
      return;
    }

    try {
      setIsSaving(true);

      // Convert exercises to template exercises
      const templateExercises: TemplateExercise[] = exercises.map(
        (exercise) => ({
          exerciseId: exercise.id,
          sets: 3, // Default values
          reps: 10,
          name: exercise.name,
          category: exercise.category,
          primaryMuscles: exercise.primaryMuscles,
        })
      );

      const templateData: Omit<Template, 'id' | 'userId'> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        exercises: templateExercises,
        estimatedDuration: 45, // Default duration
        difficulty: 'intermediate', // Default difficulty  
        isPublic: false,
      };

      await actions.createTemplate(templateData);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsSaving(false);
    }
  };

  const renderExerciseItem = ({ item, index }: { item: Exercise; index: number }) => (
    <Card
      padding="$3"
      backgroundColor="$gray2"
      borderColor="$gray4"
      borderWidth={1}
      marginBottom="$2"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1} space="$1">
          <Text fontSize="$4" fontWeight="500">
            {index + 1}. {item.name}
          </Text>
          <XStack space="$2" flexWrap="wrap">
            <Text fontSize="$2" color="$gray10" textTransform="capitalize">
              {item.difficulty}
            </Text>
            <Text fontSize="$2" color="$gray10">•</Text>
            <Text fontSize="$2" color="$gray10">
              {item.primaryMuscles.join(', ')}
            </Text>
          </XStack>
          <Text fontSize="$3" color="$gray10">
            3 sets × 10 reps
          </Text>
        </YStack>
        <Button
          size="$2"
          chromeless
          onPress={() => removeExercise(item.id)}
          padding="$2"
          accessibilityLabel={`Remove ${item.name}`}
        >
          <Trash2 size={16} color="$red10" />
        </Button>
      </XStack>
    </Card>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
        {/* Header */}
        <CustomHeader
          title="Create Template"
          leftAction={
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<ChevronLeft size={20} />}
              accessibilityLabel="Go back"
            />
          }
          rightAction={
            <Button
              size="$3"
              backgroundColor="$green9"
              onPress={handleSave}
              disabled={isSaving || exercises.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          }
        />

        {/* Content */}
        <YStack flex={1} padding="$4" space="$4">
          {/* Basic Info Form */}
          <YStack space="$3">
            <YStack space="$2">
              <Label htmlFor="title" fontSize="$4" fontWeight="500">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter template name"
                value={form.title}
                onChangeText={(text) => updateForm('title', text)}
                borderColor={showTitleError ? '$red6' : '$gray6'}
                focusStyle={{
                  borderColor: showTitleError ? '$red8' : '$blue8',
                }}
                accessibilityLabel="Template title"
              />
              {showTitleError && (
                <Text fontSize="$3" color="$red10">
                  Title is required
                </Text>
              )}
            </YStack>

            <YStack space="$2">
              <Label htmlFor="description" fontSize="$4" fontWeight="500">
                Description (optional)
              </Label>
              <Input
                id="description"
                placeholder="Describe your template"
                value={form.description}
                onChangeText={(text) => updateForm('description', text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Template description"
              />
            </YStack>
          </YStack>

          {/* Exercises Section */}
          <YStack flex={1} space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Target size={16} color="$gray10" />
                <Text fontSize="$5" fontWeight="500">
                  Exercises ({exercises.length})
                </Text>
              </XStack>
              <Button
                size="$3"
                backgroundColor="$blue9"
                onPress={addExercises}
                accessibilityLabel="Add exercises"
              >
                Add Exercises
              </Button>
            </XStack>

            {/* Exercise List */}
            {isLoading ? (
              <YStack flex={1} justifyContent="center" alignItems="center">
                <Text fontSize="$4" color="$gray10">
                  Loading exercises...
                </Text>
              </YStack>
            ) : exercises.length === 0 ? (
              <YStack flex={1} justifyContent="center" alignItems="center" space="$3">
                <Text fontSize="$4" fontWeight="500" textAlign="center">
                  No exercises added yet
                </Text>
                <Text fontSize="$3" color="$gray10" textAlign="center">
                  Add exercises to create your template
                </Text>
                <Button backgroundColor="$blue9" onPress={addExercises}>
                  Add Exercises
                </Button>
              </YStack>
            ) : (
              <YStack flex={1}>
                <FlatList
                  data={exercises}
                  renderItem={renderExerciseItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={(data, index) => ({
                    length: 85,
                    offset: 85 * index,
                    index,
                  })}
                />
              </YStack>
            )}
          </YStack>
        </YStack>

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
              <Text color="$red11" flex={1}>{error}</Text>
              <Button
                size="$2"
                chromeless
                onPress={() => setError(null)}
                icon={<X size={16} />}
              />
            </XStack>
          </Card>
        )}

        {/* Add Exercise Modal */}
        <AddExerciseModal
          isOpen={showAddExerciseModal}
          onClose={() => setShowAddExerciseModal(false)}
          onSelect={handleExerciseSelection}
          currentExercises={exercises.map(ex => ex.id)}
          mode="add"
        />
        </YStack>
      </SafeAreaView>
    </>
  );
}