/*
  Warnings:

  - Added the required column `userId` to the `Production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmId` to the `StockItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StockMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Production" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "farmId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "userId" TEXT NOT NULL;
