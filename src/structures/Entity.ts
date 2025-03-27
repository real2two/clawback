export enum InteractionEntityType {
  Command = 0,
  Subcommand = 1,
  SubcommandGroup = 2,
  Component = 3,
  Option = 4,
}

export class Entity {
  constructor(public _for: InteractionEntityType) {}
}

export class EntityCommand extends Entity {
  constructor() {
    super(InteractionEntityType.Command);
  }
}

export class EntitySubcommand extends Entity {
  constructor() {
    super(InteractionEntityType.Subcommand);
  }
}

export class EntitySubcommandGroup extends Entity {
  constructor() {
    super(InteractionEntityType.SubcommandGroup);
  }
}

export class EntityComponent extends Entity {
  constructor() {
    super(InteractionEntityType.Component);
  }
}

export class EntityOption extends Entity {
  constructor() {
    super(InteractionEntityType.Option);
  }
}
