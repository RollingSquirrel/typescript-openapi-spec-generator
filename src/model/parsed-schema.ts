import { ParsedSchemaValue } from "./parsed-schema-value";

export interface ParsedSchema {
  name: string;
  keyValueMap: Map<string, ParsedSchemaValue>;
}
