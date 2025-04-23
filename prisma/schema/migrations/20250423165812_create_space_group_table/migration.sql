-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FREE', 'PAID');

-- DropIndex
DROP INDEX "brands_id_idx";

-- CreateTable
CREATE TABLE "space_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "color" TEXT,
    "emoji" TEXT,
    "pricingType" "PricingType" NOT NULL DEFAULT 'FREE',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_groups_brandId_idx" ON "space_groups"("brandId");

-- AddForeignKey
ALTER TABLE "space_groups" ADD CONSTRAINT "space_groups_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
