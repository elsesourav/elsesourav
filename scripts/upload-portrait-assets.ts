import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import crypto from 'crypto';
import { prisma } from '../packages/database/src/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Simple zero-dependency .env loader
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
}

async function uploadToCloudinary(
  filePath: string,
  publicIdPrefix: string
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in environment.');
  }

  const fileBuffer = readFileSync(filePath);
  const base64Data = `data:image/png;base64,${fileBuffer.toString('base64')}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'elsesourav/about';
  const publicId = `${publicIdPrefix}_1x1`;

  // Sort parameter keys alphabetically as required by Cloudinary signing specification
  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('folder', folder);
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
  }

  const result = (await response.json()) as CloudinaryUploadResult;

  // Build optimal 1:1 auto-crop & face gravity transformation URL
  // ar_1:1, c_fill, g_face, w_512, h_512, q_auto, f_auto
  const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,ar_1:1,w_512,h_512,g_face,q_auto,f_auto/${result.public_id}.webp`;

  console.log(`✓ Uploaded ${publicIdPrefix}: ${result.width}x${result.height} (${(result.bytes / 1024).toFixed(1)} KB)`);
  console.log(`  Raw URL: ${result.secure_url}`);
  console.log(`  Optimized 1:1 URL: ${optimizedUrl}`);

  return optimizedUrl;
}

async function main() {
  console.log('--- Syncing Portrait Images with Cloudinary & Database ---');

  const darkPath = resolve(rootDir, 'apps/web/public/about/souravbarui-dark-512.png');
  const lightPath = resolve(rootDir, 'apps/web/public/about/souravbarui-light-512.png');

  console.log('1. Uploading dark mode portrait image...');
  const darkUrl = await uploadToCloudinary(darkPath, 'souravbarui_dark');

  console.log('2. Uploading light mode portrait image...');
  const lightUrl = await uploadToCloudinary(lightPath, 'souravbarui_light');

  console.log('3. Updating database SiteSetting table...');
  await prisma.siteSetting.upsert({
    where: { key: 'portrait_image_dark_url' },
    update: { value: darkUrl },
    create: {
      key: 'portrait_image_dark_url',
      value: darkUrl,
      description: 'Optimized 1:1 square portrait image URL for dark mode interactive canvas',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'portrait_image_light_url' },
    update: { value: lightUrl },
    create: {
      key: 'portrait_image_light_url',
      value: lightUrl,
      description: 'Optimized 1:1 square portrait image URL for light mode interactive canvas',
    },
  });

  console.log('✓ Successfully updated database with 1:1 Cloudinary URLs:');
  console.log(`  Dark URL:  ${darkUrl}`);
  console.log(`  Light URL: ${lightUrl}`);
  console.log('--- Done ---');
}

main()
  .catch((err) => {
    console.error('Failed to sync portrait assets:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
