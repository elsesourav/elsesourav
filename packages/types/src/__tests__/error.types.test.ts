import { describe, it, expect } from 'vitest';
import { AppError } from '../error.types';
import { ok, err } from '../result.types';

describe('AppError Domain Class', () => {
  it('instantiates validation error with 400 status', () => {
    const error = AppError.validation('Invalid email format', { field: 'email' });
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid email format');
    expect(error.details).toEqual({ field: 'email' });
    expect(error.isRetryable).toBe(false);
  });

  it('instantiates unauthorized error with 401 status', () => {
    const error = AppError.unauthorized();
    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.status).toBe(401);
  });

  it('instantiates forbidden error with 403 status', () => {
    const error = AppError.forbidden();
    expect(error.code).toBe('AUTHORIZATION_ERROR');
    expect(error.status).toBe(403);
  });

  it('instantiates notFound error with 404 status', () => {
    const error = AppError.notFound('App');
    expect(error.code).toBe('NOT_FOUND_ERROR');
    expect(error.status).toBe(404);
    expect(error.message).toBe('App not found');
  });

  it('instantiates database error with 500 status and retryable flag', () => {
    const error = AppError.database('Query timeout');
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.status).toBe(500);
    expect(error.isRetryable).toBe(true);
  });

  it('serializes to JSON cleanly', () => {
    const error = AppError.validation('Bad Request');
    const json = error.toJSON();
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.status).toBe(400);
    expect(typeof json.timestamp).toBe('number');
  });
});

describe('Result Monad Helpers', () => {
  it('creates successful result with ok()', () => {
    const res = ok({ id: '123' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.id).toBe('123');
    }
  });

  it('creates error result with err()', () => {
    const error = AppError.notFound();
    const res = err(error);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('NOT_FOUND_ERROR');
    }
  });
});
