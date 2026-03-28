import { JsonValue } from "../types/common";
import { uppercaseAction } from "./uppercase";
import { reverseAction } from "./reverse";
import { addTimestampAction } from "./addTimestamp";

export const actionRegistry: Record<
  string,
  (payload: JsonValue) => Promise<JsonValue>
> = {
  uppercase: uppercaseAction,
  reverse: reverseAction,
  addTimestamp: addTimestampAction,
};

export { uppercaseAction, reverseAction, addTimestampAction };
