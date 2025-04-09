/*
  Warnings:

  - You are about to drop the column `imageName` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageName",
ADD COLUMN     "image_name" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_name" TEXT,
ADD COLUMN     "background_name" TEXT;
