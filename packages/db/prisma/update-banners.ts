import { prisma } from "../src/client";

async function main() {
  const placementResult = await prisma.$executeRaw`
    UPDATE "store_banners"
    SET "placement" = 'NEW'
    WHERE "placement"::text = 'HOME_HERO'
  `;

  const liveWindowResult = await prisma.$executeRaw`
    UPDATE "store_banners"
    SET
      "live_starts_at" = COALESCE("live_starts_at", "starts_at"),
      "live_ends_at" = COALESCE("live_ends_at", "ends_at")
    WHERE "live_starts_at" IS NULL
       OR "live_ends_at" IS NULL
  `;

  console.log("Updated placements:", placementResult);
  console.log("Backfilled live window:", liveWindowResult);
}

main()
  .catch((error) => {
    console.error("Failed to update banner data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
