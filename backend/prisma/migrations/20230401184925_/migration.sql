-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `discordId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Unknwown',
    `password` VARCHAR(191) NULL,
    `teamId` INTEGER NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_discordId_key`(`discordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isCommittee` BOOLEAN NOT NULL DEFAULT false,
    `channelId` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,

    UNIQUE INDEX `team_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `puzzlesubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `fileLink` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `location` INTEGER NOT NULL,
    `isFunny` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `puzzlesubmission_fileLink_key`(`fileLink`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challangesubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `fileLink` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `location` INTEGER NOT NULL,
    `number` INTEGER NOT NULL,
    `isFunny` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `challangesubmission_fileLink_key`(`fileLink`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crazy88submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `fileLink` VARCHAR(191) NOT NULL,
    `grading` INTEGER NULL,
    `number` INTEGER NOT NULL,
    `isFunny` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `crazy88submission_fileLink_key`(`fileLink`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variables` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `puzzlesubmission` ADD CONSTRAINT `puzzlesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challangesubmission` ADD CONSTRAINT `challangesubmission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crazy88submission` ADD CONSTRAINT `crazy88submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
