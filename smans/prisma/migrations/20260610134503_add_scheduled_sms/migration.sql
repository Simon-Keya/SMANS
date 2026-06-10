-- CreateTable
CREATE TABLE "scheduled_sms" (
    "id" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "senderId" TEXT NOT NULL DEFAULT 'SMANS',
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_sms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_sms_status_idx" ON "scheduled_sms"("status");

-- CreateIndex
CREATE INDEX "scheduled_sms_scheduledAt_idx" ON "scheduled_sms"("scheduledAt");

-- CreateIndex
CREATE INDEX "scheduled_sms_createdBy_idx" ON "scheduled_sms"("createdBy");
