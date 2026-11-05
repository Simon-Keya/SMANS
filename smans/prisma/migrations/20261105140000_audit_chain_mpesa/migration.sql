ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "prevHash" TEXT;

ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "checkoutRequestId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "mpesaReceipt" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "payments_checkoutRequestId_key" ON "payments"("checkoutRequestId");
