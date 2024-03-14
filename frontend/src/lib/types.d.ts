export type Team = {
  id: number;
  name: string;
  Users?: Member[];
  isCommittee: boolean;
  channelId?: string;
  roleId?: string;
};

type Member = {
  id: number;
  name: string;
  username: string;
  discordId?: string;
};

export type Submission = {
  Team: Team;
  id: number;
  teamId: number;
  fileLink: string;
  timeSubmitted: Date;
  grading?: number;
  type: string;
  PuzzleSubmission?: {
    location: number;
  };
  ChallengeSubmission?: {
    location: number;
    number: number;
  };
  Crazy88Submission?: {
    number: number;
  };
};
