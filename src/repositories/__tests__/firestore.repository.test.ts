import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { FirestoreRepository } from '../firestore.repository';
import { createFirestoreConverter, sanitizeForFirestore } from '../converters';
import { isOk, isErr } from '@/lib/result';
import type { BaseEntity } from '../types';
import type { Firestore, QueryDocumentSnapshot } from 'firebase/firestore';

// Mock Firebase Firestore SDK
vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    constructor(
      private readonly seconds: number,
      private readonly nanoseconds: number
    ) {}
    toMillis(): number {
      return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000);
    }
  }

  return {
    collection: vi.fn().mockImplementation((_db, name) => ({
      path: name,
      withConverter: vi.fn().mockReturnThis(),
    })),
    doc: vi.fn().mockImplementation((...args: unknown[]) => {
      const id = args.length === 3 ? (args[2] as string) : 'mock-generated-id';
      return {
        id,
        path: `testCollection/${id}`,
        withConverter: vi.fn().mockReturnThis(),
      };
    }),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn().mockImplementation((q) => q),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    Timestamp: MockTimestamp,
  };
});

import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp as MockTimestamp,
} from 'firebase/firestore';

interface TestItem extends BaseEntity {
  readonly title: string;
  readonly count: number;
  readonly isPublished?: boolean;
}

const createTestSchema = z.object({
  title: z.string().min(1),
  count: z.number().int().nonnegative(),
  isPublished: z.boolean().optional(),
});

describe('Firestore Converters', () => {
  it('sanitizes undefined fields from objects before Firestore write', () => {
    const raw = {
      title: 'Hello',
      description: undefined,
      nested: {
        value: 42,
        extra: undefined,
      },
    };

    const sanitized = sanitizeForFirestore(raw);
    expect(sanitized).toEqual({
      title: 'Hello',
      nested: { value: 42 },
    });
    expect('description' in sanitized).toBe(false);
  });

  it('converter removes client id on toFirestore and injects snapshot id on fromFirestore', () => {
    const converter = createFirestoreConverter<TestItem>();

    const toData = converter.toFirestore({
      id: 'item-123',
      title: 'Test',
      count: 5,
      createdAt: 1000,
      updatedAt: 2000,
    });

    expect(toData).not.toHaveProperty('id');
    expect(toData.title).toBe('Test');

    const fakeTimestamp = new MockTimestamp(1700000000, 0);
    const mockSnapshot = {
      id: 'snapshot-456',
      data: () => ({
        title: 'Hydrated',
        count: 10,
        createdAt: fakeTimestamp,
        updatedAt: fakeTimestamp,
      }),
    } as unknown as QueryDocumentSnapshot;

    const fromData = converter.fromFirestore(mockSnapshot);
    expect(fromData.id).toBe('snapshot-456');
    expect(fromData.title).toBe('Hydrated');
    expect(fromData.createdAt).toBe(1700000000000);
  });
});

describe('FirestoreRepository Generic Base', () => {
  let mockDb: Firestore;
  let repository: FirestoreRepository<TestItem, z.infer<typeof createTestSchema>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {} as Firestore;
    repository = new FirestoreRepository<TestItem, z.infer<typeof createTestSchema>>('test_items', {
      createSchema: createTestSchema,
      getFirestore: () => mockDb,
    });
  });

  describe('findById', () => {
    it('returns entity when document exists', async () => {
      const mockData = {
        title: 'First Item',
        count: 1,
        createdAt: 1000,
        updatedAt: 1000,
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'item-1',
        data: () => mockData,
      } as never);

      const result = await repository.findById('item-1');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual(mockData);
      }
    });

    it('returns null when document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as never);

      const result = await repository.findById('missing-id');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });

    it('returns AppError on invalid ID format', async () => {
      const result = await repository.findById('');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('BAD_REQUEST');
      }
    });

    it('handles Firestore error properly', async () => {
      vi.mocked(getDoc).mockRejectedValueOnce(new Error('Permission denied'));

      const result = await repository.findById('item-1');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Permission denied');
      }
    });
  });

  describe('findMany', () => {
    it('returns paginated items from query', async () => {
      const docs = [
        { id: '1', data: () => ({ id: '1', title: 'A', count: 1, createdAt: 1, updatedAt: 1 }) },
        { id: '2', data: () => ({ id: '2', title: 'B', count: 2, createdAt: 2, updatedAt: 2 }) },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (cb: (doc: unknown) => void) => docs.forEach(cb),
        docs,
      } as never);

      const result = await repository.findMany({ limit: 10 });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.items[0]?.title).toBe('A');
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('returns empty array when no documents match', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: vi.fn(),
        docs: [],
      } as never);

      const result = await repository.findMany();
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items).toHaveLength(0);
        expect(result.data.hasMore).toBe(false);
      }
    });
  });

  describe('create', () => {
    it('creates a new entity when valid payload is passed', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      const payload = {
        title: 'New Item',
        count: 42,
        isPublished: true,
      };

      const result = await repository.create(payload);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.id).toBe('mock-generated-id');
        expect(result.data.title).toBe('New Item');
        expect(result.data.count).toBe(42);
        expect(result.data.createdAt).toBeDefined();
      }
    });

    it('rejects invalid payload via Zod schema before database write', async () => {
      const invalidPayload = {
        title: '', // empty title violates min(1)
        count: -5, // negative count violates nonnegative()
      };

      const result = await repository.create(invalidPayload as never);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  describe('update & delete', () => {
    it('updates existing document', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ id: 'item-1', title: 'Old', count: 1, createdAt: 100, updatedAt: 100 }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      const result = await repository.update('item-1', { title: 'Updated' } as never);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('Updated');
      }
    });

    it('returns notFound when updating non-existent document', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as never);

      const result = await repository.update('missing', { title: 'Updated' } as never);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('deletes document by ID', async () => {
      vi.mocked(deleteDoc).mockResolvedValueOnce(undefined);

      const result = await repository.delete('item-1');
      expect(isOk(result)).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
