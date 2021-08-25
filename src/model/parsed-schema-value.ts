import { ValueType } from "./value-type";

export interface ParsedSchemaValue {
  type: ValueType;
  stringRepresentation: string;
  isArray: boolean;
  isRequired: boolean;
}
