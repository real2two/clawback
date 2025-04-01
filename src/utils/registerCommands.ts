import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export function registerCommands({
  baseApi = "https://discord.com/api/v10",
  id,
  guildId,
  token,
  entities,
}: {
  baseApi?: string;
  id: string;
  guildId?: string;
  token: string;
  entities: ({ serialize?: () => RESTPostAPIApplicationCommandsJSONBody } | {})[];
}) {
  return fetch(
    `${new URL(baseApi).href}/applications/${encodeURIComponent(id)}${guildId ? `/guilds/${encodeURIComponent(guildId)}/commands` : `/commands`}`,
    {
      method: "put",
      headers: {
        authorization: `Bot ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(entities.map((c) => ("serialize" in c ? c.serialize?.() : undefined)).filter((c) => c)),
    },
  );
}
