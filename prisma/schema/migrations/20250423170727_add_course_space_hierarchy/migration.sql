/*
  Warnings:

  - You are about to drop the column `spaceGroupId` on the `courses` table. All the data in the column will be lost.
  - Added the required column `courseSpaceId` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_spaceGroupId_fkey";

-- DropIndex
DROP INDEX "courses_spaceGroupId_idx";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "spaceGroupId",
ADD COLUMN     "courseSpaceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "course_spaces" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "spaceGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_spaces_spaceGroupId_idx" ON "course_spaces"("spaceGroupId");

-- CreateIndex
CREATE INDEX "courses_courseSpaceId_idx" ON "courses"("courseSpaceId");

-- AddForeignKey
ALTER TABLE "course_spaces" ADD CONSTRAINT "course_spaces_spaceGroupId_fkey" FOREIGN KEY ("spaceGroupId") REFERENCES "space_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseSpaceId_fkey" FOREIGN KEY ("courseSpaceId") REFERENCES "course_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
