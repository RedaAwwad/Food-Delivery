/*
  Warnings:

  - You are about to drop the column `isActive` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `order_status_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[role_name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `user_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_status` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_type` to the `user_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH_TOKEN');

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_order_status_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropIndex
DROP INDEX "public"."user_tokens_user_id_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "order_status_id",
ADD COLUMN     "order_status" TEXT NOT NULL,
ADD COLUMN     "tracking_status" TEXT;

-- AlterTable
ALTER TABLE "user_tokens" ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_reason" TEXT,
ADD COLUMN     "token_type" "TokenType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."refresh_tokens";

-- CreateTable
CREATE TABLE "order_tracking_statuses" (
    "tracking_status_id" TEXT NOT NULL,
    "tracking_status_name" TEXT NOT NULL,
    "tracking_status_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_tracking_statuses_pkey" PRIMARY KEY ("tracking_status_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_tracking_statuses_tracking_status_key_key" ON "order_tracking_statuses"("tracking_status_key");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_token_key" ON "user_tokens"("token");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_fkey" FOREIGN KEY ("order_status") REFERENCES "order_statuses"("order_status_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tracking_status_fkey" FOREIGN KEY ("tracking_status") REFERENCES "order_tracking_statuses"("tracking_status_key") ON DELETE SET NULL ON UPDATE CASCADE;
