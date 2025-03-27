import { EntityComponent } from "../structures/Entity";

export function createComponent() {
  type ComponentConstructor = { customId: Component["customId"] };

  class Component extends EntityComponent {
    customId: string | RegExp;
    constructor({ customId }: ComponentConstructor) {
      super();
      this.customId = customId;
    }
  }

  return (data: ComponentConstructor) => new Component(data);
}
