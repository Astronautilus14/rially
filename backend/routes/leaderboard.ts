import express from "express";
import prisma, { sendError } from "../database";
import { isCommittee, teamCheck, tokenCheck } from "./auth";

const router = express.Router();

router.get("/public", async (req, res) => {
  const isPublic =
    (await prisma.variables.findUnique({
      where: { key: "publicLeaderboard" },
    }))!.value === "true"
      ? true
      : false;

  if (!isPublic)
    return sendError(res, "The leaderboard is currently turned off!", 200);

  const teams = await prisma.$queryRaw`
  SELECT * FROM (
    (
      SELECT SUM(cs.grading) AS score, team.id, team.name
      FROM challangesubmission AS cs, team
      WHERE team.id = cs.teamId
      GROUP BY team.id
    )
    UNION
    (
      SELECT SUM(crazy.grading) AS score, team.id, team.name
      FROM crazy88submission AS crazy, team
      WHERE team.id = crazy.teamId
      GROUP BY team.id
    )
    UNION 
    (
      SELECT SUM(ps.grading) AS score, team.id, team.name
      FROM puzzlesubmission AS ps, team
      WHERE ps.teamId = team.id
      GROUP BY team.id
    )
  ) AS t
  GROUP BY t.id
  ORDER BY t.score DESC;
`;
  res.json({ teams });
});

router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const teams = await prisma.$queryRaw`
  SELECT SUM(t.grading) AS score, team.name, team.id
  FROM (
    SELECT grading, teamId FROM challangesubmission
    UNION
    SELECT grading, teamId FROM crazy88submission
    UNION
    SELECT grading, teamId FROM puzzlesubmission
  ) AS t, team
  WHERE t.teamId = team.id
  AND team.isCommittee = 0
  GROUP BY t.teamId
  ORDER BY score DESC;
`;
  res.json({ teams });
});

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
