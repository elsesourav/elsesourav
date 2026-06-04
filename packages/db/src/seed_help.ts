import { prisma } from "./client";

async function main() {
  console.log("Adding temp categories and articles...");

  const appSupport = await prisma.helpCategory.create({
    data: {
      name: "App Support",
      slug: "app-support",
      description: "Troubleshooting and managing your application integrations.",
      isActive: true,
      orderIndex: 10,
      articles: {
        create: [
          {
            title: "How to connect a new App",
            slug: "connect-new-app",
            summary: "Learn how to link third-party applications to your account.",
            contentMarkdown: "To connect a new app, go to Settings > Integrations and click 'Connect'.\n\nMake sure you have your API keys ready.",
            status: "PUBLISHED",
            publishedAt: new Date(),
            orderIndex: 1,
            readingTimeMins: 2,
          },
          {
            title: "Troubleshooting Connection Issues",
            slug: "troubleshoot-app-connection",
            summary: "Common fixes for when your apps won't sync.",
            contentMarkdown: "If an app fails to sync, try disconnecting and reconnecting it. Check our status page for any ongoing outages.",
            status: "PUBLISHED",
            publishedAt: new Date(),
            orderIndex: 2,
            readingTimeMins: 3,
          }
        ]
      }
    }
  });

  const billing = await prisma.helpCategory.create({
    data: {
      name: "Billing",
      slug: "billing",
      description: "Invoices, subscriptions, and payment methods.",
      isActive: true,
      orderIndex: 11,
      articles: {
        create: [
          {
            title: "How to update your payment method",
            slug: "update-payment-method",
            summary: "Change the credit card on file for your subscription.",
            contentMarkdown: "Navigate to your Billing portal and click 'Update Payment Method'. We accept all major credit cards.",
            status: "PUBLISHED",
            publishedAt: new Date(),
            orderIndex: 1,
            readingTimeMins: 1,
          },
          {
            title: "Understanding your invoice",
            slug: "understanding-invoice",
            summary: "A breakdown of the charges on your monthly bill.",
            contentMarkdown: "Your invoice includes the base subscription fee plus any overages. Overages are billed at $0.05 per extra transaction.",
            status: "PUBLISHED",
            publishedAt: new Date(),
            orderIndex: 2,
            readingTimeMins: 4,
          }
        ]
      }
    }
  });

  console.log("Successfully added categories:", appSupport.name, billing.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
