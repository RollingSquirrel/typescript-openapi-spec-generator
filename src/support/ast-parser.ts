import {
  ClassDeclaration,
  InterfaceDeclaration,
  Node,
  Project,
  PropertyDeclaration,
  PropertySignature,
  SourceFile,
  SyntaxKind,
  ts,
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

    if (sourceFile === undefined) {
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

    this.processHeritageClausesIfPresent(
      classDeclaration,
      parsedSchema.keyValueMap
    );

    const properties = classDeclaration.getProperties();
    this.processProperties(properties, parsedSchema.keyValueMap);

    return parsedSchema;
  }

  private processInterface(interfaceDeclaration: InterfaceDeclaration) {
    const parsedSchema: ParsedSchema = {
      name: interfaceDeclaration.getName(),
      keyValueMap: new Map<string, ParsedSchemaValue>(),
    };

    this.processHeritageClausesIfPresent(
      interfaceDeclaration,
      parsedSchema.keyValueMap
    );

    const properties = interfaceDeclaration.getProperties();
    this.processProperties(properties, parsedSchema.keyValueMap);

    return parsedSchema;
  }

  private processHeritageClausesIfPresent(
    declaration: InterfaceDeclaration | ClassDeclaration,
    keyValueMap: Map<string, ParsedSchemaValue>
  ) {
    const heritageClauses = declaration.getHeritageClauses();
    if (heritageClauses.length !== 0) {
      console.log(`Found heritage clauses for ${declaration.getName()}`);

      for (const heritageClause of heritageClauses) {
        const typeNodes = heritageClause.getTypeNodes();

        if (typeNodes.length !== 1) {
          console.log(typeNodes);
          throw new Error(
            "Multiple / Zero type nodes in heritage clause are not supported."
          );
        }

        let definitions: Node<ts.Node>[];
        try {
          definitions = typeNodes[0]
            .getExpression()
            .asKindOrThrow(SyntaxKind.Identifier)
            .getDefinitionNodes();
        } catch (error) {
          console.log(
            "Failed to find definition for heritage clause. " +
              "You probably did not add the source file to the parsed inputs."
          );
          console.log(
            `To resolve: ${typeNodes[0]
              .getExpression()
              .asKindOrThrow(SyntaxKind.Identifier)
              .getText()}`
          );

          throw error;
        }

        if (definitions.length !== 1) {
          console.log("Definitions:", definitions);
          throw new Error(
            "Multiple / Zero definitions of heritage clause not supported." +
              "Provide the implementation to be resolved."
          );
        }

        const definition = definitions[0];
        let resultKeyValueMap: Map<string, ParsedSchemaValue>;

        switch (definition.getKind()) {
          case SyntaxKind.InterfaceDeclaration:
            resultKeyValueMap = this.processInterface(
              definition.asKindOrThrow(SyntaxKind.InterfaceDeclaration)
            ).keyValueMap;
            break;
          case SyntaxKind.ClassDeclaration:
            resultKeyValueMap = this.processClass(
              definition.asKindOrThrow(SyntaxKind.ClassDeclaration)
            ).keyValueMap;
            break;
          default:
            console.log(definition);
            throw new Error("Unsupported definition kind.");
        }

        resultKeyValueMap.forEach((value, key) => {
          keyValueMap.set(key, value);
        });
      }
    }
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
