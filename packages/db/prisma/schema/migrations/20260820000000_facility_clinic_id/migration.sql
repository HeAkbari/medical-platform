-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "clinicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Facility_clinicId_key" ON "Facility"("clinicId");
