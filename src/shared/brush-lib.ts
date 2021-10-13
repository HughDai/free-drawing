import { Vector2d } from 'konva/lib/types'

export interface Segment extends Vector2d {
  length: number
}
export interface Point extends Vector2d {
  spacing: number
  dir?: Vector2d
}

export const clamp = function (val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export const mix = function (x: number, y: number, a: number) {
  return x * (1 - a) + y * a
}

export const dist = function (ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2))
}

export const angleFromPoints = function (p1: Vector2d, p2: Vector2d) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
}

export const Vec2 = {
  add: function (p1: Vector2d, p2: Vector2d) {
    return {
      x: p1.x + p2.x,
      y: p1.y + p2.y
    }
  },
  sub: function (p1: Vector2d, p2: Vector2d) {
    return {
      x: p1.x - p2.x,
      y: p1.y - p2.y
    }
  },
  nor: function (p: Vector2d) {
    const len = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2))
    return {
      x: p.x / len,
      y: p.y / len
    }
  },
  len: function (p: Vector2d) {
    return Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2))
  },
  dist: function (p1: Vector2d, p2: Vector2d) {
    return Vec2.len(Vec2.sub(p1, p2))
  },
  mul: function (p: Vector2d, s: number) {
    return {
      x: p.x * s,
      y: p.y * s
    }
  },
  angle: function (p1: Vector2d, p2: Vector2d) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
  }
}

/**
 * Operations on a line made up of points
 * getAtDist(dist) - point when traveling *dist* along the line
 * getLength - gives you total length of line
 */
export class PointLine {
  // points: Vector2d[]
  segments: Segment[]
  constructor (points: Vector2d[]) {
    // this.points = points
    this.segments = []
    let length = 0
    for (let i = 0; i < points.length; i++) {
      if (i < points.length - 1) {
        length = dist(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
      }
      this.segments[i] = {
        x: points[i].x,
        y: points[i].y,
        length: length
      }
    }
  }

  /**
   * @param dist number - distance in pixels, > 0
   * @returns {{x: number, y: number}}
   */
  getAtDist (dist: number): Vector2d {
    let remainder = Math.min(this.getLength(), dist)
    let i = 0

    for (; remainder > this.segments[i].length && i < this.segments.length - 2; i++) {
      remainder -= this.segments[i].length
    }

    const fac = Math.min(1, Math.max(0, remainder / this.segments[i].length))

    return {
      x: (this.segments[i].x * (1 - fac) + this.segments[i + 1].x * fac),
      y: (this.segments[i].y * (1 - fac) + this.segments[i + 1].y * fac)
    }
  }

  getLength () {
    return this.segments.reduce((acc, curr) => {
      return acc + curr.length
    }, 0)
  }
}

/**
 * Each instance is one line made up of bezier interpolated segments.
 * You feed it points. It calculates control points on its own, and the resulting curve.
 */
export class BezierLine {
  points: Point[]
  lastDot: number
  lastPoint: Vector2d
  lastCallbackPoint: Vector2d
  lastAngle: number
  lastSpacing: number
  constructor () {
    this.points = []
    this.lastDot = 0
  }

  /**
   * creates bezier curve from control points
   *
   * @param p1 - control point 1 {x: float, y: float}
   * @param p2 - control point 2 {x: float, y: float}
   * @param p3 - control point 3 {x: float, y: float}
   * @param p4 - control point 4 {x: float, y: float}
   * @param resolution - int
   * @returns {Array} - bezier curve made up of points {x: float, y: float}
   */
  getBezierPoints (
    p1: Vector2d,
    p2: Vector2d,
    p3: Vector2d,
    p4: Vector2d,
    resolution: number
  ) {
    const curvePoints: Vector2d[] = []
    let t = 0
    let result
    for (let i = 0; i <= resolution; i++) {
      t = i / resolution
      result = {} as Vector2d
      result.x = Math.pow(1 - t, 3) * p1.x + 3 * Math.pow(1 - t, 2) * t * p2.x + 3 * (1 - t) * Math.pow(t, 2) * p3.x + Math.pow(t, 3) * p4.x
      result.y = Math.pow(1 - t, 3) * p1.y + 3 * Math.pow(1 - t, 2) * t * p2.y + 3 * (1 - t) * Math.pow(t, 2) * p3.y + Math.pow(t, 3) * p4.y
      curvePoints[i] = result
    }
    return curvePoints
  }

  /**
   *
   * add now point to line
   * line will go until the previous point
   *
   * @param x - coord of new point
   * @param y - coord of new point
   * @param spacing - space between each step
   * @param callback - calls for each step - x, y, t - t is 0-1 how far along
   * @param controlsCallback - calls that callback with the bezier control points p1, p2, p3, p4 - each {x: float, y: float}
   */
  add (
    x: number,
    y: number,
    spacing: number,
    callback: (arg: any) => void,
    controlsCallback: (arg: any) => void
  ) {
    // console.log(x, y, this.points)
    if (this.lastPoint && x === this.lastPoint.x && y === this.lastPoint.y) {
      return
    }
    this.lastPoint = { x, y }
    this.points[this.points.length] = { x, y, spacing }

    if (this.points.length === 1) {
      this.lastSpacing = spacing
      return
    } else if (this.points.length === 2) {
      this.points[0].dir = Vec2.nor(Vec2.sub(this.points[1], this.points[0]))
      this.lastDot = spacing
      this.lastSpacing = spacing
      return
    } else {
      const pointM1 = this.points[this.points.length - 1]
      const pointM2 = this.points[this.points.length - 2]
      const pointM3 = this.points[this.points.length - 3]
      pointM2.dir = Vec2.nor(Vec2.sub(pointM1, pointM3))
      if (isNaN(pointM2.dir.x) || isNaN(pointM2.dir.y)) {
        pointM2.dir = JSON.parse(JSON.stringify(pointM3.dir))
      }
    }

    const a = this.points[this.points.length - 3]
    const b = this.points[this.points.length - 2]
    const p1 = a
    const p2 = Vec2.add(a, Vec2.mul(a.dir as Vector2d, Vec2.dist(a, b) / 4))
    const p3 = Vec2.sub(b, Vec2.mul(b.dir as Vector2d, Vec2.dist(a, b) / 4))
    const p4 = b

    const pointLine = callback !== undefined
      ? new PointLine(this.getBezierPoints(p1, p2, p3, p4, 20))
      : new PointLine([p1, p4])

    const len = pointLine.getLength()
    // console.log('this.points: ', this.points)
    let tempSpacing = mix(this.lastSpacing, spacing, clamp(this.lastDot / len, 0, 1))
    let d = this.lastDot
    for (; d <= len; d += tempSpacing) {
      tempSpacing = mix(this.lastSpacing, spacing, clamp(d / len, 0, 1))
      const point = pointLine.getAtDist(d)
      const angle = this.lastCallbackPoint ? angleFromPoints(this.lastCallbackPoint, point) : 0

      if (callback !== undefined) {
        callback({
          x: point.x,
          y: point.y,
          t: d / len,
          angle: angle,
          dAngle: this.lastCallbackPoint ? angle - this.lastAngle : 0
        })
      }
      this.lastCallbackPoint = point
      this.lastAngle = angle
    }

    if (callback !== undefined) {
      this.lastDot = d - len
    } else {
      this.lastDot = 0
      controlsCallback({ p1, p2, p3, p4 })
    }

    this.lastSpacing = spacing
  }

  addFinal (
    spacing: number,
    callback: (arg: any) => void,
    controlsCallback: (arg: any) => void
  ) {
    const len = this.points.length
    if (len < 2) {
      return
    }
    const p1 = this.points[len - 2]
    const p2 = this.points[len - 1]

    const newP = Vec2.add(p2, Vec2.sub(p2, p1))

    this.add(newP.x, newP.y, spacing, callback, controlsCallback)
  }
}
