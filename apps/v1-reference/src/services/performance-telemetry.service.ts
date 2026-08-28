import type {
  PerformanceMetric,
  PerformanceMetricCategory,
} from '@/types/observability.types';
import { sanitizeContext } from './error-logger.service';

/**
 * Lightweight, non-blocking in-memory telemetry observer
 */
export class PerformanceTelemetryService {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly maxStoredMetrics = 100;

  /**
   * Times the execution of an async operation and records its duration without blocking
   */
  public async measure<T>(
    name: string,
    category: PerformanceMetricCategory,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      return await operation();
    } finally {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.round((endTime - startTime) * 100) / 100;
      this.record(name, category, durationMs, metadata);
    }
  }

  /**
   * Records a standalone performance measurement
   */
  public record(
    name: string,
    category: PerformanceMetricCategory,
    durationMs: number,
    metadata?: Record<string, unknown>
  ): void {
    const sanitizedMetadata = metadata
      ? (sanitizeContext(metadata) as Record<string, unknown>)
      : undefined;

    const metric: PerformanceMetric = {
      id: `pm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category,
      durationMs: Math.max(0, durationMs),
      timestamp: Date.now(),
      metadata: sanitizedMetadata,
    };

    this.metrics.push(metric);

    // Keep bounded in-memory buffer to prevent memory growth
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxStoredMetrics);
    }
  }

  /**
   * Retrieves recent recorded performance metrics
   */
  public getRecentMetrics(limit = 20): readonly PerformanceMetric[] {
    return this.metrics.slice(-limit).reverse();
  }

  /**
   * Retrieves metrics filtered by category
   */
  public getMetricsByCategory(category: PerformanceMetricCategory): readonly PerformanceMetric[] {
    return this.metrics.filter((m) => m.category === category).reverse();
  }

  /**
   * Clears in-memory performance history
   */
  public clearMetrics(): void {
    this.metrics.length = 0;
  }
}

export const performanceTelemetry = new PerformanceTelemetryService();
