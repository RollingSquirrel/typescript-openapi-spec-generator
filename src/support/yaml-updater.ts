import fs from "fs";
import * as yaml from "yaml";
import { YAMLMap } from "yaml/types";
import { ParsedSchema } from "../model/parsed-schema";
import { convertToOpenAPISchemaContent } from "./openapi-conversion";

export class YamlUpdater {
  private existingFilePath: string;

  constructor(existingFilePath: string) {
    this.existingFilePath = existingFilePath;
  }

  /**
   * Overwrite / Add all schemas
   *
   * @param newSchemas The new schemas to update the existing definitions with
   * @returns The updated yaml document
   */
  updateDefinitions(newSchemas: ParsedSchema[]): yaml.Document.Parsed {
    const parsedDocument = this.parseExistingDefinitions();

    let currentYamlMap = parsedDocument.contents;

    if (!(currentYamlMap instanceof YAMLMap)) {
      throw new Error("Invalid existing document.");
    }

    currentYamlMap = this.getYamlMapAndAssert(currentYamlMap, "components");
    currentYamlMap = this.getYamlMapAndAssert(currentYamlMap, "schemas");

    for (const parsedSchema of newSchemas) {
      this.overwriteKeyInMap(currentYamlMap, parsedSchema);
    }

    return parsedDocument;
  }

  private overwriteKeyInMap(yamlMap: YAMLMap, parsedSchema: ParsedSchema) {
    const key = parsedSchema.name;

    yamlMap.set(key, yaml.parse(convertToOpenAPISchemaContent(parsedSchema)));
  }

  private getYamlMapAndAssert(currentMap: YAMLMap, keyForAnotherMap: string) {
    const next = currentMap.get(keyForAnotherMap);

    if (next instanceof YAMLMap) {
      return next;
    } else {
      console.log(next);
      throw new Error(`Expected type YAMLMap but was ${typeof next}`);
    }
  }

  private parseExistingDefinitions(): yaml.Document.Parsed {
    const fileContent = fs.readFileSync(this.existingFilePath).toString();

    return yaml.parseDocument(fileContent);
  }
}
