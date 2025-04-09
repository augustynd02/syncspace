/*
  Warnings:

  - Made the column `avatar_name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `background_name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar_name" SET NOT NULL,
ALTER COLUMN "background_name" SET NOT NULL;
