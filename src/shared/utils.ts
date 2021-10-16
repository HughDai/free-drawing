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

export function debounce (fn: () => void, delay: number) {
  // 定时器，用来 setTimeout
  let timer: number
  // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
  return function (...args: any) {
    // 保存函数调用时的上下文和参数，传递给 fn
    const context = this

    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer)

    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = window.setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

export function throttle (fn: () => void, threshold: number) {
  // 记录上次执行的时间
  let last: number

  // 定时器
  let timer: number

  // 默认间隔为 250ms
  threshold || (threshold = 250)

  // 返回的函数，每过 threshold 毫秒就执行一次 fn 函数
  return function (...args: any) {
    // 保存函数调用时的上下文和参数，传递给 fn
    const context = this

    const now = +new Date()

    // 如果距离上次执行 fn 函数的时间小于 threshold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshold) {
      clearTimeout(timer)

      // 保证在当前时间区间结束后，再执行一次 fn
      timer = window.setTimeout(function () {
        last = now
        fn.apply(context, args)
      }, threshold)

      // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
    } else {
      last = now
      fn.apply(context, args)
    }
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
