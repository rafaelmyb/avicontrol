-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('pre_inicial', 'crescimento', 'postura');

-- Migrate existing data: map any value not in enum to postura
UPDATE "FeedInventory" SET "feedType" = 'postura' WHERE "feedType" NOT IN ('pre_inicial', 'crescimento', 'postura');

-- AlterTable
ALTER TABLE "FeedInventory" ALTER COLUMN "feedType" TYPE "FeedType" USING ("feedType"::"FeedType");
