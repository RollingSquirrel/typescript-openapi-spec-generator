import fs from "fs";
import path from "path";
import { cwd } from "process";
import { convertToOpenAPISchema } from "./support/openapi-conversion";
import { writeSchemas } from "./support/output-writer";
import { convertToSchema } from "./support/schema-conversion";

const config = {
  outDir: "./parsed",
  inputDir: "./parse",
  writeSingleFile: true,
};

main();

function main() {
  console.log("Starting Schema Parsing");
  const parseDir = fs.readdirSync(path.join(cwd(), config.inputDir));
  console.log("Found files:", parseDir);

  /**
   * Maps the filename to their converted YAML representation
   */
  const convertedYamlStringsMap = new Map<string, string>();

  for (const fileToParse of parseDir) {
    const fileContent = fs.readFileSync(
      path.join(cwd(), config.inputDir, fileToParse)
    );

    const stringContent = fileContent.toString();
    const words = stringContent.split(" ").map((word) => word.trim());
    const relevantWordsSanitized = [];

    let isImportsRemoved = false;

    for (const word of words) {
      if (word.includes("class") || word.includes("interface")) {
        isImportsRemoved = true;
      }

      const sanitizedWord = sanitizeWord(word);

      if (isImportsRemoved && isWordRelevant(sanitizedWord)) {
        relevantWordsSanitized.push(sanitizedWord);
      }
    }

    console.log("Parsing and converting to schema");
    const schema = convertToSchema(relevantWordsSanitized);

    console.log("Converting parsed schema to OpenAPI Spec");
    convertedYamlStringsMap.set(fileToParse, convertToOpenAPISchema(schema));
  }

  const outputDirPath = path.join(cwd(), config.outDir);
  writeSchemas(convertedYamlStringsMap, outputDirPath, config.writeSingleFile);
}

function isWordRelevant(word: string): boolean {
  return (
    word.length !== 0 && !word.includes("class") && !word.includes("interface")
  );
}

function sanitizeWord(word: string): string {
  return word
    .replace("\r", "")
    .replace("\n", "")
    .replace("{", "")
    .replace("}", "");
}
