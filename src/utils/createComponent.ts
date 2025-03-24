import { BaseInteraction, BaseInteractionType } from "../structures/BaseInteraction";

export function createComponent() {
  return class Component extends BaseInteraction {
    customId: string | RegExp;
    constructor({ customId }: { customId: Component["customId"] }) {
      super(BaseInteractionType.Component);
      this.customId = customId;
    }
  };
}
