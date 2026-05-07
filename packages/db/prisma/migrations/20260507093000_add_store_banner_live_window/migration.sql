-- Add live visibility window for store banners.
ALTER TABLE "store_banners"
ADD COLUMN "live_starts_at" TIMESTAMP(3),
ADD COLUMN "live_ends_at" TIMESTAMP(3);

-- Backfill live window from existing banner app dates for continuity.
UPDATE "store_banners"
SET "live_starts_at" = "starts_at",
    "live_ends_at" = "ends_at"
WHERE "live_starts_at" IS NULL
  AND "live_ends_at" IS NULL;

-- Update banner indexes for live/app windows.
DROP INDEX IF EXISTS "store_banners_placement_is_active_starts_at_ends_at_idx";
CREATE INDEX "store_banners_placement_is_active_live_starts_at_live_ends_at_idx"
  ON "store_banners"("placement", "is_active", "live_starts_at", "live_ends_at");
CREATE INDEX "store_banners_placement_app_starts_at_app_ends_at_idx"
  ON "store_banners"("placement", "starts_at", "ends_at");
