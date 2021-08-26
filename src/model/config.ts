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
  /**
   * Path to existing OpenAPI spec file.
   * 
   * This option allows for automatically overwriting existing specifications
   * instead of manually updating them.
   */
  existingOpenApiSpecPath?: string
}
