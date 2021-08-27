import path from "path";
import fs from "fs";
import * as yaml from "yaml";
import { YamlUpdater } from "../src/support/yaml-updater";
import { YAMLMap } from "yaml/types";
import { ParsedSchema } from "../src/model/parsed-schema";
import { ValueType } from "../src/model/value-type";
import { OpenApiConverter } from "../src/support/openapi-converter";

describe("YAML Manager tests", () => {
  let manager: YamlUpdater;

  beforeEach(() => {
    manager = new YamlUpdater(
      path.join(__dirname, "fixture", "yaml", "f001-existing.yaml"),
      new OpenApiConverter(true)
    );
  });

  it("should update existing definitions", () => {
    const parsed: ParsedSchema[] = [
      {
        name: "ParameterCreationRequest",
        keyValueMap: new Map(),
      },
    ];

    parsed[0].keyValueMap.set("id", {
      isArray: false,
      isRequired: true,
      stringRepresentation: "number",
      type: ValueType.NUMBER,
    });

    const updatedDocument = manager.updateDefinitions(parsed);

    const expectedStringContent = fs
      .readFileSync(
        path.join(
          __dirname,
          "fixture",
          "yaml",
          "f002-expected-update-existing.yaml"
        )
      )
      .toString();

    expect(yaml.stringify(yaml.parse(expectedStringContent))).toBe(
      yaml.stringify(updatedDocument)
    );
  });

  it('should update existing and sort', () => {
    manager = new YamlUpdater(
      path.join(__dirname, "fixture", "yaml", "f003-existing-not-sorted.yaml"),
      new OpenApiConverter(true)
    );

    const parsed: ParsedSchema[] = [
      {
        name: "ParameterCreationRequest",
        keyValueMap: new Map(),
      },
    ];

    parsed[0].keyValueMap.set("parameterValue", {
      isArray: false,
      isRequired: true,
      stringRepresentation: "string",
      type: ValueType.STRING,
    });
    parsed[0].keyValueMap.set("abc", {
      isArray: false,
      isRequired: true,
      stringRepresentation: "string",
      type: ValueType.STRING,
    });

    const updatedDocument = manager.updateDefinitions(parsed);

    const expectedStringContent = fs
      .readFileSync(
        path.join(
          __dirname,
          "fixture",
          "yaml",
          "f003-expected-update-sorted.yaml"
        )
      )
      .toString();

    expect(yaml.stringify(yaml.parse(expectedStringContent))).toBe(
      yaml.stringify(updatedDocument)
    );
  });
});
