import express from "express";
import axios from "axios";

import type { Response, NextFunction } from "express";
import type { Request } from "../utils/types";

import prisma from "../utils/database";
import sendError from "../utils/sendError";
import io from "../utils/socket";
import {
  isCommittee,
  teamCheck,
  tokenCheck,
  checkBotApiKey,
  checkDiscordId,
} from "./auth";

const router = express.Router();

// Method to submit a puzzle
router.post(
  "/puzzle",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req: Request, res) => {
    const { fileLink }: { fileLink: string } = req.body;
    if (!fileLink) return sendError(res, "File link required", 400);

    // Figure out where they are now by counting the number of approved puzzle submissions + 1
    // ex: they have 1 approved submission, so they are now looking to submit location 2
    const location = await prisma.puzzlesubmission.count({
      where: {
        teamId: req.data!.team!.id,
        grading: { gt: 0 },
      },
    }) + 1;

    // If there is a submission without a grading, this should be graded first
    // and the team should stop spamming :)
    const pedingSubmission = await prisma.puzzlesubmission.findFirst({
      where: {
        teamId: req.data!.team!.id,
        grading: null,
        location,
      },
    });

    if (pedingSubmission)
      return sendError(
        res,
        `Your team already submitted a puzzle for location ${location}. Your submition will be graded as soon as possible.`,
        400
      );

    // Create the submission in the database
    let submission;
    try {
      submission = await prisma.puzzlesubmission.create({
        data: {
          teamId: req.data!.team!.id,
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

    // Emit an event that a new submission is ready to be graded
    io.emit("submission", submission.id, "puzzle");
  }
);

// Method to submit a (location based) challenge
router.post(
  "/challenge",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req: Request, res) => {
    const { fileLink, number }: { fileLink: string; number: number } = req.body;
    if (!fileLink || !number)
      return sendError(res, "File link and Number required", 400);

    // Figure out where they are now by counting the number of approved puzzle submissions
    // ex: if they have 1 approved puzzle submission they are looking to submit challenge for location 1
    const location = await prisma.puzzlesubmission.count({
      where: {
        teamId: req.data!.team!.id,
        grading: { gt: 0 },
      },
    });

    // If the location is 0 they have not found the first location yet and should not
    // submit a location based challenge
    if (location === 0)
      return sendError(
        res,
        "You can't do a location challenge if you're nou at the first location yet. Did you perhaps mean to do /submission puzzle instead?",
        400
      );

    // If there is a submission without a grading, this should be graded first
    // Or if the challenge was already approved it can't be submitted in again
    const challengesubmission = await prisma.challangesubmission.findFirst({
      where: {
        teamId: req.data!.team!.id,
        number,
        location,
        OR: [{ grading: null }, { grading: { gt: 0 } }],
      },
    });

    if (challengesubmission)
      return sendError(
        res,
        `Your team already submitted a photo or video for challenge ${number} at location ${location}. ${
          challengesubmission.grading === null
            ? "Your submission will be graded as soon as possible."
            : `It got graded with ${challengesubmission.grading} points.`
        }`,
        400
      );

    let submission;
    try {
      submission = await prisma.challangesubmission.create({
        data: {
          teamId: req.data!.team!.id,
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
      message: `Your submission for location challenge ${number} at location ${location} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.id, "challange");
  }
);

router.post(
  "/crazy88",
  checkBotApiKey,
  checkDiscordId,
  checkTeam,
  async (req: Request, res) => {
    const { fileLink, number }: { fileLink: string; number: number } = req.body;
    if (!fileLink || !number)
      return sendError(res, "File link and Number required", 400);

    // If there is a submission without a grading, this should be graded first
    // Or if the challenge was already approved it can't be submitted in again
    const crazy88submission = await prisma.crazy88submission.findFirst({
      where: {
        teamId: req.data!.team!.id,
        number,
        OR: [{ grading: null }, { grading: { gt: 0 } }],
      },
    });

    if (crazy88submission)
      return sendError(
        res,
        `Your team already submitted a photo or video for crazy 88 task ${number}. ${
          crazy88submission.grading === null
            ? "Your submission will be graded as soon as possible."
            : `It got graded with ${crazy88submission.grading} points.`
        }`,
        400
      );

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

router.get("/past", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const puzzles = prisma.puzzlesubmission.findMany({
    where: {
      NOT: {
        grading: null,
      },
    },
    include: { team: true },
  });
  const challanges = prisma.challangesubmission.findMany({
    where: {
      NOT: {
        grading: null,
      },
    },
    include: { team: true },
  });
  const crazy88 = prisma.crazy88submission.findMany({
    where: {
      NOT: {
        grading: null,
      },
    },
    include: { team: true },
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
      include: { team: true },
    });
    if (!submission)
      return sendError(res, "Combination Type and ID is unkown", 404);

    const speedPlace =
      // @ts-expect-error
      (await table.count({
        where: {
          timeSubmitted: {
            lt: submission.timeSubmitted,
          },
          number: submission.number,
          location: submission.location,
          OR: [{ grading: null }, { grading: { gt: 0 } }],
        },
      })) + 1;

    return res.json({
      submission,
      speedPlace,
    });
  }
);

router.post("/grade", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const {
    type,
    id,
    grading,
    isFunny,
  }: { type: string; id: number; grading: number; isFunny: boolean } = req.body;
  if (!type || !id || grading === null || grading === undefined)
    return sendError(res, "Type, Grading and ID required", 400);

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
    data: { grading, isFunny },
    include: { team: true },
  });

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

router.get("/funny", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const challange = prisma.challangesubmission.findMany({
    where: { isFunny: true },
    include: { team: true },
  });
  const puzzle = prisma.puzzlesubmission.findMany({
    where: { isFunny: true },
    include: { team: true },
  });
  const crazy88 = prisma.crazy88submission.findMany({
    where: { isFunny: true },
    include: { team: true },
  });

  Promise.all([challange, puzzle, crazy88])
    .then(([challange, puzzle, crazy88]) => {
      // @ts-expect-error
      challange.map((s) => (s.type = "challange"));
      // @ts-expect-error
      puzzle.map((s) => (s.type = "puzzle"));
      // @ts-expect-error
      crazy88.map((s) => (s.type = "crazy88"));

      res.json({
        submissions: [...challange, ...puzzle, ...crazy88],
      });
    })
    .catch((e) => {
      console.error(e);
      sendError(res);
    });
});

export default router;
