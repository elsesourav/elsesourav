import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { prisma } from '../packages/database/src/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables
function loadEnvFile(envPath: string) {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(resolve(rootDir, '.env'));
loadEnvFile(resolve(rootDir, 'apps/web/.env.local'));

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  error?: { message: string };
}

function uploadToCloudinary(
  filePath: string,
  folder: string,
  publicIdPrefix: string
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in environment.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${publicIdPrefix}-${Date.now()}`;

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');

  const curlCmd = `curl -s -X POST "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" ` +
    `-F "file=@${filePath}" ` +
    `-F "folder=${folder}" ` +
    `-F "public_id=${publicId}" ` +
    `-F "timestamp=${timestamp}" ` +
    `-F "api_key=${apiKey}" ` +
    `-F "signature=${signature}"`;

  const output = execSync(curlCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const result = JSON.parse(output) as CloudinaryUploadResult;

  if (result.error) {
    throw new Error(`Cloudinary upload error: ${result.error.message}`);
  }

  const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${result.public_id}.webp`;

  console.log(`✓ Uploaded ${publicIdPrefix}: ${result.width}x${result.height} (${(result.bytes / 1024).toFixed(1)} KB) -> ${optimizedUrl}`);
  return optimizedUrl;
}

async function main() {
  console.log('=== Step 1: Uploading Carousel Slider Banners to Cloudinary ===');

  const brainDir = '/Users/sourav/.gemini/antigravity/brain/7da36697-1914-45ae-9c83-26faaa033651';

  const desktop21x9Url = uploadToCloudinary(
    `${brainDir}/opt-carousel-21x9.jpg`,
    'elsesourav/general',
    'debayan-carousel-slider-desktop-21x9'
  );

  const mobile3x4Url = uploadToCloudinary(
    `${brainDir}/opt-carousel-3x4.jpg`,
    'elsesourav/general',
    'debayan-carousel-slider-mobile-3x4'
  );

  console.log('\n=== Step 2: Creating Carousel Slide Record in Database ===');

  // Check if a slide for Debayan already exists
  const existingSlide = await prisma.carouselSlide.findFirst({
    where: {
      OR: [
        { targetUrl: '/apps/debayan-ganguly-portfolio' },
        { title: { contains: 'Debayan', mode: 'insensitive' } },
      ],
    },
  });

  // Reorder existing slides so Debayan is placed prominently at sortOrder: 0
  await prisma.carouselSlide.updateMany({
    data: {
      sortOrder: {
        increment: 1,
      },
    },
  });

  let slide;
  if (existingSlide) {
    slide = await prisma.carouselSlide.update({
      where: { id: existingSlide.id },
      data: {
        title: 'Dr. Debayan Ganguly Portfolio & CMS',
        subtitle: 'Bilingual academic and research portfolio platform for the Govt. of West Bengal with KaTeX proofs and Cloud Firestore.',
        desktopImageUrl: desktop21x9Url,
        mobileImageUrl: mobile3x4Url,
        targetUrl: '/apps/debayan-ganguly-portfolio',
        badgeText: 'FEATURED',
        sortOrder: 0,
        isActive: true,
      },
    });
    console.log(`✓ Updated existing Carousel Slide (${slide.id})`);
  } else {
    slide = await prisma.carouselSlide.create({
      data: {
        title: 'Dr. Debayan Ganguly Portfolio & CMS',
        subtitle: 'Bilingual academic and research portfolio platform for the Govt. of West Bengal with KaTeX proofs and Cloud Firestore.',
        desktopImageUrl: desktop21x9Url,
        mobileImageUrl: mobile3x4Url,
        targetUrl: '/apps/debayan-ganguly-portfolio',
        badgeText: 'FEATURED',
        sortOrder: 0,
        isActive: true,
      },
    });
    console.log(`✓ Created new Carousel Slide (${slide.id})`);
  }

  console.log('\n=== Step 3: Verified Active Carousel Slides ===');
  const allActiveSlides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, sortOrder: true, badgeText: true, desktopImageUrl: true, mobileImageUrl: true, targetUrl: true }
  });
  console.log(JSON.stringify(allActiveSlides, null, 2));
}

main()
  .catch((err) => {
    console.error('Execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
