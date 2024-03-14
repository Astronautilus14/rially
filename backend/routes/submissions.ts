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

// Method to get all submission marked as 'funny'
router.get("/funny", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  // Get all entries from database
  const submissions = await prisma.submission.findMany({
    where: { isFunny: true },
    include: { Team: true },
  });

  return res.json({ funny: submissions });
});

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
    const location = (await getLocation(req.data!.team!.id)) + 1;

    // If there is a submission without a grading, this should be graded first
    // and the team should stop spamming :)
    const pedingSubmission = await prisma.submission.findFirst({
      where: {
        teamId: req.data!.team!.id,
        grading: null,
        type: "PUZZLE",
        PuzzleSubmission: {
          location,
        },
      },
    });

    if (pedingSubmission) {
      return sendError(
        res,
        `Your team already submitted a puzzle for location ${location}. Your submition will be graded as soon as possible.`,
        400
      );
    }

    // Create the submission in the database
    let submission;
    try {
      submission = await prisma.puzzleSubmission.create({
        data: {
          location,
          Submission: {
            create: {
              fileLink,
              teamId: req.data!.team!.id,
              type: "PUZZLE",
            },
          },
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
    io.emit("submission", submission.submissionId, "puzzle");
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

    const location = await getLocation(req.data!.team!.id);

    // If the location is 0 they have not found the first location yet and should not
    // submit a location based challenge
    if (location === 0) {
      return sendError(
        res,
        "You can't do a location challenge if you're nou at the first location yet. Did you perhaps mean to do /submission puzzle instead?",
        400
      );
    }

    // If there is a submission without a grading, this should be graded first
    // Or if the challenge was already approved it can't be submitted in again
    const challengesubmission = await prisma.challengeSubmission.findFirst({
      where: {
        number,
        location,
        Submission: {
          teamId: req.data!.team!.id,
          OR: [{ grading: null }, { grading: { gt: 0 } }],
        },
      },
      include: {
        Submission: true,
      },
    });

    if (challengesubmission) {
      return sendError(
        res,
        `Your team already submitted a photo or video for challenge ${number} at location ${location}. ${
          challengesubmission.Submission.grading === null
            ? "Your submission will be graded as soon as possible."
            : `It got graded with ${challengesubmission.Submission.grading} points.`
        }`,
        400
      );
    }

    let submission;
    try {
      submission = await prisma.challengeSubmission.create({
        data: {
          location,
          number,
          Submission: {
            create: {
              fileLink,
              teamId: req.data!.team!.id,
              type: "CHALLENGE",
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }

    res.json({
      message: `Your submission for location challenge ${number} at location ${location} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.submissionId, "challenge");
  }
);

// Method to submit a crazy 88 task
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
    const crazy88submission = await prisma.crazy88Submission.findFirst({
      where: {
        number,
        Submission: {
          OR: [{ grading: null }, { grading: { gt: 0 } }],
          teamId: req.data!.team!.id,
        },
      },
      include: { Submission: true },
    });

    if (crazy88submission) {
      return sendError(
        res,
        `Your team already submitted a photo or video for crazy 88 task ${number}. ${
          crazy88submission.Submission.grading === null
            ? "Your submission will be graded as soon as possible."
            : `It got graded with ${crazy88submission.Submission.grading} points.`
        }`,
        400
      );
    }

    let submission;
    try {
      submission = await prisma.crazy88Submission.create({
        data: {
          number,
          Submission: {
            create: {
              fileLink,
              teamId: req.data!.team!.id,
              type: "CRAZY88",
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }

    res.json({
      message: `Your submission for crazy 88 task ${number} has been received. It will be graded soon.`,
    });
    io.emit("submission", submission.submissionId, "crazy88");
  }
);

// Helper function used to
// figure out where a team is now by counting the number of approved puzzle submissions
// ex: if they have 1 approved puzzle submission they are looking to submit challenge for location 1
async function getLocation(teamId: number) {
  return await prisma.puzzleSubmission.count({
    where: {
      Submission: {
        teamId,
        grading: { gt: 0 },
      },
    },
  });
}

// Middleware that should be used after chekckDiscordId to check if the user is in a team or not
function checkTeam(req: Request, res: Response, next: NextFunction) {
  const teamId = req.data?.team?.id;
  if (!teamId) return sendError(res, "You are not in a team yet", 400);
  next();
}

// Mehtod to get all submission that need to be graded
router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { grading: null },
  });

  return res.json({ pending: submissions });
});

// Method to get all graded submissions
router.get("/past", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { grading: { not: null } },
    include: { Team: true },
  });
  return res.json({ pending: submissions });
});

// Method to get all information about a specific submission
router.get("/:id", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, "ID should be a number", 400);

  // Find the submission in the database
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      Team: true,
      PuzzleSubmission: true,
      ChallengeSubmission: true,
      Crazy88Submission: true,
    },
  });
  if (!submission) {
    return sendError(res, `Unkown submission ID: ${id}`, 404);
  }

  // Count all the penidng or approved submissions of the same type
  // ex: if a team is the 2nd team to successfully submit location challenge 5,
  // their 'speedPlace' is 2
  const speedPlace = await prisma.submission.count({
    where: {
      type: submission.type,
      grading: { gt: 0 },
      timeSubmitted: { lt: submission.timeSubmitted },
    },
  });

  return res.json({
    submission,
    speedPlace: speedPlace + 1,
  });
});

// Method to (re)grade a submission
router.post("/grade", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const {
    id,
    grading,
    isFunny,
  }: { type: string; id: number; grading: number; isFunny: boolean } = req.body;

  if (!id || grading === null || grading === undefined) {
    return sendError(res, "Type, Grading and ID required", 400);
  }

  // Update the database entry
  const submission = await prisma.submission.update({
    where: { id },
    data: { grading, isFunny },
    include: {
      Team: true,
      PuzzleSubmission: true,
      ChallengeSubmission: true,
      Crazy88Submission: true,
    },
  });
  if (!submission) {
    return sendError(res, `Unkown submission ID: ${id}`, 404);
  }

  const location =
    submission.PuzzleSubmission?.location ??
    submission.ChallengeSubmission?.location ??
    null;

  const number =
    submission.ChallengeSubmission?.number ??
    submission.Crazy88Submission?.number ??
    null;

  // Send a request to the bot to let the team know their grade
  try {
    await axios.post(
      `${process.env.BOT_API_URL}/grade`,
      {
        roleId: submission.Team.roleId,
        channelId: submission.Team.channelId,
        type: submission.type,
        number,
        location,
        grading,
      },
      {
        headers: {
          Authorization: process.env.BOT_API_KEY!,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return sendError(
      res,
      "Could not send the grade to the bot, in case the submission was a puzzle: please edit the permssion for the next location channel in the discord server manually. Otherwise the team just did not get notified with their grade.",
      500
    );
  }

  return res.sendStatus(200);
});

export default router;
