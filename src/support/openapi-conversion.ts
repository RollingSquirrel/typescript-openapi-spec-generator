import { ParsedSchema } from "../model/parsed-schema";
import { ValueType } from "../model/value-type";

const IDENT = "  ";

export function convertToOpenAPISchema(parsedSchema: ParsedSchema) {
  const stringRepresentation =
    [
      `${parsedSchema.name}:`,
      `${ident(1)}type: object`,
      ...createRequiredPropertiesStrings(parsedSchema, 1),
      `${ident(1)}properties:`,
      ...createPropertiesStrings(parsedSchema, 2),
    ].join("\n") + "\n";

  return stringRepresentation;
}

export function convertToOpenAPISchemaContent(parsedSchema: ParsedSchema) {
  const stringRepresentation =
    [
      `${ident(0)}type: object`,
      ...createRequiredPropertiesStrings(parsedSchema, 0),
      `${ident(0)}properties:`,
      ...createPropertiesStrings(parsedSchema, 1),
    ].join("\n") + "\n";

  return stringRepresentation;
}

function createPropertiesStrings(
  parsedSchema: ParsedSchema,
  identFac: number
): string[] {
  const propertiesStrings: string[] = [];

  parsedSchema.keyValueMap.forEach((value, key) => {
    propertiesStrings.push(`${ident(identFac)}${key}:`);

    if (value.isArray) {
      propertiesStrings.push(`${ident(identFac + 1)}type: array`);
      propertiesStrings.push(`${ident(identFac + 1)}items:`);

      if (value.type !== ValueType.OBJECT) {
        // primitive
        propertiesStrings.push(`${ident(identFac + 2)}type: ${value.type}`);
      } else {
        // object
        propertiesStrings.push(
          `${ident(identFac + 2)}\$ref: "#/components/schemas/${
            value.stringRepresentation
          }"`
        );
      }
    } else {
      if (value.type !== ValueType.OBJECT) {
        // primitive
        propertiesStrings.push(`${ident(identFac + 1)}type: ${value.type}`);
      } else {
        // object
        propertiesStrings.push(
          `${ident(identFac + 1)}\$ref: "#/components/schemas/${
            value.stringRepresentation
          }"`
        );
      }
    }
  });

  return propertiesStrings;
}

function createRequiredPropertiesStrings(
  parsedSchema: ParsedSchema,
  identFac: number
): string[] {
  let requiredPropertiesStrings: string[] = [`${ident(identFac)}required:`];

  parsedSchema.keyValueMap.forEach((value, key) => {
    if (value.isRequired) {
      requiredPropertiesStrings.push(`${ident(identFac + 1)}- ${key}`);
    }
  });

  return requiredPropertiesStrings.length === 1
    ? []
    : requiredPropertiesStrings;
}

function ident(factor: number) {
  let ident = "";

  while (factor > 0) {
    ident += IDENT;
    factor--;
  }

  return ident;
}
