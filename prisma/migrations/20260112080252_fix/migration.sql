/*
  Warnings:

  - Changed the type of `order_status_key` on the `order_statuses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderStatusKey" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'PICKED_UP', 'DELIVERED');

-- AlterTable
ALTER TABLE "order_statuses" DROP COLUMN "order_status_key",
ADD COLUMN     "order_status_key" "OrderStatusKey" NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT true;

-- DropEnum
DROP TYPE "public"."TrackingStatusKey";

-- CreateIndex
CREATE UNIQUE INDEX "order_statuses_order_status_key_key" ON "order_statuses"("order_status_key");
