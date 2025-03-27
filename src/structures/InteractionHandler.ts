import { EntityCommand, EntitySubcommand, EntityComponent } from "./Entity";

export class InteractionHandler<E = undefined, A = undefined> {
  entities: (EntityCommand | EntitySubcommand | EntityComponent)[];

  execute?: (data: E) => unknown | Promise<unknown>;
  autocomplete?: (data: A) => unknown | Promise<unknown>;

  constructor({
    entities,
    execute,
    autocomplete,
  }: {
    entities: InteractionHandler<E, A>["entities"];
    execute?: InteractionHandler<E, A>["execute"];
    autocomplete?: InteractionHandler<E, A>["autocomplete"];
  }) {
    this.entities = entities;
    this.execute = execute;
    this.autocomplete = autocomplete;

    for (const entity of this.entities) {
      if (!(entity instanceof EntityCommand) && !(entity instanceof EntitySubcommand) && !(entity instanceof EntityComponent)) {
        throw new Error("Only provide commands, subcommands and components in interaction for InteractionHandler!");
      }
    }
  }
}
