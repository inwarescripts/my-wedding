-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('pending', 'uploaded');

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'pending';
