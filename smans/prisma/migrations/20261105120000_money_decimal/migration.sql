-- Convert money amounts from double precision to Decimal(12,2)
-- Existing float values are cast; review data if precision issues appear.

ALTER TABLE "fee_items" ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING ("amount"::numeric(12,2));
ALTER TABLE "invoices" ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING ("amount"::numeric(12,2));
ALTER TABLE "payments" ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING ("amount"::numeric(12,2));
