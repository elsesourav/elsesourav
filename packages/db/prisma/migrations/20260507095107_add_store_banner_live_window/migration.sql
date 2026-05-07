-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "theme_configs" ALTER COLUMN "dark_action_color" SET DEFAULT '#38bdf8';

-- RenameIndex
ALTER INDEX "store_banners_placement_app_starts_at_app_ends_at_idx" RENAME TO "store_banners_placement_starts_at_ends_at_idx";

-- RenameIndex
ALTER INDEX "store_banners_placement_is_active_live_starts_at_live_ends_at_i" RENAME TO "store_banners_placement_is_active_live_starts_at_live_ends__idx";
