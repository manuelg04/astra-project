-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "color" TEXT,
    "logoUrl" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brands_id_idx" ON "brands"("id");

-- CreateIndex
CREATE INDEX "brands_createdAt_idx" ON "brands"("createdAt");

-- CreateIndex
CREATE INDEX "brands_updatedAt_idx" ON "brands"("updatedAt");

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
