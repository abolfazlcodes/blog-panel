/*
  Warnings:

  - You are about to drop the `BlogImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BlogImage" DROP CONSTRAINT "BlogImage_blogId_fkey";

-- DropTable
DROP TABLE "public"."BlogImage";
