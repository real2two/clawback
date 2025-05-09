import { Clawback } from "clawback";
import { optionsHandler, subcommandHandler, subcommandGroupHandler, contextHandler } from "./handlers/testHandler";

export const clawback = new Clawback({
  handlers: [optionsHandler, subcommandHandler, subcommandGroupHandler, contextHandler],
});
