import fs from "fs";
import path from "path";
import * as yaml from "yaml";

export class OutputWriter {
  constructor() {}

  writeYamlFile(
    updatedYamlDocument: yaml.Document.Parsed,
    pathToOutputDir: string,
    inputFilePath: string
  ) {
    this.mkdirIfNotExists(pathToOutputDir);

    const outputFileName = path.basename(inputFilePath);
    const completeOutputPath = path.join(pathToOutputDir, outputFileName);

    console.log(`Writing ${completeOutputPath}`);
    fs.writeFileSync(completeOutputPath, yaml.stringify(updatedYamlDocument));
  }

  writeSchemas(
    fileToYamlMap: Map<string, string>,
    pathToOutputDir: string,
    writeSingleFile: boolean
  ) {
    this.mkdirIfNotExists(pathToOutputDir);

    if (writeSingleFile) {
      const concatOutputString = Array.from(fileToYamlMap.values()).reduce(
        (previous, current) => {
          return previous + current;
        }
      );

      const completeOutputPath = path.join(pathToOutputDir, "output.yaml");
      console.log(`Writing ${completeOutputPath}`);
      fs.writeFileSync(completeOutputPath, concatOutputString);
    } else {
      fileToYamlMap.forEach((schemaString, inputFileName) => {
        const outputFileName = `${inputFileName}.yaml`;

        const completeOutputPath = path.join(pathToOutputDir, outputFileName);

        console.log(`Writing ${completeOutputPath}`);
        fs.writeFileSync(completeOutputPath, schemaString);
      });
    }
  }

  private mkdirIfNotExists(outputDirPath: string) {
    if (!fs.existsSync(outputDirPath)) {
      console.log(`Creating output directory: ${outputDirPath}`);
      fs.mkdirSync(outputDirPath, {
        recursive: true,
      });
    }
  }
}
