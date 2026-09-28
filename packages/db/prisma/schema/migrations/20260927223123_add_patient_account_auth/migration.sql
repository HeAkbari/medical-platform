-- CreateTable
CREATE TABLE "PatientAccount" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingGoogleRegistration" (
    "token" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingGoogleRegistration_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_patientId_key" ON "PatientAccount"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_phone_key" ON "PatientAccount"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_googleId_key" ON "PatientAccount"("googleId");

-- CreateIndex
CREATE INDEX "AuthSession_accountId_idx" ON "AuthSession"("accountId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PatientAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
