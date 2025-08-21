import { z } from 'zod';

// Exercise schemas
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  category: z.enum(['strength', 'cardio', 'flexibility', 'balance', 'sports']),
  equipment: z.array(z.string()),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().optional(),
  isCustom: z.boolean().default(false),
  userId: z.string().optional(),
});

// Session and set schemas
export const SetDataSchema = z.object({
  id: z.string(),
  setNumber: z.number().int().positive(),
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  distance: z.number().min(0).optional(),
  completed: z.boolean().default(false),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});

export const SessionExerciseSchema = z.object({
  id: z.string(),
  exercise: ExerciseSchema,
  sets: z.array(SetDataSchema),
  orderIndex: z.number().int().min(0),
  restPreset: z.number().int().min(0).default(120),
  notes: z.string().optional(),
});

export const ActiveSessionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  startedAt: z.string().datetime(),
  exercises: z.array(SessionExerciseSchema),
  currentExerciseIndex: z.number().int().min(0).default(0),
  totalVolume: z.number().min(0).default(0),
  duration: z.number().int().min(0).default(0),
});

// Template schemas
export const TemplateExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  restTime: z.number().int().min(0).optional(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  exercises: z.array(TemplateExerciseSchema),
  estimatedDuration: z.number().int().min(0),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  isPublic: z.boolean().default(false),
  userId: z.string(),
});

// Request/Response schemas
export const CreateSessionRequestSchema = z.object({
  name: z.string().min(1).max(100),
  exerciseIds: z.array(z.string()).min(1),
  templateId: z.string().optional(),
});

export const UpdateSetRequestSchema = z.object({
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  distance: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export const CompleteSetRequestSchema = z.object({
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  duration: z.number().int().min(0).optional(),
  distance: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

// Legacy schemas (keeping for compatibility)
export const CreateWorkoutRequestSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().optional(),
  notes: z.string().optional(),
});

export const SetEntrySchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().positive(),
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  distance: z.number().min(0).optional(),
  completed: z.boolean(),
  restTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateWorkoutRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  notes: z.string().optional(),
  sets: z.array(SetEntrySchema).optional(),
});

export const CompleteWorkoutRequestSchema = z.object({
  completedAt: z.string().datetime(),
  duration: z.number().int().min(0),
});

// Type exports
export type Exercise = z.infer<typeof ExerciseSchema>;
export type SetData = z.infer<typeof SetDataSchema>;
export type SessionExercise = z.infer<typeof SessionExerciseSchema>;
export type ActiveSession = z.infer<typeof ActiveSessionSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateExercise = z.infer<typeof TemplateExerciseSchema>;

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
export type UpdateSetRequest = z.infer<typeof UpdateSetRequestSchema>;
export type CompleteSetRequest = z.infer<typeof CompleteSetRequestSchema>;

// Legacy types
export type CreateWorkoutRequest = z.infer<typeof CreateWorkoutRequestSchema>;
export type SetEntry = z.infer<typeof SetEntrySchema>;
export type UpdateWorkoutRequest = z.infer<typeof UpdateWorkoutRequestSchema>;
export type CompleteWorkoutRequest = z.infer<
  typeof CompleteWorkoutRequestSchema
>;
