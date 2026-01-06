/*
  Warnings:

  - A unique constraint covering the columns `[order_id,customer_id]` on the table `order_tracking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_tracking_order_id_customer_id_key" ON "order_tracking"("order_id", "customer_id");
