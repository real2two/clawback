export enum EntityType {
  Command = 0,
  Component = 1,
}

export class Entity {
  constructor(public _for: EntityType) {}
}
