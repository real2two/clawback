import { Entity, EntityType } from "../structures/Entity";

export function createComponent() {
  return class Component extends Entity {
    customId: string | RegExp;
    constructor({ customId }: { customId: Component["customId"] }) {
      super(EntityType.Component);
      this.customId = customId;
    }
  };
}
