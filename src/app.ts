import fs from "fs";
import path from "path";
import { cwd } from "process";
import { ParsedSchema } from "./model/parsed-schema";
import { AstParser } from "./support/ast-parser";
import { OpenApiConverter } from "./support/openapi-converter";
import { OutputWriter } from "./support/output-writer";
import { YamlUpdater } from "./support/yaml-updater";
export class App {
  private config: Config;
  private openApiConverter: OpenApiConverter;
  private outputWriter: OutputWriter;

  constructor(config: Config) {
    this.config = config;
    this.openApiConverter = new OpenApiConverter(config.sortProperties);
    this.outputWriter = new OutputWriter();
  }

  start() {
    console.log("Started with config:", this.config);

    console.log("Starting Schema Parsing");
    const parseDir = fs.readdirSync(path.join(cwd(), this.config.inputDir));
    console.log("Found files:", parseDir);

    /**
     * Maps the filename to their converted YAML representation
     */
    const convertedYamlStringsMap = new Map<string, string>();
    const astParser = new AstParser(
      parseDir.map((fileInDir) =>
        path.join(cwd(), this.config.inputDir, fileInDir)
      )
    );
    const allParsedSchemas: ParsedSchema[] = [];

    for (const fileToParse of parseDir) {
      const filePath = path.join(cwd(), this.config.inputDir, fileToParse);
      const parsedSchemas = astParser.processFile(filePath);
      allParsedSchemas.push(...parsedSchemas);

      for (let i = 0; i < parsedSchemas.length; i++) {
        const schema = parsedSchemas[i];

        console.log(
          `Converting parsed schema to OpenAPI Spec - ${schema.name}`
        );
        convertedYamlStringsMap.set(
          `${fileToParse.replace(".ts", "")}-${i}`,
          this.openApiConverter.convertToOpenAPISchema(schema)
        );
      }
    }

    if (this.config.existingOpenApiSpecPath !== undefined) {
      this.writeFullApiSpec(allParsedSchemas);
    }

    const outputDirPath = path.join(cwd(), this.config.outDir);

    this.outputWriter.writeSchemas(
      convertedYamlStringsMap,
      outputDirPath,
      this.config.writeSingleFile
    );
  }

  private writeFullApiSpec(allParsedSchemas: ParsedSchema[]) {
    if (this.config.existingOpenApiSpecPath === undefined) {
      throw new Error("Illegal argument. Existing API Spec must be defined.");
    }

    const yamlManager = new YamlUpdater(
      path.join(cwd(), this.config.existingOpenApiSpecPath),
      this.openApiConverter
    );

    const parsedUpdatedDocument =
      yamlManager.updateDefinitions(allParsedSchemas);
    const outputDirPath = path.join(cwd(), this.config.outDir);

    this.outputWriter.writeYamlFile(
      parsedUpdatedDocument,
      outputDirPath,
      this.config.existingOpenApiSpecPath
    );
  }
}
