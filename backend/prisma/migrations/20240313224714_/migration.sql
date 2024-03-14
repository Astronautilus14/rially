-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `discordId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Unknwown',
    `password` VARCHAR(191) NULL,
    `teamId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_discordId_key`(`discordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isCommittee` BOOLEAN NOT NULL DEFAULT false,
    `channelId` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,

    UNIQUE INDEX `Team_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `fileLink` VARCHAR(275) NOT NULL,
    `isFunny` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `grading` INTEGER NULL,
    `type` ENUM('PUZZLE', 'CHALLENGE', 'CRAZY88') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PuzzleSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` INTEGER NOT NULL,
    `submissionId` INTEGER NOT NULL,

    UNIQUE INDEX `PuzzleSubmission_submissionId_key`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChallengeSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` INTEGER NOT NULL,
    `number` INTEGER NOT NULL,
    `submissionId` INTEGER NOT NULL,

    UNIQUE INDEX `ChallengeSubmission_submissionId_key`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Crazy88Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `submissionId` INTEGER NOT NULL,

    UNIQUE INDEX `Crazy88Submission_submissionId_key`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Variables` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PuzzleSubmission` ADD CONSTRAINT `PuzzleSubmission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChallengeSubmission` ADD CONSTRAINT `ChallengeSubmission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Crazy88Submission` ADD CONSTRAINT `Crazy88Submission_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
