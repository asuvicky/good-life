-- AlterTable
ALTER TABLE "Household" ADD COLUMN "phoneLast3" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "LineConversation" ADD COLUMN "householdNumber" TEXT;

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resident_username_key" ON "Resident"("username");

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
