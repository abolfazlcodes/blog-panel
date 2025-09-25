-- CreateTable
CREATE TABLE "public"."BlogImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "blogId" INTEGER,
    "userId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogImage_hash_key" ON "public"."BlogImage"("hash");

-- AddForeignKey
ALTER TABLE "public"."BlogImage" ADD CONSTRAINT "BlogImage_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
