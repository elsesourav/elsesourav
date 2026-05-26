import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, HelpArticleStatus, SupportTicketStatus, SupportTicketPriority, SupportTicketChannel } from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run db seed.");
  }
  return databaseUrl;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
});

const DAY_MS = 24 * 60 * 60 * 1000;
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

async function main() {
  console.log("Seeding Help Center Demo Content...");

  // 1. Fetch some users to act as authors, support agents, and customers
  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN" }, take: 2 });
  const regularUsers = await prisma.user.findMany({ where: { role: "USER" }, take: 5 });
  const apps = await prisma.app.findMany({ take: 3 });

  if (adminUsers.length === 0 || regularUsers.length === 0 || apps.length === 0) {
    console.error("Please run the main seed first to populate basic Users and Apps.");
    process.exit(1);
  }

  const agent1 = adminUsers[0];
  const agent2 = adminUsers[1] || adminUsers[0];
  const customer1 = regularUsers[0];
  const customer2 = regularUsers[1];
  const customer3 = regularUsers[2];

  // 2. Clear existing help content to avoid duplicates on re-run
  console.log("Cleaning up existing help data...");
  await prisma.helpArticleFeedback.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.helpArticle.deleteMany();
  await prisma.helpCategory.deleteMany();
  await prisma.supportTicketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();

  // 3. Create Categories
  console.log("Creating Help Categories...");
  
  const gettingStartedCat = await prisma.helpCategory.create({
    data: {
      name: "Getting Started",
      slug: "getting-started",
      description: "Everything you need to know to set up your account and install your first app.",
      orderIndex: 10,
    }
  });

  const billingCat = await prisma.helpCategory.create({
    data: {
      name: "Billing & Payments",
      slug: "billing-payments",
      description: "Manage your subscriptions, view invoices, and handle refunds.",
      orderIndex: 20,
    }
  });

  const troubleshootingCat = await prisma.helpCategory.create({
    data: {
      name: "Troubleshooting",
      slug: "troubleshooting",
      description: "Fix common issues and learn how to report bugs effectively.",
      orderIndex: 30,
    }
  });

  // Nested Category
  const appPublishingCat = await prisma.helpCategory.create({
    data: {
      name: "App Publishing",
      slug: "app-publishing",
      description: "Guidelines and steps to publish your own tools to the marketplace.",
      orderIndex: 40,
      parentId: gettingStartedCat.id
    }
  });

  // 4. Create Help Articles
  console.log("Creating Help Articles...");

  const articles = [
    {
      categoryId: gettingStartedCat.id,
      title: "How to Install Apps",
      slug: "how-to-install-apps",
      summary: "A step-by-step guide to installing and configuring applications from our marketplace.",
      isFeatured: true,
      contentMdx: `
# Installing Your First App

Welcome to the ecosystem! Installing an app takes just a few clicks. Whether you are adding a browser extension or downloading a desktop client, our unified marketplace handles the heavy lifting.

## Prerequisites

Before installing any app, ensure you have:
1. **An active account** (Free or Pro).
2. **Supported environment**: Windows 11, macOS 13+, or latest Chrome/Firefox.

## Installation Steps

1. Navigate to the [Marketplace Dashboard](/apps).
2. Browse or search for your desired application.
3. Click the **Download** or **Install** button located on the top right of the app card.

<Callout type="info">
**Note for Chrome Extensions:** Clicking install will redirect you to the Chrome Web Store to complete the process securely.
</Callout>

### Verification

Once installed, the app will appear in your Library under the **Installed** tab. You can manage updates directly from there.

\`\`\`bash
# For developers using the CLI tools
$ es-cli install <app-slug>
\`\`\`

If you run into issues, check our [Troubleshooting Guide](/help/troubleshooting-download-issues).
      `,
      readingTimeMins: 3,
      status: HelpArticleStatus.PUBLISHED,
      publishedAt: daysFromNow(-30),
    },
    {
      categoryId: troubleshootingCat.id,
      title: "Troubleshooting Download Issues",
      slug: "troubleshooting-download-issues",
      summary: "Resolve common errors encountered during app installation or updates.",
      isFeatured: false,
      contentMdx: `
# Troubleshooting Download Issues

Experiencing issues while trying to download or update an app? Follow these steps to resolve the most common problems.

## 1. Clear Your Browser Cache

Stale session data is the #1 cause of download interruptions.
* **Chrome:** \`Cmd + Shift + Delete\` -> Clear cached images and files.
* **Safari:** \`Option + Cmd + E\`

## 2. Check Network Restrictions

If you are on a corporate network, your firewall might be blocking our CDN endpoints.
Ensure the following domains are whitelisted:
* \`cdn.elsesourav.dev\`
* \`downloads.elsesourav.dev\`

<Callout type="warning">
**VPN Users:** Some VPN protocols may cause TLS handshakes to fail. Try temporarily disabling your VPN to see if the download completes.
</Callout>

## 3. Storage Space

Ensure you have at least 500MB of free disk space before initiating large desktop client downloads.
      `,
      readingTimeMins: 2,
      status: HelpArticleStatus.PUBLISHED,
      publishedAt: daysFromNow(-25),
    },
    {
      categoryId: billingCat.id,
      title: "Refund & Billing Support",
      slug: "refund-billing-support",
      summary: "Understand our 14-day refund policy, how to request a refund, and managing payment methods.",
      isFeatured: true,
      contentMdx: `
# Managing Your Billing & Refunds

We want you to be completely satisfied with your purchases. Here is everything you need to know about our billing practices.

## 14-Day Money-Back Guarantee

All one-time purchases and first-time subscription charges are eligible for a full refund within 14 days of the transaction date—no questions asked.

### How to Request a Refund

1. Go to your **Account Settings** -> **Billing**.
2. Locate the transaction in your **Payment History**.
3. Click the **Request Refund** button next to the item.
4. Funds will return to your original payment method within 3-5 business days.

<Callout type="danger">
**Important:** After 14 days, refunds are only granted for technical defects that our support team cannot resolve.
</Callout>

## Updating Payment Methods

To update your credit card on file:
1. Navigate to **Billing Settings**.
2. Click **Add Payment Method**.
3. Set the new card as your **Default**.

We use Stripe for secure payment processing. We do not store your raw card details on our servers.
      `,
      readingTimeMins: 4,
      status: HelpArticleStatus.PUBLISHED,
      publishedAt: daysFromNow(-15),
    },
    {
      categoryId: appPublishingCat.id,
      title: "App Publishing Guidelines",
      slug: "app-publishing-guidelines",
      summary: "Security, quality, and review requirements for submitting apps to the marketplace.",
      isFeatured: false,
      contentMdx: `
# App Publishing Guidelines

To maintain a high-quality ecosystem, all third-party submissions undergo a manual review process. 

## Core Requirements

* **No malicious code:** Apps must pass automated static analysis.
* **Privacy Policy:** All apps handling user data must link a valid privacy policy.
* **Clear Descriptions:** Marketing copy must accurately reflect the app's functionality.

## The Review Process

1. **Submission:** Upload your artifact and metadata via the Developer Portal.
2. **Automated Checks:** Our CI pipeline scans for known vulnerabilities and secret leaks.
3. **Manual Review:** A team member tests the app on target platforms (typically takes 24-48 hours).
4. **Approval:** Once approved, your app goes live instantly.

<Callout type="info">
**Fast Track:** Verified publishers get access to prioritized, expedited review queues.
</Callout>
      `,
      readingTimeMins: 5,
      status: HelpArticleStatus.PUBLISHED,
      publishedAt: daysFromNow(-10),
    },
    {
      categoryId: gettingStartedCat.id,
      title: "API Limits & Usage (Draft)",
      slug: "api-limits-usage",
      summary: "Rate limits and quota management for the developer API.",
      isFeatured: false,
      contentMdx: `
# API Limits (Work in Progress)

Our API enforces rate limits to ensure stability...
(Content being drafted by engineering team)
      `,
      readingTimeMins: 1,
      status: HelpArticleStatus.DRAFT,
      publishedAt: null,
    },
    // App specific article
    {
      categoryId: troubleshootingCat.id,
      appId: apps[0].id,
      title: `Known Issues: ${apps[0].title}`,
      slug: `known-issues-${apps[0].slug}`,
      summary: `Current active bugs and workarounds for ${apps[0].title}.`,
      isFeatured: false,
      contentMdx: `
# Known Issues Tracker

Here we track the active issues for ${apps[0].title} and provide temporary workarounds while our team works on patches.

## 1. Sync failures on slow connections
**Status:** In Progress (Target: v2.5.0)
**Description:** When packet loss is extremely high, the sync queue may stall.
**Workaround:** Restart the application to force a clean handshake.

## 2. Dark mode UI glitches on legacy browsers
**Status:** Investigating
**Description:** Shadows appear completely black instead of soft gray.
**Workaround:** Disable hardware acceleration in your browser settings.
      `,
      readingTimeMins: 2,
      status: HelpArticleStatus.PUBLISHED,
      publishedAt: daysFromNow(-2),
    }
  ];

  for (const art of articles) {
    const created = await prisma.helpArticle.create({
      data: {
        ...art,
        contentMarkdown: art.contentMdx, // fallback
        seoTitle: art.title,
        seoDescription: art.summary,
        createdBy: agent1.id,
        updatedBy: agent1.id,
      }
    });

    // Add some realistic feedback analytics
    if (art.status === HelpArticleStatus.PUBLISHED) {
      await prisma.helpArticle.update({
        where: { id: created.id },
        data: {
          viewCount: Math.floor(Math.random() * 5000) + 100,
          upvotes: Math.floor(Math.random() * 300) + 10,
          downvotes: Math.floor(Math.random() * 20),
        }
      });

      // Insert actual feedback rows
      await prisma.helpArticleFeedback.create({
        data: {
          articleId: created.id,
          userId: customer1.id,
          isHelpful: true,
          comment: "This perfectly answered my question. Thanks!",
          createdAt: daysFromNow(-1),
        }
      });
    }
  }

  // 5. Create FAQs
  console.log("Creating FAQs...");
  const faqs = [
    {
      categoryId: billingCat.id,
      question: "Can I pay with PayPal?",
      answerMdx: "Currently, we only accept major Credit Cards via **Stripe**. PayPal support is on our roadmap for Q4.",
      orderIndex: 1
    },
    {
      categoryId: billingCat.id,
      question: "Where can I download my invoice?",
      answerMdx: "Invoices are automatically emailed to you after a successful charge. You can also download PDF copies directly from your **Account > Billing** dashboard.",
      orderIndex: 2
    },
    {
      categoryId: gettingStartedCat.id,
      question: "Do I need an account to browse apps?",
      answerMdx: "No! You can browse the entire marketplace without an account. However, you will need to register to download or purchase apps.",
      orderIndex: 1
    },
    // App Specific FAQs
    {
      appId: apps[0].id,
      question: `Is ${apps[0].title} available for Mac?`,
      answerMdx: "Yes, it is fully supported on macOS 12 (Monterey) and higher, including Apple Silicon (M1/M2) native binaries.",
      orderIndex: 1
    },
    {
      appId: apps[0].id,
      question: "How do I export my data?",
      answerMdx: "Navigate to **Settings > Data Management > Export**. You can export your data as CSV or JSON.",
      orderIndex: 2
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // 6. Create Support Tickets
  console.log("Creating Support Tickets...");

  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: customer1.id,
      assignedToId: agent1.id,
      subject: "Cannot install extension on Chrome 114",
      description: "Installation error during Chrome Web Store redirect.",
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.HIGH,
      channel: SupportTicketChannel.WEB,
      createdAt: daysFromNow(-1),
      messages: {
        create: [
          {
            authorUserId: customer1.id,
            body: "Hi support, whenever I click install on the marketplace, the Chrome Web Store says the item is not found. I'm on Chrome 114.",
            createdAt: daysFromNow(-1),
          },
          {
            authorUserId: agent1.id,
            body: "Hello! Thanks for reaching out. We are currently rolling out a patch for the extension, which temporarily hid the listing from the store. It should be back up in about 2 hours. I will notify you once it's live.",
            isInternal: false,
            createdAt: daysFromNow(-0.8),
          },
          {
            authorUserId: agent1.id,
            body: "Internal note: Escalated to engineering team (JIRA-892) regarding the propagation delay.",
            isInternal: true,
            createdAt: daysFromNow(-0.75),
          }
        ]
      }
    }
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      userId: customer2.id,
      subject: "Requesting a refund for App purchase",
      description: "App does not meet user requirements, requesting money back.",
      status: SupportTicketStatus.RESOLVED,
      priority: SupportTicketPriority.MEDIUM,
      channel: SupportTicketChannel.EMAIL,
      createdAt: daysFromNow(-5),
      messages: {
        create: [
          {
            authorUserId: customer2.id,
            body: "I purchased this app yesterday but it doesn't fit my workflow. Can I get a refund under the 14-day policy?",
            createdAt: daysFromNow(-5),
          },
          {
            authorUserId: agent2.id,
            body: "Hi there, I'm sorry to hear the app wasn't a good fit. I have processed your refund in full. You should see the funds return to your card within 3-5 business days. Let us know if you need anything else!",
            createdAt: daysFromNow(-4.5),
          }
        ]
      }
    }
  });

  const ticket3 = await prisma.supportTicket.create({
    data: {
      userId: customer3.id,
      subject: "Feature request: Dark mode sync",
      description: "User is asking for OS-level dark mode synchronization.",
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.LOW,
      channel: SupportTicketChannel.WEB,
      createdAt: daysFromNow(-2),
      messages: {
        create: [
          {
            authorUserId: customer3.id,
            body: "Would love it if the app synced its dark mode setting with my macOS system settings automatically.",
            createdAt: daysFromNow(-2),
          }
        ]
      }
    }
  });

  console.log("Seed complete! Created robust demo data for Help Center & Support ecosystem.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
