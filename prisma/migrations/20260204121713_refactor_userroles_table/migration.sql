/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_user_id_fkey";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "addresses" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "addresses" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roles" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "users_roles";
