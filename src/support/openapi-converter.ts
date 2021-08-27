import { ParsedSchema } from "../model/parsed-schema";
import { ValueType } from "../model/value-type";

export class OpenApiConverter {
  private currentIndentation;
  private isPropertySortingEnabled: boolean;

  constructor(sortProperties: boolean) {
    this.currentIndentation = "  ";
    this.isPropertySortingEnabled = sortProperties;
  }

  convertToOpenAPISchema(parsedSchema: ParsedSchema) {
    const stringRepresentation =
      [
        `${parsedSchema.name}:`,
        `${this.ident(1)}type: object`,
        ...this.createRequiredPropertiesStrings(parsedSchema, 1),
        `${this.ident(1)}properties:`,
        ...this.createPropertiesStrings(parsedSchema, 2),
      ].join("\n") + "\n";

    return stringRepresentation;
  }

  convertToOpenAPISchemaContent(parsedSchema: ParsedSchema) {
    const stringRepresentation =
      [
        `${this.ident(0)}type: object`,
        ...this.createRequiredPropertiesStrings(parsedSchema, 0),
        `${this.ident(0)}properties:`,
        ...this.createPropertiesStrings(parsedSchema, 1),
      ].join("\n") + "\n";

    return stringRepresentation;
  }

  private createPropertiesStrings(
    parsedSchema: ParsedSchema,
    identFac: number
  ): string[] {
    const propertiesStrings: string[] = [];
    const keys = Array.from(parsedSchema.keyValueMap.keys());

    if (this.isPropertySortingEnabled) {
      keys.sort();
    }

    for (const key of keys) {
      propertiesStrings.push(`${this.ident(identFac)}${key}:`);

      const value = parsedSchema.keyValueMap.get(key);

      if (value === undefined) {
        console.log(key, keys);
        throw new Error("Value to given key undefined.");
      }

      if (value.isArray) {
        propertiesStrings.push(`${this.ident(identFac + 1)}type: array`);
        propertiesStrings.push(`${this.ident(identFac + 1)}items:`);

        if (value.type !== ValueType.OBJECT) {
          // primitive
          propertiesStrings.push(
            `${this.ident(identFac + 2)}type: ${value.type}`
          );
        } else {
          // object
          propertiesStrings.push(
            `${this.ident(identFac + 2)}\$ref: "#/components/schemas/${
              value.stringRepresentation
            }"`
          );
        }
      } else {
        if (value.type !== ValueType.OBJECT) {
          // primitive
          propertiesStrings.push(
            `${this.ident(identFac + 1)}type: ${value.type}`
          );
        } else {
          // object
          propertiesStrings.push(
            `${this.ident(identFac + 1)}\$ref: "#/components/schemas/${
              value.stringRepresentation
            }"`
          );
        }
      }
    }

    return propertiesStrings;
  }

  private createRequiredPropertiesStrings(
    parsedSchema: ParsedSchema,
    identFac: number
  ): string[] {
    let requiredPropertiesStrings: string[] = [];

    parsedSchema.keyValueMap.forEach((value, key) => {
      if (value.isRequired) {
        requiredPropertiesStrings.push(`${this.ident(identFac + 1)}- ${key}`);
      }
    });

    if (this.isPropertySortingEnabled) {
      requiredPropertiesStrings.sort();
    }

    const outputPropertyStrings = [
      `${this.ident(identFac)}required:`,
      ...requiredPropertiesStrings,
    ];

    return outputPropertyStrings.length === 1 ? [] : outputPropertyStrings;
  }

  private ident(factor: number) {
    let ident = "";

    while (factor > 0) {
      ident += this.currentIndentation;
      factor--;
    }

    return ident;
  }
}
