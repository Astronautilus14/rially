-- CreateTable
CREATE TABLE `submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `description` VARCHAR(191) NOT NULL,
    `location` INTEGER NULL,
    `challangeNumber` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `submission_file_key`(`file`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
