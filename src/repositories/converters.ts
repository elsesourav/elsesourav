import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type DocumentData,
  Timestamp as FirestoreTimestamp,
} from 'firebase/firestore';

/**
 * Recursively converts Firestore Timestamps to millisecond numbers
 */
function convertTimestampsToMillis(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof FirestoreTimestamp) {
    return data.toMillis();
  }

  if (Array.isArray(data)) {
    return data.map(convertTimestampsToMillis);
  }

  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      converted[key] = convertTimestampsToMillis(value);
    }

    return converted;
  }

  return data;
}

/**
 * Removes undefined fields from payload to prevent Firestore write rejections
 */
export function sanitizeForFirestore(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof FirestoreTimestamp) &&
        !(value instanceof Date)
      ) {
        result[key] = sanitizeForFirestore(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Generic factory to create a typed FirestoreDataConverter for any domain entity
 */
export function createFirestoreConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const data = { ...model } as Record<string, unknown>;
      // Remove client-only id field as it's the document key
      delete data.id;

      return sanitizeForFirestore(data);
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      const rawData = snapshot.data(options);
      const converted = convertTimestampsToMillis(rawData) as Record<string, unknown>;

      return {
        id: snapshot.id,
        ...converted,
      } as T;
    },
  };
}
