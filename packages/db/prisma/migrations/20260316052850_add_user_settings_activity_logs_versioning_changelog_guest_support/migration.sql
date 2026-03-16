-- AlterTable
ALTER TABLE "app_view_events" ADD COLUMN     "is_unique" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "blog_comments" ADD COLUMN     "is_guest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_library" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_deletion_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme_mode" TEXT,
    "custom_theme" JSONB,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_changelogs" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT,
    "content_markdown" TEXT NOT NULL,
    "release_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_versions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content_markdown" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_article_versions" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_article_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_description_versions" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "version_label" TEXT NOT NULL,
    "description_markdown" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_description_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_sessions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "guest_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_entity_id_idx" ON "activity_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_created_at_idx" ON "activity_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "app_changelogs_app_id_release_date_idx" ON "app_changelogs"("app_id", "release_date");

-- CreateIndex
CREATE INDEX "app_changelogs_app_id_version_idx" ON "app_changelogs"("app_id", "version");

-- CreateIndex
CREATE INDEX "blog_post_versions_post_id_idx" ON "blog_post_versions"("post_id");

-- CreateIndex
CREATE INDEX "blog_post_versions_post_id_created_at_idx" ON "blog_post_versions"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "help_article_versions_article_id_idx" ON "help_article_versions"("article_id");

-- CreateIndex
CREATE INDEX "help_article_versions_article_id_created_at_idx" ON "help_article_versions"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "app_description_versions_app_id_idx" ON "app_description_versions"("app_id");

-- CreateIndex
CREATE INDEX "app_description_versions_app_id_created_at_idx" ON "app_description_versions"("app_id", "created_at");

-- CreateIndex
CREATE INDEX "app_description_versions_app_id_version_label_idx" ON "app_description_versions"("app_id", "version_label");

-- CreateIndex
CREATE UNIQUE INDEX "guest_sessions_session_id_key" ON "guest_sessions"("session_id");

-- CreateIndex
CREATE INDEX "guest_sessions_last_seen_at_idx" ON "guest_sessions"("last_seen_at");

-- CreateIndex
CREATE INDEX "users_scheduled_deletion_at_idx" ON "users"("scheduled_deletion_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_changelogs" ADD CONSTRAINT "app_changelogs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_versions" ADD CONSTRAINT "blog_post_versions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_article_versions" ADD CONSTRAINT "help_article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "help_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_description_versions" ADD CONSTRAINT "app_description_versions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
