-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "chickenId" TEXT,
ADD COLUMN "feedInventoryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_chickenId_key" ON "Expense"("chickenId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_feedInventoryId_key" ON "Expense"("feedInventoryId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_chickenId_fkey" FOREIGN KEY ("chickenId") REFERENCES "Chicken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_feedInventoryId_fkey" FOREIGN KEY ("feedInventoryId") REFERENCES "FeedInventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
