import fs from "fs";
import path from "path";

export function writeSchemasToFiles(
  fileToYamlMap: Map<string, string>,
  pathToOutputDir: string
) {
  mkdirIfNotExists(pathToOutputDir);

  fileToYamlMap.forEach((schemaString, inputFileName) => {
    const outputFileName = inputFileName.replace(".ts", ".yaml");

    const completeOutputPath = path.join(pathToOutputDir, outputFileName);

    console.log(`Writing ${completeOutputPath}`);
    fs.writeFileSync(completeOutputPath, schemaString);
  });
}

function mkdirIfNotExists(outputDirPath: string) {
  if (!fs.existsSync(outputDirPath)) {
    console.log(`Creating output directory: ${outputDirPath}`);
    fs.mkdirSync(outputDirPath, {
      recursive: true,
    });
  }
}
