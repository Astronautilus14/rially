/*
  Warnings:

  - You are about to drop the column `isCommitte` on the `team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `team` DROP COLUMN `isCommitte`,
    ADD COLUMN `isCommittee` BOOLEAN NOT NULL DEFAULT false;
