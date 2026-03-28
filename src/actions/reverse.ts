import { JsonValue } from "../types/common";

export const reverseAction = async (payload: JsonValue): Promise<JsonValue> => {
  if (typeof payload === "string") {
    return payload.split("").reverse().join("");
  }

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = value.split("").reverse().join("");
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return payload;
};
