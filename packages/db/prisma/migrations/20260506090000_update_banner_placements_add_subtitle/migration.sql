-- Update banner placement enum and add subtitle column

ALTER TABLE "store_banners" ADD COLUMN "subtitle" TEXT;

ALTER TABLE "store_banners" ALTER COLUMN "placement" DROP DEFAULT;

CREATE TYPE "BannerPlacement_new" AS ENUM (
  'NEW',
  'COMING_SOON',
  'SPECIAL_OFFER',
  'EVENT'
);

ALTER TABLE "store_banners"
ALTER COLUMN "placement" TYPE "BannerPlacement_new"
USING (
  CASE "placement"
    WHEN 'HOME_HERO' THEN 'NEW'
    WHEN 'LATEST' THEN 'SPECIAL_OFFER'
    WHEN 'UPCOMING' THEN 'COMING_SOON'
    ELSE 'NEW'
  END
)::"BannerPlacement_new";

DROP TYPE "BannerPlacement";

ALTER TYPE "BannerPlacement_new" RENAME TO "BannerPlacement";

ALTER TABLE "store_banners" ALTER COLUMN "placement" SET DEFAULT 'NEW';
