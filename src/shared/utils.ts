export class EnumUtils {
  /**
   * Returns the enum keys
   * @param enumObj enum object
   */
  static getEnumKeys (enumObj: any, valueType: string): any[] {
    return EnumUtils.getEnumValues(enumObj, valueType).map(value => enumObj[value])
  }

  /**
   * Returns the enum values
   * @param enumObj enum object
   */
  static getEnumValues (enumObj: any, valueType: string): any[] {
    return Object.keys(enumObj).filter(key => typeof enumObj[key] === valueType)
  }
}
