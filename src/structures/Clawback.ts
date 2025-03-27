import { InteractionType } from "discord-api-types/v10";
import { InteractionEntityType } from "./Entity";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ApplicationCommandType } from "discord-api-types/v10";
import type { InteractionHandler } from "./InteractionHandler";
import type { OptionParent } from "../types/options";
import type { createComponent } from "../utils/createComponent";

interface HandleDataWithoutCustomId {
  name?: string;
  type?: ApplicationCommandType;
  options?: (
    | {
        type: ApplicationCommandOptionType.Subcommand;
        name: string;
      }
    | {
        type: ApplicationCommandOptionType.SubcommandGroup;
        name: string;
        options: { type: ApplicationCommandOptionType.Subcommand; name: string }[];
      }
    | { type: number }
  )[];
}

interface HandleDataWithCustomIdSnakeCase extends HandleDataWithoutCustomId {
  custom_id?: string;
}

interface HandleDataWithCustomIdCamelCase extends HandleDataWithoutCustomId {
  customId?: string;
}

export class Clawback<E = undefined, A = undefined> {
  handlers: InteractionHandler<E, A>[];

  constructor({ handlers }: { handlers: Clawback<E, A>["handlers"] }) {
    this.handlers = handlers;
  }

  handle(interaction: {
    type: InteractionType;
    data?: HandleDataWithCustomIdSnakeCase | HandleDataWithCustomIdCamelCase;
  }) {
    // Loop through all handlers
    for (const handler of this.handlers) {
      // Loop through every entity in the handler to see if it matches
      for (const entity of handler.entities) {
        if (interaction.type === InteractionType.ApplicationCommand || interaction.type === InteractionType.ApplicationCommandAutocomplete) {
          // Handle commands and autocomplete
          if (
            entity._for !== InteractionEntityType.Command &&
            entity._for !== InteractionEntityType.Subcommand &&
            entity._for !== InteractionEntityType.SubcommandGroup
          )
            continue;

          const commandEntities: OptionParent[] = [];
          let commandEntity = entity as unknown as OptionParent;
          while (commandEntity) {
            commandEntities.unshift(commandEntity);

            if (!commandEntity.parent) break; // so I can use this below
            commandEntity = commandEntity.parent;
          }

          if (interaction.data?.type !== commandEntity.type) continue;
          if (interaction.data?.name !== commandEntity.data.name) continue;

          if (commandEntities.length === 1) {
            // /command {
            if (
              interaction.data?.options?.find((o) =>
                [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(o.type),
              )
            )
              continue;
          } else if (commandEntities.length === 2) {
            // /command <subcommand>
            if (
              !interaction.data?.options?.find(
                (o) => o.type === ApplicationCommandOptionType.Subcommand && "name" in o && o.name === commandEntities[1].data.name,
              )
            )
              continue;
          } else if (commandEntities.length === 3) {
            // /command <group> <subcommand>
            if (
              !interaction.data?.options?.find(
                (o) =>
                  o.type === ApplicationCommandOptionType.SubcommandGroup &&
                  "name" in o &&
                  o.name === commandEntities[1].data.name &&
                  o.options.find((o) => o.type === ApplicationCommandOptionType.Subcommand && o.name === commandEntities[2].data.name),
              )
            )
              continue;
          }

          return {
            isAutocomplete: interaction.type === InteractionType.ApplicationCommandAutocomplete,
            entity,
            handler,
          };
        } else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
          // Handle message components and modal submit
          if (entity._for !== InteractionEntityType.Component || !interaction.data) continue;

          const interactionCustomId =
            "custom_id" in interaction.data ? interaction.data.custom_id : "customId" in interaction.data ? interaction.data.customId : undefined;
          const entityCustomId = (entity as ReturnType<ReturnType<typeof createComponent>>).customId;

          if (
            !interactionCustomId || typeof entityCustomId === "string"
              ? interactionCustomId !== entityCustomId
              : !entityCustomId.test(interactionCustomId)
          )
            continue;

          return {
            isAutocomplete: false,
            entity,
            handler,
          };
        }
      }
    }

    return {
      isAutocomplete: false,
      entity: null,
      handler: null,
    };
  }
}
