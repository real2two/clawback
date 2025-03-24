import { ApplicationCommandOptionType, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord-api-types/v10";
import { createOption, createSubcommandGroupOption, createSubcommandOption } from "./createOption";
import { InteractionEntity, InteractionEntityType } from "../structures/InteractionEntity";
import type { LocalizationMap, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import type { SubcommandAndGroupBuilder, SubcommandAndGroup, OptionBuilder, Option } from "../types/options";

type SubcommandKeys<T> = {
  [K in keyof T]: T[K] extends {
    type: ApplicationCommandOptionType.Subcommand;
  }
    ? K
    : never;
}[keyof T];

type SubcommandGroupKeys<T> = {
  [K in keyof T]: T[K] extends {
    type: ApplicationCommandOptionType.SubcommandGroup;
  }
    ? K
    : never;
}[keyof T];

export function createCommand<T extends ApplicationCommandType>(type: T) {
  return class Command<O extends Record<string, Option> = {}, S extends Record<string, SubcommandAndGroup> = {}> extends InteractionEntity {
    type = type;
    name: string;
    name_localizations?: LocalizationMap;
    description: string;
    description_localizations?: LocalizationMap;
    options?: O;
    subcommands?: S;
    default_member_permissions?: string;
    nsfw?: boolean;
    integration_types?: ApplicationIntegrationType[];
    contexts?: InteractionContextType[];

    constructor({
      name,
      name_localizations,
      description,
      description_localizations,
      options,
      subcommands,
      default_member_permissions,
      nsfw = false,
      integration_types = [ApplicationIntegrationType.GuildInstall],
      contexts = [InteractionContextType.Guild],
    }: {
      name: Command["name"];
      name_localizations?: Command["name_localizations"];
      description: Command["description"];
      description_localizations?: Command["description_localizations"];
      default_member_permissions?: Command["default_member_permissions"];
      nsfw?: Command["nsfw"];
      integration_types?: Command["integration_types"];
      contexts?: Command["contexts"];
    } & (
      | (T extends ApplicationCommandType.ChatInput
          ?
              | {
                  type?: T;
                  options?: (opt: OptionBuilder) => O;
                  subcommands?: undefined;
                }
              | {
                  type?: T;
                  options?: undefined;
                  subcommands?: (opt: SubcommandAndGroupBuilder) => S;
                }
          : never)
      | {
          type?: ApplicationCommandType;
          options?: undefined;
          subcommands?: undefined;
        }
    )) {
      super(InteractionEntityType.Command);

      this.name = name;
      this.name_localizations = name_localizations;
      this.description = description;
      this.description_localizations = description_localizations;
      this.default_member_permissions = default_member_permissions;
      this.nsfw = nsfw;
      this.integration_types = integration_types;
      this.contexts = contexts;

      // Parse options and subcommands
      this.options = options?.({
        attachment: createOption(ApplicationCommandOptionType.Attachment),
        boolean: createOption(ApplicationCommandOptionType.Boolean),
        channel: createOption(ApplicationCommandOptionType.Channel),
        integer: createOption(ApplicationCommandOptionType.Integer),
        mentionable: createOption(ApplicationCommandOptionType.Mentionable),
        number: createOption(ApplicationCommandOptionType.Number),
        role: createOption(ApplicationCommandOptionType.Role),
        string: createOption(ApplicationCommandOptionType.String),
        user: createOption(ApplicationCommandOptionType.User),
      });
      this.subcommands = subcommands?.({
        subcommand: createSubcommandOption(),
        group: createSubcommandGroupOption(),
      });

      // Disallow having both options and subcommands
      if (this.options && this.subcommands) {
        throw new Error("Cannot mix subcommands/subcommand groups with other option types!");
      }

      // If a name wasn't set to the option, the name is set to the key in dictionary
      for (const [name, option] of [...Object.entries(this.options ?? {}), ...Object.entries(this.subcommands ?? {})]) {
        if (!option.data.name) option.data.name = name;
      }
    }

    subcommand(name: SubcommandKeys<S>) {
      const subcommand = this.subcommands?.[name];
      if (subcommand?.type !== ApplicationCommandOptionType.Subcommand) {
        throw new Error("Failed to find subcommand provided to the subcommand function!");
      }
      return subcommand;
    }

    group(name: SubcommandGroupKeys<S>) {
      const group = this.subcommands?.[name];
      if (group?.type !== ApplicationCommandOptionType.SubcommandGroup) {
        throw new Error("Failed to find subcommand provided to the subcommand group function!");
      }
      return group;
    }

    serialize(): RESTPostAPIApplicationCommandsJSONBody {
      return {
        type: this.type,
        name: this.name,
        name_localizations: this.name_localizations,
        description: this.description,
        description_localizations: this.description_localizations,
        options: Object.values(this.options || this.subcommands || {})
          .map((o) => o.serialize())
          .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
        default_member_permissions: this.default_member_permissions,
        nsfw: this.nsfw,
        integration_types: this.integration_types,
        contexts: this.contexts,
      };
    }
  };
}
