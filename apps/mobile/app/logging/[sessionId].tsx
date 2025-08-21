import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
} from '../../src/features/workout/hooks';
import {
  CollapsibleExerciseCard,
  RestBar,
  RestPresetSheet,
} from '../../src/features/workout/components';
import type {
  SetData,
  SessionExercise,
} from '../../src/features/workout/types';
import type { ExerciseId, SetEntryId } from '@spotta/shared';

export default function LoggingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { state, actions } = useWorkoutState();
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showRestPresetSheet, setShowRestPresetSheet] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set([0])
  );
  const addSetTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
          router.replace('/(tabs)/workout');
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

  const handleAddSet = useCallback(
    async (exerciseId: string) => {
      const timeoutKey = exerciseId;

      // Clear existing timeout for this exercise
      if (addSetTimeouts.current.has(timeoutKey)) {
        clearTimeout(addSetTimeouts.current.get(timeoutKey)!);
      }

      // Add debouncing to prevent rapid clicks
      const timeout = setTimeout(async () => {
        try {
          await actions.addSet(exerciseId as any);
          addSetTimeouts.current.delete(timeoutKey);
        } catch (error) {
          console.error('Failed to add set:', error);
          addSetTimeouts.current.delete(timeoutKey);
        }
      }, 300);

      addSetTimeouts.current.set(timeoutKey, timeout);
    },
    [actions]
  );

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
              router.replace('/(tabs)/workout');
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
              router.replace('/(tabs)/workout');
            } catch (error) {
              console.error('Failed to discard workout:', error);
            }
          },
        },
      ]
    );
  }, [state.activeSession, sessionStats.sets, actions]);

  const handleToggleExercise = useCallback((index: number) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      addSetTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      addSetTimeouts.current.clear();
    };
  }, []);

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

        {/* Exercise List - Fullwidth with No Horizontal Padding */}
        <YStack flex={1}>
          <FlatList
            data={state.activeSession.exercises}
            renderItem={({ item, index }) => (
              <CollapsibleExerciseCard
                exercise={item}
                index={index}
                isExpanded={expandedExercises.has(index)}
                onToggleExpanded={() => handleToggleExercise(index)}
                onSetComplete={handleSetComplete}
                onSetUpdate={handleSetUpdate}
                onAddSet={() => handleAddSet(item.id)}
                onShowRestPreset={
                  index === activeExerciseIndex
                    ? () => setShowRestPresetSheet(true)
                    : undefined
                }
              />
            )}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: expandedExercises.has(index) ? 300 : 80,
              offset: data
                ? Array.from(data)
                    .slice(0, index)
                    .reduce(
                      (sum, _, i) =>
                        sum + (expandedExercises.has(i) ? 300 : 80),
                      0
                    )
                : 0,
              index,
            })}
          />

          {/* Cancel Workout Button */}
          <Button
            size="$3"
            margin="$4"
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
