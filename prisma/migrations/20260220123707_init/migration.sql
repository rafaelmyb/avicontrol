-- CreateEnum
CREATE TYPE "ChickenStatus" AS ENUM ('chick', 'pullet', 'laying', 'brooding', 'recovering', 'retired', 'sold', 'deceased');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chicken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "status" "ChickenStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chicken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroodCycle" (
    "id" TEXT NOT NULL,
    "chickenId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "eggCount" INTEGER NOT NULL,
    "expectedHatchDate" TIMESTAMP(3) NOT NULL,
    "expectedReturnToLayDate" TIMESTAMP(3) NOT NULL,
    "actualHatchedCount" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroodCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feedType" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "consumptionPerBirdGrams" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Chicken_userId_idx" ON "Chicken"("userId");

-- CreateIndex
CREATE INDEX "BroodCycle_chickenId_idx" ON "BroodCycle"("chickenId");

-- CreateIndex
CREATE INDEX "FeedInventory_userId_idx" ON "FeedInventory"("userId");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_userId_date_idx" ON "Expense"("userId", "date");

-- CreateIndex
CREATE INDEX "Revenue_userId_idx" ON "Revenue"("userId");

-- CreateIndex
CREATE INDEX "Revenue_userId_date_idx" ON "Revenue"("userId", "date");

-- AddForeignKey
ALTER TABLE "Chicken" ADD CONSTRAINT "Chicken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroodCycle" ADD CONSTRAINT "BroodCycle_chickenId_fkey" FOREIGN KEY ("chickenId") REFERENCES "Chicken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
