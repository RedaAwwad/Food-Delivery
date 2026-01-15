/*
  Warnings:

  - You are about to drop the column `is_revoked` on the `user_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revoked_at` on the `user_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revoked_reason` on the `user_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_tokens" DROP COLUMN "is_revoked",
DROP COLUMN "revoked_at",
DROP COLUMN "revoked_reason";
