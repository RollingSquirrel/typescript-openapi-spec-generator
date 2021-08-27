# TypeScript OpenAPI Spec Generator

This simple NodeJS application can be used to convert TypeScript models to their corresponding OpenAPI specification (v3). [Further Reading](https://swagger.io/docs/specification/about/)

Features:

- Generate OpenAPI specification based on your models (classes or interfaces)
- Update schemas within your existing OpenAPI specification without manually inserting them
- Sort properties (required list and properties themselves)

This is a very simple implementation based on my personal requirements:

- Quick conversion of a large number of entities to their schema
- No special documentation requirements (There are advanced libraries out there to generate documentation based on the source code jsDoc which may be harder to maintain in a small and quickly changing project)
- Specifying required and none required properties to simplify frontend development

The implementation relies on [ts-morph](https://github.com/dsherret/ts-morph) an abstraction of the TypeScript compiler API to parse the AST.

Feel free to fork and expand this project to tailor it to your needs.

## Example

Model:

```typescript
// Import is not required to be resolved unless needed for extends/implements
import { WorkflowDescriptionResponse } from "./workflow-description-response";

export interface DefaultResponse {
  defaultResponseValue: string;
}

export interface WorkflowResponse extends DefaultResponse {
  /**
   * Some comment will be ignored.
   */
  id: number;
  name: string;

  // Note: Optional -> not in required property list
  // (other format importPath: string | undefined not supported)
  importPath?: string;
  descriptions: WorkflowDescriptionResponse[];
}
```

Results in the following YAML:

```yaml
DefaultResponse:
  type: object
  required:
    - defaultResponseValue
  properties:
    defaultResponseValue:
      type: string
WorkflowResponse:
  type: object
  required:
    - defaultResponseValue
    - id
    - name
    - descriptions
  properties:
    defaultResponseValue:
      type: string
    id:
      type: number
    name:
      type: string
    importPath:
      type: string
    descriptions:
      type: array
      items:
        $ref: "#/components/schemas/WorkflowDescriptionResponse"
```

## Setup

This project requires NodeJS (v14+) to be installed.

After cloning this repository run `npm i` to install all dependencies.
This includes the development dependencies to compile the project.

That's all. No more setup required.

## Run

Create a folder `parse` in the project directory and paste all your models.
Each model must be in an individual file which only includes a single interface or class.

Now you can run the application with `npm start` to get the corresponding YAML representation.
The results are saved inside the `/parsed` directory in the current working directory.

### Want to run the compiled project?

Run the compiler with `npm run build`.

Then run the compiled entry file `index.js` with node:

```
node ./dist/index.js --option=value
```

## Configuration

The application accepts some simple command line options in the format `--option=value`.
Note that the scripts inside `package.json` require a special format to pass options to node.
See the `start:s` script for an example.

Example usage with Node:

```
npm run start:s -- --apispec="your-api-spec.yaml"
```

This runs the script `start:s` (see package.json) and passes on the parameter `--apispec="your-api-spec.yaml"`
to the application.

### Update existing OpenAPI Specification

```
--apispec="your-api-spec.yaml"
```

Default: undefined

Specify a relative path to your current OpenAPI specification.

Adding this option will parse your existing OpenAPI specification and update the component/schemas with the new definitions. The default behavior is not modify / remove any existing schemas unless their key is part of the parsed input files.

### Sort properties

```
--sort=false
```

Default: true

If this option is true, sort the properties alphabetically.
This includes the required properties list and the properties themselves.

### Single file output

```
--wsf=true
```

Default: false

Specify this option to store all outputs in a single file (sorted alphabetically based on the input file names).
The shortcut script `npm run start:s` can be used to store all results in a single file as well.

### Specify input directory path

```
--input=exampledir/files
```

Default: "./parse"

Specify a relative path to the input directory.

### Specify output directory path

```
--output=exampledir/deeper
```

Default: "./parsed"

Specify a relative path to the output directory.
If the directory does not exist it will be created automatically.
