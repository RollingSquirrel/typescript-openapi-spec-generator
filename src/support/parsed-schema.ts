export enum ValueType {
  OBJECT = "object",
  NUMBER = "number",
  BOOLEAN = "boolean",
  STRING = "string",
}

export interface ParsedSchemaValue {
  type: ValueType;
  stringRepresentation: string;
  isArray: boolean;
  isRequired: boolean;
}

export interface ParsedSchema {
  name: string;
  keyValueMap: Map<string, ParsedSchemaValue>;
}
