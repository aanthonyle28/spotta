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
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import { useRestTimer } from '../../src/features/workout/hooks';
import {
  CollapsibleExerciseCard,
  RestBar,
  RestPresetSheet,
  ExerciseReorderModal,
  FinishWorkoutModal,
} from '../../src/features/workout/components';
import type {
  SetData,
  FinishWorkoutData,
} from '../../src/features/workout/types';
import type { SetEntryId, ExerciseId } from '@spotta/shared';
import { finishWorkoutService } from '../../src/features/workout/services/finishWorkoutService';
import { workoutService } from '../../src/features/workout/services/workoutService';

export default function LoggingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { state, actions } = useWorkoutState();
  const [showRestPresetSheet, setShowRestPresetSheet] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedExerciseForRest, setSelectedExerciseForRest] =
    useState<ExerciseId | null>(null);

  // Get selected exercise data - memoized to prevent unnecessary recalculations
  const selectedExerciseData = useMemo(() => {
    if (selectedExerciseForRest && state.activeSession) {
      return state.activeSession.exercises.find(
        (ex) => ex.id === selectedExerciseForRest
      );
    }
    return null;
  }, [selectedExerciseForRest, state.activeSession?.exercises]);

  // Memoize rest time calculation to avoid stale state issues
  const currentRestTime = useMemo(() => {
    if (selectedExerciseForRest && selectedExerciseData) {
      // Exercise-specific rest time
      return selectedExerciseData.restPreset || 120;
    }
    // Template-level rest time (when selectedExerciseForRest is null)
    return state.activeSession?.templateRestTime || 120;
  }, [
    selectedExerciseForRest,
    selectedExerciseData?.restPreset,
    state.activeSession?.templateRestTime,
  ]);

  // Memoize exercise name calculation
  const selectedExerciseName = useMemo(() => {
    return selectedExerciseData?.exercise.name;
  }, [selectedExerciseData?.exercise.name]);

  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set([0])
  );

  // Display template-level rest time consistently in header
  const headerRestTime = useMemo(() => {
    return state.activeSession?.templateRestTime || 120;
  }, [state.activeSession?.templateRestTime]);
  const [openMenuExerciseId, setOpenMenuExerciseId] =
    useState<ExerciseId | null>(null);
  const [closeAllMenus, setCloseAllMenus] = useState(false);
  const [showExerciseReorderModal, setShowExerciseReorderModal] =
    useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const addSetTimeouts = useRef<Map<ExerciseId, NodeJS.Timeout>>(new Map());

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
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  }, [state.activeSession, currentTime]);

  // Update timer every second for real-time duration
  useEffect(() => {
    if (!state.activeSession) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
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

  // Removed activeExercise - now using individual exercise IDs from components

  const handleSetComplete = useCallback(
    async (setData: SetData) => {
      try {
        await actions.completeSet(setData);
        // Rest timer is now started automatically by useWorkoutState.completeSet

        // Auto-expand/collapse logic: collapse current exercise and expand next if last set completed
        if (!state.activeSession) return;

        // Find the exercise that contains this set
        const exerciseIndex = state.activeSession.exercises.findIndex((ex) =>
          ex.sets.some((set) => set.id === setData.id)
        );

        if (exerciseIndex !== -1) {
          const exercise = state.activeSession.exercises[exerciseIndex];

          // Check if this was the last uncompleted set of the exercise
          // (we need to check the updated state, so we look at all sets except the one we just completed)
          const otherSets = exercise.sets.filter(
            (set) => set.id !== setData.id
          );
          const isLastSet = otherSets.every((set) => set.completed);

          if (isLastSet) {
            setExpandedExercises((prev) => {
              const newSet = new Set(prev);
              // Collapse current exercise
              newSet.delete(exerciseIndex);

              // Expand next exercise if it exists
              const nextIndex = exerciseIndex + 1;
              if (nextIndex < state.activeSession!.exercises.length) {
                newSet.add(nextIndex);
              }

              return newSet;
            });
          }
        }
      } catch (error) {
        console.error('Failed to complete set:', error);
      }
    },
    [actions, state.activeSession, setExpandedExercises]
  );

  const handleSetUpdate = useCallback(
    async (
      exerciseId: ExerciseId,
      setId: SetEntryId,
      updates: Partial<SetData>
    ) => {
      try {
        await actions.updateSet(exerciseId, setId, updates);
      } catch (error) {
        console.error('Failed to update set:', error);
      }
    },
    [actions]
  );

  const handleAddSet = useCallback(
    async (exerciseId: ExerciseId) => {
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
    setShowFinishModal(true);
  }, [state.activeSession]);

  const handleFinishModalComplete = useCallback(
    async (finishData: FinishWorkoutData) => {
      if (!state.activeSession) return;

      try {
        setIsFinishing(true);

        // Process finish workflow (image upload, sharing, etc.)
        await finishWorkoutService.processFinishWorkout(
          state.activeSession.id,
          finishData
        );

        // Update template if requested
        if (finishData.updateTemplate && state.activeSession.templateId) {
          await workoutService.updateTemplateFromSession(
            state.activeSession.templateId,
            state.activeSession
          );
        }

        // Create template if requested for empty workouts
        if (finishData.saveAsTemplate && finishData.templateName) {
          const templateExercises = state.activeSession.exercises.map(
            (sessionEx) => ({
              exerciseId: sessionEx.id,
              sets: sessionEx.sets.length,
              reps: sessionEx.sets.find((set) => set.reps)?.reps,
              weight: sessionEx.sets.find((set) => set.weight)?.weight,
              restTime: sessionEx.restPreset,
              name: sessionEx.exercise.name,
              category: sessionEx.exercise.category,
              primaryMuscles: sessionEx.exercise.primaryMuscles,
            })
          );

          const templateData = {
            title: finishData.templateName,
            description: finishData.description,
            exercises: templateExercises,
            estimatedDuration: Math.ceil(templateExercises.length * 15), // Rough estimate
            difficulty: 'intermediate' as const,
            isPublic: false,
          };

          await actions.createTemplate(templateData);
        }

        // Finish the session
        await actions.finishSession();

        // Close modal and navigate
        setShowFinishModal(false);
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.replace('/(tabs)/workout');
      } catch (error) {
        console.error('Failed to complete workout:', error);
        Alert.alert('Error', 'Failed to complete workout. Please try again.');
      } finally {
        setIsFinishing(false);
      }
    },
    [state.activeSession, actions]
  );

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
              // Allow state to propagate before navigation
              await new Promise((resolve) => setTimeout(resolve, 100));
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

  const handleMenuStateChange = useCallback(
    (isOpen: boolean, exerciseId: ExerciseId) => {
      if (isOpen) {
        // Close other menus first, then open this one
        if (openMenuExerciseId && openMenuExerciseId !== exerciseId) {
          setCloseAllMenus(true);
          setTimeout(() => {
            setCloseAllMenus(false);
            setOpenMenuExerciseId(exerciseId);
          }, 50);
        } else {
          setOpenMenuExerciseId(exerciseId);
        }
      } else {
        setOpenMenuExerciseId(null);
      }
    },
    [openMenuExerciseId]
  );

  const handleScrollViewScroll = useCallback(() => {
    // Close menus when scrolling
    if (openMenuExerciseId) {
      setCloseAllMenus(true);
      setOpenMenuExerciseId(null);
      setTimeout(() => setCloseAllMenus(false), 50);
    }
  }, [openMenuExerciseId]);

  const handleRemoveExercise = useCallback(
    (exerciseId: ExerciseId) => {
      if (!state.activeSession) return;

      const exercise = state.activeSession.exercises.find(
        (ex) => ex.id === exerciseId
      );
      if (!exercise) return;

      Alert.alert(
        'Remove Exercise',
        `Remove "${exercise.exercise.name}" and all its sets?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await actions.removeExercise(exerciseId);
              } catch (error) {
                console.error('Failed to remove exercise:', error);
              }
            },
          },
        ]
      );
    },
    [state.activeSession, actions]
  );

  const handleReplaceExercise = useCallback((exerciseId: ExerciseId) => {
    // Navigate to exercise selection with replace mode
    router.push(`/add-exercises?mode=replace&exerciseId=${exerciseId}` as any);
  }, []);

  const handleReorderExercises = useCallback(() => {
    setShowExerciseReorderModal(true);
  }, []);

  const handleExerciseReorderSave = useCallback(
    async (reorderedExercises: any[]) => {
      try {
        await actions.reorderExercises(reorderedExercises);
        setShowExerciseReorderModal(false);
      } catch (error) {
        console.error('Failed to reorder exercises:', error);
      }
    },
    [actions]
  );

  const handleRestPresetApply = useCallback(
    (scope: 'this' | 'all' | 'remember', seconds: number) => {
      switch (scope) {
        case 'this':
          // Apply custom time to this specific exercise only
          if (selectedExerciseForRest) {
            actions.updateExerciseRestPreset(selectedExerciseForRest, seconds);
          }
          break;
        case 'all':
          // Apply to template-level timer and ALL exercises in session (override all customizations)
          actions.updateTemplateRestTime(seconds);
          actions.updateAllExerciseRestPresetsFromTemplate(seconds);
          break;
        case 'remember':
          // Remember user input for this exercise type - update all exercises with same name
          if (selectedExerciseForRest) {
            const exercise = state.activeSession?.exercises.find(
              (ex) => ex.id === selectedExerciseForRest
            );
            if (exercise) {
              actions.updateRestPresetForExerciseType(
                exercise.exercise.name,
                seconds
              );
            }
          }
          break;
      }

      setShowRestPresetSheet(false);
      setSelectedExerciseForRest(null);
    },
    [selectedExerciseForRest, actions, state.activeSession]
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
                  <Text
                    fontSize="$2"
                    color="$gray10"
                    minWidth={35}
                    textAlign="center"
                  >
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
                onPress={() => {
                  setSelectedExerciseForRest(null); // null = template level
                  setShowRestPresetSheet(true);
                }}
                accessibilityLabel="Template rest timer settings"
                paddingHorizontal="$2"
                paddingVertical="$1"
                pressStyle={{
                  backgroundColor: '$gray4',
                }}
              >
                <Text fontSize="$2" color="$gray11" fontWeight="500">
                  Rest: {headerRestTime}s
                </Text>
              </Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Exercise List with Buttons - All Scrollable */}
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            onScroll={handleScrollViewScroll}
            scrollEventThrottle={16}
          >
            <YStack>
              {state.activeSession.exercises.map((item, index) => (
                <CollapsibleExerciseCard
                  key={`${item.id}-${index}`}
                  exercise={item}
                  index={index}
                  isExpanded={expandedExercises.has(index)}
                  onToggleExpanded={() => handleToggleExercise(index)}
                  onSetComplete={handleSetComplete}
                  onSetUpdate={(setId, updates) =>
                    handleSetUpdate(item.id, setId, updates)
                  }
                  onAddSet={() => handleAddSet(item.id)}
                  onShowRestPreset={() => {
                    setSelectedExerciseForRest(item.id);
                    setShowRestPresetSheet(true);
                  }}
                  closeAllMenus={closeAllMenus}
                  onMenuStateChange={handleMenuStateChange}
                  onRemoveExercise={handleRemoveExercise}
                  onReplaceExercise={handleReplaceExercise}
                  onReorderExercises={handleReorderExercises}
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
              exerciseName={
                state.restTimer.exerciseId
                  ? state.activeSession?.exercises.find(
                      (ex) => ex.id === state.restTimer.exerciseId
                    )?.exercise.name || 'Exercise'
                  : 'Exercise'
              }
            />
          )}

          {/* Rest Preset Sheet */}
          <RestPresetSheet
            isOpen={showRestPresetSheet}
            onClose={() => {
              setShowRestPresetSheet(false);
              setSelectedExerciseForRest(null);
            }}
            currentRestTime={currentRestTime}
            exerciseName={selectedExerciseName}
            isTemplate={selectedExerciseForRest === null}
            onApplyToThis={(seconds) => handleRestPresetApply('this', seconds)}
            onApplyToAll={(seconds) => handleRestPresetApply('all', seconds)}
            onRememberForExercise={(seconds) =>
              handleRestPresetApply('remember', seconds)
            }
          />

          {/* Exercise Reorder Modal */}
          <ExerciseReorderModal
            isOpen={showExerciseReorderModal}
            exercises={state.activeSession?.exercises || []}
            onClose={() => setShowExerciseReorderModal(false)}
            onSave={handleExerciseReorderSave}
          />

          {/* Finish Workout Modal */}
          {state.activeSession && (
            <FinishWorkoutModal
              isOpen={showFinishModal}
              session={state.activeSession}
              onClose={() => setShowFinishModal(false)}
              onComplete={handleFinishModalComplete}
            />
          )}
        </YStack>
      </PortalProvider>
    </SafeAreaView>
  );
}
