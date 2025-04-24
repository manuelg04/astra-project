-- CreateEnum
CREATE TYPE "SpaceGroupRole" AS ENUM ('FAN', 'AUTHOR');

-- AlterTable
ALTER TABLE "space_group_members" ADD COLUMN     "role" "SpaceGroupRole" NOT NULL DEFAULT 'FAN';
