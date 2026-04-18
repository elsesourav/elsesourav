/*
  Warnings:

  - Added the required column `updated_at` to the `app_media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_media" ADD COLUMN     "duration_sec" INTEGER,
ADD COLUMN     "file_size_bytes" BIGINT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "is_animated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "contains_ads" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "developer_name" TEXT,
ADD COLUMN     "feature_graphic_url" TEXT,
ADD COLUMN     "icon_url" TEXT,
ADD COLUMN     "privacy_policy_url" TEXT,
ADD COLUMN     "promo_video_url" TEXT,
ADD COLUMN     "release_notes" TEXT,
ADD COLUMN     "support_email" TEXT,
ADD COLUMN     "support_website_url" TEXT;
