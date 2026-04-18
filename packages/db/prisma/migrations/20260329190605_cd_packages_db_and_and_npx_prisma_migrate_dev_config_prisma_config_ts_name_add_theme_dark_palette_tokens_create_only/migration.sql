-- AlterTable
ALTER TABLE "theme_configs" ADD COLUMN     "dark_accent_color" TEXT NOT NULL DEFAULT '#38bdf8',
ADD COLUMN     "dark_background_color" TEXT NOT NULL DEFAULT '#0b1220',
ADD COLUMN     "dark_foreground_color" TEXT NOT NULL DEFAULT '#f8fafc',
ADD COLUMN     "dark_primary_color" TEXT NOT NULL DEFAULT '#e2e8f0',
ADD COLUMN     "dark_secondary_color" TEXT NOT NULL DEFAULT '#334155';
