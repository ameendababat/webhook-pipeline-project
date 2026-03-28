import { JsonValue } from "../types/common";

export const addTimestampAction = async (
  payload: JsonValue,
): Promise<JsonValue> => {
  const timestamp = new Date().toISOString();

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as Record<string, unknown>;
    return {
      ...obj,
      processed_at: timestamp,
      received_at: obj["received_at"] ?? timestamp,
    };
  }

  return {
    original: payload,
    processed_at: timestamp,
    received_at: timestamp,
  };
};
