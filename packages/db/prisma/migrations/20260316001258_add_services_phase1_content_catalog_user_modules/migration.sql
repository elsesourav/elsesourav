-- CreateEnum
CREATE TYPE "SliderType" AS ENUM ('HERO', 'FEATURED', 'PROMO');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HelpArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "app_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_tags_on_apps" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_tags_on_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_sliders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "SliderType" NOT NULL DEFAULT 'HERO',
    "image_url" TEXT,
    "link_url" TEXT,
    "app_id" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_view_events" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "source" TEXT,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_daily_stats" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "library_count" INTEGER NOT NULL DEFAULT 0,
    "feedback_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_aggregate_stats" (
    "app_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "library_count" INTEGER NOT NULL DEFAULT 0,
    "feedback_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "last_viewed_at" TIMESTAMP(3),
    "last_downloaded_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_aggregate_stats_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "profile_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "headline" TEXT,
    "short_bio" TEXT,
    "bio_markdown" TEXT NOT NULL,
    "experience_markdown" TEXT,
    "skills" JSONB,
    "tools" JSONB,
    "contact_email" TEXT,
    "location" TEXT,
    "website_url" TEXT,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "resume_url" TEXT,
    "avatar_url" TEXT,
    "cover_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content_markdown" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "author_id" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_tags" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,
    "author_name" TEXT,
    "author_email" TEXT,
    "content" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_articles" (
    "id" TEXT NOT NULL,
    "category_id" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content_markdown" TEXT NOT NULL,
    "status" "HelpArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "publish_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role" TEXT,
    "company" TEXT,
    "avatar_url" TEXT,
    "quote_markdown" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "source_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_tags_name_key" ON "app_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_tags_slug_key" ON "app_tags"("slug");

-- CreateIndex
CREATE INDEX "app_tags_on_apps_tag_id_idx" ON "app_tags_on_apps"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_tags_on_apps_app_id_tag_id_key" ON "app_tags_on_apps"("app_id", "tag_id");

-- CreateIndex
CREATE INDEX "home_sliders_type_is_active_order_index_idx" ON "home_sliders"("type", "is_active", "order_index");

-- CreateIndex
CREATE INDEX "home_sliders_starts_at_ends_at_idx" ON "home_sliders"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "app_view_events_app_id_created_at_idx" ON "app_view_events"("app_id", "created_at");

-- CreateIndex
CREATE INDEX "app_view_events_user_id_created_at_idx" ON "app_view_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "app_view_events_session_id_created_at_idx" ON "app_view_events"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "app_daily_stats_date_idx" ON "app_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "app_daily_stats_app_id_date_key" ON "app_daily_stats"("app_id", "date");

-- CreateIndex
CREATE INDEX "app_aggregate_stats_view_count_updated_at_idx" ON "app_aggregate_stats"("view_count", "updated_at");

-- CreateIndex
CREATE INDEX "app_aggregate_stats_download_count_updated_at_idx" ON "app_aggregate_stats"("download_count", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_pages_slug_key" ON "profile_pages"("slug");

-- CreateIndex
CREATE INDEX "profile_pages_is_active_updated_at_idx" ON "profile_pages"("is_active", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_name_key" ON "blog_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_author_id_created_at_idx" ON "blog_posts"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "blog_post_tags_tag_id_idx" ON "blog_post_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_tags_post_id_tag_id_key" ON "blog_post_tags"("post_id", "tag_id");

-- CreateIndex
CREATE INDEX "blog_comments_post_id_created_at_idx" ON "blog_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "blog_comments_is_approved_created_at_idx" ON "blog_comments"("is_approved", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "help_categories_slug_key" ON "help_categories"("slug");

-- CreateIndex
CREATE INDEX "help_categories_is_active_order_index_idx" ON "help_categories"("is_active", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "help_articles_slug_key" ON "help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_status_published_at_idx" ON "help_articles"("status", "published_at");

-- CreateIndex
CREATE INDEX "help_articles_category_id_is_featured_idx" ON "help_articles"("category_id", "is_featured");

-- CreateIndex
CREATE INDEX "testimonials_is_active_is_featured_sort_order_idx" ON "testimonials"("is_active", "is_featured", "sort_order");

-- CreateIndex
CREATE INDEX "apps_is_featured_published_at_idx" ON "apps"("is_featured", "published_at");

-- AddForeignKey
ALTER TABLE "app_tags_on_apps" ADD CONSTRAINT "app_tags_on_apps_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_tags_on_apps" ADD CONSTRAINT "app_tags_on_apps_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "app_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_sliders" ADD CONSTRAINT "home_sliders_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_view_events" ADD CONSTRAINT "app_view_events_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_view_events" ADD CONSTRAINT "app_view_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_daily_stats" ADD CONSTRAINT "app_daily_stats_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_aggregate_stats" ADD CONSTRAINT "app_aggregate_stats_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "help_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
