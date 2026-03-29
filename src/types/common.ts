export type JsonValue =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];
