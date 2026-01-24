/*
  Warnings:

  - A unique constraint covering the columns `[restaurantName]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "restaurants_restaurantName_key" ON "restaurants"("restaurantName");
