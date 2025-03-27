import { d } from "../../";

export const exampleCommand = d.command({
  name: "example_command",
  description: "This is an example command with subcommands and subcommand groups.",
  subcommands: (o) => ({
    subcommand: o.subcommand("This is a basic subcommand!"),
    group: o.group({
      description: "This is a subcommand group.",
      subcommands: (o) => ({
        subcommand_in_group: o.subcommand("This is a subcommand in a group!"),
      }),
    }),
  }),
});

export const optionsCommand = d.command({
  name: "options_command",
  description: "This command has options!",
  options: (o) => ({
    string: o.string({ description: "This is a string option!", autocomplete: true }),
    number: o.number("This is a number option!"),
  }),
});

export const userCommand = d.user({
  name: "User Command",
});

export const messageCommand = d.message({
  name: "Message Command",
});

export const component = d.component({
  customId: /test_component/,
});
