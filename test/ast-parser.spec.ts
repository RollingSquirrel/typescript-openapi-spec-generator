import path from "path";
import { ValueType } from "../src/model/value-type";
import "../src/support/ast-parser";
import { AstParser } from "../src/support/ast-parser";

describe("AST Parser tests", () => {
  let parserInstance: AstParser;

  beforeEach(() => {
    parserInstance = new AstParser();
  });

  it("should parse interface", () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "f001-single-interface.txt")
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
    expect(descriptionsProperty.stringRepresentation).toBe("WorkflowDescriptionResponse");
    expect(descriptionsProperty.type).toBe(ValueType.OBJECT);
  });

  it('should parse class', () => {
    const result = parserInstance.processFile(
      path.join(__dirname, "fixture", "f002-single-class.txt")
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
    expect(descriptionsProperty.stringRepresentation).toBe("WorkflowDescriptionResponse");
    expect(descriptionsProperty.type).toBe(ValueType.OBJECT);
  });
});