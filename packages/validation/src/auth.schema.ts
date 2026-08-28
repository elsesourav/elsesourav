import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const LoginSchema = SignInSchema;

export const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(50),
});

export const PasswordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordSchema = PasswordResetSchema;

export type SignInInput = z.infer<typeof SignInSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
