import path from "path";
import { ValueType } from "../src/model/value-type";
import "../src/support/ast-parser";
import { AstParser } from "../src/support/ast-parser";
import fs from "fs";

describe("AST Parser tests", () => {
  let parserInstance: AstParser;

  beforeEach(() => {
    const fixturePaths = fs
      .readdirSync(path.join(__dirname, "fixture", "tsparse"))
      .map((file) => path.join(__dirname, "fixture", "tsparse", file));

    parserInstance = new AstParser(fixturePaths);
  });

  it("should parse interface", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f001-single-interface.txt")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("WorkflowResponse");

    const keyValueMap = result[0].keyValueMap;
    expect(keyValueMap.size).toBe(4);

    const idProperty = keyValueMap.get("id");
    expect(idProperty).toBeDefined();
    expect(idProperty.isArray).toBe(false);
    expect(idProperty.isRequired).toBe(true);
    expect(idProperty.stringRepresentation).toBe("number");
    expect(idProperty.type).toBe(ValueType.NUMBER);

    const nameProperty = keyValueMap.get("name");
    expect(nameProperty).toBeDefined();
    expect(nameProperty.isArray).toBe(false);
    expect(nameProperty.isRequired).toBe(true);
    expect(nameProperty.stringRepresentation).toBe("string");
    expect(nameProperty.type).toBe(ValueType.STRING);

    const importPathProperty = keyValueMap.get("importPath");
    expect(importPathProperty).toBeDefined();
    expect(importPathProperty.isArray).toBe(false);
    expect(importPathProperty.isRequired).toBe(false);
    expect(importPathProperty.stringRepresentation).toBe("string");
    expect(importPathProperty.type).toBe(ValueType.STRING);

    const descriptionsProperty = keyValueMap.get("descriptions");
    expect(descriptionsProperty).toBeDefined();
    expect(descriptionsProperty.isArray).toBe(true);
    expect(descriptionsProperty.isRequired).toBe(true);
    expect(descriptionsProperty.stringRepresentation).toBe(
      "WorkflowDescriptionResponse"
    );
    expect(descriptionsProperty.type).toBe(ValueType.OBJECT);
  });

  it("should parse class", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f002-single-class.txt")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("WorkflowResponse");

    const keyValueMap = result[0].keyValueMap;
    expect(keyValueMap.size).toBe(4);

    const idProperty = keyValueMap.get("id");
    expect(idProperty).toBeDefined();
    expect(idProperty.isArray).toBe(false);
    expect(idProperty.isRequired).toBe(true);
    expect(idProperty.stringRepresentation).toBe("number");
    expect(idProperty.type).toBe(ValueType.NUMBER);

    const nameProperty = keyValueMap.get("name");
    expect(nameProperty).toBeDefined();
    expect(nameProperty.isArray).toBe(false);
    expect(nameProperty.isRequired).toBe(true);
    expect(nameProperty.stringRepresentation).toBe("string");
    expect(nameProperty.type).toBe(ValueType.STRING);

    const importPathProperty = keyValueMap.get("importPath");
    expect(importPathProperty).toBeDefined();
    expect(importPathProperty.isArray).toBe(false);
    expect(importPathProperty.isRequired).toBe(false);
    expect(importPathProperty.stringRepresentation).toBe("string");
    expect(importPathProperty.type).toBe(ValueType.STRING);

    const descriptionsProperty = keyValueMap.get("descriptions");
    expect(descriptionsProperty).toBeDefined();
    expect(descriptionsProperty.isArray).toBe(true);
    expect(descriptionsProperty.isRequired).toBe(true);
    expect(descriptionsProperty.stringRepresentation).toBe(
      "WorkflowDescriptionResponse"
    );
    expect(descriptionsProperty.type).toBe(ValueType.OBJECT);
  });

  it("should parse first interface of multiple interfaces", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f003-multiple-interfaces.txt")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("WorkflowResponse");
    expect(result[1].name).toBe("SecondInterface");

    // first interface
    const wfResponseKeyValueMap = result[0].keyValueMap;
    expect(wfResponseKeyValueMap.size).toBe(2);

    const idProperty = wfResponseKeyValueMap.get("id");
    expect(idProperty).toBeDefined();
    expect(idProperty.isArray).toBe(false);
    expect(idProperty.isRequired).toBe(true);
    expect(idProperty.stringRepresentation).toBe("number");
    expect(idProperty.type).toBe(ValueType.NUMBER);

    const descriptionsProperty = wfResponseKeyValueMap.get("descriptions");
    expect(descriptionsProperty).toBeDefined();
    expect(descriptionsProperty.isArray).toBe(true);
    expect(descriptionsProperty.isRequired).toBe(true);
    expect(descriptionsProperty.stringRepresentation).toBe(
      "WorkflowDescriptionResponse"
    );
    expect(descriptionsProperty.type).toBe(ValueType.OBJECT);
  });

  it("should parse second interfaces of multiple interfaces", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f003-multiple-interfaces.txt")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("WorkflowResponse");
    expect(result[1].name).toBe("SecondInterface");

    // second interface
    const secondInterfaceKeyValueMap = result[1].keyValueMap;
    expect(secondInterfaceKeyValueMap.size).toBe(2);

    const refOtherInterfaceProperty =
      secondInterfaceKeyValueMap.get("refOtherInterface");
    expect(refOtherInterfaceProperty).toBeDefined();
    expect(refOtherInterfaceProperty.isArray).toBe(false);
    expect(refOtherInterfaceProperty.isRequired).toBe(true);
    expect(refOtherInterfaceProperty.stringRepresentation).toBe(
      "WorkflowResponse"
    );
    expect(refOtherInterfaceProperty.type).toBe(ValueType.OBJECT);

    const otherDescriptionsProperty =
      secondInterfaceKeyValueMap.get("otherDescriptions");
    expect(otherDescriptionsProperty).toBeDefined();
    expect(otherDescriptionsProperty.isArray).toBe(true);
    expect(otherDescriptionsProperty.isRequired).toBe(true);
    expect(otherDescriptionsProperty.stringRepresentation).toBe(
      "WorkflowDescriptionResponse"
    );
    expect(otherDescriptionsProperty.type).toBe(ValueType.OBJECT);
  });

  it("should parse interface with heritage clause and definition in same file", () => {
    const result = parserInstance.processFile(
      path.join(
        __dirname,
        "fixture",
        "tsparse",
        "f004-resolve-heritage-interface.ts"
      )
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("FirstInterface");
    expect(result[1].name).toBe("SecondInterface");

    const secondKeyValueMap = result[1].keyValueMap;

    const idProperty = secondKeyValueMap.get("id");
    expect(idProperty).toBeDefined();
    expect(idProperty.isArray).toBe(false);
    expect(idProperty.isRequired).toBe(false);
    expect(idProperty.stringRepresentation).toBe("number");
    expect(idProperty.type).toBe(ValueType.NUMBER);

    const secondProperty = secondKeyValueMap.get("secondProperty");
    expect(secondProperty).toBeDefined();
    expect(secondProperty.isArray).toBe(false);
    expect(secondProperty.isRequired).toBe(true);
    expect(secondProperty.stringRepresentation).toBe("string");
    expect(secondProperty.type).toBe(ValueType.STRING);
  });

  it("should parse interface with heritage clause and definition in different file", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f005-2-extend-interface.ts")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("ExtendInterface");

    const keyValueMap = result[0].keyValueMap;

    const baseProperty = keyValueMap.get("base");
    expect(baseProperty).toBeDefined();
    expect(baseProperty.isArray).toBe(false);
    expect(baseProperty.isRequired).toBe(true);
    expect(baseProperty.stringRepresentation).toBe("FirstInterface");
    expect(baseProperty.type).toBe(ValueType.OBJECT);

    const extendProperty = keyValueMap.get("extendProperty");
    expect(extendProperty).toBeDefined();
    expect(extendProperty.isArray).toBe(true);
    expect(extendProperty.isRequired).toBe(true);
    expect(extendProperty.stringRepresentation).toBe("string");
    expect(extendProperty.type).toBe(ValueType.STRING);
  });

  it("should parse class with heritage clause and definition in different file", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "tsparse", "f006-2-extend-class.ts")
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("ExtendClass");

    const keyValueMap = result[0].keyValueMap;

    const baseProperty = keyValueMap.get("baseProperty");
    expect(baseProperty).toBeDefined();
    expect(baseProperty.isArray).toBe(false);
    expect(baseProperty.isRequired).toBe(true);
    expect(baseProperty.stringRepresentation).toBe("string");
    expect(baseProperty.type).toBe(ValueType.STRING);

    const extendProperty = keyValueMap.get("extendProperty");
    expect(extendProperty).toBeDefined();
    expect(extendProperty.isArray).toBe(false);
    expect(extendProperty.isRequired).toBe(false);
    expect(extendProperty.stringRepresentation).toBe("number");
    expect(extendProperty.type).toBe(ValueType.NUMBER);
  });
});
