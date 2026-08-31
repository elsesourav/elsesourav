import { z } from 'zod';
import { UsernameSchema, NameSchema } from './user.schema';

// Email standard RFC regex without control chars or whitespace
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EmailSchema = z
  .string()
  .trim()
  .min(5, 'Please enter a valid email address')
  .max(254, 'Email address cannot exceed 254 characters')
  .email('Please enter a valid email address')
  .regex(EMAIL_REGEX, 'Please enter a valid email address format');

// Password schema: min 8 characters, max 128 chars (accepts any combination)
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters');

export const IdentifierSchema = z
  .string()
  .min(3, 'Please enter a valid email or username')
  .refine(
    (val) => {
      const trimmed = val.trim();
      if (trimmed.includes('@')) {
        return EmailSchema.safeParse(trimmed).success;
      }
      return UsernameSchema.safeParse(trimmed.toLowerCase()).success;
    },
    { message: 'Please enter a valid email address or username' }
  );

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const UniversalLoginSchema = z.object({
  identifier: IdentifierSchema,
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const LoginSchema = SignInSchema;

export const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: NameSchema,
  username: UsernameSchema,
});

export const PasswordResetSchema = z.object({
  email: EmailSchema,
});

export const ForgotPasswordSchema = PasswordResetSchema;

export const ResetPasswordConfirmationSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(8, 'Password confirmation must match'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof SignInSchema>;
export type UniversalLoginInput = z.infer<typeof UniversalLoginSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordConfirmationInput = z.infer<typeof ResetPasswordConfirmationSchema>;
