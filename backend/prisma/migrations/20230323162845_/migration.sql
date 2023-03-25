/*
  Warnings:

  - You are about to drop the column `grading` on the `puzzlesubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `challangesubmission` ADD COLUMN `isFunny` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `crazy88submission` ADD COLUMN `isFunny` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `puzzlesubmission` DROP COLUMN `grading`,
    ADD COLUMN `isFunny` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` ENUM('NEED_GRADING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'NEED_GRADING';
