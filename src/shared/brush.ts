
import { BRUSH_MODE, PEN_MODE } from './constants'
import { Vector2d } from './types'
import { BezierLine, Vec2Math } from './brush-lib'

const twoPI = Math.PI * 2

const alphaImgs: {[key: string]: HTMLImageElement } = {
  [BRUSH_MODE.Chalk]: new Image(),
  [BRUSH_MODE.Calligraphy]: new Image()
}

alphaImgs[BRUSH_MODE.Chalk].crossOrigin = 'Anonymous'
alphaImgs[BRUSH_MODE.Chalk].src = require('../assets/images/alpha_chalk.png')

alphaImgs[BRUSH_MODE.Calligraphy].crossOrigin = 'Anonymous'
alphaImgs[BRUSH_MODE.Calligraphy].src = require('../assets/images/alpha_calligraphy.png')

export interface PressurePoint extends Vector2d {
  pressure: number
}

export interface BrushConfig {
  context: CanvasRenderingContext2D,
  brushMode: BRUSH_MODE,
  penMode: PEN_MODE,
  size: number,
  opacity: number,
  color: string
}

export default class Brush {
  context: CanvasRenderingContext2D
  brushMode: BRUSH_MODE
  penMode: PEN_MODE
  size: number
  opacity: number
  color: string
  spacing: number
  isDrawing: boolean
  hasSizePressure: boolean
  hasOpacityPressure: boolean
  lastDotSize: number
  lastPressurePoint_1: PressurePoint
  lastPressurePoint_2: PressurePoint
  bezierline: any
  alphaCanvas32: HTMLCanvasElement
  alphaCanvas64: HTMLCanvasElement
  alphaCanvas128: HTMLCanvasElement

  constructor (config: BrushConfig) {
    this.context = config.context
    this.brushMode = config.brushMode
    this.size = config.size
    this.opacity = config.opacity
    this.color = config.color
    this.spacing = 0.8489
    this.isDrawing = false
    this.hasSizePressure = true
    this.hasOpacityPressure = false
    this.lastDotSize = 0
    this.lastPressurePoint_1 = {
      x: 0,
      y: 0,
      pressure: 0
    }
    this.lastPressurePoint_2 = {
      x: 0,
      y: 0,
      pressure: 0
    }
    this.bezierline = null

    this.initAlphaCanvas()
  }

  initAlphaCanvas () {
    this.alphaCanvas32 = document.createElement('canvas')
    this.alphaCanvas32.width = 32
    this.alphaCanvas32.height = 32

    this.alphaCanvas64 = document.createElement('canvas')
    this.alphaCanvas64.width = 64
    this.alphaCanvas64.height = 64

    this.alphaCanvas128 = document.createElement('canvas')
    this.alphaCanvas128.width = 128
    this.alphaCanvas128.height = 128
  }

  updateAlphaCanvas () {
    if (
      this.brushMode === BRUSH_MODE.Circle ||
      this.brushMode === BRUSH_MODE.Square ||
      this.penMode === PEN_MODE.Eraser
    ) {
      return
    }
    const instructionArr: [HTMLCanvasElement, number][] = [
      [this.alphaCanvas128, 128],
      [this.alphaCanvas64, 64],
      [this.alphaCanvas32, 32]
    ]
    let ctx: any

    for (let i = 0; i < instructionArr.length; i++) {
      ctx = instructionArr[i][0].getContext('2d')

      ctx.save()
      ctx.clearRect(0, 0, instructionArr[i][1], instructionArr[i][1])

      ctx.fillStyle = this.color.replace(/[\d+?.]+\)/, this.opacity + ')')
      ctx.fillRect(0, 0, instructionArr[i][1], instructionArr[i][1])

      ctx.globalCompositeOperation = 'destination-in'
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(alphaImgs[this.brushMode], 0, 0, instructionArr[i][1], instructionArr[i][1])

      ctx.restore()
    }
  }

  drawDot (
    x: number, y: number, size: number, opacity: number, angle?: number, before?: number[]
  ) {
    if (size <= 0) {
      return
    }

    if (this.penMode === PEN_MODE.Eraser) {
      this.context.save()
      this.context.globalCompositeOperation = 'destination-out'
      const radgrad = this.context.createRadialGradient(size, this.size, 0, size, size, size)
      let sharpness = Math.pow(opacity, 2)
      sharpness = Math.max(0, Math.min((size - 1) / size, sharpness))
      const oFac = Math.max(0, Math.min(1, opacity))
      const localOpacity = 2 * oFac - oFac * oFac
      radgrad.addColorStop(sharpness, `rgba(255, 255, 255, ${localOpacity})`)
      radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      this.context.fillStyle = radgrad
      this.context.translate(x - size, y - size)
      this.context.fillRect(0, 0, size * 2, size * 2)
      this.context.restore()
    } else {
      if (!before || before[3] !== opacity) {
        this.context.globalAlpha = opacity
      }

      if (!before && (this.brushMode === BRUSH_MODE.Circle || this.brushMode === BRUSH_MODE.Square)) {
        this.context.fillStyle = this.color
      }

      if (this.brushMode === BRUSH_MODE.Circle) {
        this.context.beginPath()
        this.context.arc(x, y, size, 0, twoPI)
        this.context.closePath()
        this.context.fill()
      } else if (this.brushMode === BRUSH_MODE.Square) {
        if (angle !== undefined) {
          this.context.save()
          this.context.translate(x, y)
          this.context.rotate(angle / 180 * Math.PI)
          this.context.fillRect(-size, -size, size * 2, size * 2)
          this.context.restore()
        }
      } else {
        this.context.save()
        this.context.translate(x, y)
        let targetMipmap = this.alphaCanvas128
        if (size <= 32 && size > 16) {
          targetMipmap = this.alphaCanvas64
        } else if (size <= 16) {
          targetMipmap = this.alphaCanvas32
        }
        this.context.scale(size, size)
        if (this.brushMode === BRUSH_MODE.Chalk) {
          this.context.rotate(((x + y) * 53123) % twoPI)
        }
        this.context.drawImage(targetMipmap, -1, -1, 2, 2)
        this.context.restore()
      }
    }
  }

  continueLine (x: number | null, y: number | null, size: number, pressure: number) {
    if (this.bezierline === null) {
      this.bezierline = new BezierLine()
      this.bezierline.add(this.lastPressurePoint_1.x, this.lastPressurePoint_1.y, 0, function () {})
    }
    const drawArr: any[] = []
    const dotCallback = (val: any) => {
      const localPressure = Vec2Math.mix(this.lastPressurePoint_2.pressure, pressure, val.t)
      const localOpacity = this.opacity * (this.hasOpacityPressure ? (localPressure * localPressure) : 1)
      const localSize = Math.max(0.1, this.size * (this.hasSizePressure ? localPressure : 1))
      drawArr.push([val.x, val.y, localSize, localOpacity, val.angle])
    }

    const localSpacing = size * this.spacing
    if (x === null) {
      this.bezierline.addFinal(localSpacing, dotCallback)
    } else {
      this.bezierline.add(x, y, localSpacing, dotCallback)
    }

    this.context.save()

    let before
    let item: any[]
    for (let i = 0; i < drawArr.length; i++) {
      item = drawArr[i]
      this.drawDot(item[0], item[1], item[2], item[3], item[4], before)
      before = item
    }
    this.context.restore()
  }

  startLine (x: number, y: number, p: number) {
    p = Vec2Math.clamp(p, 0, 1)
    const localOpacity = this.hasOpacityPressure ? (this.opacity * p * p) : this.opacity
    const localSize = this.hasSizePressure ? Math.max(0.1, p * this.size) : Math.max(0.1, this.size)

    this.isDrawing = true
    this.context.save()
    this.drawDot(x, y, localSize, localOpacity)
    this.context.restore()

    this.lastDotSize = localSize * this.spacing
    this.lastPressurePoint_1.x = x
    this.lastPressurePoint_1.y = y
    this.lastPressurePoint_1.pressure = p
    this.lastPressurePoint_2.pressure = p
  }

  goLine (x: number, y: number, p: number) {
    if (!this.isDrawing) {
      return
    }

    const pressure = Vec2Math.clamp(p, 0, 1)
    const localSize = this.hasSizePressure ? Math.max(0.1, this.lastPressurePoint_1.pressure * this.size) : Math.max(0.1, this.size)

    this.context.save()
    this.continueLine(x, y, localSize, this.lastPressurePoint_1.pressure)

    this.context.restore()

    this.lastPressurePoint_1.x = x
    this.lastPressurePoint_1.y = y
    this.lastPressurePoint_2.pressure = this.lastPressurePoint_1.pressure
    this.lastPressurePoint_1.pressure = pressure
  }

  endLine () {
    const localSize = this.hasSizePressure ? Math.max(0.1, this.lastPressurePoint_1.pressure * this.size) : Math.max(0.1, this.size)
    this.context.save()
    this.continueLine(null, null, localSize, this.lastPressurePoint_1.pressure)
    this.context.restore()

    this.isDrawing = false
    this.bezierline = null
  }

  setConfig (config: {
    brushMode: BRUSH_MODE,
    penMode: PEN_MODE,
    size: number,
    opacity: number,
    color: string
  }) {
    this.brushMode = config.brushMode
    this.penMode = config.penMode
    this.size = config.size
    this.opacity = config.opacity
    this.color = config.color
    this.updateAlphaCanvas()
  }

  setColor (color: string) {
    this.color = color
  }

  setOpacity (opacity: number) {
    this.opacity = opacity
  }

  setSize (size: number) {
    this.size = size
  }

  setMode (mode: BRUSH_MODE) {
    this.brushMode = mode
  }
}
