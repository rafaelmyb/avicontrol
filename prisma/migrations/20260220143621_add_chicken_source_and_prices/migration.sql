-- CreateEnum
CREATE TYPE "ChickenSource" AS ENUM ('purchased', 'hatched');

-- AlterTable
ALTER TABLE "Chicken" ADD COLUMN     "purchasePrice" DOUBLE PRECISION,
ADD COLUMN     "source" "ChickenSource" NOT NULL DEFAULT 'purchased';
