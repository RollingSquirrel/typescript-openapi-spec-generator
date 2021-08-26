import fs from "fs";
import path from "path";
import { cwd } from "process";
import { AstParser } from "./support/ast-parser";
import { convertToOpenAPISchema } from "./support/openapi-conversion";
import { writeSchemas } from "./support/output-writer";

export class App {

  constructor() {
  }

  start(config: Config) {
    console.log("Started with config:", config);
  
    console.log("Starting Schema Parsing");
    const parseDir = fs.readdirSync(path.join(cwd(), config.inputDir));
    console.log("Found files:", parseDir);
  
    /**
     * Maps the filename to their converted YAML representation
     */
    const convertedYamlStringsMap = new Map<string, string>();
    const astParser = new AstParser();
  
    for (const fileToParse of parseDir) {
      const filePath = path.join(cwd(), config.inputDir, fileToParse);
      const parsedSchemas = astParser.processFile(filePath);
  
      for (let i = 0; i < parsedSchemas.length; i++) {
        const schema = parsedSchemas[i];
  
        console.log("Converting parsed schema to OpenAPI Spec");
        convertedYamlStringsMap.set(
          `${fileToParse.replace(".ts", "")}-${i}`,
          convertToOpenAPISchema(schema)
        );
      }
    }
  
    const outputDirPath = path.join(cwd(), config.outDir);
    writeSchemas(convertedYamlStringsMap, outputDirPath, config.writeSingleFile);
  }

}