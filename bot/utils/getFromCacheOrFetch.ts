import type discordjs from "discord.js";

type Managers =
  | discordjs.GuildManager
  | discordjs.ChannelManager
  | discordjs.RoleManager
  | discordjs.GuildMemberManager;

type returnType<T> = T extends discordjs.GuildManager
  ? discordjs.Guild
  : T extends discordjs.ChannelManager
  ? discordjs.Channel
  : T extends discordjs.RoleManager
  ? discordjs.Role
  : T extends discordjs.GuildMemberManager
  ? discordjs.GuildMember
  : never;

export default async function getFromCacheOrFetch<T extends Managers>(
  manager: T,
  id: string
): Promise<returnType<T>> {
  // @ts-expect-error
  let res = manager.cache.find((a: any) => a.id == id) ?? undefined;
  try {
    if (!res) res = (await manager.fetch(id)) ?? undefined;
  } catch (error) {
    console.error(error);
  }
  return res;
}
