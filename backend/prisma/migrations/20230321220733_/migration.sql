/*
  Warnings:

  - You are about to drop the column `file` on the `challangesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `crazy88submission` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `puzzlesubmission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileLink]` on the table `challangesubmission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileLink]` on the table `crazy88submission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileLink]` on the table `puzzlesubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileLink` to the `challangesubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileLink` to the `crazy88submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileLink` to the `puzzlesubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `challangesubmission_file_key` ON `challangesubmission`;

-- DropIndex
DROP INDEX `crazy88submission_file_key` ON `crazy88submission`;

-- DropIndex
DROP INDEX `puzzlesubmission_file_key` ON `puzzlesubmission`;

-- AlterTable
ALTER TABLE `challangesubmission` DROP COLUMN `file`,
    ADD COLUMN `fileLink` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `crazy88submission` DROP COLUMN `file`,
    ADD COLUMN `fileLink` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `puzzlesubmission` DROP COLUMN `file`,
    ADD COLUMN `fileLink` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `challangesubmission_fileLink_key` ON `challangesubmission`(`fileLink`);

-- CreateIndex
CREATE UNIQUE INDEX `crazy88submission_fileLink_key` ON `crazy88submission`(`fileLink`);

-- CreateIndex
CREATE UNIQUE INDEX `puzzlesubmission_fileLink_key` ON `puzzlesubmission`(`fileLink`);
