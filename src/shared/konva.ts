import Konva from 'konva'
import { Line, LineConfig } from 'konva/lib/shapes/Line'
import { Context } from 'konva/lib/Context'
import { Factory } from 'konva/lib/Factory'
import { GetSet } from 'konva/lib/types'
import { _registerNode } from 'konva/lib/Global'

Konva.pixelRatio = window.devicePixelRatio
window.Konva = Konva

export interface CustomLineConfig extends LineConfig {
  widths: number[];
}

export class CustomLine<Config extends CustomLineConfig = CustomLineConfig> extends Line<Config> {
  constructor (config: Config) {
    super(config)
    this.on(
      'pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva',
      function () {
        this._clearCache('tensionPoints')
      }
    )
  }

  widths: GetSet<number[], this>;

  _sceneFunc (context: Context) {
    const { points, widths } = this.getAttrs()
    const length = points.length
    const _context = context._context

    if (length === 0) return
    let lastIndex = 0

    _context.globalCompositeOperation = 'source-over'
    // _context.lineCap = this.lineCap()
    // _context.lineJoin = this.lineJoin()
    _context.strokeStyle = this.stroke()

    for (let n = lastIndex; n < length; n += 2) {
      _context.lineWidth = widths.length === 1 ? widths[0] : widths[n / 2]
      _context.beginPath()
      _context.moveTo(points[lastIndex], points[lastIndex + 1])

      _context.bezierCurveTo(
        points[n++],
        points[n++],
        points[n++],
        points[n++],
        points[n++],
        points[n++]
      )
      _context.lineTo(points[n], points[n + 1])
      _context.stroke()
      lastIndex = n
    }
  }
}

CustomLine.prototype.className = 'CustomLine'
CustomLine.prototype._attrsAffectingSize = ['widths']
_registerNode(CustomLine)

Factory.addGetterSetter(CustomLine, 'widths', [])

export function lineSceneFunc (context: Context, shape: CustomLine): void {
  const { points, widths } = shape.getAttrs()
  const length = points.length
  const _context = context._context

  if (length === 0) return
  let lastIndex = 0

  _context.globalCompositeOperation = 'source-over'
  _context.lineCap = shape.lineCap()
  _context.lineJoin = shape.lineJoin()
  _context.strokeStyle = shape.stroke()

  for (let n = lastIndex; n < length; n += 2) {
    _context.lineWidth = widths.length === 1 ? widths[0] : widths[n / 2]
    _context.beginPath()
    _context.moveTo(points[lastIndex], points[lastIndex + 1])

    _context.bezierCurveTo(
      points[n++],
      points[n++],
      points[n++],
      points[n++],
      points[n++],
      points[n++]
    )
    _context.lineTo(points[n], points[n + 1])
    _context.stroke()
    lastIndex = n
  }
}

export default Konva
