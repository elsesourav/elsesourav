import { prisma } from "@elsesourav/db";

const DEFAULT_DELETION_POLL_INTERVAL_MS = 60_000;

export type ScheduledCategoryDeletionProcessorOptions = {
  intervalMs?: number;
  now?: () => Date;
};

export function startScheduledCategoryDeletionProcessor(
  options: ScheduledCategoryDeletionProcessorOptions = {},
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

      const result = await prisma.category.updateMany({
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
          `[catalog-service] processed ${result.count} scheduled category deletions`,
        );
      }
    } catch (error) {
      console.error(
        "[catalog-service] failed to process scheduled category deletions",
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
