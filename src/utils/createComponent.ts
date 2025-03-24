import { InteractionEntity, InteractionEntityType } from "../structures/InteractionEntity";

export function createComponent() {
  return class Component extends InteractionEntity {
    customId: string | RegExp;
    constructor({ customId }: { customId: Component["customId"] }) {
      super(InteractionEntityType.Component);
      this.customId = customId;
    }
  };
}
