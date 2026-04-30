-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_payment_method_id_fkey";

-- CreateTable
CREATE TABLE "payment_attempts" (
    "idempotency_key" TEXT NOT NULL,
    "order_id" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "transaction_id" TEXT,
    "response_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("idempotency_key")
);

-- CreateTable
CREATE TABLE "refunds" (
    "refund_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_attempt_id" TEXT NOT NULL,
    "refund_transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("refund_id")
);

-- CreateTable
CREATE TABLE "provider_customers" (
    "provider_customer_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_customers_pkey" PRIMARY KEY ("provider_customer_id")
);

-- CreateIndex
CREATE INDEX "payment_attempts_order_id_idx" ON "payment_attempts"("order_id");

-- CreateIndex
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts"("status");

-- CreateIndex
CREATE INDEX "payment_attempts_created_at_idx" ON "payment_attempts"("created_at");

-- CreateIndex
CREATE INDEX "refunds_order_id_idx" ON "refunds"("order_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "provider_customers_provider_idx" ON "provider_customers"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "provider_customers_customer_id_provider_key" ON "provider_customers"("customer_id", "provider");

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_customers" ADD CONSTRAINT "provider_customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_preferred_payment_settings_id_fkey" FOREIGN KEY ("preferred_payment_settings_id") REFERENCES "preferred_payment_settings"("preferred_payment_settings_id") ON DELETE RESTRICT ON UPDATE CASCADE;
