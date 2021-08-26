export interface FirstInterface {
  /**
   * Some comment will be ignored.
   */
  id?: number;
}

/**
 * Some comment
 */
export interface SecondInterface extends FirstInterface {
  // This could cause problems if resolved differently
  secondProperty: string;
}
