import { BaseClass } from "./f006-1-base-class";

export class ExtendClass extends BaseClass {
  extendProperty?: number;

  constructor(baseProperty: string) {
    super(baseProperty);
  }
}
