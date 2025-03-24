import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { OptionBuilder, Option, SubcommandBuilder, Subcommand } from "../types/options";
import type {
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
} from "discord-api-types/v10";

export function createOption<T extends ApplicationCommandOptionType>(type: T) {
  return <D extends APIApplicationCommandOption & { type: T }>(
    data:
      | string
      | (Omit<D, "type" | "name" | "options"> & {
          name?: string;
        }),
  ) => {
    const parsedData = typeof data === "string" ? { name: undefined, description: data, required: true } : data;
    return {
      type,
      data: parsedData,
      serialize: () => ({ type, ...parsedData }) as D,
    } as const;
  };
}

export function createSubcommandOption() {
  const type = ApplicationCommandOptionType.Subcommand;
  return <D extends APIApplicationCommandSubcommandOption, O extends Record<string, Option> = {}>(
    data:
      | string
      | (Omit<D, "type" | "name" | "options"> & {
          name?: string;
          options?: (opt: OptionBuilder) => O;
        }),
  ) => {
    // Parse data if it's a string
    const parsedData = typeof data === "string" ? { name: undefined, description: data, options: undefined } : data;

    // Parse options
    const parsedOptions = parsedData.options?.({
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

    // If a name wasn't set to the option, the name is set to the key in dictionary
    for (const [name, option] of Object.entries(parsedOptions ?? {})) {
      if (!option.data.name) option.data.name = name;
    }

    // Return subcommand option object
    return {
      type,
      data: parsedData,
      serialize: () => {
        return {
          ...parsedData,
          type,
          options: Object.values(parsedOptions || {})
            .map((o) => o.serialize())
            .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
        } as D;
      },
    } as const;
  };
}

export function createSubcommandGroupOption() {
  const type = ApplicationCommandOptionType.SubcommandGroup;
  return <D extends APIApplicationCommandSubcommandGroupOption, S extends Record<string, Subcommand> = {}>(
    data: Omit<D, "type" | "name" | "options"> & {
      name?: string;
      subcommands?: (opt: SubcommandBuilder) => S;
    },
  ) => {
    // Parse subcommands
    const parsedSubcommands = data.subcommands?.({
      subcommand: createSubcommandOption(),
    });

    // If a name wasn't set to the option, the name is set to the key in dictionary
    for (const [name, option] of Object.entries(parsedSubcommands ?? {})) {
      if (!option.data.name) option.data.name = name;
    }

    // Return subcommand group option object
    return {
      type,
      data,
      serialize: () => {
        const copiedData = { ...data };
        delete copiedData["subcommands"];
        return {
          ...copiedData,
          type,
          options: Object.values(parsedSubcommands || {})
            .map((o) => o.serialize())
            .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
        } as D;
      },
    } as const;
  };
}
