import express from "express";
import prisma from "../utils/database";
import sendError from "../utils/sendError";
import { isCommittee, teamCheck, tokenCheck } from "./auth";

const router = express.Router();

// Method to get the public leaderboard
router.get("/public", async (req, res) => {
  // Check if the leaderboard is set to public
  if (
    (
      await prisma.variables.findUnique({
        where: { key: "publicLeaderboard" },
      })
    )?.value === "true"
  )
    return sendError(res, "The leaderboard is currently turned off!", 200);

  res.json({ teams: await getLeaderboard() });
});

// Method to get the leaderboard as a committee member
router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  res.json({ teams: await getLeaderboard() });
});

// Helper function that queries the leaderboard from the database
async function getLeaderboard() {
  const scores = await prisma.team.findMany({
    where: { isCommittee: false },
    include: {
      Submissions: {
        where: { grading: { not: null } },
      },
    },
  });
  return scores
    .map((team) => {
      const score = team.Submissions.reduce(
        (acc, curr) => acc + curr.grading!,
        0
      );
      return {
        id: team.id,
        name: team.name,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Method to change the leaderboard between public and private
router.patch("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { setPublic }: { setPublic: boolean } = req.body;
  if (typeof setPublic !== "boolean") {
    return res.status(400).json({ message: "setPublic is required" });
  }

  const key = "publicLeaderboard";
  try {
    await prisma.variables.upsert({
      where: { key },
      update: { value: setPublic.toString() },
      create: { key, value: setPublic.toString() },
    });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    return sendError(res);
  }
});

export default router;
