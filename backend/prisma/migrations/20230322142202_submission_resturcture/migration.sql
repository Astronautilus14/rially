/*
  Warnings:

  - The primary key for the `challangesubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileLink` on the `challangesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `grading` on the `challangesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `challangesubmission` table. All the data in the column will be lost.
  - The primary key for the `crazy88submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileLink` on the `crazy88submission` table. All the data in the column will be lost.
  - You are about to drop the column `grading` on the `crazy88submission` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `crazy88submission` table. All the data in the column will be lost.
  - The primary key for the `puzzlesubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileLink` on the `puzzlesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `grading` on the `puzzlesubmission` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `puzzlesubmission` table. All the data in the column will be lost.
  - Added the required column `submissionId` to the `challangesubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionId` to the `crazy88submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionId` to the `puzzlesubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `challangesubmission` DROP FOREIGN KEY `challangesubmission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `crazy88submission` DROP FOREIGN KEY `crazy88submission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `puzzlesubmission` DROP FOREIGN KEY `puzzlesubmission_teamId_fkey`;

-- DropIndex
DROP INDEX `challangesubmission_fileLink_key` ON `challangesubmission`;

-- DropIndex
DROP INDEX `crazy88submission_fileLink_key` ON `crazy88submission`;

-- DropIndex
DROP INDEX `puzzlesubmission_fileLink_key` ON `puzzlesubmission`;

-- AlterTable
ALTER TABLE `challangesubmission` DROP PRIMARY KEY,
    DROP COLUMN `fileLink`,
    DROP COLUMN `grading`,
    DROP COLUMN `id`,
    ADD COLUMN `submissionId` INTEGER NOT NULL,
    MODIFY `teamId` INTEGER NULL,
    ADD PRIMARY KEY (`submissionId`);

-- AlterTable
ALTER TABLE `crazy88submission` DROP PRIMARY KEY,
    DROP COLUMN `fileLink`,
    DROP COLUMN `grading`,
    DROP COLUMN `id`,
    ADD COLUMN `submissionId` INTEGER NOT NULL,
    MODIFY `teamId` INTEGER NULL,
    ADD PRIMARY KEY (`submissionId`);

-- AlterTable
ALTER TABLE `puzzlesubmission` DROP PRIMARY KEY,
    DROP COLUMN `fileLink`,
    DROP COLUMN `grading`,
    DROP COLUMN `id`,
    ADD COLUMN `submissionId` INTEGER NOT NULL,
    MODIFY `teamId` INTEGER NULL,
    ADD PRIMARY KEY (`submissionId`);

-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(191) NOT NULL DEFAULT 'Miel Monteur';

-- CreateTable
CREATE TABLE `submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `fileLink` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,

    UNIQUE INDEX `submission_fileLink_key`(`fileLink`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `puzzlesubmission` ADD CONSTRAINT `puzzlesubmission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `puzzlesubmission` ADD CONSTRAINT `puzzlesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challangesubmission` ADD CONSTRAINT `challangesubmission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challangesubmission` ADD CONSTRAINT `challangesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crazy88submission` ADD CONSTRAINT `crazy88submission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crazy88submission` ADD CONSTRAINT `crazy88submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
