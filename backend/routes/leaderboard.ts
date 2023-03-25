import express from "express";
import prisma from "../database";

const router = express.Router();

router.get("/", async (req, res) => {
  const teams = await prisma.$queryRaw`
  SELECT SUM(t.grading) AS score, team.name, team.id
  FROM (
    SELECT grading, teamId FROM challangesubmission
    UNION
    SELECT grading, teamId FROM crazy88submission
  ) AS t, team
  WHERE t.teamId = team.id
  AND team.isCommittee = 0
  GROUP BY t.teamId
`;
  res.json({ teams });
});

export default router;
