import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ExerciseId, SetEntryId, TemplateId } from '@spotta/shared';
import type {
  WorkoutState,
  SetData,
  RestTimerState,
  WorkoutSettings,
  ActiveSession,
  SessionExercise,
  Template,
} from '../types';
import { workoutService } from '../services/workoutService';
import { createMockSet } from '../services/mockData';
import { logger } from '../../../utils/logger';

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
  defaultRestTime: 120,
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

  // Add transition state to prevent race conditions
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Debouncing for rest preset updates to prevent race conditions
  const restPresetTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [recentWorkouts, templates] = await Promise.all([
        workoutService.getRecentWorkouts(),
        workoutService.getTemplates(),
      ]);

      // Initialize with mock session for development (only if no current session and user hasn't completed one)
      let initialActiveSession: ActiveSession | null = null;
      if (process.env.NODE_ENV === 'development') {
        // Check if user has previously completed a development session (now async)
        const { developmentState } = await import('../utils/developmentState');
        const hasCompletedSession =
          await developmentState.hasUserCompletedSession();

        // Only create mock session if we don't already have one AND user hasn't completed one before
        if (!state.activeSession && !hasCompletedSession) {
          const mockExercises = await workoutService.getAllExercises();
          if (mockExercises.length >= 3) {
            // Import the createMockActiveSession function
            const { createMockActiveSession } = await import(
              '../services/mockData'
            );
            const session = createMockActiveSession(mockExercises.slice(0, 3));
            session.name = 'Push Day';
            session.startedAt = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

            // Store in service sessionStorage so service methods can find it
            await workoutService.storeSession(session);

            logger.info(
              `[Hook Init] Created mock session with ID: ${session.id}`
            );
            initialActiveSession = session;
          }
        } else if (hasCompletedSession) {
          logger.info(
            `[Hook Init] User has completed a session before - not creating mock session`
          );
        } else {
          // Use existing session
          initialActiveSession = state.activeSession;
          logger.info(
            `[Hook Init] Preserving existing session with ID: ${state.activeSession?.id}`
          );
        }
      }

      setState((prev) => ({
        ...prev,
        activeSession: initialActiveSession,
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
      if (!state.activeSession) {
        throw new Error('No active session');
      }

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
      if (!state.activeSession) {
        throw new Error('No active session');
      }

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
    if (!state.activeSession || isTransitioning) return;

    try {
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, isLoading: true }));

      const completedWorkout = await workoutService.finishSession(
        state.activeSession.id
      );

      // Reload templates to get updated lastCompleted dates
      const updatedTemplates = await workoutService.getTemplates();

      logger.info(
        `[FinishSession Hook] Templates reloaded:`,
        updatedTemplates.map((t) => ({
          title: t.title,
          lastCompleted: t.lastCompleted,
        }))
      );

      setState((prev) => ({
        ...prev,
        activeSession: null,
        restTimer: initialRestTimer,
        recentWorkouts: [completedWorkout, ...prev.recentWorkouts],
        templates: updatedTemplates,
        isLoading: false,
      }));

      logger.info(
        `[FinishSession Hook] State updated - activeSession cleared, templates updated`
      );

      // Mark that user has completed a session in development mode (now async)
      if (process.env.NODE_ENV === 'development') {
        const { developmentState } = await import('../utils/developmentState');
        await developmentState.markSessionCompleted();
      }

      return completedWorkout;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to finish workout',
        isLoading: false,
      }));
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, [state.activeSession, isTransitioning]);

  const discardSession = useCallback(async () => {
    if (!state.activeSession || isTransitioning) return;

    try {
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, isLoading: true }));

      await workoutService.discardSession(state.activeSession.id);

      logger.info(`[DiscardSession Hook] Clearing activeSession from state`);

      setState((prev) => ({
        ...prev,
        activeSession: null,
        restTimer: initialRestTimer,
        isLoading: false,
      }));

      logger.info(
        `[DiscardSession Hook] State updated - activeSession cleared`
      );

      // Mark that user has completed a session in development mode (discarding also counts as completion)
      if (process.env.NODE_ENV === 'development') {
        const { developmentState } = await import('../utils/developmentState');
        await developmentState.markSessionCompleted();
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to discard workout',
        isLoading: false,
      }));
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, [state.activeSession, isTransitioning]);

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
        startedAt: prev.restTimer.isActive
          ? new Date()
          : prev.restTimer.startedAt,
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

        // Create new session exercises first
        const currentMaxOrderIndex = Math.max(
          ...state.activeSession.exercises.map((ex) => ex.orderIndex),
          -1
        );

        const newSessionExercises = exercisesToAdd.map((exercise, index) => ({
          id: exercise.id,
          exercise,
          sets: [createMockSet(1, false)],
          orderIndex: currentMaxOrderIndex + 1 + index,
          restPreset: state.activeSession?.templateRestTime || 120,
        }));

        // Create updated session
        const updatedSession = {
          ...state.activeSession,
          exercises: [...state.activeSession.exercises, ...newSessionExercises],
        };

        // Optimistic update - immediately update local state
        setState((prev) => ({
          ...prev,
          activeSession: updatedSession,
        }));

        // Background sync with service - store the exact same session
        // to prevent set ID mismatches
        await workoutService.storeSession(updatedSession);
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
    () => !!state.activeSession && !isTransitioning,
    [state.activeSession, isTransitioning]
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

  const removeExercise = useCallback(
    async (exerciseId: ExerciseId) => {
      if (!state.activeSession) return;

      try {
        await workoutService.removeExercise(state.activeSession.id, exerciseId);

        // Update local state
        setState((prev) => {
          if (!prev.activeSession) return prev;

          const updatedExercises = prev.activeSession.exercises.filter(
            (exercise) => exercise.id !== exerciseId
          );

          // Recalculate total volume
          const totalVolume = updatedExercises.reduce((total, ex) => {
            return (
              total +
              ex.sets.reduce((exTotal, set) => {
                return set.completed && set.weight && set.reps
                  ? exTotal + set.weight * set.reps
                  : exTotal;
              }, 0)
            );
          }, 0);

          return {
            ...prev,
            activeSession: {
              ...prev.activeSession,
              exercises: updatedExercises,
              totalVolume,
            },
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to remove exercise',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  const replaceExercise = useCallback(
    async (oldExerciseId: ExerciseId, newExerciseId: ExerciseId) => {
      if (!state.activeSession) return;

      try {
        await workoutService.replaceExercise(
          state.activeSession.id,
          oldExerciseId,
          newExerciseId
        );

        // Reload the session to get updated data
        // In a real app, you'd probably optimistically update local state instead
        const updatedSession = await workoutService.getSessionById(
          state.activeSession.id
        );
        if (updatedSession) {
          setState((prev) => ({
            ...prev,
            activeSession: updatedSession,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to replace exercise',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  // Template actions
  const createTemplate = useCallback(
    async (templateData: Omit<Template, 'id' | 'userId'>) => {
      try {
        const newTemplate = await workoutService.createTemplate(templateData);
        await loadInitialData(); // Refresh templates
        return newTemplate;
      } catch (error) {
        logger.error('Failed to create template:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create template',
        }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const updateTemplate = useCallback(
    async (templateId: TemplateId, updates: Partial<Template>) => {
      try {
        const updatedTemplate = await workoutService.updateTemplate(
          templateId,
          updates
        );
        await loadInitialData(); // Refresh templates
        return updatedTemplate;
      } catch (error) {
        logger.error('Failed to update template:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update template',
        }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const deleteTemplate = useCallback(
    async (templateId: TemplateId) => {
      try {
        await workoutService.deleteTemplate(templateId);
        await loadInitialData(); // Refresh templates
      } catch (error) {
        logger.error('Failed to delete template:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to delete template',
        }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const duplicateTemplate = useCallback(
    async (templateId: TemplateId) => {
      try {
        const duplicatedTemplate =
          await workoutService.duplicateTemplate(templateId);
        await loadInitialData(); // Refresh templates
        return duplicatedTemplate;
      } catch (error) {
        logger.error('Failed to duplicate template:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to duplicate template',
        }));
        throw error;
      }
    },
    [loadInitialData]
  );

  const reorderExercises = useCallback(
    async (reorderedExercises: SessionExercise[]) => {
      if (!state.activeSession) return;

      try {
        await workoutService.reorderExercises(
          state.activeSession.id,
          reorderedExercises
        );

        // Update local state
        setState((prev) => {
          if (!prev.activeSession) return prev;

          return {
            ...prev,
            activeSession: {
              ...prev.activeSession,
              exercises: reorderedExercises,
            },
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to reorder exercises',
        }));
        throw error;
      }
    },
    [state.activeSession]
  );

  const updateExerciseRestPreset = useCallback(
    (exerciseId: ExerciseId, seconds: number) => {
      const key = `${exerciseId}-rest`;

      // Clear existing timeout for this exercise
      if (restPresetTimeouts.current.has(key)) {
        clearTimeout(restPresetTimeouts.current.get(key)!);
      }

      // Debounce the update to prevent race conditions
      const timeout = setTimeout(() => {
        setState((prev) => {
          if (!prev.activeSession) return prev;

          const updatedSession = {
            ...prev.activeSession,
            exercises: prev.activeSession.exercises.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, restPreset: seconds }
                : exercise
            ),
            // Mark this exercise as having a custom rest time
            customizedExercises: new Set([
              ...prev.activeSession.customizedExercises,
              exerciseId,
            ]),
          };

          // Sync with service storage to prevent stale data
          workoutService.storeSession(updatedSession);

          return {
            ...prev,
            activeSession: updatedSession,
          };
        });

        restPresetTimeouts.current.delete(key);
      }, 300);

      restPresetTimeouts.current.set(key, timeout);
    },
    []
  );

  const resetExerciseToTemplateTime = useCallback((exerciseId: ExerciseId) => {
    setState((prev) => {
      if (!prev.activeSession) return prev;

      const templateRestTime = prev.activeSession.templateRestTime || 120;

      const updatedSession = {
        ...prev.activeSession,
        exercises: prev.activeSession.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, restPreset: templateRestTime }
            : exercise
        ),
      };

      // Sync with service storage to prevent stale data
      workoutService.storeSession(updatedSession);

      return {
        ...prev,
        activeSession: updatedSession,
      };
    });
  }, []);

  const updateAllExerciseRestPresets = useCallback((seconds: number) => {
    setState((prev) => {
      if (!prev.activeSession) return prev;

      const updatedSession = {
        ...prev.activeSession,
        exercises: prev.activeSession.exercises.map((exercise) => ({
          ...exercise,
          // Only update rest preset if exercise is not customized
          restPreset: prev.activeSession!.customizedExercises.has(exercise.id)
            ? exercise.restPreset
            : seconds,
        })),
      };

      // Sync with service storage to prevent stale data
      workoutService.storeSession(updatedSession);

      return {
        ...prev,
        activeSession: updatedSession,
      };
    });
  }, []);

  const updateAllExerciseRestPresetsFromTemplate = useCallback(
    (seconds: number) => {
      setState((prev) => {
        if (!prev.activeSession) return prev;

        const updatedSession = {
          ...prev.activeSession,
          exercises: prev.activeSession.exercises.map((exercise) => ({
            ...exercise,
            // Update ALL exercises regardless of customization status
            restPreset: seconds,
          })),
          // Clear customization flags since template is now overriding everything
          customizedExercises: new Set<ExerciseId>(),
        };

        // Sync with service storage to prevent stale data
        workoutService.storeSession(updatedSession);

        return {
          ...prev,
          activeSession: updatedSession,
        };
      });
    },
    []
  );

  const updateRestPresetForExerciseType = useCallback(
    async (exerciseName: string, seconds: number) => {
      // Save to global preferences first
      try {
        await workoutService.setExerciseRestPreference(exerciseName, seconds);
      } catch (error) {
        console.error('Failed to save exercise rest preference:', error);
      }

      setState((prev) => {
        if (!prev.activeSession) return prev;

        const updatedSession = {
          ...prev.activeSession,
          exercises: prev.activeSession.exercises.map((sessionExercise) =>
            sessionExercise.exercise.name === exerciseName
              ? { ...sessionExercise, restPreset: seconds }
              : sessionExercise
          ),
          // Mark all exercises of this type as customized
          customizedExercises: new Set([
            ...prev.activeSession.customizedExercises,
            ...prev.activeSession.exercises
              .filter((ex) => ex.exercise.name === exerciseName)
              .map((ex) => ex.id),
          ]),
        };

        // Sync with service storage to prevent stale data
        workoutService.storeSession(updatedSession);

        return {
          ...prev,
          activeSession: updatedSession,
        };
      });
    },
    []
  );

  const updateTemplateRestTime = useCallback((seconds: number) => {
    setState((prev) => {
      if (!prev.activeSession) return prev;

      const updatedSession = {
        ...prev.activeSession,
        templateRestTime: seconds,
      };

      // Sync with service storage to prevent stale data
      workoutService.storeSession(updatedSession);

      return {
        ...prev,
        activeSession: updatedSession,
      };
    });
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      restPresetTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      restPresetTimeouts.current.clear();
    };
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
      removeExercise,
      replaceExercise,
      reorderExercises,
      updateExerciseRestPreset,
      resetExerciseToTemplateTime,
      updateAllExerciseRestPresets,
      updateAllExerciseRestPresetsFromTemplate,
      updateRestPresetForExerciseType,
      updateTemplateRestTime,
      // Template actions
      createTemplate,
      updateTemplate,
      deleteTemplate,
      duplicateTemplate,
    },
  };
};
