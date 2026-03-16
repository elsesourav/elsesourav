-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_deletion_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "categories_scheduled_deletion_at_idx" ON "categories"("scheduled_deletion_at");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "categories"("deleted_at");
