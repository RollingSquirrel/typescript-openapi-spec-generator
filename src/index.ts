import { App } from "./app";

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

const app = new App();

app.start(defaultConfig);
