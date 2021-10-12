
import { BRUSH_MODE } from './constants'
import { Vector2d } from 'konva/lib/types'
import { BezierLine, mix, clamp } from './brush-lib'

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
  mode: BRUSH_MODE,
  size: number,
  opacity: number,
  color: string
}

export default class Brush () {
  context: CanvasRenderingContext2D,
  mode: BRUSH_MODE,
  size: number,
  opacity: number,
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
    this.mode = config.mode
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
    this.bezierline: any = null

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
    if (this.mode === BRUSH_MODE.Circle || BRUSH_MODE.Square) {
      return
    }
    const instructionArr = [
      [this.alphaCanvas128, 128],
      [this.alphaCanvas64, 64],
      [this.alphaCanvas32, 32]
    ]
    let ctx: CanvasRenderingContext2D

    for (let index = 0; index < instructionArr.length; index++) {
      ctx = instructionArr[i][0].getContext('2d')

      ctx.save()
      ctx.clearRect(0, 0, instructionArr[i][1], instructionArr[i][1])

      // ctx.fillStyle = "rgba(" + settingColor.r + ", " + settingColor.g + ", " + settingColor.b + ", " + alphaOpacityArr[settingAlphaId] + ")";
      ctx.fillRect(0, 0, instructionArr[i][1], instructionArr[i][1]);

      ctx.globalCompositeOperation = 'destination-in'
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(alphaImgs[this.mode], 0, 0, instructionArr[i][1], instructionArr[i][1])

      ctx.restore()
    }
  }

  drawDot (
    x: number,
    y: number,
    size: number,
    opacity: number,
    angle: number,
    before: any
  ) {
    if (size <= 0) {
      return
    }
    // if (settingLockLayerAlpha) {
    //     context.globalCompositeOperation = "source-atop";
    // }

    if (!before || before[3] !== opacity) {
      this.context.globalAlpha = opacity
    }

    if (!before && (this.mode === BRUSH_MODE.Circle || this.mode === BRUSH_MODE.Square)) {
      this.context.fillStyle = this.color
    }

    if (this.mode === BRUSH_MODE.Circle) {
      this.context.beginPath()
      this.context.arc(x, y, size, 0, twoPI)
      this.context.closePath()
      this.context.fill()
    } else if (this.mode === BRUSH_MODE.Square) {
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
      if (this.mode === BRUSH_MODE.Chalk) {
        this.context.rotate(((x + y) * 53123) % twoPI)
      }
      this.context.drawImage(targetMipmap, -1, -1, 2, 2)
      this.context.restore()
    }
  }

  continueLine (x: number, y: number, size: number, pressure: number) {
    if (this.bezierLine === null) {
      bezierLine = new BezierLine()
      bezierLine.add(this.lastPressurePoint_1.x, this.lastPressurePoint_1.y, 0, function () {})
    }

    let drawArr = []

    function dotCallback (val: any) {
      var localPressure = mix(lastInput2.pressure, pressure, val.t)
      var localOpacity = this.opacity * (this.hasOpacityPressure ? (localPressure * localPressure) : 1)
      var localSize = Math.max(0.1, this.size * (this.hasSizePressure ? localPressure : 1))
      drawArr.push([val.x, val.y, localSize, localOpacity, val.angle])
    }

    var localSpacing = size * this.spacing
    if (x === null) {
      this.bezierLine.addFinal(localSpacing, dotCallback)
    } else {
      this.bezierLine.add(x, y, localSpacing, dotCallback)
    }

    this.context.save()

    let before
    for (let i = 0; i < drawArr.length; i++) {
      let item = drawArr[i]
      this.drawDot(item[0], item[1], item[2], item[3], item[4], before)
      before = item
    }
    this.context.restore()
  }

  startLine (x: number, y: number, p: number) {
    p = clamp(p, 0, 1)
    let localOpacity = this.hasOpacityPressure ? (this.opacity * p * p) : this.opacity
    let localSize = this.hasSizePressure ? Math.max(0.1, p * this.size) : Math.max(0.1, this.size)

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

    let pressure = clamp(p, 0, 1)
    let localSize = thos.hasSizePressure ? Math.max(0.1, this.lastPressurePoint_1.pressure * this.size) : Math.max(0.1, this.size)

    this.context.save()
    this.continueLine(x, y, localSize, this.lastPressurePoint_1.pressure)

    this.context.restore()

    this.lastPressurePoint_1.x = x
    this.lastPressurePoint_1.y = y
    this.lastPressurePoint_2.pressure = this.lastPressurePoint_1.pressure
    this.lastPressurePoint_1.pressure = pressure
  }

  endLine (x, y) {
    const localSize = this.hasSizePressure ? Math.max(0.1, this.lastPressurePoint_1.pressure * this.size) : Math.max(0.1, this.size)
    this.context.save()
    this.continueLine(null, null, localSize, this.lastPressurePoint_1.pressure)
    this.context.restore()

    this.isDrawing = false
    this.bezierLine = null
  }
}
