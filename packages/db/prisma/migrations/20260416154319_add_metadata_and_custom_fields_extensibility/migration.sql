-- CreateEnum
CREATE TYPE "CustomFieldEntity" AS ENUM ('APP', 'CATEGORY', 'CONTENT_PAGE', 'BLOG_POST', 'HELP_ARTICLE', 'PROFILE_PAGE', 'TESTIMONIAL', 'THEME_CONFIG', 'STORE_BANNER', 'STORE_SECTION_ITEM', 'HOME_SLIDER', 'APP_TAG', 'BLOG_TAG', 'HELP_CATEGORY', 'APP_MEDIA', 'APP_LINK', 'USER');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'LONG_TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'URL', 'JSON', 'SELECT', 'MULTISELECT');

-- AlterTable
ALTER TABLE "app_media" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "blog_post_versions" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "content_page_versions" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "content_pages" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" TEXT NOT NULL,
    "entity" "CustomFieldEntity" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "field_type" "CustomFieldType" NOT NULL DEFAULT 'TEXT',
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "default_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_field_definitions_entity_is_active_idx" ON "custom_field_definitions"("entity", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_entity_key_key" ON "custom_field_definitions"("entity", "key");

-- CreateIndex
CREATE INDEX "custom_field_values_entity_id_idx" ON "custom_field_values"("entity_id");

-- CreateIndex
CREATE INDEX "custom_field_values_definition_id_updated_at_idx" ON "custom_field_values"("definition_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_definition_id_entity_id_key" ON "custom_field_values"("definition_id", "entity_id");

-- AddForeignKey
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
