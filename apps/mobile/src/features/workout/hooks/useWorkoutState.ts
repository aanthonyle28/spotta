import { useState, useCallback, useEffect } from 'react';
import type { ExerciseId, SetEntryId } from '@spotta/shared';
import type { WorkoutState, SetData, RestTimerState } from '../types';
import { workoutService } from '../services/workoutService';

const initialRestTimer: RestTimerState = {
  isActive: false,
  remainingTime: 0,
  totalTime: 0,
  exerciseId: null,
  startedAt: null,
};

export const useWorkoutState = () => {
  const [state, setState] = useState<WorkoutState>({
    activeSession: null,
    restTimer: initialRestTimer,
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
          isActive: true,
          remainingTime: duration,
          totalTime: duration,
          exerciseId: exerciseId || null,
          startedAt: new Date(),
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

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    actions: {
      startQuickWorkout,
      startFromTemplate,
      startSessionWithExercises,
      updateSet,
      completeSet,
      addSet,
      finishSession,
      discardSession,
      startRestTimer,
      skipRest,
      adjustRestTimer,
      pauseRestTimer,
      resumeRestTimer,
      clearError,
      loadInitialData,
    },
  };
};
