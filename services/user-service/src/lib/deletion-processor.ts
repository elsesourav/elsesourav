import { prisma } from "@elsesourav/db";

const DEFAULT_DELETION_POLL_INTERVAL_MS = 60_000;

export type ScheduledDeletionProcessorOptions = {
  intervalMs?: number;
  now?: () => Date;
};

export function startScheduledDeletionProcessor(
  options: ScheduledDeletionProcessorOptions = {},
): () => void {
  const intervalMs = options.intervalMs ?? DEFAULT_DELETION_POLL_INTERVAL_MS;
  const now = options.now ?? (() => new Date());

  let inFlight = false;
  let stopped = false;

  async function processDueDeletions() {
    if (inFlight || stopped) {
      return;
    }

    inFlight = true;

    try {
      const deletedAt = now();

      const result = await prisma.user.updateMany({
        where: {
          deletedAt: null,
          scheduledDeletionAt: {
            lte: deletedAt,
          },
        },
        data: {
          deletedAt,
          scheduledDeletionAt: null,
        },
      });

      if (result.count > 0) {
        console.log(
          `[user-service] processed ${result.count} scheduled account deletions`,
        );
      }
    } catch (error) {
      console.error(
        "[user-service] failed to process scheduled account deletions",
        error,
      );
    } finally {
      inFlight = false;
    }
  }

  const timer = setInterval(() => {
    void processDueDeletions();
  }, intervalMs);

  timer.unref();
  void processDueDeletions();

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
