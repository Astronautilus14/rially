export interface Team {
  id: number;
  name: string;
  members?: Member[];
  isCommittee: boolean;
  channelId?: string;
  roleId?: string;
}

interface Member {
  id: number;
  name: string;
  username: string;
  discordId?: string;
}