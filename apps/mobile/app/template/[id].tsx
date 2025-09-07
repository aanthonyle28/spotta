import { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  ScrollView,
  Spinner,
} from '@my/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Play, Clock, Target, ChevronLeft, Edit3 } from '@tamagui/lucide-icons';
import { workoutService } from '../../src/features/workout/services/workoutService';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import {
  WorkoutConflictModal,
  CustomHeader,
} from '../../src/features/workout/components';
import type { Template } from '../../src/features/workout/types';
import type { TemplateId } from '@spotta/shared';

export default function TemplatePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions, hasActiveSession } = useWorkoutState();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const templateData = await workoutService.getTemplateById(id);

      if (!templateData) {
        setError('Template not found');
        return;
      }

      setTemplate(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!template) return;

    if (hasActiveSession) {
      setIsConflictModalOpen(true);
      return;
    }

    try {
      setIsStarting(true);
      const session = await actions.startFromTemplate(
        template.id as TemplateId
      );
      // Navigate back to workout screen first, then open modal
      router.back();
      // Small delay to ensure back navigation completes
      setTimeout(() => {
        router.push(`/logging/${session.id}`);
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout');
      setIsStarting(false);
    }
  };

  const handleResumeWorkout = () => {
    if (state.activeSession) {
      router.push(`/logging/${state.activeSession.id}`);
    }
  };

  const handleEditTemplate = () => {
    if (template && id) {
      router.push(`/edit-template/${id}`);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          <CustomHeader
            title="Template Preview"
            leftAction={
              <Button
                size="$3"
                chromeless
                onPress={() => router.back()}
                icon={<ChevronLeft size={20} />}
                accessibilityLabel="Go back"
              />
            }
          />
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" />
            <Text marginTop="$3" color="$gray10">
              Loading template...
            </Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !template) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          <CustomHeader
            title="Template Preview"
            leftAction={
              <Button
                size="$3"
                chromeless
                onPress={() => router.back()}
                icon={<ChevronLeft size={20} />}
                accessibilityLabel="Go back"
              />
            }
          />
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            space="$3"
            padding="$4"
          >
            <Text fontSize="$5" color="$red10">
              {error || 'Template not found'}
            </Text>
            <Button onPress={loadTemplate}>Try Again</Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        <CustomHeader
          title={template.title}
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
              chromeless
              onPress={handleEditTemplate}
              icon={<Edit3 size={20} />}
              accessibilityLabel="Edit template"
            />
          }
        />
        <ScrollView flex={1}>
          <YStack padding="$4" space="$4">
            {/* Template Header Info */}
            <YStack space="$4">
              {/* Description */}
              {template.description && (
                <Text fontSize="$4" color="$gray11" lineHeight="$2">
                  {template.description}
                </Text>
              )}

              {/* Template Stats - Clean inline design */}
              <XStack space="$4" alignItems="center" flexWrap="wrap">
                <XStack space="$2" alignItems="center">
                  <Clock size={16} color="$blue9" />
                  <Text fontSize="$4" fontWeight="600">
                    {template.estimatedDuration} min
                  </Text>
                </XStack>

                <XStack space="$2" alignItems="center">
                  <Target size={16} color="$green9" />
                  <Text fontSize="$4" fontWeight="600">
                    {template.exercises.length} exercises
                  </Text>
                </XStack>
              </XStack>

              {template.lastCompleted && (
                <Text fontSize="$3" color="$gray10">
                  Last completed {formatDate(template.lastCompleted)}
                </Text>
              )}
            </YStack>

            {/* Exercise List */}
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
                <Text fontSize="$3" color="$gray10">
                  {template.exercises.length} exercise
                  {template.exercises.length === 1 ? '' : 's'}
                </Text>
              </XStack>
            </YStack>

            {/* Full-width exercise list */}
            <YStack marginHorizontal="$-4">
              {template.exercises.map((templateExercise, index) => (
                <XStack
                  key={`${templateExercise.exerciseId}-${index}`}
                  alignItems="center"
                  paddingHorizontal="$4"
                  paddingVertical="$4"
                  borderBottomWidth={
                    index === template.exercises.length - 1 ? 0 : 1
                  }
                  borderBottomColor="$gray3"
                >
                  {/* Exercise Info */}
                  <YStack flex={1} space="$2">
                    <Text fontSize="$5" fontWeight="600" color="$gray12">
                      {templateExercise.name}
                    </Text>

                    {/* Workout Details */}
                    <XStack space="$3" alignItems="center" flexWrap="wrap">
                      <Text fontSize="$3" fontWeight="600" color="$blue10">
                        {templateExercise.sets} set
                        {templateExercise.sets === 1 ? '' : 's'}
                      </Text>

                      {templateExercise.reps && (
                        <Text fontSize="$3" color="$gray11">
                          × {templateExercise.reps}
                        </Text>
                      )}

                      {templateExercise.weight && (
                        <Text fontSize="$3" color="$gray11">
                          @ {templateExercise.weight} lbs
                        </Text>
                      )}

                      {templateExercise.restTime && (
                        <XStack space="$1" alignItems="center">
                          <Clock size={12} color="$gray10" />
                          <Text fontSize="$3" color="$gray11">
                            {templateExercise.restTime}s
                          </Text>
                        </XStack>
                      )}
                    </XStack>

                    {/* Muscle Groups - Clean pill design */}
                    <XStack space="$2" flexWrap="wrap">
                      {templateExercise.primaryMuscles
                        .slice(0, 3)
                        .map((muscle, muscleIndex) => (
                          <Text
                            key={muscleIndex}
                            fontSize="$2"
                            color="$gray11"
                            backgroundColor="$gray3"
                            paddingHorizontal="$2.5"
                            paddingVertical="$1.5"
                            borderRadius="$4"
                            fontWeight="500"
                          >
                            {muscle}
                          </Text>
                        ))}
                      {templateExercise.primaryMuscles.length > 3 && (
                        <Text
                          fontSize="$2"
                          color="$gray10"
                          backgroundColor="$gray2"
                          paddingHorizontal="$2.5"
                          paddingVertical="$1.5"
                          borderRadius="$4"
                          fontWeight="500"
                        >
                          +{templateExercise.primaryMuscles.length - 3}
                        </Text>
                      )}
                    </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>

            {error && (
              <Card
                backgroundColor="$red2"
                borderColor="$red6"
                borderWidth={1}
                padding="$3"
              >
                <Text color="$red11">{error}</Text>
              </Card>
            )}
          </YStack>
        </ScrollView>

        {/* Sticky Start Button */}
        <YStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          paddingBottom="$6"
          backgroundColor="black"
          borderTopWidth={1}
          borderTopColor="$gray4"
        >
          <Button
            size="$4"
            backgroundColor="$green9"
            onPress={handleStart}
            disabled={isStarting}
            icon={<Play size={20} color="white" />}
          >
            {isStarting ? 'Starting...' : 'Start Workout'}
          </Button>
        </YStack>

        {/* Conflict Modal */}
        <WorkoutConflictModal
          isOpen={isConflictModalOpen}
          activeSession={state.activeSession}
          onClose={() => setIsConflictModalOpen(false)}
          onResume={handleResumeWorkout}
          onStartNew={async () => {
            try {
              if (state.activeSession) {
                await actions.discardSession();
              }
              setIsConflictModalOpen(false);

              // Start workout directly without checking hasActiveSession again
              // This follows the same pattern as /(tabs)/workout.tsx
              if (!template) {
                setIsStarting(false);
                return;
              }

              setIsStarting(true);
              const session = await actions.startFromTemplate(
                template.id as TemplateId
              );
              // Navigate back to workout screen first, then open modal
              router.back();
              // Small delay to ensure back navigation completes
              setTimeout(() => {
                router.push(`/logging/${session.id}`);
              }, 100);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Failed to start workout'
              );
              setIsStarting(false);
            }
          }}
        />
      </YStack>
    </SafeAreaView>
  );
}
