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
  CommunityTemplate,
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
  {
    id: 'dips' as ExerciseId,
    name: 'Dips',
    category: 'strength',
    equipment: ['dip_bars'],
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    difficulty: 'intermediate',
    instructions: 'Lower body until shoulders are below elbows, push up...',
    isCustom: false,
  },
  {
    id: 'burpees' as ExerciseId,
    name: 'Burpees',
    category: 'cardio',
    equipment: [],
    primaryMuscles: ['legs', 'core'],
    secondaryMuscles: ['chest', 'shoulders'],
    difficulty: 'intermediate',
    instructions:
      'Squat down, jump back to plank, jump feet forward, jump up...',
    isCustom: false,
  },
  {
    id: 'mountain-climbers' as ExerciseId,
    name: 'Mountain Climbers',
    category: 'cardio',
    equipment: [],
    primaryMuscles: ['core', 'legs'],
    secondaryMuscles: ['shoulders'],
    difficulty: 'beginner',
    instructions:
      'Start in plank, alternate bringing knees to chest quickly...',
    isCustom: false,
  },
  {
    id: 'jump-squats' as ExerciseId,
    name: 'Jump Squats',
    category: 'cardio',
    equipment: [],
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    difficulty: 'intermediate',
    instructions: 'Squat down, explode up into a jump, land softly...',
    isCustom: false,
  },
  {
    id: 'bent-over-row' as ExerciseId,
    name: 'Bent Over Row',
    category: 'strength',
    equipment: ['barbell'],
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'rear_delts'],
    difficulty: 'intermediate',
    instructions:
      'Hinge at hips, pull bar to lower chest, squeeze shoulder blades...',
    isCustom: false,
  },
  {
    id: 'weighted-pullups' as ExerciseId,
    name: 'Weighted Pull-ups',
    category: 'strength',
    equipment: ['pull_up_bar', 'weight_belt'],
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    difficulty: 'advanced',
    instructions:
      'Hang from bar with added weight, pull up until chin over bar...',
    isCustom: false,
  },
  {
    id: 'sun-salutation' as ExerciseId,
    name: 'Sun Salutation',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    primaryMuscles: ['core'],
    secondaryMuscles: ['legs', 'shoulders'],
    difficulty: 'beginner',
    instructions:
      'Flow through mountain pose, forward fold, plank, upward dog...',
    isCustom: false,
  },
  {
    id: 'warrior-pose' as ExerciseId,
    name: 'Warrior Pose',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    primaryMuscles: ['legs'],
    secondaryMuscles: ['core'],
    difficulty: 'beginner',
    instructions: 'Step back into lunge, arms overhead, hold the position...',
    isCustom: false,
  },
  {
    id: 'downward-dog' as ExerciseId,
    name: 'Downward Dog',
    category: 'flexibility',
    equipment: ['yoga_mat'],
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['legs', 'core'],
    difficulty: 'beginner',
    instructions:
      'Start on hands and knees, tuck toes, lift hips up and back...',
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
        name: 'Bench Press',
        category: 'strength',
        primaryMuscles: ['chest'],
      },
      {
        exerciseId: 'overhead-press' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 95,
        restTime: 120,
        name: 'Overhead Press',
        category: 'strength',
        primaryMuscles: ['shoulders'],
      },
    ],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    isPublic: true,
    userId: 'user-1' as UserId,
    lastCompleted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
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
        name: 'Deadlift',
        category: 'strength',
        primaryMuscles: ['hamstrings'],
      },
    ],
    estimatedDuration: 45,
    difficulty: 'advanced',
    isPublic: true,
    userId: 'user-1' as UserId,
    lastCompleted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: 'leg-day' as TemplateId,
    title: 'Leg Day',
    description: 'Lower body strength workout',
    exercises: [
      {
        exerciseId: 'squat' as ExerciseId,
        sets: 4,
        reps: 8,
        weight: 185,
        restTime: 120,
        name: 'Back Squat',
        category: 'strength',
        primaryMuscles: ['quadriceps'],
      },
    ],
    estimatedDuration: 50,
    difficulty: 'intermediate',
    isPublic: true,
    userId: 'user-1' as UserId,
    // No lastCompleted - never used
  },
];

// Mock community templates database
export const mockCommunityTemplates: CommunityTemplate[] = [
  {
    id: 'community-push-pull-legs' as TemplateId,
    title: 'Complete Push Pull Legs',
    description: 'A comprehensive 3-day split for muscle building',
    exercises: [
      {
        exerciseId: 'bench-press' as ExerciseId,
        sets: 4,
        reps: 8,
        weight: 135,
        restTime: 120,
        name: 'Bench Press',
        category: 'strength',
        primaryMuscles: ['chest'],
      },
      {
        exerciseId: 'overhead-press' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 95,
        restTime: 120,
        name: 'Overhead Press',
        category: 'strength',
        primaryMuscles: ['shoulders'],
      },
      {
        exerciseId: 'dips' as ExerciseId,
        sets: 3,
        reps: 12,
        restTime: 120,
        name: 'Dips',
        category: 'strength',
        primaryMuscles: ['triceps'],
      },
    ],
    estimatedDuration: 75,
    difficulty: 'intermediate',
    isPublic: true,
    userId: 'community-user-1' as UserId,
    author: 'FitnessGuru42',
    authorId: 'community-user-1' as UserId,
    saves: 2341,
    likes: 1876,
    uses: 5432,
    tags: ['muscle-building', 'hypertrophy', 'split'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    isOfficial: false,
  },
  {
    id: 'community-hiit-cardio' as TemplateId,
    title: '20-Min HIIT Blast',
    description: 'High intensity cardio for fat burning',
    exercises: [
      {
        exerciseId: 'burpees' as ExerciseId,
        sets: 4,
        reps: 15,
        restTime: 30,
        name: 'Burpees',
        category: 'cardio',
        primaryMuscles: ['full-body'],
      },
      {
        exerciseId: 'mountain-climbers' as ExerciseId,
        sets: 4,
        reps: 20,
        restTime: 30,
        name: 'Mountain Climbers',
        category: 'cardio',
        primaryMuscles: ['core'],
      },
      {
        exerciseId: 'jump-squats' as ExerciseId,
        sets: 4,
        reps: 15,
        restTime: 30,
        name: 'Jump Squats',
        category: 'cardio',
        primaryMuscles: ['legs'],
      },
    ],
    estimatedDuration: 20,
    difficulty: 'advanced',
    isPublic: true,
    userId: 'community-user-2' as UserId,
    author: 'CardioQueen',
    authorId: 'community-user-2' as UserId,
    saves: 4567,
    likes: 3210,
    uses: 7891,
    tags: ['hiit', 'cardio', 'fat-loss', 'bodyweight'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    isOfficial: true,
  },
  {
    id: 'community-beginner-strength' as TemplateId,
    title: 'Beginner Strength Foundation',
    description: 'Perfect starter program for new lifters',
    exercises: [
      {
        exerciseId: 'squat' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 95,
        restTime: 120,
        name: 'Back Squat',
        category: 'strength',
        primaryMuscles: ['quadriceps'],
      },
      {
        exerciseId: 'bench-press' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 95,
        restTime: 120,
        name: 'Bench Press',
        category: 'strength',
        primaryMuscles: ['chest'],
      },
      {
        exerciseId: 'bent-over-row' as ExerciseId,
        sets: 3,
        reps: 10,
        weight: 75,
        restTime: 120,
        name: 'Bent Over Row',
        category: 'strength',
        primaryMuscles: ['back'],
      },
    ],
    estimatedDuration: 45,
    difficulty: 'beginner',
    isPublic: true,
    userId: 'community-user-3' as UserId,
    author: 'CoachMike',
    authorId: 'community-user-3' as UserId,
    saves: 5678,
    likes: 3456,
    uses: 8923,
    tags: ['beginner', 'strength', 'foundation', 'compound'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    isOfficial: true,
  },
  {
    id: 'community-yoga-flow' as TemplateId,
    title: 'Morning Yoga Flow',
    description: 'Gentle morning routine for flexibility',
    exercises: [
      {
        exerciseId: 'sun-salutation' as ExerciseId,
        sets: 3,
        reps: 1,
        restTime: 60,
        name: 'Sun Salutation',
        category: 'flexibility',
        primaryMuscles: ['full-body'],
      },
      {
        exerciseId: 'warrior-pose' as ExerciseId,
        sets: 2,
        reps: 1,
        restTime: 30,
        name: 'Warrior Pose',
        category: 'flexibility',
        primaryMuscles: ['legs'],
      },
      {
        exerciseId: 'downward-dog' as ExerciseId,
        sets: 3,
        reps: 1,
        restTime: 30,
        name: 'Downward Dog',
        category: 'flexibility',
        primaryMuscles: ['shoulders'],
      },
    ],
    estimatedDuration: 25,
    difficulty: 'beginner',
    isPublic: true,
    userId: 'community-user-4' as UserId,
    author: 'YogaMaster',
    authorId: 'community-user-4' as UserId,
    saves: 1543,
    likes: 892,
    uses: 2134,
    tags: ['yoga', 'flexibility', 'morning', 'mindfulness'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    isOfficial: false,
  },
  {
    id: 'community-upper-power' as TemplateId,
    title: 'Upper Body Power',
    description: 'Explosive upper body strength training',
    exercises: [
      {
        exerciseId: 'bench-press' as ExerciseId,
        sets: 5,
        reps: 5,
        weight: 185,
        restTime: 180,
        name: 'Bench Press',
        category: 'strength',
        primaryMuscles: ['chest'],
      },
      {
        exerciseId: 'weighted-pullups' as ExerciseId,
        sets: 4,
        reps: 6,
        weight: 25,
        restTime: 180,
        name: 'Weighted Pull-ups',
        category: 'strength',
        primaryMuscles: ['back'],
      },
      {
        exerciseId: 'overhead-press' as ExerciseId,
        sets: 4,
        reps: 6,
        weight: 115,
        restTime: 150,
        name: 'Overhead Press',
        category: 'strength',
        primaryMuscles: ['shoulders'],
      },
    ],
    estimatedDuration: 60,
    difficulty: 'advanced',
    isPublic: true,
    userId: 'community-user-5' as UserId,
    author: 'PowerLifter23',
    authorId: 'community-user-5' as UserId,
    saves: 987,
    likes: 654,
    uses: 1876,
    tags: ['powerlifting', 'strength', 'upper-body', 'heavy'],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    isOfficial: false,
  },
];

// Helper functions to create mock data
let setIdCounter = 0;
export const createMockSet = (
  setNumber: number,
  completed: boolean = false,
  weight?: number,
  reps?: number
): SetData => ({
  id: `set-${setNumber}-${Date.now()}-${++setIdCounter}` as SetEntryId,
  setNumber,
  weight,
  reps,
  completed,
  completedAt: completed ? new Date() : undefined,
});

export const createMockSessionExercise = (
  exercise: Exercise,
  orderIndex: number,
  numSets: number = 3,
  restTime: number = 120
): SessionExercise => ({
  id: exercise.id,
  exercise,
  sets: Array.from({ length: numSets }, (_, i) => createMockSet(i + 1, false)),
  orderIndex,
  restPreset: restTime,
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
  templateRestTime: 120, // Default template rest time
  customizedExercises: new Set(), // Track which exercises have custom rest times
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

// Helper function to calculate days since last workout
export const getDaysAgoText = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};
