import type { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { createOption, createSubcommandOption, createSubcommandGroupOption } from "../utils/createOption";

export interface OptionParent {
  parent?: OptionParent;
  type: number;
  data: {
    name?: string;
  };
}

export interface SubcommandBuilder {
  subcommand: ReturnType<typeof createSubcommandOption>;
}
export type Subcommand = ReturnType<SubcommandBuilder[keyof SubcommandBuilder]>;

export interface SubcommandAndGroupBuilder extends SubcommandBuilder {
  group: ReturnType<typeof createSubcommandGroupOption>;
}
export type SubcommandAndGroup = ReturnType<SubcommandAndGroupBuilder[keyof SubcommandAndGroupBuilder]>;

export interface OptionBuilder {
  attachment: ReturnType<typeof createOption<ApplicationCommandOptionType.Attachment>>;
  boolean: ReturnType<typeof createOption<ApplicationCommandOptionType.Boolean>>;
  channel: ReturnType<typeof createOption<ApplicationCommandOptionType.Channel>>;
  integer: ReturnType<typeof createOption<ApplicationCommandOptionType.Integer>>;
  mentionable: ReturnType<typeof createOption<ApplicationCommandOptionType.Mentionable>>;
  number: ReturnType<typeof createOption<ApplicationCommandOptionType.Number>>;
  role: ReturnType<typeof createOption<ApplicationCommandOptionType.Role>>;
  string: ReturnType<typeof createOption<ApplicationCommandOptionType.String>>;
  user: ReturnType<typeof createOption<ApplicationCommandOptionType.User>>;
}
export type Option = ReturnType<OptionBuilder[keyof OptionBuilder]>;
