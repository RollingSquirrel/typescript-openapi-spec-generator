import {
  ClassDeclaration,
  InterfaceDeclaration,
  Project,
  PropertyDeclaration,
  PropertySignature,
  SourceFile,
  SyntaxKind,
  ts,
  Type,
} from "ts-morph";
import { ParsedSchema } from "../model/parsed-schema";
import { ParsedSchemaValue } from "../model/parsed-schema-value";
import { ValueType } from "../model/value-type";

export class AstParser {
  private filePathSourceMap: Map<string, SourceFile>;

  constructor(filePaths: string[]) {
    const astProject = new Project({});
    this.filePathSourceMap = new Map();

    for (const filePath of filePaths) {
      const sourceFile = astProject.addSourceFileAtPath(filePath);

      this.filePathSourceMap.set(filePath, sourceFile);
    }
  }

  processFile(filePath: string) {
    const sourceFile = this.filePathSourceMap.get(filePath);

    if(sourceFile === undefined) {
      console.log(`${filePath} not loaded.`);
      throw new Error("Source file to process has not been loaded.");
    }

    const classes = sourceFile.getClasses();
    const interfaces = sourceFile.getInterfaces();

    const parseResult: ParsedSchema[] = [
      ...classes.map((cls) => this.processClass(cls)),
      ...interfaces.map((inf) => this.processInterface(inf)),
    ];

    return parseResult;
  }

  private processClass(classDeclaration: ClassDeclaration) {
    const name = classDeclaration.getName();
    if (name === undefined) {
      console.log(name);
      throw new Error("Invalid class for parsing.");
    }

    const parsedSchema: ParsedSchema = {
      name: name,
      keyValueMap: new Map<string, ParsedSchemaValue>(),
    };

    const properties = classDeclaration.getProperties();
    this.processProperties(properties, parsedSchema.keyValueMap);

    return parsedSchema;
  }

  private processInterface(interfaceDeclaration: InterfaceDeclaration) {
    const parsedSchema: ParsedSchema = {
      name: interfaceDeclaration.getName(),
      keyValueMap: new Map<string, ParsedSchemaValue>(),
    };

    const properties = interfaceDeclaration.getProperties();
    this.processProperties(properties, parsedSchema.keyValueMap);

    return parsedSchema;
  }

  private processProperties(
    properties: PropertySignature[] | PropertyDeclaration[],
    keyValueMap: Map<string, ParsedSchemaValue>
  ) {
    for (const property of properties) {
      const propertyName = property.getName();
      let typeNode = property.getTypeNodeOrThrow();
      let isArray = false;
      let isRequired = property.getQuestionTokenNode() === undefined;

      if (typeNode.getKind() === SyntaxKind.ArrayType) {
        isArray = true;
        const innerTypeNode = typeNode
          .asKind(SyntaxKind.ArrayType)
          ?.getElementTypeNode();

        if (innerTypeNode === undefined) {
          console.log(typeNode);
          throw new Error("Array has no inner type node!");
        }

        typeNode = innerTypeNode;
      }

      let valueType: ValueType;

      switch (typeNode.getKind()) {
        case SyntaxKind.StringKeyword:
          valueType = ValueType.STRING;
          break;
        case SyntaxKind.BooleanKeyword:
          valueType = ValueType.BOOLEAN;
          break;
        case SyntaxKind.NumberKeyword:
          valueType = ValueType.NUMBER;
          break;
        case SyntaxKind.TypeReference:
          valueType = ValueType.OBJECT;
          break;
        default:
          console.log(typeNode.getKind());
          throw new Error("Unsupported type node kind.");
      }

      keyValueMap.set(propertyName, {
        isArray: isArray,
        isRequired: isRequired,
        stringRepresentation: typeNode.getText(),
        type: valueType,
      });
    }
  }
}
