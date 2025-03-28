import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export function registerCommands({
  baseApi = "https://discord.com",
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
    `${new URL(baseApi).href.slice(0, -1)}/api/applications/${encodeURIComponent(id)}${guildId ? `/guilds/${encodeURIComponent(guildId)}/commands` : `/commands`}`,
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
