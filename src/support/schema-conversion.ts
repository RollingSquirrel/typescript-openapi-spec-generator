import { ParsedSchema } from "../model/parsed-schema";
import { ParsedSchemaValue } from "../model/parsed-schema-value";
import { ValueType } from "../model/value-type";

export function convertToSchema(relevantWordsInput: string[]): ParsedSchema {
  const schema: ParsedSchema = {
    name: relevantWordsInput[0],
    keyValueMap: new Map<string, ParsedSchemaValue>(),
  };

  // sanity check - must include pairs of values
  if ((relevantWordsInput.length - 1) % 2 === 1) {
    console.error(relevantWordsInput);
    throw new Error(
      "Parsing failed. There are more than just key-value pairs remaining."
    );
  }

  for (let i = 1; i < relevantWordsInput.length; i = i + 2) {
    const key = relevantWordsInput[i];
    const value = relevantWordsInput[i + 1];

    schema.keyValueMap.set(parseKey(key), parseValue(key, value));
  }

  return schema;
}

function parseValue(key: string, value: string): ParsedSchemaValue {
  if (value.includes(";")) {
    value = value.replace(";", "");
  } else {
    console.error(value);
    throw new Error(
      'Received invalid value for parsing. Values should include their ";" form ts definition.'
    );
  }

  let isArray = false;

  if (value.includes("[]")) {
    isArray = true;
    value = value.replace("[]", "");
  }

  let type: ValueType;

  if (value === "string") {
    type = ValueType.STRING;
  } else if (value === "number") {
    type = ValueType.NUMBER;
  } else if (value === "boolean") {
    type = ValueType.BOOLEAN;
  } else {
    type = ValueType.OBJECT;
  }

  let isRequired = true;

  if (key.includes("?")) {
    isRequired = false;
  }

  return {
    isArray: isArray,
    stringRepresentation: value,
    type: type,
    isRequired: isRequired,
  };
}

function parseKey(key: string): string {
  if (key.includes(":")) {
    return key.replace(":", "").replace("?", "");
  } else {
    console.error(key);
    throw new Error(
      'Received invalid key for parsing. Keys should include their ":" form ts definition.'
    );
  }
}
