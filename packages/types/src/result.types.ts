export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T; readonly error?: never }
  | { readonly success: false; readonly error: E; readonly data?: never };

export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});
