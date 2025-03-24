import { Entity } from "./Entity";

export class Interaction<D = undefined, A = undefined> {
  entities: Entity[];

  execute?: (data: D) => unknown | Promise<unknown>;
  autocomplete?: (data: A) => unknown | Promise<unknown>;

  constructor({
    entities,
    execute,
    autocomplete,
  }: {
    entities: Entity[];
    execute?: Interaction<D, A>["execute"];
    autocomplete?: Interaction<D, A>["autocomplete"];
  }) {
    this.entities = entities;
    this.execute = execute;
    this.autocomplete = autocomplete;

    for (const interaction of this.entities) {
      if (!(interaction instanceof Entity)) {
        throw new Error("Only provide commands and components in interaction for InteractionHandler!");
      }
    }
  }
}
