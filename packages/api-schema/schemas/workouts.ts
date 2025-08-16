import { z } from 'zod';

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

export type CreateWorkoutRequest = z.infer<typeof CreateWorkoutRequestSchema>;
export type SetEntry = z.infer<typeof SetEntrySchema>;
export type UpdateWorkoutRequest = z.infer<typeof UpdateWorkoutRequestSchema>;
export type CompleteWorkoutRequest = z.infer<typeof CompleteWorkoutRequestSchema>;