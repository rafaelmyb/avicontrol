-- CreateIndex
CREATE INDEX "Chicken_userId_createdAt_idx" ON "Chicken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Chicken_userId_name_idx" ON "Chicken"("userId", "name");

-- CreateIndex
CREATE INDEX "Chicken_userId_birthDate_idx" ON "Chicken"("userId", "birthDate");

-- CreateIndex
CREATE INDEX "BroodCycle_chickenId_expectedHatchDate_idx" ON "BroodCycle"("chickenId", "expectedHatchDate");

-- CreateIndex
CREATE INDEX "FeedInventory_userId_purchaseDate_idx" ON "FeedInventory"("userId", "purchaseDate");
