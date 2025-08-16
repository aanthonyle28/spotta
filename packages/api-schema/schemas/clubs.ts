import { z } from 'zod';

export const CreateClubRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
});

export const JoinClubRequestSchema = z.object({
  inviteCode: z.string().min(6).max(12),
});

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'workout_share']).default('text'),
  metadata: z.record(z.any()).optional(),
});

export const UpdateClubRequestSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});

export type CreateClubRequest = z.infer<typeof CreateClubRequestSchema>;
export type JoinClubRequest = z.infer<typeof JoinClubRequestSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type UpdateClubRequest = z.infer<typeof UpdateClubRequestSchema>;