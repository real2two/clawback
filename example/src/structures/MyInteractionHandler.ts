import { InteractionHandler } from "clawback";
import type { Context } from "hono";
import type { APIApplicationCommandAutocompleteResponse, APIBaseInteraction, APIInteractionResponse, InteractionType } from "discord-api-types/v10";

export interface BaseInteractionResponse {
  c: Context;
  interaction: APIBaseInteraction<InteractionType, any>;
}

export interface InteractionResponse extends BaseInteractionResponse {
  respond: (data: APIInteractionResponse) => void;
}
export interface AutocompleteInteractionResponse extends BaseInteractionResponse {
  respond: (data: APIApplicationCommandAutocompleteResponse) => void;
}

export const MyInteractionHandler = InteractionHandler<InteractionResponse, AutocompleteInteractionResponse>;
