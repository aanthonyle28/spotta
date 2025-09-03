import { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { YStack, XStack, Text, Button, Input, Label } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Target, Clock, Plus } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import {
  CustomHeader,
  AddExerciseModal,
} from '../../src/features/workout/components';
import type {
  Template,
  TemplateExercise,
  Exercise,
} from '../../src/features/workout/types';
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
      const templateData = state.templates.find(
        (t) => t.id === (id as TemplateId)
      );
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
            setExercises((prev) =>
              prev.filter((ex) => ex.exerciseId !== exerciseId)
            );
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
    const currentIds = new Set(exercises.map((ex) => ex.exerciseId));
    const newTemplateExercises: TemplateExercise[] = selectedExercises
      .filter((ex) => !currentIds.has(ex.id))
      .map((exercise) => ({
        exerciseId: exercise.id,
        sets: 3, // Default values
        reps: 10,
        name: exercise.name,
        category: exercise.category,
        primaryMuscles: exercise.primaryMuscles,
      }));

    setExercises((prev) => [...prev, ...newTemplateExercises]);
  };

  const handleSave = async () => {
    if (!template) return;

    // Clear previous errors
    setError(null);

    // Validation
    if (!form.title.trim()) {
      setShowTitleError(true);
      setError('Please enter a name for your template');
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
      setError(
        err instanceof Error ? err.message : 'Failed to save template changes'
      );
    } finally {
      setIsSaving(false);
    }
  };


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
          {/* Header - Clean title, no save button */}
          <CustomHeader
            title="Edit Template"
            leftAction={
              <Button
                size="$3"
                chromeless
                onPress={() => router.back()}
                icon={<ChevronLeft size={20} />}
                accessibilityLabel="Go back"
                accessibilityHint="Returns to template preview"
              />
            }
          />

          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {/* Form Section - Padded container */}
            <YStack padding="$4" space="$4">
              {/* Template Details Form - Improved Design */}
              <YStack space="$4">
                {/* Title Input */}
                <YStack space="$2.5">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$4" fontWeight="600" color="$gray12">
                      Template Name
                    </Text>
                    <Text fontSize="$2" fontWeight="500" color={showTitleError ? '$red10' : 'white'}>
                      Required
                    </Text>
                  </XStack>
                  <Input
                    id="title"
                    placeholder="e.g. Upper Body Strength"
                    value={form.title}
                    onChangeText={(text) => updateForm('title', text)}
                    fontSize="$4"
                    paddingHorizontal="$3.5"
                    paddingVertical="$2.5"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor={showTitleError ? '$red6' : '$gray4'}
                    backgroundColor={showTitleError ? '$red1' : '$gray1'}
                    focusStyle={{
                      borderColor: showTitleError ? '$red8' : '$gray6',
                      backgroundColor: showTitleError ? '$red2' : '$gray1',
                    }}
                    placeholderTextColor="$gray9"
                    accessibilityLabel="Template name"
                    accessibilityHint="Enter a descriptive name for your workout template"
                  />
                  {showTitleError && (
                    <XStack space="$2" alignItems="center">
                      <Text fontSize="$2" fontWeight="500" color="$red10">
                        ⚠
                      </Text>
                      <Text fontSize="$3" color="$red10" flex={1}>
                        Please enter a name for your template
                      </Text>
                    </XStack>
                  )}
                </YStack>

                {/* Description Input */}
                <YStack space="$2.5">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack space="$2" alignItems="center">
                      <Text fontSize="$4" fontWeight="600" color="$gray12">
                        Description
                      </Text>
                      {form.description.trim() && (
                        <Text fontSize="$2" color="$gray9">
                          ({form.description.trim().length}/200)
                        </Text>
                      )}
                    </XStack>
                    <Text fontSize="$2" fontWeight="500" color="$gray9">
                      Optional
                    </Text>
                  </XStack>
                  <Input
                    id="description"
                    placeholder="Describe the focus and goals of this template..."
                    value={form.description}
                    onChangeText={(text) => updateForm('description', text)}
                    fontSize="$3"
                    paddingHorizontal="$3.5"
                    paddingVertical="$2.5"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor="$gray4"
                    backgroundColor="$gray1"
                    multiline
                    numberOfLines={3}
                    minHeight={80}
                    textAlignVertical="top"
                    focusStyle={{
                      borderColor: '$gray6',
                      backgroundColor: '$gray1',
                    }}
                    placeholderTextColor="$gray9"
                    accessibilityLabel="Template description"
                    accessibilityHint="Optional description explaining the template's purpose and goals"
                  />
                </YStack>
              </YStack>
              
              {/* Spacing between form and exercise section */}
              <YStack height="$1" />
              
              {/* Exercise Section Header */}
              <YStack space="$3">
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  backgroundColor="$gray2"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  marginHorizontal="$-4"
                >
                  <Text fontSize="$5" fontWeight="600">
                    Exercises
                  </Text>
                  <XStack space="$3" alignItems="center">
                    <Text fontSize="$3" color="$gray10">
                      {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
                    </Text>
                    <Button
                      size="$3"
                      backgroundColor="$blue9"
                      onPress={addExercises}
                      icon={<Plus size={16} />}
                      accessibilityLabel="Add exercises to template"
                      accessibilityHint="Opens exercise selection modal"
                    >
                      Add
                    </Button>
                  </XStack>
                </XStack>
              </YStack>
              
              {/* Full-width exercise list - Edge-to-edge */}
              <YStack marginHorizontal="$-4">
                {exercises.length === 0 ? (
                  <YStack
                    paddingHorizontal="$4"
                    paddingVertical="$8"
                    alignItems="center"
                    space="$4"
                  >
                    <YStack alignItems="center" space="$3">
                      <Target size={48} color="$gray8" />
                      <Text fontSize="$4" fontWeight="600" textAlign="center">
                        No exercises in this template
                      </Text>
                      <Text fontSize="$3" color="$gray10" textAlign="center" maxWidth={240}>
                        Add exercises to create your workout template
                      </Text>
                    </YStack>
                    <Button
                      size="$4"
                      backgroundColor="$blue9"
                      onPress={addExercises}
                      icon={<Plus size={20} />}
                      accessibilityLabel="Add exercises to template"
                    >
                      Add Exercises
                    </Button>
                  </YStack>
                ) : (
                  <>
                    {exercises.map((exercise, index) => {
                      const isLast = index === exercises.length - 1;
                      
                      return (
                        <XStack
                          key={`${exercise.exerciseId}-${index}`}
                          alignItems="center"
                          paddingHorizontal="$4"
                          paddingVertical="$4"
                          borderBottomWidth={isLast ? 0 : 1}
                          borderBottomColor="$gray3"
                        >
                          <YStack flex={1} space="$2">
                            {/* Primary: Exercise name with index */}
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                              {index + 1}. {exercise.name}
                            </Text>
                            
                            {/* Secondary: Set details */}
                            <XStack space="$3" alignItems="center" flexWrap="wrap">
                              <Text fontSize="$3" fontWeight="600" color="$blue10">
                                {exercise.sets} set{exercise.sets === 1 ? '' : 's'}
                              </Text>
                              {exercise.reps && (
                                <Text fontSize="$3" color="$gray11">
                                  × {exercise.reps} reps
                                </Text>
                              )}
                              {exercise.weight && (
                                <Text fontSize="$3" color="$gray11">
                                  @ {exercise.weight} lbs
                                </Text>
                              )}
                            </XStack>
                            
                            {/* Category pills - max 3 + overflow */}
                            <XStack space="$2" flexWrap="wrap">
                              {exercise.primaryMuscles.slice(0, 3).map((muscle, muscleIndex) => (
                                <Text
                                  key={muscleIndex}
                                  fontSize="$2"
                                  color="$gray11"
                                  backgroundColor="$gray3"
                                  paddingHorizontal="$2.5"
                                  paddingVertical="$1.5"
                                  borderRadius="$2"
                                  fontWeight="500"
                                >
                                  {muscle}
                                </Text>
                              ))}
                              {exercise.primaryMuscles.length > 3 && (
                                <Text
                                  fontSize="$2"
                                  color="$gray10"
                                  backgroundColor="$gray2"
                                  paddingHorizontal="$2.5"
                                  paddingVertical="$1.5"
                                  borderRadius="$2"
                                  fontWeight="500"
                                >
                                  +{exercise.primaryMuscles.length - 3}
                                </Text>
                              )}
                            </XStack>
                          </YStack>
                          
                          <Button
                            size="$3"
                            chromeless
                            onPress={() => removeExercise(exercise.exerciseId, exercise.name)}
                            accessibilityLabel={`Remove ${exercise.name} from template`}
                            accessibilityHint="Removes this exercise from the template"
                          >
                            <Text fontSize="$3" color="$red10">Remove</Text>
                          </Button>
                        </XStack>
                      );
                    })}
                  </>
                )}
              </YStack>
            </YStack>
            
            {/* Bottom spacing for scroll content */}
            <YStack height="$4" />
          </ScrollView>
          
          {/* Sticky bottom action */}
          <YStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            paddingBottom="$6"
            backgroundColor="black"
            borderTopWidth={1}
            borderTopColor="$gray4"
          >
            {error && (
              <YStack
                backgroundColor="$red2"
                borderColor="$red6"
                borderWidth={1}
                borderRadius="$4"
                padding="$3"
                marginBottom="$3"
              >
                <Text color="$red11" fontSize="$3">
                  {error}
                </Text>
              </YStack>
            )}
            <Button
              size="$4"
              backgroundColor="$green9"
              onPress={handleSave}
              disabled={isSaving || !form.title.trim() || exercises.length === 0}
              accessibilityLabel="Save template changes"
              accessibilityHint={isSaving ? 'Saving your template' : 'Saves changes to your template'}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </YStack>

        {/* Add Exercise Modal */}
        <AddExerciseModal
          isOpen={showAddExerciseModal}
          onClose={() => setShowAddExerciseModal(false)}
          onSelect={handleExerciseSelection}
          currentExercises={exercises.map((ex) => ex.exerciseId)}
          mode="add"
        />
        </YStack>
      </SafeAreaView>
    </>
  );
}
