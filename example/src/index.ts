import env from "./utils/env";
import { Hono } from "hono";
import { InteractionResponseType, verifyKey } from "discord-interactions";
import { clawback } from "./handlers";
import { InteractionType } from "discord-api-types/v10";
import type { APIBaseInteraction, APIInteractionResponse } from "discord-api-types/v10";

const app = new Hono();

app.post("/interactions", async (c) => {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");
  if (!signature || !timestamp) return c.text("400 Bad request", 400);

  const body = await c.req.text();
  if (!(await verifyKey(body, signature, timestamp, env.PUBLIC_KEY))) {
    return c.text("401 Invalid signature", 401);
  }

  const interaction = JSON.parse(body) as APIBaseInteraction<InteractionType, any>;
  if (interaction.type === InteractionType.Ping) return c.json({ type: InteractionResponseType.PONG });

  return new Promise(async (resolve) => {
    let resolved = false;
    const resolvedTimeout = setTimeout(() => {
      resolved = true;
      return resolve(new Response(null, { status: 204 }));
    }, 3000);

    const respond = (data: APIInteractionResponse) => {
      if (resolved) throw new Error("Interaction has already been resolved!");

      resolved = true;
      clearTimeout(resolvedTimeout);

      return resolve(c.json(data));
    };

    try {
      const { isAutocomplete, handler } = clawback.handle(interaction);
      if (!handler) return console.warn("Cannot find handler that matches interaction data", interaction);

      if (isAutocomplete) {
        await handler.autocomplete?.({ c, interaction, respond });
      } else {
        await handler.execute?.({ c, interaction, respond });
      }
    } catch (err) {
      console.error("An error has occurred:", err);
    }
  });
});

export default app;
