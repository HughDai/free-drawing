import { createCanvasElement, urlToImage } from '@/shared/utils'

const DPR = window.devicePixelRatio

let _pixelRatio: any
const getDevicePixelRatio = function () {
  if (_pixelRatio) {
    return _pixelRatio
  }
  const canvas = createCanvasElement()
  const context = canvas.getContext('2d') as any
  _pixelRatio = (function () {
    const devicePixelRatio = DPR || 1
    const backingStoreRatio =
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1
    return devicePixelRatio / backingStoreRatio
  })()
  return _pixelRatio
}

interface ICanvasConfig {
  width: number
  height: number
  pixelRatio?: number
}
export default class Canvas {
  pixelRatio = 1
  _canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  containerElement: HTMLElement
  width = 0
  height = 0
  constructor (container: HTMLElement | string, config: ICanvasConfig) {
    this.pixelRatio = config.pixelRatio || DPR || getDevicePixelRatio()
    this._canvas = createCanvasElement()
    this.context = this._canvas.getContext('2d') as CanvasRenderingContext2D

    const contentDom = document.createElement('div')
    contentDom.style.position = 'relative'
    contentDom.style.userSelect = 'none'
    contentDom.style.width = config.width + 'px'
    contentDom.style.height = config.height + 'px'
    contentDom.setAttribute('role', 'presentation')

    this._canvas.style.padding = '0'
    this._canvas.style.margin = '0'
    this._canvas.style.border = '0'
    this._canvas.style.background = 'transparent'
    this._canvas.style.position = 'absolute'
    this._canvas.style.top = '0'
    this._canvas.style.left = '0'

    this.setSize(config.width, config.height)

    contentDom.appendChild(this._canvas)

    this.containerElement = typeof container === 'string'
      ? document.getElementById(container) as HTMLElement
      : container
    this.containerElement.appendChild(contentDom)
  }

  getContainer () {
    return this.containerElement
  }

  getContext () {
    return this.context
  }

  getPixelRatio () {
    return this.pixelRatio
  }

  setPixelRatio (pixelRatio: number) {
    const previousRatio = this.pixelRatio
    this.pixelRatio = pixelRatio
    this.setSize(
      this.getWidth() / previousRatio,
      this.getHeight() / previousRatio
    )
  }

  setWidth (width: number) {
    // take into account pixel ratio
    this.width = this._canvas.width = width * this.pixelRatio
    this._canvas.style.width = width + 'px'
    const pixelRatio = this.pixelRatio
    this.context.scale(pixelRatio, pixelRatio)
  }

  setHeight (height: number) {
    // take into account pixel ratio
    this.height = this._canvas.height = height * this.pixelRatio
    this._canvas.style.height = height + 'px'
    const pixelRatio = this.pixelRatio
    this.context.scale(pixelRatio, pixelRatio)
  }

  getWidth () {
    return this.width
  }

  getHeight () {
    return this.height
  }

  setSize (width: number, height: number) {
    this.setWidth(width || 0)
    this.setHeight(height || 0)
  }

  setContextFill (color: string) {
    this.context.fillStyle = color
    this.context.fillRect(0, 0, this.width, this.height)
  }

  setBG (color: string) {
    this._canvas.style.backgroundColor = color
  }

  toDataURL (config?: {
    mimeType?: string
    quality?: number
  }) {
    try {
      const mimeType = config?.mimeType || 'image/png'
      const quality = config?.quality || 1
      // If this call fails (due to browser bug, like in Firefox 3.6),
      // then revert to previous no-parameter image/png behavior
      return this._canvas.toDataURL(mimeType, quality)
    } catch (e) {
      try {
        return this._canvas.toDataURL()
      } catch (err) {
        console.error('Unable to get data URL. ' + err.message)
        return ''
      }
    }
  }

  toImage (config?: {
    mimeType?: string
    quality?: number
    callback?: (img: HTMLImageElement) => void
  }) {
    if (!config || !config.callback) {
      throw 'callback required for toImage method config argument'
    }
    const callback = config.callback
    delete config.callback
    urlToImage(this.toDataURL(config), function (img: HTMLImageElement) {
      callback(img)
    })
  }

  clear () {
    this.context.clearRect(0, 0, this._canvas.width, this._canvas.height)
  }
}
