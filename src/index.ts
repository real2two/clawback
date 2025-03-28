import { ApplicationCommandType } from "discord-api-types/v10";
import { createCommand } from "./utils/createCommand";
import { createComponent } from "./utils/createComponent";

/** Interaction events */
export const d = {
  command: createCommand(ApplicationCommandType.ChatInput),
  user: createCommand(ApplicationCommandType.User),
  message: createCommand(ApplicationCommandType.Message),
  component: createComponent(),
};

/** Main class and interaction handler*/
export { Clawback } from "./structures/Clawback";
export { InteractionHandler } from "./structures/InteractionHandler";

/** Register commands to Discord */
export { registerCommands } from "./utils/registerCommands";
