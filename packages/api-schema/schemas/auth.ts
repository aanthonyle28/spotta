import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(50),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    displayName: z.string(),
  }),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;