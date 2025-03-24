import { ApplicationCommandOptionType, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord-api-types/v10";
import { createOption, createSubcommandGroupOption, createSubcommandOption } from "./createOption";
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
  return <O extends Record<string, Option> = {}, S extends Record<string, SubcommandAndGroup> = {}>({
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
    name: string;
    name_localizations?: LocalizationMap;
    description: string;
    description_localizations?: LocalizationMap;
    default_member_permissions?: string;
    nsfw?: boolean;
    integration_types?: ApplicationIntegrationType[];
    contexts?: InteractionContextType[];
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
  )) => {
    // Parse options and subcommands
    const parsedOptions = options?.({
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
    const parsedSubcommands = subcommands?.({
      subcommand: createSubcommandOption(),
      group: createSubcommandGroupOption(),
    });

    // Disallow having both options and subcommands
    if (parsedOptions && parsedSubcommands) {
      throw new Error("Cannot mix subcommands/subcommand groups with other option types!");
    }

    // If a name wasn't set to the option, the name is set to the key in dictionary
    for (const [name, option] of [...Object.entries(parsedOptions ?? {}), ...Object.entries(parsedSubcommands ?? {})]) {
      if (!option.data.name) option.data.name = name;
    }

    // Return command object
    return {
      name,
      name_localizations,
      description,
      description_localizations,
      options: parsedOptions || parsedSubcommands,
      default_member_permissions,
      nsfw,
      integration_types,
      contexts,

      subcommand(name: SubcommandKeys<S>) {
        const subcommand = parsedSubcommands?.[name];
        if (subcommand?.type !== ApplicationCommandOptionType.Subcommand) {
          throw new Error("Failed to find subcommand provided to the subcommand function!");
        }
        return subcommand;
      },

      group(name: SubcommandGroupKeys<S>) {
        const group = parsedSubcommands?.[name];
        if (group?.type !== ApplicationCommandOptionType.SubcommandGroup) {
          throw new Error("Failed to find subcommand provided to the subcommand group function!");
        }
        return group;
      },

      serialize(): RESTPostAPIApplicationCommandsJSONBody {
        return {
          type,
          name,
          name_localizations,
          description,
          description_localizations,
          options: Object.values(parsedOptions || parsedSubcommands || {})
            .map((o) => o.serialize())
            .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
          default_member_permissions,
          nsfw,
          integration_types,
          contexts,
        };
      },
    } as const;
  };
}
