export enum InteractionEntityType {
  Command = 0,
  Component = 1,
}

export class InteractionEntity {
  constructor(public _for: InteractionEntityType) {}
}
