import { getFirebaseServices } from '@/firebase/client';
import { clientEnv } from '@/config/env.config';
import { appConfig } from '@/config/app.config';
import type {
  SystemHealthReport,
  SystemHealthCheckResult,
} from '@/types/observability.types';

export class HealthCheckService {
  /**
   * Runs non-destructive system health diagnostics without exposing sensitive secrets
   */
  public async runDiagnostics(): Promise<SystemHealthReport> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const [configCheck, firebaseCheck, authCheck, firestoreCheck] = await Promise.all([
      this.checkConfiguration(),
      this.checkFirebaseInit(),
      this.checkAuthentication(),
      this.checkFirestore(),
    ]);

    const isAllPass =
      configCheck.status === 'pass' &&
      firebaseCheck.status === 'pass' &&
      authCheck.status === 'pass' &&
      firestoreCheck.status === 'pass';

    const isAnyFail =
      configCheck.status === 'fail' ||
      firebaseCheck.status === 'fail' ||
      authCheck.status === 'fail' ||
      firestoreCheck.status === 'fail';

    const overallStatus: SystemHealthReport['status'] = isAllPass
      ? 'healthy'
      : isAnyFail
      ? 'unhealthy'
      : 'degraded';

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const totalDurationMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      status: overallStatus,
      timestamp: Date.now(),
      appVersion: appConfig.version,
      environment: appConfig.environment,
      checks: {
        configuration: configCheck,
        firebaseInit: firebaseCheck,
        authentication: authCheck,
        firestore: firestoreCheck,
      },
      totalDurationMs,
    };
  }

  private async checkConfiguration(): Promise<SystemHealthCheckResult> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const fb = clientEnv.firebase;
      const isConfigValid =
        Boolean(fb.apiKey) &&
        Boolean(fb.authDomain) &&
        Boolean(fb.projectId) &&
        Boolean(fb.appId);

      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;

      if (isConfigValid) {
        return {
          status: 'pass',
          message: 'Client configuration schema validated successfully',
          durationMs,
        };
      }

      return {
        status: 'fail',
        message: 'One or more required client configuration keys are missing',
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;
      return {
        status: 'fail',
        message: err instanceof Error ? err.message : 'Configuration validation error',
        durationMs,
      };
    }
  }

  private async checkFirebaseInit(): Promise<SystemHealthCheckResult> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const services = getFirebaseServices();
      const isAppReady = Boolean(services.app && services.app.name);
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;

      if (isAppReady) {
        return {
          status: 'pass',
          message: `Firebase Web SDK App "${services.app.name}" initialized`,
          durationMs,
        };
      }

      return {
        status: 'fail',
        message: 'Firebase App instance is not initialized',
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;
      return {
        status: 'fail',
        message: err instanceof Error ? err.message : 'Firebase initialization check failed',
        durationMs,
      };
    }
  }

  private async checkAuthentication(): Promise<SystemHealthCheckResult> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const services = getFirebaseServices();
      const isAuthReady = Boolean(services.auth && services.auth.app);
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;

      if (isAuthReady) {
        return {
          status: 'pass',
          message: 'Firebase Authentication service is operational',
          durationMs,
        };
      }

      return {
        status: 'fail',
        message: 'Firebase Authentication service is unavailable',
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;
      return {
        status: 'fail',
        message: err instanceof Error ? err.message : 'Authentication check failed',
        durationMs,
      };
    }
  }

  private async checkFirestore(): Promise<SystemHealthCheckResult> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const services = getFirebaseServices();
      const isFirestoreReady = Boolean(services.firestore && services.firestore.type === 'firestore');
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;

      if (isFirestoreReady) {
        return {
          status: 'pass',
          message: 'Cloud Firestore database client is initialized',
          durationMs,
        };
      }

      return {
        status: 'fail',
        message: 'Cloud Firestore database client is not ready',
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 100) / 100;
      return {
        status: 'fail',
        message: err instanceof Error ? err.message : 'Firestore check failed',
        durationMs,
      };
    }
  }
}

export const healthCheckService = new HealthCheckService();
