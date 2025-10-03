/*
  Warnings:

  - You are about to drop the column `cover_image` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Blog" DROP COLUMN "cover_image",
ADD COLUMN     "cover_imageId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "cover_image",
ADD COLUMN     "cover_imageId" INTEGER;

-- CreateTable
CREATE TABLE "public"."MediaFile" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_url_key" ON "public"."MediaFile"("url");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_hash_key" ON "public"."MediaFile"("hash");

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_cover_imageId_fkey" FOREIGN KEY ("cover_imageId") REFERENCES "public"."MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_cover_imageId_fkey" FOREIGN KEY ("cover_imageId") REFERENCES "public"."MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaFile" ADD CONSTRAINT "MediaFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
