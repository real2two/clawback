import { ApplicationCommandOptionType, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord-api-types/v10";
import { createOption, createSubcommandGroupOption, createSubcommandOption } from "./createOption";
import { EntityCommand } from "../structures/Entity";
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
  type CommandConstructor<O extends Record<string, Option> = {}, S extends Record<string, SubcommandAndGroup> = {}> = {
    name: Command["data"]["name"];
    name_localizations?: Command["data"]["name_localizations"];
    description?: Command["data"]["description"];
    description_localizations?: Command["data"]["description_localizations"];
    default_member_permissions?: Command["data"]["default_member_permissions"];
    nsfw?: Command["data"]["nsfw"];
    integration_types?: Command["data"]["integration_types"];
    contexts?: Command["data"]["contexts"];
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
  );

  class Command<O extends Record<string, Option> = {}, S extends Record<string, SubcommandAndGroup> = {}> extends EntityCommand {
    type = type;
    data: {
      name: string;
      name_localizations?: LocalizationMap;
      description?: string;
      description_localizations?: LocalizationMap;
      default_member_permissions?: string;
      nsfw?: boolean;
      integration_types?: ApplicationIntegrationType[];
      contexts?: InteractionContextType[];
    };
    options?: O;
    subcommands?: S;

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
    }: CommandConstructor<O, S>) {
      super();

      if (type !== ApplicationCommandType.ChatInput && (description || description_localizations)) {
        throw new Error("Application commands that aren't chat input commands cannot have a description!");
      }

      this.data = {
        name,
        name_localizations,
        description: type === ApplicationCommandType.ChatInput ? "No description has been set." : undefined,
        description_localizations,
        default_member_permissions,
        nsfw,
        integration_types,
        contexts,
      };

      this.options = options?.({
        attachment: createOption(this, ApplicationCommandOptionType.Attachment),
        boolean: createOption(this, ApplicationCommandOptionType.Boolean),
        channel: createOption(this, ApplicationCommandOptionType.Channel),
        integer: createOption(this, ApplicationCommandOptionType.Integer),
        mentionable: createOption(this, ApplicationCommandOptionType.Mentionable),
        number: createOption(this, ApplicationCommandOptionType.Number),
        role: createOption(this, ApplicationCommandOptionType.Role),
        string: createOption(this, ApplicationCommandOptionType.String),
        user: createOption(this, ApplicationCommandOptionType.User),
      });

      this.subcommands = subcommands?.({
        subcommand: createSubcommandOption(this),
        group: createSubcommandGroupOption(this),
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
        name: this.data.name,
        name_localizations: this.data.name_localizations,
        description: (this.type === ApplicationCommandType.ChatInput ? this.data.description : undefined) as string, // Needs to be a string for application commands. Doesn't exist in context commands.
        description_localizations: this.data.description_localizations,
        options: Object.values(this.options || this.subcommands || {})
          .map((o) => o.serialize())
          .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
        default_member_permissions: this.data.default_member_permissions,
        nsfw: this.data.nsfw,
        integration_types: this.data.integration_types,
        contexts: this.data.contexts,
      };
    }
  }

  return <O extends Record<string, Option> = {}, S extends Record<string, SubcommandAndGroup> = {}>(data: CommandConstructor<O, S>) =>
    new Command<O, S>(data);
}
