import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ExerciseId, SetEntryId } from '@spotta/shared';
import type {
  WorkoutState,
  SetData,
  RestTimerState,
  WorkoutSettings,
} from '../types';
import { workoutService } from '../services/workoutService';

const initialRestTimer: RestTimerState = {
  isActive: false,
  remainingTime: 0,
  totalTime: 0,
  exerciseId: null,
  startedAt: null,
  showAsModal: true,
};

const initialSettings: WorkoutSettings = {
  restTimerEnabled: true,
  defaultRestTime: 90,
  showRestAsModal: true,
};

export const useWorkoutState = () => {
  const [state, setState] = useState<WorkoutState>({
    activeSession: null,
    restTimer: initialRestTimer,
    settings: initialSettings,
    templates: [],
    recentWorkouts: [],
    isLoading: false,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [activeSession, recentWorkouts, templates] = await Promise.all([
        workoutService.getActiveSession(),
        workoutService.getRecentWorkouts(),
        workoutService.getTemplates(),
      ]);

      setState((prev) => ({
        ...prev,
        activeSession,
        recentWorkouts,
        templates,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, []);

  const startQuickWorkout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Start with first two exercises for quick workout
      const exercises = await workoutService.getAllExercises();
      const session = await workoutService.startSession(
        [exercises[0].id, exercises[1].id],
        'Quick Workout'
      );

      setState((prev) => ({
        ...prev,
        activeSession: session,
        isLoading: false,
      }));

      return session;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to start workout',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const startFromTemplate = useCallback(async (templateId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const session = await workoutService.startFromTemplate(templateId);

      setState((prev) => ({
        ...prev,
        activeSession: session,
        isLoading: false,
      }));

      return session;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start from template',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const startSessionWithExercises = useCallback(
    async (exerciseIds: ExerciseId[], name?: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const session = await workoutService.startSession(exerciseIds, name);

        setState((prev) => ({
          ...prev,
          activeSession: session,
          isLoading: false,
        }));

        return session;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to start workout',
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  const updateSet = useCallback(
    async (
      exerciseId: ExerciseId,
      setId: SetEntryId,
      updates: Partial<SetData>
    ) => {
      if (!state.activeSession) return;

      try {
        const updatedSet = await workoutService.updateSet(
          state.activeSession.id,
          exerciseId,
          setId,
          updates
        );

        // Update local state optimistically
        setState((prev) => {
          if (!prev.activeSession) return prev;

          const updatedExercises = prev.activeSession.exercises.map(
            (exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map((set) =>
                    set.id === setId ? { ...set, ...updates } : set
                  ),
                };
              }
              return exercise;
            }
          );

          return {
            ...prev,
            activeSession: {
              ...prev.activeSession,
              exercises: updatedExercises,
            },
          };
        });

        return updatedSet;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to update set',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  const completeSet = useCallback(
    async (setData: SetData) => {
      if (!state.activeSession) return;

      try {
        const exerciseId = state.activeSession.exercises.find((ex) =>
          ex.sets.some((set) => set.id === setData.id)
        )?.id;

        if (!exerciseId) throw new Error('Exercise not found');

        const result = await workoutService.completeSet(
          state.activeSession.id,
          exerciseId,
          setData.id,
          setData
        );

        // Update local state
        await updateSet(exerciseId, setData.id, result.set);

        // Start rest timer if rest time is provided
        if (result.restTime) {
          startRestTimer(result.restTime, exerciseId);
        }

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to complete set',
        }));
        throw error;
      }
    },
    [state.activeSession, updateSet]
  );

  const addSet = useCallback(
    async (exerciseId: ExerciseId) => {
      if (!state.activeSession) return;

      try {
        const newSet = await workoutService.addSet(
          state.activeSession.id,
          exerciseId
        );

        setState((prev) => {
          if (!prev.activeSession) return prev;

          const updatedExercises = prev.activeSession.exercises.map(
            (exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: [...exercise.sets, newSet],
                };
              }
              return exercise;
            }
          );

          return {
            ...prev,
            activeSession: {
              ...prev.activeSession,
              exercises: updatedExercises,
            },
          };
        });

        return newSet;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add set',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  const finishSession = useCallback(async () => {
    if (!state.activeSession) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const completedWorkout = await workoutService.finishSession(
        state.activeSession.id
      );

      setState((prev) => ({
        ...prev,
        activeSession: null,
        restTimer: initialRestTimer,
        recentWorkouts: [completedWorkout, ...prev.recentWorkouts],
        isLoading: false,
      }));

      return completedWorkout;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to finish workout',
        isLoading: false,
      }));
      throw error;
    }
  }, [state.activeSession]);

  const discardSession = useCallback(async () => {
    if (!state.activeSession) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await workoutService.discardSession(state.activeSession.id);

      setState((prev) => ({
        ...prev,
        activeSession: null,
        restTimer: initialRestTimer,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to discard workout',
        isLoading: false,
      }));
      throw error;
    }
  }, [state.activeSession]);

  // Rest timer functions
  const startRestTimer = useCallback(
    (duration: number, exerciseId?: ExerciseId) => {
      setState((prev) => ({
        ...prev,
        restTimer: {
          isActive: prev.settings.restTimerEnabled,
          remainingTime: duration,
          totalTime: duration,
          exerciseId: exerciseId || null,
          startedAt: prev.settings.restTimerEnabled ? new Date() : null,
          showAsModal: prev.settings.showRestAsModal,
        },
      }));
    },
    []
  );

  const skipRest = useCallback(() => {
    setState((prev) => ({
      ...prev,
      restTimer: initialRestTimer,
    }));
  }, []);

  const adjustRestTimer = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      restTimer: {
        ...prev.restTimer,
        remainingTime: Math.max(0, prev.restTimer.remainingTime + seconds),
      },
    }));
  }, []);

  const pauseRestTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      restTimer: {
        ...prev.restTimer,
        startedAt: null,
      },
    }));
  }, []);

  const resumeRestTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      restTimer: {
        ...prev.restTimer,
        startedAt: new Date(),
      },
    }));
  }, []);

  const appendExercises = useCallback(
    async (exerciseIds: ExerciseId[]) => {
      if (!state.activeSession) return;

      try {
        // Get the exercises data first
        const allExercises = await workoutService.getAllExercises();
        const exercisesToAdd = allExercises.filter((ex) =>
          exerciseIds.includes(ex.id)
        );

        if (exercisesToAdd.length === 0) {
          throw new Error('No valid exercises found');
        }

        // Optimistic update - immediately update local state
        setState((prev) => {
          if (!prev.activeSession) return prev;

          const currentMaxOrderIndex = Math.max(
            ...prev.activeSession.exercises.map((ex) => ex.orderIndex),
            -1
          );

          const newSessionExercises = exercisesToAdd.map((exercise, index) => ({
            id: exercise.id,
            exercise,
            sets: [
              {
                id: `set-1-${exercise.id}-${Date.now()}` as SetEntryId,
                setNumber: 1,
                completed: false,
              },
            ],
            orderIndex: currentMaxOrderIndex + 1 + index,
            restPreset: 120,
          }));

          return {
            ...prev,
            activeSession: {
              ...prev.activeSession,
              exercises: [
                ...prev.activeSession.exercises,
                ...newSessionExercises,
              ],
            },
          };
        });

        // Background sync with service
        await workoutService.appendExercises(
          state.activeSession.id,
          exerciseIds
        );
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to append exercises',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Enhanced active session management
  const hasActiveSession = useMemo(
    () => !!state.activeSession,
    [state.activeSession]
  );

  const checkForActiveSession = useCallback(() => {
    return state.activeSession;
  }, [state.activeSession]);

  // Settings functions
  const updateRestTimerEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        restTimerEnabled: enabled,
      },
      // Stop current timer if being disabled
      restTimer: enabled ? prev.restTimer : initialRestTimer,
    }));
  }, []);

  const updateShowRestAsModal = useCallback((showAsModal: boolean) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        showRestAsModal: showAsModal,
      },
      restTimer: {
        ...prev.restTimer,
        showAsModal: showAsModal,
      },
    }));
  }, []);

  return {
    state,
    hasActiveSession,
    actions: {
      startQuickWorkout,
      startFromTemplate,
      startSessionWithExercises,
      updateSet,
      completeSet,
      addSet,
      appendExercises,
      finishSession,
      discardSession,
      startRestTimer,
      skipRest,
      adjustRestTimer,
      pauseRestTimer,
      resumeRestTimer,
      updateRestTimerEnabled,
      updateShowRestAsModal,
      clearError,
      loadInitialData,
      checkForActiveSession,
    },
  };
};
