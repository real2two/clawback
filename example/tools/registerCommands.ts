import env from "../src/utils/env";
import { registerCommands } from "clawback";
import * as entities from "../src/entities";

const res = await registerCommands({
  id: env.CLIENT_ID,
  token: env.TOKEN,
  entities: Object.values(entities),
});

if (res.ok) {
  console.info("✅ Successfully registered commands!");
} else {
  console.error("❌ Failed to register commands:", await res.json());
}
