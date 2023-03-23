-- DropForeignKey
ALTER TABLE `challangesubmission` DROP FOREIGN KEY `challangesubmission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `crazy88submission` DROP FOREIGN KEY `crazy88submission_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `puzzlesubmission` DROP FOREIGN KEY `puzzlesubmission_teamId_fkey`;

-- AddForeignKey
ALTER TABLE `puzzlesubmission` ADD CONSTRAINT `puzzlesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challangesubmission` ADD CONSTRAINT `challangesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crazy88submission` ADD CONSTRAINT `crazy88submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
