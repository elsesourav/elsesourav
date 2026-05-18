-- CreateEnum
CREATE TYPE "AppType" AS ENUM ('GAMING', 'SOCIAL_MEDIA_COMMUNICATION', 'PRODUCTIVITY_BUSINESS', 'LIFESTYLE', 'UTILITY_TOOL');

-- DropForeignKey
ALTER TABLE "apps" DROP CONSTRAINT "apps_category_id_fkey";

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "app_category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "AppType" NOT NULL DEFAULT 'UTILITY_TOOL',
ALTER COLUMN "category_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "apps_type_idx" ON "apps"("type");

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
