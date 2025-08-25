import { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  H2,
  Text,
  Button,
  Card,
  ScrollView,
  Spinner,
} from 'tamagui';
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
      router.push(`/logging/${session.id}`);
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
      router.push(`/edit-template/${id}` as any);
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
        <ScrollView>
          <YStack flex={1} padding="$4" space="$4">
            {/* Template Info */}
            <YStack space="$3">
              <H2>{template.title}</H2>

              {template.description && (
                <Text fontSize="$4" color="$gray11" lineHeight="$1">
                  {template.description}
                </Text>
              )}

              {/* Stats */}
              <XStack space="$4" alignItems="center">
                <XStack space="$2" alignItems="center">
                  <Clock size={16} color="$gray10" />
                  <Text fontSize="$3" color="$gray10">
                    {template.estimatedDuration}m
                  </Text>
                </XStack>

                <XStack space="$2" alignItems="center">
                  <Target size={16} color="$gray10" />
                  <Text fontSize="$3" color="$gray10">
                    {template.exercises.length} exercises
                  </Text>
                </XStack>

                <Text fontSize="$3" color="$gray10" textTransform="capitalize">
                  {template.difficulty}
                </Text>
              </XStack>

              {template.lastCompleted && (
                <Text fontSize="$3" color="$gray10">
                  Last completed: {formatDate(template.lastCompleted)}
                </Text>
              )}
            </YStack>

            {/* Exercise List */}
            <YStack space="$3">
              <Text fontSize="$5" fontWeight="600">
                Exercises
              </Text>

              <YStack space="$3">
                {template.exercises.map((templateExercise, index) => (
                  <Card
                    key={`${templateExercise.exerciseId}-${index}`}
                    padding="$3"
                    backgroundColor="$gray2"
                  >
                    <YStack space="$2">
                      <Text fontSize="$4" fontWeight="500">
                        {index + 1}. Exercise {templateExercise.exerciseId}
                      </Text>

                      <XStack space="$4">
                        <Text fontSize="$3" color="$gray10">
                          {templateExercise.sets} sets
                        </Text>

                        {templateExercise.reps && (
                          <Text fontSize="$3" color="$gray10">
                            {templateExercise.reps} reps
                          </Text>
                        )}

                        {templateExercise.weight && (
                          <Text fontSize="$3" color="$gray10">
                            {templateExercise.weight} lbs
                          </Text>
                        )}

                        {templateExercise.restTime && (
                          <Text fontSize="$3" color="$gray10">
                            {templateExercise.restTime}s rest
                          </Text>
                        )}
                      </XStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            </YStack>

            {/* Start CTA */}
            <Button
              size="$4"
              backgroundColor="$green9"
              onPress={handleStart}
              disabled={isStarting}
              icon={<Play size={20} color="white" />}
              marginTop="$4"
            >
              {isStarting ? 'Starting...' : 'Start Workout'}
            </Button>

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

        {/* Conflict Modal */}
        <WorkoutConflictModal
          isOpen={isConflictModalOpen}
          activeSession={state.activeSession}
          onClose={() => setIsConflictModalOpen(false)}
          onResume={handleResumeWorkout}
          onStartNew={async () => {
            if (state.activeSession) {
              await actions.discardSession();
            }
            setIsConflictModalOpen(false);
            handleStart();
          }}
        />

      </YStack>
    </SafeAreaView>
  );
}
