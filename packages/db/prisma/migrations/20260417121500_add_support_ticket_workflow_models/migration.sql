-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_USER',
  'RESOLVED',
  'CLOSED'
);

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

-- CreateEnum
CREATE TYPE "SupportTicketChannel" AS ENUM (
  'WEB',
  'EMAIL',
  'CHAT',
  'API'
);

-- CreateTable
CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "app_id" TEXT,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "category" TEXT,
  "channel" "SupportTicketChannel" NOT NULL DEFAULT 'WEB',
  "source_url" TEXT,
  "assigned_to" TEXT,
  "first_response_at" TIMESTAMP(3),
  "resolved_at" TIMESTAMP(3),
  "closed_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_messages" (
  "id" TEXT NOT NULL,
  "ticket_id" TEXT NOT NULL,
  "author_user_id" TEXT,
  "author_type" TEXT NOT NULL DEFAULT 'USER',
  "body" TEXT NOT NULL,
  "is_internal" BOOLEAN NOT NULL DEFAULT false,
  "attachments" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_tickets_user_id_created_at_idx" ON "support_tickets"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "support_tickets_app_id_created_at_idx" ON "support_tickets"("app_id", "created_at");

-- CreateIndex
CREATE INDEX "support_tickets_status_priority_updated_at_idx" ON "support_tickets"("status", "priority", "updated_at");

-- CreateIndex
CREATE INDEX "support_tickets_assigned_to_status_idx" ON "support_tickets"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "support_ticket_messages_ticket_id_created_at_idx" ON "support_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "support_ticket_messages_author_user_id_created_at_idx" ON "support_ticket_messages"("author_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES "apps"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_assigned_to_fkey"
  FOREIGN KEY ("assigned_to") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_messages"
  ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey"
  FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_messages"
  ADD CONSTRAINT "support_ticket_messages_author_user_id_fkey"
  FOREIGN KEY ("author_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
