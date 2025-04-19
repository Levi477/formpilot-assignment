/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiUri]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiUri` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "apiUri" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Data" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "txhash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_apiUri_key" ON "User"("apiUri");

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
