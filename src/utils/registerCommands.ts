import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export function registerCommands({
  baseApi = "https://discord.com",
  id,
  token,
  commands,
}: { baseApi?: string; id: string; token: string; commands: ({ serialize?: () => RESTPostAPIApplicationCommandsJSONBody } | {})[] }) {
  return fetch(`${new URL(baseApi).href.slice(0, -1)}/api/applications/${encodeURIComponent(id)}/commands`, {
    method: "put",
    headers: {
      authorization: `Bot ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(commands.map((c) => ("serialize" in c ? c.serialize?.() : undefined)).filter((c) => c)),
  });
}
