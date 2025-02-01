/*
  Warnings:

  - You are about to drop the column `displayLocation` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Location` table. All the data in the column will be lost.
  - The primary key for the `UserAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `city` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserAssessment" DROP CONSTRAINT "UserAssessment_certificateId_fkey";

-- DropIndex
DROP INDEX "Location_location_key";

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "displayLocation",
DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserAssessment" DROP CONSTRAINT "UserAssessment_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "certificateId" DROP NOT NULL,
ADD CONSTRAINT "UserAssessment_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "UserAssessment" ADD CONSTRAINT "UserAssessment_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
