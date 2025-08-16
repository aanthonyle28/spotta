import type {
  ExerciseId,
  WorkoutId,
  SetEntryId,
  TemplateId,
  UserId,
} from '@spotta/shared';
import type {
  Exercise,
  Template,
  ActiveSession,
  SessionExercise,
  SetData,
} from '../types';

// Mock exercises database
export const mockExercises: Exercise[] = [
  {
    id: 'bench-press' as ExerciseId,
    name: 'Bench Press',
    category: 'strength',
    equipment: ['barbell', 'bench'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    difficulty: 'intermediate',
    instructions:
      'Lie on bench, grip bar with hands slightly wider than shoulder-width...',
    isCustom: false,
  },
  {
    id: 'squat' as ExerciseId,
    name: 'Back Squat',
    category: 'strength',
    equipment: ['barbell', 'squat_rack'],
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    difficulty: 'intermediate',
    instructions: 'Stand with bar on shoulders, feet shoulder-width apart...',
    isCustom: false,
  },
  {
    id: 'deadlift' as ExerciseId,
    name: 'Deadlift',
    category: 'strength',
    equipment: ['barbell'],
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'traps', 'lats'],
    difficulty: 'advanced',
    instructions:
      'Stand with feet hip-width apart, grip bar with mixed grip...',
    isCustom: false,
  },
  {
    id: 'overhead-press' as ExerciseId,
    name: 'Overhead Press',
    category: 'strength',
    equipment: ['barbell'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    difficulty: 'intermediate',
    instructions: 'Stand with feet hip-width apart, press bar overhead...',
    isCustom: false,
  },
  {
    id: 'treadmill-run' as ExerciseId,
    name: 'Treadmill Run',
    category: 'cardio',
    equipment: ['treadmill'],
    primaryMuscles: ['legs'],
    secondaryMuscles: ['core'],
    difficulty: 'beginner',
    instructions: 'Set desired speed and incline, maintain steady pace...',
    isCustom: false,
  },
];

// Mock templates
export const mockTemplates: Template[] = [
  {
    id: 'push-day' as TemplateId,
    title: 'Push Day',
    description: 'Chest, shoulders, and triceps workout',
    exercises: [
      {
        exerciseId: 'bench-press' as ExerciseId,
        sets: 4,
        reps: 8,
        weight: 135,
        restTime: 120,
      },
      {
        exerciseId: 'overhead-press' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 95,
        restTime: 90,
      },
    ],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    isPublic: true,
    userId: 'user-1' as UserId,
  },
  {
    id: 'pull-day' as TemplateId,
    title: 'Pull Day',
    description: 'Back and biceps focused workout',
    exercises: [
      {
        exerciseId: 'deadlift' as ExerciseId,
        sets: 4,
        reps: 5,
        weight: 225,
        restTime: 180,
      },
    ],
    estimatedDuration: 45,
    difficulty: 'advanced',
    isPublic: true,
    userId: 'user-1' as UserId,
  },
];

// Helper functions to create mock data
export const createMockSet = (
  setNumber: number,
  completed: boolean = false,
  weight?: number,
  reps?: number
): SetData => ({
  id: `set-${setNumber}-${Date.now()}` as SetEntryId,
  setNumber,
  weight,
  reps,
  completed,
  completedAt: completed ? new Date() : undefined,
});

export const createMockSessionExercise = (
  exercise: Exercise,
  orderIndex: number,
  numSets: number = 3
): SessionExercise => ({
  id: exercise.id,
  exercise,
  sets: Array.from({ length: numSets }, (_, i) => createMockSet(i + 1, false)),
  orderIndex,
  restPreset: 120,
});

export const createMockActiveSession = (
  exercises: Exercise[] = mockExercises.slice(0, 2)
): ActiveSession => ({
  id: `session-${Date.now()}` as WorkoutId,
  name: 'Quick Workout',
  startedAt: new Date(),
  exercises: exercises.map((exercise, index) =>
    createMockSessionExercise(exercise, index)
  ),
  currentExerciseIndex: 0,
  totalVolume: 0,
  duration: 0,
});

// Mock recent workouts
export const mockRecentWorkouts = [
  {
    id: 'workout-1' as WorkoutId,
    name: 'Push Day - Yesterday',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    currentExercise: undefined,
    totalSets: 12,
    completedSets: 12,
    isActive: false,
  },
  {
    id: 'workout-2' as WorkoutId,
    name: 'Pull Day - 3 days ago',
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    currentExercise: undefined,
    totalSets: 8,
    completedSets: 8,
    isActive: false,
  },
];

// Search and filter functions
export const searchExercises = (query: string): Exercise[] => {
  if (!query.trim()) return mockExercises;

  const lowercaseQuery = query.toLowerCase();
  return mockExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(lowercaseQuery) ||
      exercise.category.toLowerCase().includes(lowercaseQuery) ||
      exercise.primaryMuscles.some((muscle) =>
        muscle.toLowerCase().includes(lowercaseQuery)
      )
  );
};

export const filterExercisesByCategory = (category: string): Exercise[] => {
  return mockExercises.filter((exercise) => exercise.category === category);
};

export const getExercisesByIds = (ids: ExerciseId[]): Exercise[] => {
  return mockExercises.filter((exercise) => ids.includes(exercise.id));
};
