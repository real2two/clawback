import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { OptionBuilder, Option, SubcommandBuilder, Subcommand, OptionParent } from "../types/options";
import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
} from "discord-api-types/v10";
import { EntityOption, EntitySubcommand, EntitySubcommandGroup } from "../structures/Entity";

export function createOption<T extends ApplicationCommandOptionType>(parent: OptionParent, type: T) {
  type OptionConstructor<D extends APIApplicationCommandBasicOption & { type: T }> =
    | string
    | (Omit<D, "type" | "name" | "options"> & { name?: string; description?: string; required?: boolean });

  class Option<D extends APIApplicationCommandBasicOption & { type: T }> extends EntityOption {
    parent = parent;
    type = type;
    data: Omit<D, "type" | "name" | "options"> & { name?: string; description?: string; required?: boolean };

    constructor(data: OptionConstructor<D>) {
      super();
      this.data = typeof data === "string" ? ({ name: undefined, description: data, required: true } as Option<D>["data"]) : data;
    }

    serialize() {
      return { ...this.data, type: this.type } as D;
    }
  }

  return <D extends APIApplicationCommandBasicOption & { type: T }>(data: OptionConstructor<D>) => new Option<D>(data);
}

export function createSubcommandOption(parent: OptionParent) {
  type SubcommandOptionConstructor<D extends APIApplicationCommandSubcommandOption, O extends Record<string, Option>> =
    | string
    | (Omit<D, "type" | "name" | "options"> & {
        name?: string;
        options?: (opt: OptionBuilder) => O;
      });

  class SubcommandOption<D extends APIApplicationCommandSubcommandOption, O extends Record<string, Option> = {}> extends EntitySubcommand {
    parent = parent;
    type = ApplicationCommandOptionType.Subcommand as const;
    data: Omit<D, "type" | "name" | "options"> & {
      name?: string;
      options?: (opt: OptionBuilder) => O;
    };
    options?: O;

    constructor(data: SubcommandOptionConstructor<D, O>) {
      super();

      // Parse data if it's a string
      this.data = typeof data === "string" ? ({ name: undefined, description: data } as SubcommandOption<D, O>["data"]) : data;

      // Parse options
      this.options = this.data.options?.({
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

      // If a name wasn't set to the option, the name is set to the key in dictionary
      for (const [name, option] of Object.entries(this.options ?? {})) {
        if (!option.data.name) option.data.name = name;
      }
    }

    serialize() {
      return {
        ...this.data,
        type: this.type,
        options: Object.values(this.options || {})
          .map((o) => o.serialize())
          .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
      } as D;
    }
  }

  return <D extends APIApplicationCommandSubcommandOption, O extends Record<string, Option> = {}>(data: SubcommandOptionConstructor<D, O>) =>
    new SubcommandOption<D, O>(data);
}

export function createSubcommandGroupOption(parent: OptionParent) {
  type SubcommandGroupOptionConstructor<D extends APIApplicationCommandSubcommandGroupOption, S extends Record<string, Subcommand> = {}> = Omit<
    D,
    "type" | "name" | "options"
  > & {
    name?: string;
    subcommands?: (opt: SubcommandBuilder) => S;
  };

  class SubcommandGroupOption<
    D extends APIApplicationCommandSubcommandGroupOption,
    S extends Record<string, Subcommand> = {},
  > extends EntitySubcommandGroup {
    parent = parent;
    type = ApplicationCommandOptionType.SubcommandGroup as const;
    data: Omit<D, "type" | "name" | "options"> & {
      name?: string;
      subcommands?: (opt: SubcommandBuilder) => S;
    };
    subcommands?: S;

    constructor(data: SubcommandGroupOptionConstructor<D, S>) {
      super();

      // Set the subcommand group option data
      this.data = data;

      // Parse subcommands
      this.subcommands = data.subcommands?.({
        subcommand: createSubcommandOption(this),
      });

      // If a name wasn't set to the option, the name is set to the key in dictionary
      for (const [name, option] of Object.entries(this.subcommands ?? {})) {
        if (!option.data.name) option.data.name = name;
      }
    }

    subcommand<K extends keyof S>(name: K) {
      const subcommand = this.subcommands?.[name];
      if (!subcommand) {
        throw new Error("Failed to find subcommand provided to the subcommand function!");
      }
      return subcommand;
    }

    serialize() {
      const copiedData = { ...this.data };
      delete copiedData["subcommands"];
      return {
        ...copiedData,
        type: this.type,
        options: Object.values(this.subcommands || {})
          .map((o) => o.serialize())
          .sort((a, b) => Number(b.required || false) - Number(a.required || false)),
      } as D;
    }
  }

  return <D extends APIApplicationCommandSubcommandGroupOption, S extends Record<string, Subcommand> = {}>(
    data: SubcommandGroupOptionConstructor<D, S>,
  ) => new SubcommandGroupOption(data);
}
