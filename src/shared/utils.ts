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

export function createCanvasElement () {
  const canvas = document.createElement('canvas')
  // on some environments canvas.style is readonly
  try {
    (<any>canvas).style = canvas.style || {}
  } catch (e) {}
  return canvas
}

export function createImageElement () {
  return document.createElement('img')
}

export function urlToImage (url: string, callback: (img: HTMLImageElement) => void) {
  // if arg is a string, then it's a data url
  const imageObj = createImageElement()
  imageObj.onload = function () {
    callback(imageObj)
  }
  imageObj.src = url
}

export function download (src: any, filename: string) {
  console.log('download src: ', src)
  const isBlob = src instanceof Blob
  // for ms browser
  if (
    isBlob &&
    window.navigator &&
    window.navigator.msSaveOrOpenBlob
  ) {
    return window.navigator.msSaveOrOpenBlob(src)
  }
  // for other browsers
  const link = document.createElement('a')
  const href = isBlob ? window.URL.createObjectURL(src) : src

  link.href = href
  link.download = filename
  link.target = '_blank'
  link.style.display = 'none'

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }))

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    isBlob && window.URL.revokeObjectURL(href)
    link.remove()
  }, 100)
}
