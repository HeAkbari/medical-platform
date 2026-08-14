-- CreateTable
CREATE TABLE "PatientClinicIdentity" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "externalPatientId" TEXT NOT NULL,
    "healthNumber" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientClinicIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientClinicIdentity_patientId_clinicId_key" ON "PatientClinicIdentity"("patientId", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientClinicIdentity_clinicId_externalPatientId_key" ON "PatientClinicIdentity"("clinicId", "externalPatientId");

-- AddForeignKey
ALTER TABLE "PatientClinicIdentity" ADD CONSTRAINT "PatientClinicIdentity_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
