/*
  Warnings:

  - You are about to drop the `leaderboardsettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `leaderboardsettings`;

-- CreateTable
CREATE TABLE `variables` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
