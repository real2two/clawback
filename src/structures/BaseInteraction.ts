export enum BaseInteractionType {
  Command = 0,
  Component = 1,
}

export class BaseInteraction {
  constructor(public _for: BaseInteractionType) {}
}
