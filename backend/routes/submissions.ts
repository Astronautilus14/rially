import express from "express";
import type { Response, NextFunction } from "express";
import type { Request } from "../types";
import prisma, { sendError } from "../database";
import {
  isCommittee,
  teamCheck,
  tokenCheck,
  checkBotApiKey,
  checkDiscordId,
} from "./auth";
import io from "../socket";
import axios from "axios";

const router = express.Router();

router.post(
  "/puzzle",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req, res) => {
    const { fileLink }: { fileLink: string } = req.body;
    if (!fileLink) return sendError(res, "File link required", 400);

    // Figure out where they are now
    const puzzleSubmissions = await prisma.puzzlesubmission.findMany({
      where: {
        // @ts-expect-error
        teamId: req.data.team.id,
      },
    });
    const location = puzzleSubmissions.length + 1;
    for (const submission of puzzleSubmissions) {
      if (submission.grading === null)
        return sendError(
          res,
          `Your team already submitted a puzzle for location ${
            location - 1
          }. Your submition will be graded as soon as possible.`,
          400
        );
    }

    let submission;
    try {
      submission = await prisma.puzzlesubmission.create({
        data: {
          // @ts-expect-error
          teamId: req.data.team.id,
          location,
          fileLink,
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }

    res.json({
      message: `Your submission for puzzle location ${location} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.id, "puzzle");
  }
);

router.post(
  "/challange",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req, res) => {
    const { fileLink, number }: { fileLink: string; number: number } = req.body;
    if (!fileLink || !number)
      return sendError(res, "File link and Number required", 400);

    // Figure out where they are now
    const gradedSubmissions = await prisma.puzzlesubmission.findMany({
      where: {
        // @ts-expect-error
        teamId: req.data.team.id,
        NOT: {
          grading: null,
        },
      },
    });
    const location = gradedSubmissions.length;

    // Figure out if they already submitted
    const challangeSubmissions = await prisma.challangesubmission.findMany({
      where: {
        // @ts-expect-error
        teamId: req.data.team.id,
      },
    });
    for (const submission of challangeSubmissions) {
      if (submission.location === location && submission.number === number)
        return sendError(
          res,
          `Your team already submitted location challange ${number} for location ${location}. ${
            "Your submission will be graded as soon as possible"
              ? submission.grading === null
              : ""
          }`,
          400
        );
    }

    let submission;
    try {
      submission = await prisma.challangesubmission.create({
        data: {
          // @ts-expect-error
          teamId: req.data.team.id,
          location,
          fileLink,
          number,
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }

    res.json({
      message: `Your submission for location challange ${number} at location ${location} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.id, "challange");
  }
);

router.post(
  "/crazy88",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req, res) => {
    const { fileLink, number }: { fileLink: string; number: number } = req.body;
    if (!fileLink || !number)
      return sendError(res, "File link and Number required", 400);

    // Figure out weather they already submitted
    const crazy88submissions = await prisma.crazy88submission.findMany({
      where: {
        // @ts-expect-error
        teamId: req.data.team.id,
      },
    });
    for (const submission of crazy88submissions) {
      if (submission.number === number)
        return sendError(
          res,
          `Your team already submitted a photo or video for crazy 88 task ${number}. ${
            submission.grading === null
              ? "Your submission will be graded as soon as possible"
              : ""
          }`,
          400
        );
    }

    let submission;
    try {
      submission = await prisma.crazy88submission.create({
        data: {
          // @ts-expect-error
          teamId: req.data.team.id,
          fileLink,
          number,
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }

    res.json({
      message: `Your submission for crazy 88 task ${number} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.id, "crazy88");
  }
);

function checkTeam(req: Request, res: Response, next: NextFunction) {
  const teamId = req.data?.team?.id;
  if (!teamId) return sendError(res, "You are not in a team yet", 400);
  next();
}

router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const puzzles = prisma.puzzlesubmission.findMany({
    where: {
      grading: null,
    },
  });
  const challanges = prisma.challangesubmission.findMany({
    where: {
      grading: null,
    },
  });
  const crazy88 = prisma.crazy88submission.findMany({
    where: {
      grading: null,
    },
  });
  Promise.all([puzzles, challanges, crazy88]).then(
    ([puzzles, challanges, crazy88]) => {
      // @ts-expect-error
      puzzles.map((submission) => (submission.type = "puzzle"));
      // @ts-expect-error
      challanges.map((submission) => (submission.type = "challange"));
      // @ts-expect-error
      crazy88.map((submission) => (submission.type = "crazy88"));
      return res.json({
        pending: [...puzzles, ...challanges, ...crazy88],
      });
    }
  );
});

router.get(
  "/:type/:id",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req, res) => {
    const id = Number(req.params.id);
    const type = req.params.type;
    if (Number.isNaN(id)) return sendError(res, "ID should be a number", 400);

    let table;
    switch (type) {
      case "crazy88":
        table = prisma.crazy88submission;
        break;
      case "challange":
        table = prisma.challangesubmission;
        break;
      case "puzzle":
        table = prisma.puzzlesubmission;
        break;
      default:
        return sendError(res, "Submission type is unkown", 400);
    }

    // @ts-expect-error
    const submission = await table.findUnique({
      where: { id },
    });
    if (!submission)
      return sendError(res, "Combination type, id is unkown", 400);
    return res.json({
      submission,
    });
  }
);

router.post("/grade", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { type, id, grading }: { type: string; id: number; grading: number } =
    req.body;
  if (!type || !id || !grading)
    return sendError(res, "Type, ID and Grading required", 400);
  let table;
  switch (type) {
    case "crazy88":
      table = prisma.crazy88submission;
      break;
    case "challange":
      table = prisma.challangesubmission;
      break;
    case "puzzle":
      table = prisma.puzzlesubmission;
      break;
    default:
      return sendError(res, "Submission type is unkown", 400);
  }

  // @ts-expect-error
  const submission = await table.update({
    where: { id },
    data: { grading },
    include: { team: true },
  });
  console.log(submission);

  try {
    await axios.post(
      `${process.env.BOT_API_URL}/grade`,
      {
        roleId: submission.team.roleId,
        channelId: submission.team.channelId,
        type,
        number: submission.number ?? null,
        location: submission.location ?? null,
        grading: grading,
      },
      {
        headers: {
          Authorization: process.env.BOT_API_KEY!,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return sendError(res);
  }

  return res.sendStatus(200);
});

export default router;
