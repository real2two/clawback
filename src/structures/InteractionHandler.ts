import { InteractionEntity } from "./InteractionEntity";

export class InteractionHandler<D = undefined, A = undefined> {
  entities: InteractionEntity[];

  execute?: (data: D) => unknown | Promise<unknown>;
  autocomplete?: (data: A) => unknown | Promise<unknown>;

  constructor({
    entities,
    execute,
    autocomplete,
  }: {
    entities: InteractionEntity[];
    execute?: InteractionHandler<D, A>["execute"];
    autocomplete?: InteractionHandler<D, A>["autocomplete"];
  }) {
    this.entities = entities;
    this.execute = execute;
    this.autocomplete = autocomplete;

    for (const interaction of this.entities) {
      if (!(interaction instanceof InteractionEntity)) {
        throw new Error("Only provide commands and components in interaction for InteractionHandler!");
      }
    }
  }
}
