import { useState, useCallback, useEffect, useMemo } from 'react';
import { FlatList, Alert } from 'react-native';
import {
  YStack,
  XStack,
  H3,
  Text,
  Button,
  ScrollView,
  Card,
  Separator,
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  MoreHorizontal,
  Plus,
  Clock,
  Trophy,
  Hash,
} from '@tamagui/lucide-icons';
import {
  useWorkoutState,
  useRestTimer,
} from '../../../src/features/workout/hooks';
import {
  ExerciseCard,
  RestBar,
  RestPresetSheet,
} from '../../../src/features/workout/components';
import type {
  SetData,
  SessionExercise,
} from '../../../src/features/workout/types';
import type { ExerciseId, SetEntryId } from '@spotta/shared';

export default function LoggingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { state, actions } = useWorkoutState();
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showRestPresetSheet, setShowRestPresetSheet] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const restTimer = useRestTimer({
    restTimer: state.restTimer,
    onComplete: () => {
      actions.skipRest();
    },
    onTick: (remainingTime) => {
      // Audio notifications for rest timer
      if (remainingTime === 10) {
        // Could play notification sound
      }
    },
  });

  // Calculate session stats
  const sessionStats = useMemo(() => {
    if (!state.activeSession) return { duration: 0, volume: 0, sets: 0 };

    const completedSets = state.activeSession.exercises.reduce(
      (total, ex) => total + ex.sets.filter((set) => set.completed).length,
      0
    );

    const totalVolume = state.activeSession.exercises.reduce(
      (total, ex) =>
        total +
        ex.sets.reduce(
          (exTotal, set) =>
            set.completed && set.weight && set.reps
              ? exTotal + set.weight * set.reps
              : exTotal,
          0
        ),
      0
    );

    return {
      duration: Math.floor(
        (Date.now() - state.activeSession.startedAt.getTime()) / 1000 / 60
      ),
      volume: Math.round(totalVolume),
      sets: completedSets,
    };
  }, [state.activeSession]);

  useEffect(() => {
    // Only redirect if we're sure there's no session matching this sessionId
    if (
      !state.isLoading &&
      (!state.activeSession || state.activeSession.id !== sessionId)
    ) {
      // Add a small delay to allow for state updates during navigation
      const timeoutId = setTimeout(() => {
        if (!state.activeSession || state.activeSession.id !== sessionId) {
          console.log('No matching session found, redirecting to workout');
          router.replace('/workout');
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [state.activeSession, state.isLoading, sessionId]);

  const activeExercise = state.activeSession?.exercises[activeExerciseIndex];
  const currentExerciseName = activeExercise?.exercise.name;

  const handleSetComplete = useCallback(
    async (setData: SetData) => {
      try {
        await actions.completeSet(setData);

        // Start rest timer after completing a set
        if (activeExercise) {
          actions.startRestTimer(activeExercise.restPreset, activeExercise.id);
        }
      } catch (error) {
        console.error('Failed to complete set:', error);
      }
    },
    [actions, activeExercise]
  );

  const handleSetUpdate = useCallback(
    async (setId: SetEntryId, updates: Partial<SetData>) => {
      if (!activeExercise) return;

      try {
        await actions.updateSet(activeExercise.id, setId, updates);
      } catch (error) {
        console.error('Failed to update set:', error);
      }
    },
    [actions, activeExercise]
  );

  const handleAddSet = useCallback(async () => {
    if (!activeExercise) return;

    try {
      await actions.addSet(activeExercise.id);
    } catch (error) {
      console.error('Failed to add set:', error);
    }
  }, [actions, activeExercise]);

  const handleFinishWorkout = useCallback(async () => {
    if (!state.activeSession) return;

    const completedSets = sessionStats.sets;

    Alert.alert(
      'Finish Workout',
      `Complete your workout with ${completedSets} logged sets?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            try {
              setIsFinishing(true);
              await actions.finishSession();
              router.replace('/workout');
            } catch (error) {
              console.error('Failed to finish workout:', error);
              setIsFinishing(false);
            }
          },
        },
      ]
    );
  }, [state.activeSession, sessionStats.sets, actions]);

  const handleDiscardWorkout = useCallback(() => {
    if (!state.activeSession) return;

    const completedSets = sessionStats.sets;

    Alert.alert(
      'Discard workout?',
      `You'll lose ${completedSets} logged sets.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.discardSession();
              router.replace('/workout');
            } catch (error) {
              console.error('Failed to discard workout:', error);
            }
          },
        },
      ]
    );
  }, [state.activeSession, sessionStats.sets, actions]);

  const handleRestPresetApply = useCallback(
    (scope: 'this' | 'all' | 'remember', seconds: number) => {
      if (!activeExercise) return;

      switch (scope) {
        case 'this':
          // Apply to current exercise only - would update exercise rest preset
          break;
        case 'all':
          // Apply to all exercises in session
          break;
        case 'remember':
          // Remember for this exercise type
          break;
      }

      setShowRestPresetSheet(false);
    },
    [activeExercise]
  );

  const renderCollapsedExerciseCard = useCallback(
    ({ item, index }: { item: SessionExercise; index: number }) => {
      const completedSets = item.sets.filter((set) => set.completed).length;
      const lastCompletedSet = item.sets.filter((set) => set.completed).pop();

      return (
        <Card
          padding="$3"
          backgroundColor={index === activeExerciseIndex ? '$blue2' : '$gray1'}
          borderColor={index === activeExerciseIndex ? '$blue6' : '$gray4'}
          borderWidth={1}
          marginBottom="$2"
          pressStyle={{ scale: 0.98 }}
          onPress={() => setActiveExerciseIndex(index)}
          accessibilityLabel={`Exercise ${index + 1}: ${item.exercise.name}`}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <YStack flex={1} space="$1">
              <Text fontSize="$4" fontWeight="500">
                {item.exercise.name}
              </Text>
              <XStack space="$2" alignItems="center" flexWrap="wrap">
                <Text fontSize="$2" color="$gray10">
                  {completedSets}/{item.sets.length} sets
                </Text>
                {lastCompletedSet &&
                  lastCompletedSet.weight &&
                  lastCompletedSet.reps && (
                    <>
                      <Text fontSize="$2" color="$gray10">
                        •
                      </Text>
                      <Text fontSize="$2" color="$gray10">
                        Last: {lastCompletedSet.weight}×{lastCompletedSet.reps}
                      </Text>
                    </>
                  )}
              </XStack>
            </YStack>

            {index === activeExerciseIndex && (
              <Text fontSize="$2" color="$blue11" fontWeight="600">
                ACTIVE
              </Text>
            )}
          </XStack>
        </Card>
      );
    },
    [activeExerciseIndex]
  );

  if (state.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>Loading workout...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!state.activeSession) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>No active session found</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Header */}
        <XStack
          padding="$4"
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$background"
        >
          <YStack flex={1}>
            <Text fontSize="$5" fontWeight="600" numberOfLines={1}>
              {state.activeSession.name}
            </Text>
            <XStack space="$3" alignItems="center">
              <XStack space="$1" alignItems="center">
                <Clock size={12} color="$gray10" />
                <Text fontSize="$2" color="$gray10">
                  {sessionStats.duration}m
                </Text>
              </XStack>
              <XStack space="$1" alignItems="center">
                <Trophy size={12} color="$gray10" />
                <Text fontSize="$2" color="$gray10">
                  {sessionStats.volume}lbs
                </Text>
              </XStack>
              <XStack space="$1" alignItems="center">
                <Hash size={12} color="$gray10" />
                <Text fontSize="$2" color="$gray10">
                  {sessionStats.sets}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <XStack space="$2">
            <Button
              size="$3"
              chromeless
              onPress={handleDiscardWorkout}
              icon={<MoreHorizontal size={16} />}
              accessibilityLabel="More options"
            />
            <Button
              size="$3"
              backgroundColor="$green9"
              onPress={handleFinishWorkout}
              disabled={isFinishing}
            >
              {isFinishing ? 'Finishing...' : 'Finish'}
            </Button>
          </XStack>
        </XStack>

        <Separator />

        {/* Exercise List - Virtualized */}
        <YStack flex={1} paddingHorizontal="$4">
          <FlatList
            data={state.activeSession.exercises}
            renderItem={({ item, index }) => {
              if (index === activeExerciseIndex && activeExercise) {
                return (
                  <YStack marginBottom="$3" marginTop="$3">
                    <ExerciseCard
                      exercise={activeExercise}
                      isActive={true}
                      onSetComplete={handleSetComplete}
                      onSetUpdate={handleSetUpdate}
                      onToggleActive={() => {}}
                    />

                    {/* Add Set Button */}
                    <Button
                      size="$3"
                      marginTop="$2"
                      onPress={handleAddSet}
                      icon={<Plus size={16} />}
                    >
                      Add Set
                    </Button>

                    {/* Rest Preset Chip */}
                    <Button
                      size="$2"
                      marginTop="$2"
                      chromeless
                      onPress={() => setShowRestPresetSheet(true)}
                      accessibilityLabel="Rest timer settings"
                    >
                      Rest: {activeExercise.restPreset}s ⚙️
                    </Button>
                  </YStack>
                );
              }

              return renderCollapsedExerciseCard({ item, index });
            }}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: index === activeExerciseIndex ? 300 : 80,
              offset: 80 * index + (index === activeExerciseIndex ? 220 : 0),
              index,
            })}
          />

          {/* Cancel Workout Button */}
          <Button
            size="$3"
            marginVertical="$3"
            backgroundColor="$red9"
            onPress={handleDiscardWorkout}
          >
            Cancel workout
          </Button>
        </YStack>

        {/* Footer Bar */}
        <XStack
          padding="$4"
          backgroundColor="$background"
          borderTopWidth={1}
          borderTopColor="$gray6"
          space="$3"
        >
          <Button
            flex={1}
            size="$3"
            onPress={() => router.push('/workout/add?mode=append' as any)}
            icon={<Plus size={16} />}
          >
            Add Exercise
          </Button>
        </XStack>

        {/* Rest Timer Bar - Sticky */}
        {state.restTimer.isActive && (
          <RestBar
            restTimer={state.restTimer}
            onSkip={actions.skipRest}
            onAdjust={actions.adjustRestTimer}
            onPause={actions.pauseRestTimer}
            onResume={actions.resumeRestTimer}
            exerciseName={currentExerciseName || 'Exercise'}
          />
        )}

        {/* Rest Preset Sheet */}
        <RestPresetSheet
          isOpen={showRestPresetSheet}
          onClose={() => setShowRestPresetSheet(false)}
          currentRestTime={activeExercise?.restPreset || 90}
          exerciseName={currentExerciseName ?? undefined}
          onApplyToThis={(seconds) => handleRestPresetApply('this', seconds)}
          onApplyToAll={(seconds) => handleRestPresetApply('all', seconds)}
          onRememberForExercise={(seconds) =>
            handleRestPresetApply('remember', seconds)
          }
        />
      </YStack>
    </SafeAreaView>
  );
}
