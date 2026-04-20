-- AlterTable
ALTER TABLE "restaurants" ALTER COLUMN "is_available" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "menu_items_menuItemName_idx" ON "menu_items"("menuItemName");
