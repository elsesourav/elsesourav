import { prisma } from '@elsesourav/db';

async function main() {
  const token = 'cb2348027f0ab0f24ff5c0ae0c99d01a59c9ca4000f55cecc25973cffd7abaa4';
  const baseUrl = 'http://localhost:4004/v1/admin/content/help';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-token': token,
    'x-user-role': 'ADMIN'
  };

  async function api(path: string, method = 'GET', body: any = null) {
    const options: RequestInit = { method, headers: { ...headers } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${path}`, options);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error ${res.status} on ${method} ${path}: ${err}`);
    }
    return res.json();
  }

  console.log('--- Wiping existing Help Center content via Prisma ---');
  
  // Safely hard delete all Help Center related tables to clear unique constraints
  await prisma.fAQ.deleteMany({});
  await prisma.helpArticle.deleteMany({});
  await prisma.helpCategory.deleteMany({});
  
  console.log('Database wiped successfully.');
  console.log('--- Seeding new Help Center content via Admin APIs ---');

  // Helper to create category
  async function createCategory(name: string, slug: string, orderIndex: number, parentId: string | undefined = undefined): Promise<any> {
    const res = await api('/categories', 'POST', {
      name, slug, orderIndex, parentId
    });
    return res.data;
  }

  // Helper to create article
  async function createArticle(title: string, slug: string, summary: string, contentMarkdown: string, categoryId: string, orderIndex: number): Promise<any> {
    const res = await api('/articles', 'POST', {
      title, slug, summary, contentMarkdown, categoryId, status: 'PUBLISHED'
    });
    return res.data;
  }

  // Helper to create FAQ
  async function createFAQ(question: string, answerMdx: string, categoryId: string, orderIndex: number) {
    const res = await api('/faqs', 'POST', {
      question, answerMdx, categoryId, orderIndex
    });
    return res.data;
  }

  // CATEGORY 1: Getting Started
  const c1 = await createCategory("Getting Started", "getting-started", 0);
  
  await createArticle(
    "Creating Account", "creating-account", 
    "Learn how to create a new account in three simple steps.",
    "# Account Creation\n\nWelcome! To create an account:\n\n## Step 1: Sign Up\nNavigate to the registration page and enter your email.\n\n## Step 2: Verification\nCheck your email for the verification link.\n\n## Step 3: Profile Setup\nFill in your profile details to get started.",
    c1.id, 0
  );

  await createArticle(
    "Installing Apps", "installing-apps", 
    "A guide on how to install our applications.",
    "# Application Installation\n\nHere is how you can install apps:\n\n## Desktop App\nDownload the `.dmg` or `.exe` from your dashboard.\n\n## Mobile App\nVisit the App Store or Google Play Store.",
    c1.id, 1
  );

  await createArticle(
    "First Download", "first-download", 
    "Downloading your first resource.",
    "# Your First Download\n\n## Locating Files\nGo to your library tab to see available downloads.\n\n## Download Speeds\nIf speeds are slow, check your connection.",
    c1.id, 2
  );

  // CATEGORY 2: Troubleshooting
  const c2 = await createCategory("Troubleshooting", "troubleshooting", 1);

  await createArticle(
    "Known Issues", "known-issues", 
    "Currently tracked bugs and their status.",
    "# Known Issues (v1.0.4)\n\n## Login Screen Freeze\nSome users report the login screen freezing on Safari. We are investigating.\n\n## Missing Avatars\nAvatars may occasionally fail to load.",
    c2.id, 0
  );

  await createArticle(
    "Download Problems", "download-problems", 
    "Fixing stuck or failed downloads.",
    "# Download Failures\n\n## Corrupted Files\nIf your file says it is corrupted, try redownloading.\n\n## Network Drops\nDownloads support resume functionality.",
    c2.id, 1
  );



  // CATEGORY 3: Billing
  const c3 = await createCategory("Billing", "billing", 2);

  await createArticle(
    "Payments", "payments", 
    "Accepted payment methods and cycles.",
    "# Payment Methods\n\n## Credit Cards\nWe accept Visa, MasterCard, and Amex.\n\n## PayPal\nYou can link your PayPal account during checkout.",
    c3.id, 0
  );

  await createArticle(
    "Refunds", "refunds", 
    "Our refund policy.",
    "# Refund Policy\n\n## 14-Day Guarantee\nWe offer a full refund within 14 days of purchase.\n\n## Requesting a Refund\nContact support with your transaction ID.",
    c3.id, 1
  );

  await createArticle(
    "Subscriptions", "subscriptions", 
    "Managing your monthly or yearly plans.",
    "# Subscription Management\n\n## Upgrading\nYou can upgrade at any time from your settings.\n\n## Canceling\nCancel before your next billing cycle to avoid charges.",
    c3.id, 2
  );

  // CATEGORY 4: FAQs
  const c4 = await createCategory("FAQs", "faqs", 3);

  await createFAQ(
    "Why is my download failing?",
    "Downloads usually fail due to strict firewall settings or VPNs. Try disabling your VPN temporarily.",
    c4.id,
    0
  );

  await createFAQ(
    "Installation failed, what should I do?",
    "Make sure you have administrator privileges on your computer. On Mac, you may need to allow the app in System Settings > Privacy & Security.",
    c4.id,
    1
  );

  console.log('--- Successfully seeded fresh Help Center structure! ---');
  await prisma.$disconnect();
}

main().catch(console.error);
