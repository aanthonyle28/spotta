import React, { createContext, useContext, type ReactNode } from 'react';
import { useWorkoutState as useWorkoutStateHook } from '../hooks/useWorkoutState';
import type { WorkoutState } from '../types';
import type { ExerciseId, SetEntryId } from '@spotta/shared';
import type { SetData, Template } from '../types';

interface WorkoutStateContextType {
  state: WorkoutState;
  hasActiveSession: boolean;
  actions: {
    startQuickWorkout: () => Promise<any>;
    startFromTemplate: (templateId: string) => Promise<any>;
    startSessionWithExercises: (exerciseIds: ExerciseId[], name?: string) => Promise<any>;
    updateSet: (exerciseId: ExerciseId, setId: SetEntryId, updates: Partial<SetData>) => Promise<SetData>;
    completeSet: (setData: SetData) => Promise<any>;
    addSet: (exerciseId: ExerciseId) => Promise<SetData>;
    appendExercises: (exerciseIds: ExerciseId[]) => Promise<void>;
    finishSession: () => Promise<any>;
    discardSession: () => Promise<void>;
    startRestTimer: (duration: number, exerciseId?: ExerciseId) => void;
    skipRest: () => void;
    adjustRestTimer: (seconds: number) => void;
    pauseRestTimer: () => void;
    resumeRestTimer: () => void;
    updateRestTimerEnabled: (enabled: boolean) => void;
    updateShowRestAsModal: (showAsModal: boolean) => void;
    clearError: () => void;
    loadInitialData: () => Promise<void>;
    checkForActiveSession: () => any;
    removeExercise: (exerciseId: ExerciseId) => Promise<void>;
    replaceExercise: (oldExerciseId: ExerciseId, newExerciseId: ExerciseId) => Promise<void>;
    reorderExercises: (reorderedExercises: any[]) => Promise<void>;
  };
}

const WorkoutStateContext = createContext<WorkoutStateContextType | undefined>(undefined);

interface WorkoutStateProviderProps {
  children: ReactNode;
}

export const WorkoutStateProvider: React.FC<WorkoutStateProviderProps> = ({ children }) => {
  const workoutState = useWorkoutStateHook();

  return (
    <WorkoutStateContext.Provider value={workoutState}>
      {children}
    </WorkoutStateContext.Provider>
  );
};

export const useWorkoutState = (): WorkoutStateContextType => {
  const context = useContext(WorkoutStateContext);
  if (context === undefined) {
    throw new Error('useWorkoutState must be used within a WorkoutStateProvider');
  }
  return context;
};