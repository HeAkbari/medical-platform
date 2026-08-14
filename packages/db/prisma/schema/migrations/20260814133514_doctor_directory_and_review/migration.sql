-- DropIndex
DROP INDEX "Doctor_email_key";

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "externalProviderId" TEXT NOT NULL,
ADD COLUMN     "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_clinicId_externalProviderId_key" ON "Doctor"("clinicId", "externalProviderId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

