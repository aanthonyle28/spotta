import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Separator,
  PortalProvider,
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Clock, Trophy, Dumbbell } from '@tamagui/lucide-icons';
import {
  useWorkoutState,
  useRestTimer,
} from '../../src/features/workout/hooks';
import {
  CollapsibleExerciseCard,
  RestBar,
  RestPresetSheet,
} from '../../src/features/workout/components';
import type { SetData } from '../../src/features/workout/types';
import type { SetEntryId } from '@spotta/shared';

export default function LoggingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { state, actions } = useWorkoutState();
  const activeExerciseIndex = 0;
  const [showRestPresetSheet, setShowRestPresetSheet] = useState(false);
  const [selectedExerciseForRest, setSelectedExerciseForRest] = useState<
    string | null
  >(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set([0])
  );
  const addSetTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useRestTimer({
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

  // Calculate session stats with real-time updates
  const sessionStats = useMemo(() => {
    if (!state.activeSession)
      return {
        duration: 0,
        volume: 0,
        exerciseCount: 0,
        formattedDate: 'Today',
        sets: 0,
      };

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

    // Format current date as "Aug, 21 2025"
    const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    };

    // Format timer
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const durationInSeconds = Math.floor(
      (Date.now() - state.activeSession.startedAt.getTime()) / 1000
    );

    return {
      duration: formatTime(durationInSeconds),
      volume: Math.round(totalVolume),
      exerciseCount: state.activeSession.exercises.length,
      formattedDate: formatDate(new Date()),
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
          console.warn(
            `[Logging] No matching session found. Expected: ${sessionId}, Current: ${state.activeSession?.id || 'null'}, Loading: ${state.isLoading}`
          );
          router.dismiss();
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
              router.dismiss();
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
              router.dismiss();
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
    (scope: 'this' | 'all' | 'remember', _seconds: number) => {
      if (!selectedExerciseForRest) return;

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
      setSelectedExerciseForRest(null);
    },
    [selectedExerciseForRest]
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
      <PortalProvider>
        <YStack flex={1}>
          {/* Header */}
          <YStack padding="$4" backgroundColor="$background" space="$3">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1} space="$2" marginRight="$3">
                <Text fontSize="$5" fontWeight="600" numberOfLines={1}>
                  {state.activeSession.name}
                </Text>
                <Text fontSize="$4" color="$gray11" fontWeight="500">
                  {sessionStats.formattedDate}
                </Text>
              </YStack>

              <Button
                size="$3"
                backgroundColor="$green9"
                onPress={handleFinishWorkout}
                disabled={isFinishing}
                minWidth={100}
              >
                {isFinishing ? 'Finishing...' : 'Finish'}
              </Button>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack space="$3" alignItems="center">
                <XStack space="$1" alignItems="center">
                  <Clock size={12} color="$gray10" />
                  <Text fontSize="$2" color="$gray10">
                    {sessionStats.duration}
                  </Text>
                </XStack>
                <XStack space="$1" alignItems="center">
                  <Trophy size={12} color="$gray10" />
                  <Text fontSize="$2" color="$gray10">
                    {sessionStats.volume} lbs
                  </Text>
                </XStack>
                <XStack space="$1" alignItems="center">
                  <Dumbbell size={12} color="$gray10" />
                  <Text fontSize="$2" color="$gray10">
                    {sessionStats.exerciseCount} exercises
                  </Text>
                </XStack>
              </XStack>

              <Button
                size="$2"
                backgroundColor="$gray3"
                borderRadius="$2"
                onPress={() => setShowRestPresetSheet(true)}
                accessibilityLabel="Template rest timer settings"
                paddingHorizontal="$2"
                paddingVertical="$1"
                pressStyle={{
                  backgroundColor: '$gray4',
                }}
              >
                <Text fontSize="$2" color="$gray11" fontWeight="500">
                  Rest: 90s
                </Text>
              </Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Exercise List with Buttons - All Scrollable */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack>
              {state.activeSession.exercises.map((item, index) => (
                <CollapsibleExerciseCard
                  key={`${item.id}-${index}`}
                  exercise={item}
                  index={index}
                  isExpanded={expandedExercises.has(index)}
                  onToggleExpanded={() => handleToggleExercise(index)}
                  onSetComplete={handleSetComplete}
                  onSetUpdate={handleSetUpdate}
                  onAddSet={() => handleAddSet(item.id)}
                  onShowRestPreset={() => {
                    setSelectedExerciseForRest(item.id);
                    setShowRestPresetSheet(true);
                  }}
                />
              ))}

              {/* Add Exercise Button - In Scrollable Content */}
              <Button
                size="$3"
                margin="$4"
                onPress={() => router.push('/add-exercises?mode=append' as any)}
                icon={<Plus size={16} />}
                variant="outlined"
                borderColor="$gray6"
                backgroundColor="transparent"
              >
                Add Exercise
              </Button>

              {/* Cancel Workout Button - In Scrollable Content */}
              <Button
                size="$3"
                marginHorizontal="$4"
                marginBottom="$4"
                backgroundColor="$red9"
                onPress={handleDiscardWorkout}
              >
                Cancel workout
              </Button>
            </YStack>
          </ScrollView>

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
            onClose={() => {
              setShowRestPresetSheet(false);
              setSelectedExerciseForRest(null);
            }}
            currentRestTime={
              selectedExerciseForRest
                ? state.activeSession?.exercises.find(
                    (ex) => ex.id === selectedExerciseForRest
                  )?.restPreset || 90
                : 90
            }
            exerciseName={
              selectedExerciseForRest
                ? state.activeSession?.exercises.find(
                    (ex) => ex.id === selectedExerciseForRest
                  )?.exercise.name
                : undefined
            }
            onApplyToThis={(seconds) => handleRestPresetApply('this', seconds)}
            onApplyToAll={(seconds) => handleRestPresetApply('all', seconds)}
            onRememberForExercise={(seconds) =>
              handleRestPresetApply('remember', seconds)
            }
          />
        </YStack>
      </PortalProvider>
    </SafeAreaView>
  );
}
