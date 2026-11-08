import { execSync } from 'child_process';
import http from 'http';

function checkReady() {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/about', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  console.log('Checking server status...');
  const isOk = await checkReady();
  if (!isOk) {
    console.error('Server not responding with 200');
    process.exit(1);
  }
  console.log('Server is 200 OK! Taking screenshots...');

  const targets = [
    { name: 'mobile', w: 350, h: 750, path: '/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_mobile_350x750.png' },
    { name: 'tablet', w: 768, h: 1024, path: '/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_tablet_768x1024.png' },
    { name: 'desktop', w: 1280, h: 950, path: '/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_desktop_1280x950.png' }
  ];

  for (const t of targets) {
    console.log(`Capturing ${t.name} (${t.w}x${t.h})...`);
    execSync(`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=${t.w},${t.h} --screenshot="${t.path}" http://localhost:3001/about`);
    console.log(`✓ ${t.name} captured`);
  }
  console.log('All screenshots captured successfully!');
}

main();
