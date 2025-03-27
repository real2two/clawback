import { InteractionResponseType } from "discord-api-types/v10";
import { exampleCommand, messageCommand, optionsCommand, userCommand } from "../entities";
import { MyInteractionHandler } from "../structures/MyInteractionHandler";

export const optionsHandler = new MyInteractionHandler({
  entities: [optionsCommand],
  autocomplete({ respond }) {
    respond({
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: {
        choices: [
          {
            name: "Example choice",
            value: "example_choice",
          },
        ],
      },
    });
  },
  execute({ interaction, respond }) {
    respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Options: ${JSON.stringify(interaction.data?.options)}`,
      },
    });
  },
});

export const subcommandHandler = new MyInteractionHandler({
  entities: [exampleCommand.subcommand("subcommand")],
  execute({ respond }) {
    respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This is a subcommand!",
      },
    });
  },
});

export const subcommandGroupHandler = new MyInteractionHandler({
  entities: [exampleCommand.group("group").subcommand("subcommand_in_group")],
  execute({ respond }) {
    respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This is a subcommand in a group!",
      },
    });
  },
});

export const contextHandler = new MyInteractionHandler({
  entities: [userCommand, messageCommand],
  execute({ interaction, respond }) {
    respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "You ran a context command!",
      },
    });
  },
});
