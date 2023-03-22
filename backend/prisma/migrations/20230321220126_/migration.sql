/*
  Warnings:

  - You are about to drop the `submission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `submission` DROP FOREIGN KEY `submission_teamId_fkey`;

-- DropTable
DROP TABLE `submission`;

-- CreateTable
CREATE TABLE `puzzlesubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `location` INTEGER NOT NULL,

    UNIQUE INDEX `puzzlesubmission_file_key`(`file`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challangesubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `location` INTEGER NOT NULL,
    `number` INTEGER NOT NULL,

    UNIQUE INDEX `challangesubmission_file_key`(`file`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crazy88submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `number` INTEGER NOT NULL,

    UNIQUE INDEX `crazy88submission_file_key`(`file`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `puzzlesubmission` ADD CONSTRAINT `puzzlesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challangesubmission` ADD CONSTRAINT `challangesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crazy88submission` ADD CONSTRAINT `crazy88submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
