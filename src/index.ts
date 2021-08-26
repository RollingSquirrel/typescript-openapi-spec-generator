import fs from "fs";
import path from "path";
import { cwd } from "process";
import { AstParser } from "./support/ast-parser";
import { convertToOpenAPISchema } from "./support/openapi-conversion";
import { writeSchemas } from "./support/output-writer";

interface Config {
  /**
   * The output directory relative to the current working directory
   */
  outDir: string;
  /**
   * The input directory relative to the current working directory
   */
  inputDir: string;
  /**
   * If true all parsed files will be bundled within a single output file
   */
  writeSingleFile: boolean;
}

const defaultConfig: Config = {
  outDir: "./parsed",
  inputDir: "./parse",
  writeSingleFile: false,
};

// parse command line parameters to overwrite defaults
for (let i = 2; i < process.argv.length; i++) {
  const argument = process.argv[i];
  console.log(`Received argument ${argument}`);

  if (argument.includes("--wsf")) {
    defaultConfig.writeSingleFile = argument.replace("--wsf=", "") === "true";
  } else if (argument.includes("--input")) {
    defaultConfig.inputDir = argument.replace("--input=", "");
  } else if (argument.includes("--output")) {
    defaultConfig.outDir = argument.replace("--output=", "");
  } else {
    console.log("Found unknown argument. Skipping: ", argument);
  }
}

main(defaultConfig);

function main(config: Config) {
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
