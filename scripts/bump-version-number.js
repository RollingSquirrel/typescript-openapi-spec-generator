const { logError, logStandard, logSuccess } = require("./util/script-util");

const fs = require('fs');
const path = require('path');
const { cwd } = require("process");
const { exec } = require("child_process");
const versionBumpType = process.argv[2];

switch (versionBumpType) {
  case "patch":
    bumpPatchVersion();
    break;
  case "minor":
    bumpMinorVersion();
    break;
  case "major":
    bumpMajorVersion();
    break;
  default:
    logError("Received invalid param at position 0. Only 'patch', 'minor', and 'major' version types are supported.");
    break;
}

function parseCurrentVersion() {
  const packageJsonContent = JSON.parse(fs.readFileSync(path.join(cwd(), "package.json")));

  /**
   * @type string
   */
  const versionString = packageJsonContent.version;

  const versionNumbers = versionString.split('.');
  const parsed = {
    major: parseInt(versionNumbers[0]),
    minor: parseInt(versionNumbers[1]),
    patch: parseInt(versionNumbers[2])
  };

  logStandard(`Parsed current version: ${parsed.major}.${parsed.minor}.${parsed.patch}`);

  return parsed;
}

function bumpPatchVersion() {
  const currentVersion = parseCurrentVersion();

  logStandard("Bump patch version.");
  currentVersion.patch++;

  overwritePackageJson(`${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
  runInstall();
}

function bumpMinorVersion() {
  const currentVersion = parseCurrentVersion();

  logStandard("Bump minor version.");
  currentVersion.minor++;

  overwritePackageJson(`${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
  runInstall();
}

function bumpMajorVersion() {
  const currentVersion = parseCurrentVersion();

  logStandard("Bump major version.");
  currentVersion.major++;

  overwritePackageJson(`${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
  runInstall();
}

/**
 * Overwrites the existing package.json with the new version.
 * 
 * @param {string} newVersion The new version number to set
 */
function overwritePackageJson(newVersion) {
  const packageJsonContent = JSON.parse(fs.readFileSync(path.join(cwd(), "package.json")));

  packageJsonContent.version = newVersion;

  logStandard("Overwriting existing package.json.");

  fs.writeFileSync(path.join(cwd(), "package.json"), JSON.stringify(packageJsonContent, undefined, 2));

  logSuccess(`Successfully updated package.json. New version is ${newVersion}`);
}

function runInstall() {
  logStandard('Running "npm install" command to update package-lock.json');

  exec('npm i', (err, stdout, stderr) => {
    if (err) {
      logError('An error occurred. Output:');
      logError(stdout);
      logError(stderr);
    } else {
      logSuccess(`Successfully ran install command. Output:`);
      logStandard(stdout);
      logStandard(stderr);

      logSuccess("Done! Successfully bumped version.");
    }
  });
}
