/*
  Warnings:

  - A unique constraint covering the columns `[releaseHash]` on the table `pluginRelease` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `exteraPlugin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `downloads` to the `pluginRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseHash` to the `pluginRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pluginRelease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pluginRelease" DROP CONSTRAINT "pluginRelease_pluginId_fkey";

-- AlterTable
ALTER TABLE "exteraPlugin" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "forkOriginId" TEXT,
ADD COLUMN     "reactions" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "targetPlatform" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pluginRelease" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "downloads" INTEGER NOT NULL,
ADD COLUMN     "reactions" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "releaseHash" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "pluginStars" (
    "userId" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "pluginStars_pkey" PRIMARY KEY ("userId","pluginId")
);

-- CreateIndex
CREATE UNIQUE INDEX "pluginRelease_releaseHash_key" ON "pluginRelease"("releaseHash");

-- AddForeignKey
ALTER TABLE "exteraPlugin" ADD CONSTRAINT "exteraPlugin_forkOriginId_fkey" FOREIGN KEY ("forkOriginId") REFERENCES "exteraPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginRelease" ADD CONSTRAINT "pluginRelease_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "exteraPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginStars" ADD CONSTRAINT "pluginStars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginStars" ADD CONSTRAINT "pluginStars_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "exteraPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
