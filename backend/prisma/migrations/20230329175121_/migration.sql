-- CreateTable
CREATE TABLE `leaderboardSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `public` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
