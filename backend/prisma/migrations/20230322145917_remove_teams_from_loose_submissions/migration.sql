/*
  Warnings:

  - You are about to drop the column `teamId` on the `challangesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `crazy88submission` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `puzzlesubmission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `challangesubmission` DROP FOREIGN KEY `challangesubmission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `crazy88submission` DROP FOREIGN KEY `crazy88submission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `puzzlesubmission` DROP FOREIGN KEY `puzzlesubmission_teamId_fkey`;

-- AlterTable
ALTER TABLE `challangesubmission` DROP COLUMN `teamId`;

-- AlterTable
ALTER TABLE `crazy88submission` DROP COLUMN `teamId`;

-- AlterTable
ALTER TABLE `puzzlesubmission` DROP COLUMN `teamId`;
