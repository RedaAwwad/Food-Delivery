/*
  Warnings:

  - Added the required column `rating_score` to the `ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "rating_score" "RatingScore" NOT NULL,
ADD COLUMN     "review" TEXT;
