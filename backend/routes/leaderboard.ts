import express from "express";
import prisma from "../utils/database";
import sendError from "../utils/sendError";
import { isCommittee, teamCheck, tokenCheck } from "./auth";

const router = express.Router();

// Method to get the public leaderboard
router.get("/public", async (req, res) => {
  // Check if the leaderboard is set to public
  if ((await prisma.variables.findUnique({
      where: { key: "publicLeaderboard" },
    }))?.value === "true") 
    return sendError(res, "The leaderboard is currently turned off!", 200);

  res.json({ teams: await getLeaderboard() });
});

// Method to get the leaderboard as a committee member
router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  res.json({ teams: await getLeaderboard() });  
});

// Helper function that queries the leaderboard from the database
async function getLeaderboard() {
  return await prisma.$queryRaw`
    SELECT * FROM (
      (
        SELECT SUM(cs.grading) AS score, team.id, team.name, team.isCommittee
        FROM challangesubmission AS cs, team
        WHERE team.id = cs.teamId
        GROUP BY team.id
      )
      UNION
      (
        SELECT SUM(crazy.grading) AS score, team.id, team.name, team.isCommittee
        FROM crazy88submission AS crazy, team
        WHERE team.id = crazy.teamId
        GROUP BY team.id
      )
      UNION 
      (
        SELECT SUM(ps.grading) AS score, team.id, team.name, team.isCommittee
        FROM puzzlesubmission AS ps, team
        WHERE ps.teamId = team.id
        GROUP BY team.id
      )
      UNION
      (
        SELECT 0 AS score, team.id, team.name, team.isCommittee
        FROM team
      )
    ) AS t
    WHERE t.isCommittee = 0
    GROUP BY t.id
    ORDER BY t.score DESC;
  `;
}

// Method to change the leaderboard between public and private
router.patch("/", tokenCheck, teamCheck, isCommittee, (req, res) => {
  const { setPublic }: { setPublic: boolean } = req.body;
  if (typeof setPublic !== "boolean")
    return res.status(400).json({ message: "setPublic is required" });

  prisma.variables
    .upsert({
      where: { key: "publicLeaderboard" },
      update: { value: setPublic.toString() },
      create: { key: "publicLeaderboard", value: setPublic.toString() },
    })
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      sendError(res);
    });
});

export default router;
