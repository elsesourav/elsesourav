-- Add action color tokens to theme configs and backfill from accent colors.
ALTER TABLE "theme_configs" ADD COLUMN "action_color" TEXT;
ALTER TABLE "theme_configs" ADD COLUMN "dark_action_color" TEXT;

UPDATE "theme_configs"
SET "action_color" = "accent_color",
    "dark_action_color" = "dark_accent_color"
WHERE "action_color" IS NULL
   OR "dark_action_color" IS NULL;

ALTER TABLE "theme_configs" ALTER COLUMN "action_color" SET NOT NULL;
ALTER TABLE "theme_configs" ALTER COLUMN "dark_action_color" SET NOT NULL;
