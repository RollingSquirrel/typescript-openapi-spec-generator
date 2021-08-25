import fs from "fs";
import path from "path";
import { cwd } from "process";
import { convertToOpenAPISchema } from "./support/openapi-conversion";
import { writeSchemaToFiles } from "./support/output-writer";
import { convertToSchema } from "./support/schema-conversion";

const config = {
  outDir: "./parsed",
  inputDir: "./parse",
};

console.log("Starting Schema Parsing");

const parseDir = fs.readdirSync(path.join(cwd(), config.inputDir));

console.log("Found files:", parseDir);

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
  const schemaString = convertToOpenAPISchema(schema);

  console.log("Writing OpenAPI Spec");
  const outputDirPath = path.join(cwd(), config.outDir);
  writeSchemaToFiles(fileToParse, schemaString, outputDirPath);
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
