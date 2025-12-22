/*
  Warnings:

  - You are about to drop the column `order_status_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order_status_key` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrackingStatusKey" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'PICKED_UP', 'DELIVERED');

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_order_status_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_methods" DROP CONSTRAINT "payment_methods_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "order_status_id",
ADD COLUMN     "order_status_key" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."refresh_tokens";

-- CreateTable
CREATE TABLE "RefreshToken" (
    "refresh_token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "device_type" TEXT,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refresh_token_id")
);

-- CreateTable
CREATE TABLE "order_tracking" (
    "order_tracking_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "tracking_status_name" TEXT NOT NULL,
    "tracking_status_key" "TrackingStatusKey" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("order_tracking_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_key_fkey" FOREIGN KEY ("order_status_key") REFERENCES "order_statuses"("order_status_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_preferred_payment_settings_id_fkey" FOREIGN KEY ("preferred_payment_settings_id") REFERENCES "preferred_payment_settings"("preferred_payment_settings_id") ON DELETE RESTRICT ON UPDATE CASCADE;
