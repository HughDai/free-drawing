export interface Vector2d {
  x: number
  y: number
}

export interface Segment extends Vector2d {
  length: number
}
export interface Point extends Vector2d {
  spacing: number
  dir?: Vector2d
}

export interface PressurePoint extends Vector2d {
  pressure: number
}

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}
