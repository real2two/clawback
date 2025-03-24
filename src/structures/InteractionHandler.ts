import { BaseInteraction } from "./BaseInteraction";

export class InteractionHandler<D = undefined, A = undefined> {
  interaction: BaseInteraction[];

  execute?: (data: D) => unknown | Promise<unknown>;
  autocomplete?: (data: A) => unknown | Promise<unknown>;

  constructor({
    interaction,
    execute,
    autocomplete,
  }: {
    interaction: BaseInteraction[];
    execute?: InteractionHandler<D, A>["execute"];
    autocomplete?: InteractionHandler<D, A>["autocomplete"];
  }) {
    this.interaction = interaction;
    this.execute = execute;
    this.autocomplete = autocomplete;

    for (const interaction of this.interaction) {
      if (!(interaction instanceof BaseInteraction)) {
        throw new Error("Only provide commands and components in interaction for InteractionHandler!");
      }
    }
  }
}
