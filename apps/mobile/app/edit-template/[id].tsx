import { useState, useEffect } from 'react';
import { FlatList, Alert } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input, Label } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Target, Trash2 } from '@tamagui/lucide-icons';
import { workoutService } from '../../src/features/workout/services/workoutService';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import { CustomHeader, AddExerciseModal } from '../../src/features/workout/components';
import type { Template, TemplateExercise, Exercise } from '../../src/features/workout/types';
import type { ExerciseId, TemplateId } from '@spotta/shared';

interface TemplateForm {
  title: string;
  description: string;
}

export default function EditTemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { actions, state } = useWorkoutState();

  const [template, setTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState<TemplateForm>({
    title: '',
    description: '',
  });
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTitleError, setShowTitleError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Find template in state first, fallback to service
      let templateData = state.templates.find(t => t.id === id as TemplateId);
      if (!templateData) {
        // If not in state, load from service (this might need to be implemented)
        throw new Error('Template not found');
      }

      setTemplate(templateData);
      setForm({
        title: templateData.title,
        description: templateData.description || '',
      });
      setExercises([...templateData.exercises]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
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

  const removeExercise = (exerciseId: ExerciseId, exerciseName: string) => {
    Alert.alert(
      'Remove Exercise',
      `Remove "${exerciseName}" from this template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises(prev => prev.filter(ex => ex.exerciseId !== exerciseId));
          },
        },
      ]
    );
  };


  const addExercises = () => {
    setShowAddExerciseModal(true);
  };

  const handleExerciseSelection = (selectedExercises: Exercise[]) => {
    // Convert Exercise[] to TemplateExercise[] and add to existing exercises
    const currentIds = new Set(exercises.map(ex => ex.exerciseId));
    const newTemplateExercises: TemplateExercise[] = selectedExercises
      .filter(ex => !currentIds.has(ex.id))
      .map(exercise => ({
        exerciseId: exercise.id,
        sets: 3, // Default values
        reps: 10,
        name: exercise.name,
        category: exercise.category,
        primaryMuscles: exercise.primaryMuscles,
      }));
    
    setExercises(prev => [...prev, ...newTemplateExercises]);
  };

  const handleSave = async () => {
    if (!template) return;

    // Validation
    if (!form.title.trim()) {
      setShowTitleError(true);
      return;
    }

    if (exercises.length === 0) {
      setError('Template must have at least one exercise');
      return;
    }

    try {
      setIsSaving(true);

      const updates: Partial<Template> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        exercises: [...exercises],
      };

      await actions.updateTemplate(template.id, updates);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const renderExerciseItem = ({ item, index }: { item: TemplateExercise; index: number }) => (
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
            <Text fontSize="$2" color="$gray10">
              {item.primaryMuscles.join(', ')}
            </Text>
          </XStack>
          <Text fontSize="$3" color="$gray10">
            {item.sets} sets
            {item.reps && ` × ${item.reps} reps`}
            {item.weight && ` @ ${item.weight} lbs`}
          </Text>
        </YStack>
        
        <Button
          size="$2"
          chromeless
          onPress={() => removeExercise(item.exerciseId, item.name)}
          padding="$2"
          accessibilityLabel={`Remove ${item.name}`}
        >
          <Trash2 size={16} color="$red10" />
        </Button>
      </XStack>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$4" color="$gray10">
            Loading template...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" space="$3">
          <Text fontSize="$4" fontWeight="500" textAlign="center">
            Template not found
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
        {/* Header */}
        <CustomHeader
          title="Edit Template"
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
            {exercises.length === 0 ? (
              <YStack flex={1} justifyContent="center" alignItems="center" space="$3">
                <Text fontSize="$4" fontWeight="500" textAlign="center">
                  No exercises in this template
                </Text>
                <Text fontSize="$3" color="$gray10" textAlign="center">
                  Add exercises to update your template
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
                  keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={(data, index) => ({
                    length: 95,
                    offset: 95 * index,
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
          currentExercises={exercises.map(ex => ex.exerciseId)}
          mode="add"
        />
        </YStack>
      </SafeAreaView>
    </>
  );
}